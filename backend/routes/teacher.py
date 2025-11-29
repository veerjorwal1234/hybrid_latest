from flask import Blueprint, request, jsonify
from extensions import db
from models import Session, Attendance, ManualAttendance, Student
from utils.token import generate_qr_token, verify_token
import uuid
import datetime
import json

teacher_bp = Blueprint('teacher', __name__)

@teacher_bp.route('/generate-qr', methods=['POST'])
def generate_qr():
    # Verify teacher token (middleware logic simplified here)
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'Missing token'}), 401
    
    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    if not payload or payload.get('role') != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    teacher_id = payload['id']
    polygon = json.dumps(data.get('polygon')) # Expecting list of [lat, lng]
    
    # New fields
    classroom_name = data.get('classroom_name', 'Unknown')
    subject_name = data.get('subject_name', 'Unknown')
    class_date = data.get('date', datetime.datetime.now().strftime('%Y-%m-%d'))
    start_time = data.get('start_time', '00:00')
    end_time = data.get('end_time', '00:00')
    year = data.get('year', 'Unknown')
    course = data.get('course', 'Unknown')
    
    session_id = str(uuid.uuid4())
    expires_in_minutes = 10 # QR expiry, not class end time
    
    # Use time.time() to get current Unix timestamp in UTC
    import time
    current_time = time.time()
    expires_at_timestamp = int(current_time + (expires_in_minutes * 60))
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=expires_in_minutes)
    
    qr_token = generate_qr_token(teacher_id, session_id, expires_at_timestamp)
    
    new_session = Session(
        session_id=session_id,
        teacher_id=teacher_id,
        polygon=polygon,
        expires_at=expires_at,
        starts_at=datetime.datetime.utcnow(), # Explicitly set starts_at
        token=qr_token,
        classroom_name=classroom_name,
        subject_name=subject_name,
        class_date=class_date,
        start_time=start_time,
        end_time=end_time,
        year=year,
        course=course
    )
    
    db.session.add(new_session)
    db.session.commit()
    
    return jsonify({
        'qr_token': qr_token,
        'session_id': session_id,
        'expires_at': expires_at.isoformat()
    })

@teacher_bp.route('/manual-attendance', methods=['POST'])
def add_manual_attendance():
    # Verify teacher token
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'Missing token'}), 401
    
    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    if not payload or payload.get('role') != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 401
        
    data = request.json
    session_id = data.get('session_id')
    student_name = data.get('student_name')
    roll_number = data.get('roll_number')
    remarks = data.get('remarks')
    
    if not all([session_id, student_name, roll_number]):
        return jsonify({'error': 'Missing required fields'}), 400
        
    # Verify session belongs to teacher
    session = Session.query.get(session_id)
    if not session or session.teacher_id != payload['id']:
        return jsonify({'error': 'Session not found or unauthorized'}), 404
        
    new_manual = ManualAttendance(
        session_id=session_id,
        student_name=student_name,
        roll_number=roll_number,
        remarks=remarks
    )
    
    db.session.add(new_manual)
    db.session.commit()
    
    return jsonify({'message': 'Manual attendance added successfully'}), 201

@teacher_bp.route('/attendance/<session_id>', methods=['GET'])
def get_session_attendance(session_id):
    # Verify teacher token
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'Missing token'}), 401
    
    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    if not payload or payload.get('role') != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 401
    
    session = Session.query.get(session_id)
    if not session:
        return jsonify({'error': 'Session not found'}), 404
        
    if session.teacher_id != payload['id']:
        return jsonify({'error': 'Unauthorized'}), 403
        
    attendances = Attendance.query.filter_by(session_id=session_id).all()
    manual_attendances = ManualAttendance.query.filter_by(session_id=session_id).all()
    
    stats = {
        'Present': 0,
        'Late': 0,
        'Short': 0,
        'Invalid': 0
    }
    
    student_list = []
    for att in attendances:
        stats[att.status] = stats.get(att.status, 0) + 1
        student_list.append({
            'roll_number': att.student.roll_number,
            'student_name': att.student.name,
            'inside_count': att.inside_count,
            'total_samples': att.total_samples,
            'status': att.status
        })
        
    manual_list = []
    for matt in manual_attendances:
        # Manual attendance counts as Present for stats? Usually yes.
        # Let's count them as Present in stats for now, or keep separate?
        # User said "mark present", so we should count them as Present.
        stats['Present'] += 1
        manual_list.append({
            'roll_number': matt.roll_number,
            'student_name': matt.student_name,
            'remarks': matt.remarks,
            'timestamp': matt.timestamp.isoformat()
        })
        
    return jsonify({
        'stats': stats,
        'students': student_list,
        'manual_students': manual_list
    })

