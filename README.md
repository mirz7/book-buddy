# Book Buddy 📚

**Book Buddy** is a comprehensive full-stack application designed to help readers track and manage their reading progress with ease. This project was developed as a technical submission for a software engineering role, showcasing a modern tech stack and integrated AI features.

---

## 🌐 Live Experience

> **Try it out**

👉 **[https://my-book-buddy-gi34.onrender.com](https://my-book-buddy-gi34.onrender.com)**

> ⚠️ *Hosted on Render's free tier — the first load may take 30–60 seconds to spin up. Please be patient!*

---

## 🎥 Video Preview

> A short walkthrough of Book Buddy's core features — adding books, tracking progress, and using AI recommendations.

<!-- Replace the src below with your actual video embed URL (YouTube, Loom, etc.) -->

[![Book Buddy Demo](https://img.shields.io/badge/Watch%20Demo-Click%20Here-red?style=for-the-badge&logo=youtube)](https://your-video-link-here)

> 📌 *To add your video: upload a demo to YouTube or Loom and replace the link above. You can also embed it directly with an `<iframe>` if hosting on GitHub Pages or a docs site.*

---

## 📋 Task List & Completed Features

### Users Can:
- [x] **Add books**: Include title, author, genre, and status (reading, completed, wishlist).
- [x] **Update reading progress**: Track pages read versus total pages.
- [x] **View reading stats**: Interactive dashboard showing % completed and books by genre.
- [x] **Add personal notes or ratings**: Record reflections and 5-star ratings for completed books.

### Tech Requirements:
- [x] **Frontend**: ReactJS (Vite, Tailwind CSS, Recharts for stats).
- [x] **Backend**: Python (Django & Django REST Framework).
- [x] **Database**: SQLite (Development environment).

### Optional AI Features:
- [x] **Recommend books**: Personalized suggestions based on genre and reading history (Groq AI).
- [x] **Generate short summary**: AI-powered summaries based on user's personal notes.
- [x] **Predict estimated completion date**: Smart prediction based on recent reading patterns and speed.

### Optional Other Features:
- [x] **User login**: Secure authentication system to save and manage private book lists.
- [x] **Import book info**: Automated book data fetching using **ISBN API (Open Library API)**.
- [x] **Graph view**: Visual timeline of reading over time.
- [x] **AI-generated book reviews**: Professional reviews generated automatically from notes and ratings.

---

## 🛠️ Detailed Architecture

### Frontend (React)
- **State Management**: React Hooks (`useState`, `useEffect`, `useContext`).
- **Styling**: Tailwind CSS with custom glassmorphism components.
- **Charts**: Recharts for visualizing genre distribution and progress stats.
- **Icons**: Lucide-React for a clean interface.

### Backend (Django)
- **API**: Django REST Framework (DRF) for secure, token-based communication.
- **AI Services**: Integrated with **Groq AI** for fast, local-feeling AI summaries and recommendations.
- **Service Layer**: Clean separation of API logic and external service integrations (ISBN, AI).

---

## 🚀 Setup & Local Development

### 1. Prerequisites
- Python 3.10+
- Node.js & npm (v18+)
- Groq API Key (required for AI features)

### 2. Backend Installation (Django)

1. **Navigate to root**: `cd book_buddy`
2. **Setup Venv & Dependencies**:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Mac/Linux
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. **Environment**: Create a `.env` file in the root directory (where `manage.py` is) with:
   ```
   GROQ_API_KEY=your_key_here
   ```
4. **Database & Start**:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

### 3. Frontend Installation (React)

1. **Navigate**: `cd book_buddy/frontend`
2. **Install & Start**:
   ```bash
   npm install
   npm run dev
   ```
   *Access the app at `http://localhost:5173/`*

---

*This project demonstrates a full-stack integration of React, Django, and modern AI services to solve real-world user needs.*
