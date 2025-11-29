from datetime import datetime
from extensions import db
import json

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    roll_number = db.Column(db.String(20), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False) # Added for basic auth
    semester = db.Column(db.String(20), nullable=True)
    branch = db.Column(db.String(50), nullable=True)
    photo_path = db.Column(db.String(200), nullable=True)
    
    # WebAuthn fields
    credential_id = db.Column(db.Text, nullable=True)
    public_key = db.Column(db.Text, nullable=True)
    sign_count = db.Column(db.Integer, default=0)
    current_challenge = db.Column(db.Text, nullable=True)

class Teacher(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    subject = db.Column(db.String(100), nullable=True)
    branch = db.Column(db.String(50), nullable=True)
    photo_path = db.Column(db.String(200), nullable=True)

class Session(db.Model):
    session_id = db.Column(db.String(100), primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('teacher.id'), nullable=False)
    polygon = db.Column(db.Text, nullable=False) # Stored as GeoJSON string
    starts_at = db.Column(db.DateTime, default=datetime.utcnow) # Created at
    expires_at = db.Column(db.DateTime, nullable=False)
    token = db.Column(db.Text, nullable=False) # The QR token string
    
    # New fields
    classroom_name = db.Column(db.String(100), nullable=False, default="Unknown")
    subject_name = db.Column(db.String(100), nullable=False, default="Unknown")
    class_date = db.Column(db.String(20), nullable=False, default="2024-01-01") # YYYY-MM-DD
    start_time = db.Column(db.String(20), nullable=False, default="00:00") # HH:MM
    end_time = db.Column(db.String(20), nullable=False, default="00:00") # HH:MM
    year = db.Column(db.String(20), nullable=False, default="Unknown") # e.g. "2024", "1st Year"
    course = db.Column(db.String(100), nullable=False, default="Unknown") # e.g. "B.Tech", "CS"

class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('teacher.id'), nullable=False)
    session_id = db.Column(db.String(100), db.ForeignKey('session.session_id'), nullable=False)
    inside_count = db.Column(db.Integer, nullable=False)
    total_samples = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), nullable=False) # Present, Late, Short, Invalid
    samples_json = db.Column(db.Text, nullable=True) # Store raw samples for audit
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    student = db.relationship('Student', backref='attendances')
    session = db.relationship('Session', backref='attendances')

class InvalidAttempt(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    session_id = db.Column(db.String(100), db.ForeignKey('session.session_id'), nullable=False)
    reason = db.Column(db.String(200), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class ManualAttendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100), db.ForeignKey('session.session_id'), nullable=False)
    student_name = db.Column(db.String(100), nullable=False)
    roll_number = db.Column(db.String(20), nullable=False)
    remarks = db.Column(db.String(200), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    session = db.relationship('Session', backref='manual_attendances')

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('teacher.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    teacher = db.relationship('Teacher', backref='notifications')

