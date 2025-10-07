# CodeCollab - Advanced Real-Time Collaborative Coding Platform

## CodeCollab

Real-time collaborative coding platform for technical interviews, pair programming, tutoring, and practice. CodeCollab lets multiple users edit and run code together in a secure sandbox, with session event logging for replay and analytics.

## Overview

CodeCollab enables live coding sessions where multiple users can collaborate in real time. It supports JWT-based authentication, secure Docker-based code execution, event sourcing for replay, and a modern React frontend.

## Primary Use Cases 

🎯 Live technical interviews (interviewer + candidate pair programming)

👩‍🏫 Remote tutoring / pair programming sessions

🧑‍💻 Practice & assessment (problems with test cases)

📊 Session replay & analytics (review collaboration timeline)

## 📁 Project Structure

** Architecture **
Flow

    Users sign up / log in → JWT token issued.
    Rooms are created and joined with persistent state.
    Collaboration via WebSockets → synced code edits.
    Code execution inside Docker sandbox → results returned.
    Events logged → replayable session timeline.

Components

    Backend (Flask / Python)
    REST API + Socket endpoints
    Docker-based code execution
    PostgreSQL/MySQL database models

Frontend (React / Vite / Tailwind)

    Real-time editor (Monaco editor planned/used)
    Auth pages, dashboard, room UI

Security

    JWT authentication, password hashing
    Docker isolation for untrusted code

## Features

🔗 Real-time collaboration (Flask-SocketIO)

👥 Room creation & joining with persistent state

🔒 JWT-based authentication & protected routes

🐳 Secure Docker-based code execution with test case evaluation

📝 Event sourcing → replay collaboration timeline

🌍 Multi-language code execution

👤 User presence (color-coded cursors, activity tracking)

🎨 React frontend (Vite + Tailwind + Monaco editor)

## Installation & Setup

    Prerequisites
    Python 3.10+
    Node.js 18+
    Docker (for sandboxed code execution)

## Backend Setup
```
cd backend
python -m venv .venv
source .venv/bin/activate   # Linux/macOS
# .venv\Scripts\activate    # Windows
pip install -r requirements.txt
python run.py
```
## Frontend Setup
```
cd frontend
npm install
npm run dev
```
## Configuration
Create a .env file with:
```
DATABASE_URL=postgresql://user:pass@localhost/codecollab
JWT_SECRET=supersecretkey
DOCKER_CPU_LIMIT=1
DOCKER_MEMORY_LIMIT=512m
```
## How It Works

    PDF-like problems & test cases seeded into DB (seed.py).
    Users join a room and collaborate via WebSockets.
    Code is executed inside Docker sandbox (code_executor.py).
    Events (cursor moves, edits, execution logs) stored for replay.
    Replay available in dashboard or analytics.

## Directory Layout
```
Codecollab_project/
├── Codecollab/                 # Backend Flask API
│   ├── app/
│   │   ├── models.py          # Database models (User, Room, SessionEvent, UserPresence)
│   │   ├── api_routes.py      # REST API + WebSocket endpoints
│   │   ├── main_routes.py     # Main page routes
│   │   └── code_executor.py   # Docker code execution
│   ├── requirements.txt       # Python dependencies
│   ├── run.py                # Flask app entry point
│   ├── seed.py               # Database seeder
│   └── config.py             # Configuration settings
└── codecollab-frontend/       # React frontend
    ├── src/
    │   ├── components/        # React components (Layout, etc.)
    │   ├── pages/            # Page components (AuthPage, HomePage, RoomPage)
    │   ├── utils/            # Utility functions (auth.js)
    │   └── App.jsx           # Main app component
    └── package.json          # Node dependencies
```

## Usage 
Run backend + frontend, then open browser at:
```
http://localhost:5173
```

Create a room → share link → start collaborating 🚀

## Support

For questions or issues, check the individual README files:
- Backend: `Codecollab/README.md`
- Frontend: `codecollab-frontend/README.md`

---

**Ready to code together? Start CodeCollab and revolutionize collaborative programming!** 🚀
