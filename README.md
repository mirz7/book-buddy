# Book Buddy - V2 Backend & Frontend

This simulates the second major commit in the project's history: Adding a basic React frontend.

## Project Structure

This folder contains both the backend API and the frontend client.

- `book_buddy_core/` & `api/`: The Django backend (inherited from V1, but with `django-cors-headers` added to allow frontend requests).
- `frontend/`: The Vite + React + TailwindCSS frontend application.

## Setup Instructions

### 1. Backend (Django)

1. Navigate to the project root: `cd book_buddy_v2_commit`
2. Activate your virtual environment: `venv\Scripts\activate` (or `source venv/bin/activate`)
3. Install new requirements: `pip install -r requirements.txt`
4. Run migrations: `python manage.py migrate`
5. Start the server (runs on port 8000): `python manage.py runserver`

### 2. Frontend (React)

Open a **new** terminal window:

1. Navigate to the frontend folder: `cd book_buddy_v2_commit/frontend`
2. Install Node dependencies: `npm install`
3. Start the Vite dev server: `npm run dev`

The frontend will be available at standard Vite ports (e.g. `http://localhost:5173`).

### What's New in V2?

- Added a React Single Page Application using Vite.
- Styled with TailwindCSS.
- Basic `Navbar` and `BookList` components added.
- The `BookList` component fetches data from the Django API at `http://localhost:8000/api/books/`.
