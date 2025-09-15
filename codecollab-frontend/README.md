# CodeCollab Frontend

React + Vite frontend for the CodeCollab collaborative coding platform.

## 🚀 Project Status

### ✅ Completed Backend Features

#### Core Infrastructure
- **Flask API** with SQLAlchemy ORM
- **PostgreSQL** database with proper models
- **JWT Authentication** system
- **WebSocket** real-time communication via Socket.IO
- **Docker** code execution environment
- **CORS** enabled for cross-origin requests

#### User Management
- User registration and login
- Password reset functionality
- JWT token-based authentication
- User session management

#### Room System
- Dynamic room creation with unique IDs
- Real-time room joining/leaving
- Active user tracking per room
- Room persistence in database

#### Code Collaboration
- Real-time code synchronization
- Multi-language support (Python, JavaScript, etc.)
- Live code execution with Docker
- Automatic test case evaluation
- Code submission and verdict system

#### Problem Management
- Pre-loaded coding problems
- Test case system with hidden/visible cases
- Problem templates and descriptions
- Database seeding for sample problems

#### Session Recording & Analytics ⭐ **NEW**
- **Automatic event logging** for all room activities
- **SessionEvent model** with JSON payloads and timestamps
- **REST API endpoints** for timeline and summary data
- **Event types recorded:**
  - Room creation, user joins/leaves
  - Code changes, language switches
  - Code runs, submissions, problem loads
- **API endpoints:**
  - `GET /api/sessions/<room_id>/timeline` - Full event history
  - `GET /api/sessions/<room_id>/summary` - Event statistics

### 🔄 In Progress

#### Frontend Development
- React components for room interface
- Real-time code editor integration
- WebSocket client implementation
- Authentication UI components

### 📋 Backend Features To Implement

#### Advanced Session Features
- **Session Replay System**
  - Timeline scrubbing and playback
  - Event filtering and search
  - Export session data to JSON/CSV
  - Session comparison tools

- **Analytics Dashboard**
  - User engagement metrics
  - Problem difficulty analysis
  - Collaboration patterns
  - Performance insights

#### Enhanced Collaboration
- **User Presence System**
  - Color-coded cursors and selections
  - Real-time typing indicators
  - User avatars and status
  - "Follow user" mode

- **Advanced Code Features**
  - Multi-file support
  - Code comments and annotations
  - Version control integration
  - Code diff visualization

#### Interview & Education Mode
- **Interviewer Tools**
  - Hidden notes and rubrics
  - Live scoring system
  - Code watermarking
  - Proctoring features

- **Educational Features**
  - Assignment management
  - Auto-grading system
  - Student progress tracking
  - Class analytics

#### Security & Performance
- **Enhanced Security**
  - Rate limiting and DDoS protection
  - Input sanitization
  - Audit logging
  - Access control lists

- **Scalability**
  - Redis for session management
  - Database connection pooling
  - Load balancing support
  - Microservices architecture

#### Integration Features
- **GitHub Integration**
  - Repository import/export
  - Pull request preview rooms
  - Commit history integration
  - Branch management

- **AI Assistant**
  - Code explanation and hints
  - Bug detection and fixes
  - Test case generation
  - Code optimization suggestions

## 🛠️ Technology Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Socket.IO Client** for real-time communication
- **Monaco Editor** (planned) for code editing

### Backend
- **Python 3.13** with Flask
- **SQLAlchemy** ORM
- **PostgreSQL** database
- **Flask-SocketIO** for WebSockets
- **Docker** for code execution
- **JWT** for authentication

## 📁 Project Structure

```
Codecollab_project/
├── Codecollab/                 # Backend Flask API
│   ├── app/
│   │   ├── models.py          # Database models
│   │   ├── api_routes.py      # REST API endpoints
│   │   ├── main_routes.py     # Main page routes
│   │   └── code_executor.py   # Docker code execution
│   ├── requirements.txt       # Python dependencies
│   └── README.md             # Backend documentation
└── codecollab-frontend/       # React frontend
    ├── src/
    │   ├── components/        # React components
    │   ├── pages/            # Page components
    │   └── utils/            # Utility functions
    └── package.json          # Node dependencies
```

## 🚀 Getting Started

### Backend Setup
```bash
cd Codecollab
pip install -r requirements.txt
python seed.py  # Seed database
python run.py   # Start Flask server
```

### Frontend Setup
```bash
cd codecollab-frontend
npm install
npm run dev     # Start Vite dev server
```

## 📊 Current Metrics

- **16+ events** recorded in test sessions
- **42 total events** across all rooms
- **5 event types** being tracked
- **Real-time** collaboration working
- **Multi-user** room support active

## 🎯 Next Milestones

1. **Complete Frontend Integration** - Connect React to backend APIs
2. **Session Replay UI** - Build timeline playback interface  
3. **Analytics Dashboard** - Create insights and metrics views
4. **Enhanced Collaboration** - Add presence and cursor tracking
5. **Interview Mode** - Implement proctoring and assessment tools

---

*Last Updated: September 2025*
