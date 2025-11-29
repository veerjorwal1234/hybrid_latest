from flask import Blueprint, request, jsonify
from extensions import db
from models import Notification, Teacher, Student
from datetime import datetime
import jwt
import os

notifications_bp = Blueprint('notifications', __name__)

def get_current_user():
    token = None
    if 'Authorization' in request.headers:
        token = request.headers['Authorization'].split(" ")[1]
    
    if not token:
        return None, None
        
    try:
        data = jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=["HS256"])
        if data['role'] == 'teacher':
            user = Teacher.query.get(data['id'])
            return user, 'teacher'
        elif data['role'] == 'student':
            user = Student.query.get(data['id'])
            return user, 'student'
    except:
        return None, None
    return None, None

@notifications_bp.route('/', methods=['GET'])
def get_notifications():
    user, role = get_current_user()
    if not user:
        return jsonify({'message': 'Unauthorized'}), 401
        
    # Both students and teachers can view notifications
    notifications = Notification.query.order_by(Notification.created_at.desc()).all()
    
    output = []
    for notif in notifications:
        output.append({
            'id': notif.id,
            'title': notif.title,
            'message': notif.message,
            'teacher_name': notif.teacher.name,
            'created_at': notif.created_at.isoformat()
        })
        
    return jsonify(output), 200

@notifications_bp.route('/', methods=['POST'])
def create_notification():
    user, role = get_current_user()
    if not user or role != 'teacher':
        return jsonify({'message': 'Unauthorized. Only teachers can create notifications.'}), 403
        
    data = request.get_json()
    
    if not data or not data.get('title') or not data.get('message'):
        return jsonify({'message': 'Missing title or message'}), 400
        
    new_notification = Notification(
        title=data['title'],
        message=data['message'],
        teacher_id=user.id
    )
    
    db.session.add(new_notification)
    db.session.commit()
    
    return jsonify({'message': 'Notification created successfully'}), 201
