from app import create_app, db, socketio
from app.models import User, Room, SessionEvent, UserPresence 
from flask import Flask, jsonify
from flask_cors import CORS

app = create_app()
CORS(app, origins=["https://codecollab.vercel.app"])

@app.route('/')
def home():
    return jsonify({
        "message": "CodeCollab Backend is Live!",
        "status": "OK"
    }), 200
    
@app.route("/test-db")
def test_db():
    try:
        from app.models import User
        count = User.query.count()
        return {"status": "ok", "users": count}
    except Exception as e:
        return {"status": "error", "message": str(e)}, 500

@app.shell_context_processor
def make_shell_context():
    """Makes User, Room, and db available in the `flask shell`."""
    return {'db': db, 'User': User, 'Room': Room, 'SessionEvent': SessionEvent, 'UserPresence': UserPresence}

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    socketio.run(app, debug=True, port=5001)