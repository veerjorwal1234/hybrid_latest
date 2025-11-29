import requests
import json

BASE_URL = "http://localhost:5001/api"

def test_manual_attendance():
    # 1. Login
    print("Logging in...")
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "role": "teacher",
        "identifier": "manual_test@example.com",
        "password": "password123"
    })
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return
    token = response.json()['token']
    print("Login successful.")

    # 2. Generate QR (Create Session)
    print("Creating session...")
    session_payload = {
        "classroom_name": "Room 1",
        "subject_name": "Manual Test",
        "year": "2024",
        "course": "CS",
        "date": "2024-01-01",
        "start_time": "10:00",
        "end_time": "11:00",
        "polygon": [[0,0], [0,1], [1,1], [1,0]]
    }
    response = requests.post(f"{BASE_URL}/teacher/generate-qr", json=session_payload, headers={
        "Authorization": f"Bearer {token}"
    })
    if response.status_code != 200:
        print(f"Session creation failed: {response.text}")
        return
    session_id = response.json()['session_id']
    print(f"Session created: {session_id}")

    # 3. Add Manual Attendance
    print("Adding manual attendance...")
    manual_payload = {
        "session_id": session_id,
        "student_name": "Manual Student",
        "roll_number": "12345",
        "remarks": "Test Remark"
    }
    response = requests.post(f"{BASE_URL}/teacher/manual-attendance", json=manual_payload, headers={
        "Authorization": f"Bearer {token}"
    })
    if response.status_code != 201:
        print(f"Manual attendance failed: {response.text}")
        return
    print("Manual attendance added.")

    # 4. Fetch Attendance
    print("Fetching attendance...")
    response = requests.get(f"{BASE_URL}/teacher/attendance/{session_id}", headers={
        "Authorization": f"Bearer {token}"
    })
    if response.status_code != 200:
        print(f"Fetch failed: {response.text}")
        return
    
    data = response.json()
    manual_students = data.get('manual_students', [])
    print(f"Manual students found: {len(manual_students)}")
    
    found = False
    for student in manual_students:
        if student['roll_number'] == '12345' and student['student_name'] == 'Manual Student':
            print("✅ Verification Successful: Student found in manual list.")
            found = True
            break
    
    if not found:
        print("❌ Verification Failed: Student not found.")

if __name__ == "__main__":
    test_manual_attendance()
