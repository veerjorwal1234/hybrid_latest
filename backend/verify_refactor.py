import urllib.request
import urllib.parse
import json
import urllib.error
import time
import datetime

BASE_URL = 'http://127.0.0.1:5001'

def run_verification():
    print("--- Verify Refactored Session Flow ---")
    
    # 1. Register/Login Teacher
    t_email = f"refactor_teacher_{int(time.time())}@test.com"
    t_pass = "pass123"
    print(f"1. Creating Teacher: {t_email}")
    
    reg_payload = json.dumps({
        'name': 'Refactor Teacher',
        'email': t_email,
        'password': t_pass,
        'role': 'teacher'
    }).encode('utf-8')
    
    try:
        req = urllib.request.Request(f'{BASE_URL}/api/auth/register', data=reg_payload, headers={'Content-Type': 'application/json'})
        urllib.request.urlopen(req)
    except urllib.error.HTTPError as e:
        print(f"Teacher registration failed (might exist): {e.code}")

    # Login Teacher
    login_payload = json.dumps({'identifier': t_email, 'password': t_pass, 'role': 'teacher'}).encode('utf-8')
    req = urllib.request.Request(f'{BASE_URL}/api/auth/login', data=login_payload, headers={'Content-Type': 'application/json'})
    resp = urllib.request.urlopen(req)
    t_data = json.loads(resp.read().decode())
    t_token = t_data['token']
    print("   Teacher Logged In")

    # 2. Generate QR with New Fields
    print("2. Generating QR Code with Class Details")
    polygon = [[18.0, 73.0], [18.0, 74.0], [19.0, 74.0], [19.0, 73.0]]
    qr_payload = json.dumps({
        'polygon': polygon,
        'classroom_name': 'Room 101',
        'subject_name': 'Advanced AI',
        'date': '2025-11-28',
        'start_time': '10:00',
        'end_time': '11:30'
    }).encode('utf-8')
    
    try:
        req = urllib.request.Request(f'{BASE_URL}/api/teacher/generate-qr', data=qr_payload, headers={'Authorization': f'Bearer {t_token}', 'Content-Type': 'application/json'})
        resp = urllib.request.urlopen(req)
        qr_data = json.loads(resp.read().decode())
        qr_token = qr_data['qr_token']
        session_id = qr_data['session_id']
        print(f"   QR Generated. Session: {session_id}")
    except urllib.error.HTTPError as e:
        print(f"   QR Generation Failed: {e.code}")
        print(f"   Error Body: {e.read().decode()}")
        return

    # 3. Register/Login Student
    s_roll = f"REF{int(time.time())}"
    s_pass = "pass123"
    print(f"3. Creating Student: {s_roll}")
    
    reg_payload = json.dumps({
        'name': 'Refactor Student',
        'roll_number': s_roll,
        'password': s_pass,
        'role': 'student'
    }).encode('utf-8')
    
    try:
        req = urllib.request.Request(f'{BASE_URL}/api/auth/register', data=reg_payload, headers={'Content-Type': 'application/json'})
        urllib.request.urlopen(req)
    except urllib.error.HTTPError as e:
        print(f"Student registration failed: {e.code}")

    # Login Student
    login_payload = json.dumps({'identifier': s_roll, 'password': s_pass, 'role': 'student'}).encode('utf-8')
    req = urllib.request.Request(f'{BASE_URL}/api/auth/login', data=login_payload, headers={'Content-Type': 'application/json'})
    resp = urllib.request.urlopen(req)
    s_data = json.loads(resp.read().decode())
    s_token = s_data['token']
    print("   Student Logged In")

    # 4. Submit Attendance
    print("4. Submitting Attendance")
    samples = [{"latitude": 18.5, "longitude": 73.5, "accuracy": 10, "timestamp": datetime.datetime.utcnow().isoformat()}] * 10
    att_payload = json.dumps({'qr_token': qr_token, 'samples': samples}).encode('utf-8')
    req = urllib.request.Request(f'{BASE_URL}/api/student/submit-attendance', data=att_payload, headers={'Authorization': f'Bearer {s_token}', 'Content-Type': 'application/json'})
    resp = urllib.request.urlopen(req)
    att_resp = json.loads(resp.read().decode())
    print(f"   Attendance Submitted. Status: {att_resp.get('status')}")

    # 5. Check Recent Sessions (Teacher View)
    print("5. Checking Recent Sessions")
    req = urllib.request.Request(f'{BASE_URL}/api/teacher/recent-sessions', headers={'Authorization': f'Bearer {t_token}'})
    resp = urllib.request.urlopen(req)
    recent_data = json.loads(resp.read().decode())
    
    print(f"   Sessions Found: {len(recent_data)}")
    if len(recent_data) > 0:
        session = recent_data[0]
        print(f"   Latest Session: {session['subject']} in {session['classroom']}")
        print(f"   Students: {len(session['students'])}")
        if len(session['students']) > 0:
            print(f"   - {session['students'][0]['name']} ({session['students'][0]['status']})")
            print("\nSUCCESS: Refactored flow verified.")
        else:
            print("\nFAILURE: Student not found in session.")
    else:
        print("\nFAILURE: No sessions found.")

if __name__ == '__main__':
    try:
        run_verification()
    except Exception as e:
        print(f"\nERROR: {e}")
