# Book Buddy 📚

*Book Buddy* is a full-stack app for tracking your reading journey 🌟. Built as a coding task for SayOne Technologies' Full Stack Developer intern role. Want to know more about its features or tech stack?

---

## 🌐 Live Demo — Try It Out

> **[https://my-book-buddy-gi34.onrender.com](https://my-book-buddy-gi34.onrender.com)**

 ⚠️ *Hosted on Render's free tier — the loading may cause delay. Please be patient!*

---

## 🎥 Video Preview
https://github.com/user-attachments/assets/e556dca1-0f77-4e9b-8334-f723fcd5c5b9

> A short walkthrough of Book Buddy's core features — adding books, tracking progress, and using AI recommendations.




---

## ✅ Codind Task Requirements — Completion Status

> All requirements from the original task have been completed.

### 📌 Core Task
Build an app for tracking reading progress.

### 👤 Users Can:
- ✅ Add books with title, author, genre,images and status *(reading, completed, wishlist)*
- ✅ Update reading progress
- ✅ View reading stats *(e.g. % completed, books by genre)*
- ✅ Add personal notes or ratings for completed books

### ⚙️ Tech Requirements:
- ✅ **Frontend**: ReactJS *(form inputs, reading list view, stats)*
- ✅ **Backend**: Python *(Django / FastAPI)*
- ✅ **Database**: SQLite or PostgreSQL

### 🤖 Optional AI Feature:
- ✅ Recommend books based on genre, summary, or past reading
- ✅ Generate a short summary based on user notes
- ✅ Predict estimated completion date based on reading pattern

### 🌟 Optional Other Features:
- ✅ Deployment
- ✅ Add user login to save private book lists
- ✅ Import book info using ISBN API *(e.g. Open Library API)*
- ✅ Graph view of reading over time
- ✅ AI-generated book reviews based on notes and ratings

---

## 🔍 Features — In Detail

### 📚 Book Management
Add and manage your entire reading library in one place. Each book entry supports a **title, author, genre**, and a **status tag** — *Reading*, *Completed*, or *Wishlist*. Books can be imported automatically by entering an **ISBN**, pulling metadata instantly from the **Open Library API**, saving manual entry time.

### 📈 Reading Progress Tracker
Log how many pages you've read against the total page count for any book. The app calculates and displays a **live completion percentage**, giving you a clear snapshot of where you stand with each title.

### 📊 Stats Dashboard
An interactive dashboard visualizes your reading habits at a glance:
- **Genre distribution** — pie/bar chart of books by category
- **Progress overview** — completion percentages across all active reads
- **Reading timeline** — graph view showing your reading activity over time

Built with **Recharts** for smooth, responsive data visualization.

### 📝 Notes & Ratings
For completed books, add **personal reflections and a 5-star rating**. These notes also power the AI features — summaries and reviews are generated directly from what you write.

### 🤖 AI Features *(powered by Groq)*

| Feature | Description |
|---|---|
| **Book Recommendations** | Suggests new books based on your genre preferences and reading history |
| **Note Summarizer** | Condenses your personal notes into a clean, readable summary |
| **Completion Predictor** | Estimates a finish date based on your recent reading speed and pace |
| **AI Book Reviews** | Generates a professional-style review from your notes and star rating |

All AI features run through **Groq's inference API** — fast responses with no noticeable latency.

### 🔐 User Authentication
Secure **token-based login system** built with Django REST Framework. Each user's book list, notes, and progress data are private and tied to their account.

### 🗃️ Clean Service Architecture
The backend follows a clear separation of concerns:
- **API layer** — DRF ViewSets handle all REST endpoints
- **Service layer** — AI and ISBN integrations are isolated in dedicated service modules, keeping views clean and testable

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, Recharts, Lucide Icons |
| Backend | Python, Django, Django REST Framework |
| Database | SQLite *(dev)* |
| AI | Groq API |
| Book Data | Open Library ISBN API |
| Auth | DRF Token Authentication |
| Hosting | Render |

---

## 🚀 Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js & npm (v18+)
- Groq API Key

### Backend (Django)

```bash
cd book_buddy
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the root directory (alongside `manage.py`):
```
GROQ_API_KEY=your_key_here
```

```bash
python manage.py migrate
python manage.py runserver
```

### Frontend (React)

```bash
cd book_buddy/frontend
npm install
npm run dev
```

Access the app at **`http://localhost:5173/`**

---

*This project demonstrates a production-minded full-stack integration of React, Django, and modern AI services — built to solve a real, everyday user need.*