@teacher_bp.route('/generate-report', methods=['POST'])
def generate_report():
    # ... (unchanged) ...
    # Verify teacher token
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'Missing token'}), 401
    
    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    if not payload or payload.get('role') != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 401
    
    teacher_id = payload['id']
    data = request.json or {}
    session_id = data.get('session_id')  # Optional: filter by session
    
    # Fetch attendance records
    if session_id:
        attendances = Attendance.query.filter_by(session_id=session_id, teacher_id=teacher_id).all()
    else:
        attendances = Attendance.query.filter_by(teacher_id=teacher_id).all()
    
    if not attendances:
        return jsonify({
            'error': 'No attendance records found',
            'report': {
                'summary': 'No attendance data available to analyze.',
                'insights': ['No records found for the specified criteria.'],
                'recommendations': ['Start taking attendance to generate reports.']
            }
        }), 404
    
    # Format attendance data for Gemini
    attendance_data = []
    for att in attendances:
        student = Student.query.get(att.student_id)
        attendance_data.append({
            'student_name': student.name if student else 'Unknown',
            'roll_number': student.roll_number if student else 'N/A',
            'status': att.status,
            'inside_count': att.inside_count,
            'total_samples': att.total_samples,
            'date': att.timestamp.strftime('%B %d, %Y'),
            'time': att.timestamp.strftime('%I:%M %p'),
            'session_id': att.session_id
        })
    
    # Generate report using Gemini AI
    from utils.gemini_service import generate_attendance_report
    result = generate_attendance_report(attendance_data)
    
    if result['success']:
        return jsonify({
            'success': True,
            'report': result['report'],
            'records_analyzed': len(attendance_data)
        })
    else:
        return jsonify({
            'success': False,
            'error': result.get('error', 'Failed to generate report'),
            'report': result['report']
        }), 500

@teacher_bp.route('/recent-sessions', methods=['GET'])
def get_recent_sessions():
    # Verify teacher token
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'Missing token'}), 401
    
    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    if not payload or payload.get('role') != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 401
    
    teacher_id = payload['id']
    
    # Fetch recent 10 sessions
    sessions = Session.query.filter_by(teacher_id=teacher_id).order_by(Session.starts_at.desc()).limit(10).all()

    
    results = []
    for session in sessions:
        # Fetch attendance for this session
        attendances = Attendance.query.filter_by(session_id=session.session_id).all()
        student_list = []
        for att in attendances:
            student = Student.query.get(att.student_id)
            student_list.append({
                'name': student.name,
                'roll_number': student.roll_number,
                'status': att.status,
                'time': att.timestamp.strftime('%I:%M %p')
            })
            
        results.append({
            'session_id': session.session_id,
            'classroom': session.classroom_name,
            'subject': session.subject_name,
            'date': session.class_date,
            'start_time': session.start_time,
            'end_time': session.end_time,
            'year': session.year,
            'course': session.course,
            'students': student_list,
            'expires_at': session.expires_at.isoformat() if session.expires_at else None
        })
        
    return jsonify(results)

@teacher_bp.route('/session/<session_id>', methods=['DELETE'])
def delete_session(session_id):
    # Verify teacher token
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'Missing token'}), 401
    
    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    if not payload or payload.get('role') != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 401
    
    teacher_id = payload['id']
    
    # Find session and verify ownership
    session = Session.query.filter_by(session_id=session_id, teacher_id=teacher_id).first()
    if not session:
        return jsonify({'error': 'Session not found or unauthorized'}), 404
        
    # Delete associated attendance records first (if cascading delete is not set up in models)
    Attendance.query.filter_by(session_id=session_id).delete()
    
    # Delete the session
    db.session.delete(session)
    db.session.commit()
    
    return jsonify({'message': 'Session deleted successfully'})
