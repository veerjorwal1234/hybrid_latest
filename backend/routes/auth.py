import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
from extensions import db
from models import Teacher, Student
from utils.token import generate_token, verify_token

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    role = data.get('role') # 'teacher' or 'student'
    identifier = data.get('identifier') # email for teacher, roll_number for student
    password = data.get('password')
    
    if role == 'teacher':
        user = Teacher.query.filter_by(email=identifier).first()
    elif role == 'student':
        user = Student.query.filter_by(roll_number=identifier).first()
    else:
        return jsonify({'error': 'Invalid role'}), 400
        
    if user and check_password_hash(user.password_hash, password):
        token = generate_token({'id': user.id, 'role': role, 'name': user.name})
        user_data = {'id': user.id, 'name': user.name, 'role': role}
        
        if role == 'student':
            user_data.update({
                'roll_number': user.roll_number,
                'semester': user.semester,
                'branch': user.branch,
                'photo_path': user.photo_path
            })
        elif role == 'teacher':
            user_data.update({
                'subject': user.subject,
                'branch': user.branch,
                'photo_path': user.photo_path
            })
            
        return jsonify({'token': token, 'user': user_data})
    
    return jsonify({'error': 'Invalid credentials'}), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    # Handle multipart/form-data for file upload
    if request.content_type and 'multipart/form-data' in request.content_type:
        data = request.form
    else:
        data = request.json

    role = data.get('role')
    name = data.get('name')
    password = data.get('password')
    
    if role == 'teacher':
        email = data.get('email')
        subject = data.get('subject')
        branch = data.get('branch')
        
        if Teacher.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 400
            
        photo_path = None
        if 'photo' in request.files:
            file = request.files['photo']
            if file and file.filename != '':
                filename = secure_filename(f"teacher_{email}_{file.filename}")
                upload_folder = os.path.join(current_app.root_path, 'static', 'uploads', 'photos')
                os.makedirs(upload_folder, exist_ok=True)
                file_path = os.path.join(upload_folder, filename)
                file.save(file_path)
                photo_path = f"/static/uploads/photos/{filename}"
        
        user = Teacher(
            name=name, 
            email=email, 
            password_hash=generate_password_hash(password),
            subject=subject,
            branch=branch,
            photo_path=photo_path
        )
    elif role == 'student':
        roll_number = data.get('roll_number')
        semester = data.get('semester')
        branch = data.get('branch')
        
        if Student.query.filter_by(roll_number=roll_number).first():
            return jsonify({'error': 'Roll number already exists'}), 400
            
        photo_path = None
        if 'photo' in request.files:
            file = request.files['photo']
            if file and file.filename != '':
                filename = secure_filename(f"{roll_number}_{file.filename}")
                upload_folder = os.path.join(current_app.root_path, 'static', 'uploads', 'photos')
                os.makedirs(upload_folder, exist_ok=True)
                file_path = os.path.join(upload_folder, filename)
                file.save(file_path)
                photo_path = f"/static/uploads/photos/{filename}" # Relative path for frontend
        
        user = Student(
            name=name, 
            roll_number=roll_number, 
            password_hash=generate_password_hash(password),
            semester=semester,
            branch=branch,
            photo_path=photo_path
        )
    else:
        return jsonify({'error': 'Invalid role'}), 400
        
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully'}), 201

@auth_bp.route('/upload-photo', methods=['POST'])
def upload_photo():
    # Verify token
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'Missing token'}), 401
    
    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    if not payload:
        return jsonify({'error': 'Unauthorized'}), 401
        
    user_id = payload['id']
    role = payload['role']
    
    if 'photo' not in request.files:
        return jsonify({'error': 'No photo provided'}), 400
        
    file = request.files['photo']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if role == 'teacher':
        user = Teacher.query.get(user_id)
        identifier = user.email
        prefix = "teacher"
    elif role == 'student':
        user = Student.query.get(user_id)
        identifier = user.roll_number
        prefix = ""
    else:
        return jsonify({'error': 'Invalid role'}), 400
        
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    import time
    timestamp = int(time.time())
    filename = secure_filename(f"{prefix}_{identifier}_{timestamp}_{file.filename}" if prefix else f"{identifier}_{timestamp}_{file.filename}")
    upload_folder = os.path.join(current_app.root_path, 'static', 'uploads', 'photos')
    os.makedirs(upload_folder, exist_ok=True)
    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)
    
    photo_path = f"/static/uploads/photos/{filename}"
    user.photo_path = photo_path
    db.session.commit()
    
    return jsonify({'message': 'Photo uploaded successfully', 'photo_path': photo_path}), 200
