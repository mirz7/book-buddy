import requests
import json
import os
import re
from dotenv import load_dotenv
from django.conf import settings
from .models import Book, ReadingSession, Note
from datetime import timedelta, date
from groq import Groq


def get_ai_client():
    if hasattr(settings, 'BASE_DIR'):
        dotenv_path = os.path.join(settings.BASE_DIR, '.env')
        load_dotenv(dotenv_path, override=True)

    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set. Please check your .env file.")
    return Groq(api_key=api_key)


def _repair_json(text):
    """
    Salvage malformed JSON where the model embeds raw newlines inside string values.
    Groq exposes the broken output as 'failed_generation' in the 400 error body.
    """
    repaired = re.sub(r'(?<!\\)\n', ' ', text)         # collapse bare newlines
    repaired = re.sub(r',\s*([}\]])', r'\1', repaired)  # remove trailing commas
    return repaired


def fetch_book_by_isbn(isbn):
    url = f"https://openlibrary.org/api/books?bibkeys=ISBN:{isbn}&format=json&jscmd=data"
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        key = f"ISBN:{isbn}"
        if key in data:
            book_data = data[key]
            return {
                "title": book_data.get("title", ""),
                "author": ", ".join([a["name"] for a in book_data.get("authors", [])]) if "authors" in book_data else "",
                "genre": book_data.get("subjects", [{}])[0].get("name", "") if "subjects" in book_data else "",
                "cover_url": book_data.get("cover", {}).get("large", ""),
                "description": book_data.get("excerpts", [{}])[0].get("text", "") if "excerpts" in book_data else "",
                "total_pages": book_data.get("number_of_pages", 0),
            }
        return None
    except Exception as e:
        print(f"Error fetching ISBN: {e}")
        return None


def generate_recommendations(user):
    user_books = Book.objects.filter(user=user).order_by('-id')

    genres       = [book.genre for book in user_books if book.genre]
    unique_genres = list(set(genres))

    rated_books  = [b for b in user_books if b.rating is not None]
    high_rated   = [b for b in rated_books if b.rating >= 4]

    read_titles   = [b.title for b in user_books]
    liked_titles  = [b.title for b in high_rated]
    recent_titles = [b.title for b in user_books[:3]]

    # ── Build context strings that stay useful even with very few books ──────
    genre_hint  = ', '.join(unique_genres) if unique_genres else 'various genres'
    avoid_hint  = ', '.join(read_titles)   if read_titles   else 'none yet'
    liked_hint  = ', '.join(liked_titles)  if liked_titles  else 'none yet'
    recent_hint = ', '.join(recent_titles) if recent_titles else 'none yet'

    # When the library is tiny, use a broader "new reader" framing
    if len(read_titles) <= 3:
        context_line = (
            f"This reader is just getting started — they have only read: {avoid_hint}. "
            "Because their library is small, cast a wide net and suggest highly acclaimed, "
            "accessible books 2 same genre and 3 different genres to help them discover what they love."
        )
    else:
        context_line = (
            f"Books they have already read — DO NOT recommend any of these: {avoid_hint}. "
            f"Their most recently added books are: {recent_hint} — use these to understand "
            "their current mood but still diversify."
        )

    try:
        client = get_ai_client()
        prompt = (
            f"Recommend 5 books for a reader who enjoys: {genre_hint}. "
            "IMPORTANT: The 5 recommendations MUST span at least 3 same and 2 different genres — "
            "do not cluster them all in one genre. Mix literary fiction, thriller, sci-fi, "
            "history, self-help, fantasy, mystery, or similar. "
            f"{context_line} "
            f"They highly rated: {liked_hint}. "
            "Return ONLY a valid JSON object with a single key 'recommendations' whose value "
            "is an array of exactly 5 objects. "
            "Each object must have exactly these string keys: title, author, genre, isbn, description. "
            "Strict rules: "
            "(1) description = ONE sentence, no line breaks, no newline characters. "
            "(2) isbn = real 13-digit ISBN if known, otherwise empty string. "
            "(3) No double-quote characters inside any value — use single quotes if needed. "
            "(4) Every string value must open AND close on the same line. "
            "Output nothing except the JSON object."
        )

        data = None

        try:
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                temperature=0.9,
                response_format={"type": "json_object"},
            )
            response_text = chat_completion.choices[0].message.content
            data = json.loads(response_text)

        except Exception as api_err:
            # Groq sends a 400 and includes the broken output in failed_generation.
            # Extract and repair it instead of giving up entirely.
            raw = None
            try:
                raw = api_err.body.get("error", {}).get("failed_generation")
            except Exception:
                pass

            if raw:
                print("Groq returned invalid JSON — attempting repair from failed_generation.")
                try:
                    data = json.loads(_repair_json(raw))
                except Exception as repair_err:
                    print(f"Repair also failed: {repair_err}")
                    return []
            else:
                print(f"Groq API Error: {api_err}")
                return []

        recs = data.get("recommendations", [])

        # Final sanitise — strip any stray newlines that slipped through
        clean_recs = []
        for rec in recs[:6]:
            clean_recs.append({
                k: v.replace("\n", " ").strip() if isinstance(v, str) else v
                for k, v in rec.items()
            })
        return clean_recs

    except Exception as e:
        print(f"Groq API Error: {e}")
        return []


def generate_summary(notes_queryset):
    if not notes_queryset.exists():
        return "No notes available to summarize."

    combined = " ".join([note.content for note in notes_queryset])

    try:
        client = get_ai_client()
        chat_completion = client.chat.completions.create(
            messages=[{
                "role": "user",
                "content": (
                    "Summarize these reading notes into a concise but detailed paragraph "
                    "(3-4 sentences) that captures the main themes and takeaways: "
                    f"{combined}"
                ),
            }],
            model="llama-3.3-70b-versatile",
        )
        return chat_completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"Groq Error: {e}")
        return f"AI Generation Failed: {str(e)}"


def generate_review(book, notes_queryset):
    if not book:
        return ""

    rating_text = f"I rated it {book.rating}/5. " if book.rating else ""

    try:
        client = get_ai_client()
        notes  = " ".join([note.content for note in notes_queryset])
        prompt = (
            f"Draft a concise, insightful book review (maximum 100 words) for "
            f"'{book.title}' by {book.author}. {rating_text}"
            f"Use my notes if provided to inform the review: {notes}"
        )
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
        )
        return chat_completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"Groq Error: {e}")
        return f"AI Generation Failed: {str(e)}"


def predict_completion_date(book):
    sessions = book.sessions.all().order_by('-date')
    if not sessions.exists() or not book.total_pages:
        return None

    total_pages_read  = sum([s.pages_read for s in sessions])
    if total_pages_read == 0:
        return None

    days_reading      = (sessions.first().date - sessions.last().date).days + 1
    avg_pages_per_day = total_pages_read / days_reading

    if avg_pages_per_day <= 0:
        return None

    remaining_pages = book.total_pages - book.pages_read
    days_remaining  = remaining_pages / avg_pages_per_day

    return date.today() + timedelta(days=int(days_remaining))
