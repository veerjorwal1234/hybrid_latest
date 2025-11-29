from flask import Blueprint, request, jsonify
from extensions import db
from models import Session, Attendance, InvalidAttempt
from utils.token import verify_token
from utils.geofence import calculate_inside_count
import jwt
from flask import current_app
import json

student_bp = Blueprint('student', __name__)

@student_bp.route('/submit-attendance', methods=['POST'])
def submit_attendance():
    # Verify student token
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'Missing token'}), 401
    
    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    if not payload or payload.get('role') != 'student':
        return jsonify({'error': 'Unauthorized'}), 401
    
    student_id = payload['id']
    data = request.json
    
    qr_token = data.get('qr_token')
    samples = data.get('samples') # List of {lat, lng, accuracy, timestamp}
    
    # 1. Validate QR Token
    try:
        qr_payload = jwt.decode(qr_token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'QR Code expired'}), 400
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid QR Code'}), 400
        
    session_id = qr_payload['session_id']
    teacher_id = qr_payload['teacher_id']
    
    # 2. Check if session exists and is valid
    session = Session.query.get(session_id)
    if not session:
        return jsonify({'error': 'Session not found'}), 404
        
    # 3. Check for duplicate submission
    existing_attendance = Attendance.query.filter_by(student_id=student_id, session_id=session_id).first()
    if existing_attendance:
        return jsonify({'message': 'Attendance already submitted', 'status': existing_attendance.status}), 200
        
    # 4. Calculate Inside Count
    inside_count, valid_samples = calculate_inside_count(samples, session.polygon)
    
    # 5. Determine Status
    status = "Invalid Attempt"
    if inside_count >= 8:
        status = "Present"
    elif 5 <= inside_count <= 7:
        status = "Late"
    elif 2 <= inside_count <= 4:
        status = "Short"
    
    # 6. Store Attendance
    new_attendance = Attendance(
        student_id=student_id,
        teacher_id=teacher_id,
        session_id=session_id,
        inside_count=inside_count,
        total_samples=len(samples),
        status=status,
        samples_json=json.dumps(samples)
    )
    
    db.session.add(new_attendance)
    db.session.commit()
    
    return jsonify({
        'status': status,
        'inside_count': inside_count,
        'message': 'Attendance submitted successfully'
    })

@student_bp.route('/history', methods=['GET'])
def get_history():
    # Verify student token
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'Missing token'}), 401
    
    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    if not payload or payload.get('role') != 'student':
        return jsonify({'error': 'Unauthorized'}), 401
    
    student_id = payload['id']
    
    # Fetch all attendance records for this student
    attendances = Attendance.query.filter_by(student_id=student_id).order_by(Attendance.timestamp.desc()).all()
    
    history = []
    for att in attendances:
        session = Session.query.get(att.session_id)
        history.append({
            'id': att.id,
            'session_id': att.session_id,
            'subject_name': session.subject_name if session else 'Unknown Subject',
            'classroom_name': session.classroom_name if session else 'Unknown Classroom',
            'status': att.status,
            'inside_count': att.inside_count,
            'total_samples': att.total_samples,
            'timestamp': att.timestamp.isoformat(),
            'date': att.timestamp.strftime('%B %d, %Y'),
            'time': att.timestamp.strftime('%I:%M %p')
        })
    
    return jsonify({'history': history})
