from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import JSON, func
from sqlalchemy.sql import expression

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Room(db.Model):
    id = db.Column(db.String(10), primary_key=True)
    code_content = db.Column(db.Text, nullable=True, default="# Welcome to your CodeCollab room!\nprint('Hello, friend!')")
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    problem_id = db.Column(db.Integer, db.ForeignKey('problem.id'), nullable=True)
    language = db.Column(db.String(20), nullable=False, default='python')

class Problem(db.Model):
    """Represents a coding problem."""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False) 
    template_code = db.Column(db.Text, nullable=True)
    test_cases = db.relationship('TestCase', backref='problem', lazy=True, cascade="all, delete-orphan")

class TestCase(db.Model):
    """Represents a single test case for a Problem."""
    id = db.Column(db.Integer, primary_key=True)
    input_data = db.Column(db.Text, nullable=False)
    expected_output = db.Column(db.Text, nullable=False)
    is_hidden = db.Column(db.Boolean, default=True, nullable=False)
    problem_id = db.Column(db.Integer, db.ForeignKey('problem.id'), nullable=False)

class SessionEvent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.String(10), db.ForeignKey('room.id'), nullable=False, index=True)
    event_type = db.Column(db.String(32), nullable=False)
    payload = db.Column(JSON,nullable=False,default=dict)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, server_default=func.now())
    
class UserPresence(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    room_id = db.Column(db.String(10), db.ForeignKey('room.id'), nullable=False, index=True)
    username = db.Column(db.String(80), nullable=False)
    cursor_line = db.Column(db.Integer, nullable=True)
    cursor_column = db.Column(db.Integer, nullable=True)
    selection_start_line = db.Column(db.Integer, nullable=True)
    selection_start_column = db.Column(db.Integer, nullable=True)
    selection_end_line = db.Column(db.Integer, nullable=True)
    selection_end_column = db.Column(db.Integer, nullable=True)
    user_color = db.Column(db.String(7), nullable=False, default='#3B82F6')
    is_typing = db.Column(db.Boolean, default=False, nullable=False)
    last_seen = db.Column(db.DateTime(timezone=True), nullable=False, server_default=func.now())
    
    __table_args__ = (
        db.Index('idx_room_user', 'room_id', 'username'),
    )
    @staticmethod
    def get_next_user_color(room_id):
        colors = [
            '#3B82F6',  # Blue
            '#EF4444',  # Red  
            '#10B981',  # Green
            '#F59E0B',  # Yellow
            '#8B5CF6',  # Purple
            '#F97316',  # Orange
            '#06B6D4',  # Cyan
            '#84CC16',  # Lime
            '#EC4899',  # Pink
            '#6B7280',  # Gray
        ]
        
        existing_colors = db.session.query(UserPresence.user_color).filter_by(room_id=room_id).all()
        used_colors = {color[0] for color in existing_colors}
        
        for color in colors:
            if color not in used_colors:
                return color
            
        import random
        return random.choice(colors)