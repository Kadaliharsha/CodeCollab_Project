from app import create_app, db, socketio
from app.models import User, Room, SessionEvent, UserPresence
from flask import jsonify
from flask_cors import CORS
import os

app = create_app()

CORS(app, origins=[
    "https://code-collab-project.vercel.app",
    "http://localhost:5173"
], supports_credentials=True)

@app.route('/')
def home():
    return jsonify({
        "message": "CodeCollab Backend is Live!",
        "status": "OK"
    }), 200

@app.route("/test-db")
def test_db():
    try:
        count = User.query.count()
        return {"status": "ok", "users": count}
    except Exception as e:
        return {"status": "error", "message": str(e)}, 500

@app.shell_context_processor
def make_shell_context():
    """Makes models available in the Flask shell."""
    return {
        'db': db,
        'User': User,
        'Room': Room,
        'SessionEvent': SessionEvent,
        'UserPresence': UserPresence
    }

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    socketio.run(
        app,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5001)),
        debug=False,
        allow_unsafe_werkzeug=False
    )