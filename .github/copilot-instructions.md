# Copilot Instructions for CodeCollab

## Project Overview
- **CodeCollab** is a real-time collaborative coding platform for interviews, hackathons, classrooms, and peer programming.
- The backend (`Codecollab/`) is a Flask app with SQLAlchemy, Socket.IO, and PostgreSQL. It manages rooms, users, problems, and code execution (optionally sandboxed with Docker).
- The frontend (`codecollab-frontend/`) is a React + Vite app using Tailwind CSS and Monaco Editor for a professional, real-time collaborative UI.

## Key Architectural Patterns
- **Room-based Collaboration:** Users join rooms (see `app/main_routes.py`, `app/api_routes.py`). Each room has a shared code editor, problem panel, and live output.
- **Real-Time Sync:** Uses Socket.IO for sub-second code and presence updates (see backend and frontend `Sidebar.jsx`, `RoomPage.jsx`).
- **Session Recording:** All room events are logged for replay/analytics (see backend models and session logic).
- **Code Execution:** Code is executed in a sandbox (Docker recommended, see `code_executor.py`). Results and verdicts are returned to all room participants.
- **Authentication:** JWT-based, with secure token management and protected routes (see backend `config.py`, frontend `auth.js`).

## Developer Workflows
- **Backend:**
  - Install Python deps: `pip install -r requirements.txt`
  - Configure DB in `config.py` (default: PostgreSQL)
  - Seed DB: `python seed.py`
  - Run: `python run.py` (Flask app on port 5001)
- **Frontend:**
  - Install deps: `npm install`
  - Run dev server: `npm run dev` (Vite on port 5173)
- **Testing:**
  - Backend: Add tests in `test_docker.py` or similar. No formal test runner documented.
  - Frontend: No test scripts documented; add tests as needed.

## Project-Specific Conventions
- **Room IDs:** Generated securely, passed in URLs (e.g., `/room/<room_id>`)
- **Session Data:** All room activity is logged for analytics (see session/event models)
- **Problem Management:** Problems and test cases are seeded via `seed.py` and stored in DB.
- **Frontend Auth:** JWT tokens in localStorage/sessionStorage; protected routes redirect unauthenticated users.
- **Styling:** Tailwind CSS for all UI; Monaco Editor for code.

## Integration Points
- **WebSocket:** Real-time events between backend and frontend (see Socket.IO usage in both).
- **Docker:** Used for secure code execution (see `code_executor.py`).
- **Database:** PostgreSQL for all persistent data (users, rooms, problems, sessions).

## Key Files & Directories
- `Codecollab/app/api_routes.py`, `main_routes.py`: Core backend logic
- `Codecollab/app/code_executor.py`: Code execution and sandboxing
- `Codecollab/app/models.py`: DB models (users, rooms, problems, sessions)
- `Codecollab/config.py`: App config (DB, JWT, etc.)
- `Codecollab/seed.py`: Seeds DB with problems/test cases
- `codecollab-frontend/src/pages/RoomPage.jsx`: Main collaborative UI
- `codecollab-frontend/src/utils/auth.js`: Auth helpers

## Tips for AI Agents
- Follow the room/session/event model for new features.
- Use Socket.IO for any real-time updates.
- Keep DB schema changes in sync with models and seeders.
- Use Docker for any code execution logic.
- Reference existing routes/components for patterns before adding new ones.
