import requests
import json
import time

BASE_URL = "http://localhost:5001/api"

def print_step(step):
    print(f"\n{'='*50}\n{step}\n{'='*50}")

def register_user(role, name, email, password, roll_number=None):
    url = f"{BASE_URL}/auth/register"
    data = {
        "name": name,
        "email": email,
        "password": password,
        "role": role
    }
    if roll_number:
        data["roll_number"] = roll_number
    
    try:
        response = requests.post(url, json=data)
        if response.status_code == 201:
            print(f"✅ {role.capitalize()} Registered: {email}")
            return True
        elif response.status_code == 400 and "already exists" in response.text:
            print(f"ℹ️ {role.capitalize()} already exists: {email}")
            return True
        else:
            print(f"❌ Registration Failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return False

def login_user(email, password, role_check):
    url = f"{BASE_URL}/auth/login"
    data = {
        "identifier": email,
        "password": password,
        "role": role_check
    }
    response = requests.post(url, json=data)
    if response.status_code == 200:
        token = response.json().get('token')
        user = response.json().get('user')
        if user['role'] != role_check:
            print(f"❌ Role Mismatch: Expected {role_check}, got {user['role']}")
            return None
        print(f"✅ {role_check.capitalize()} Logged In. Token received.")
        return token
    else:
        print(f"❌ Login Failed: {response.text}")
        return None

def generate_qr(teacher_token):
    url = f"{BASE_URL}/teacher/generate-qr"
    # Polygon around a test point (18.76327, 73.69883)
    polygon = [
        [18.776500, 73.694436],
        [18.757928, 73.667311],
        [18.743776, 73.687630],
        [18.762875, 73.719388]
    ]
    headers = {"Authorization": f"Bearer {teacher_token}"}
    data = {"polygon": polygon}
    
    response = requests.post(url, json=data, headers=headers)
    if response.status_code == 200:
        qr_token = response.json().get('qr_token')
        session_id = response.json().get('session_id')
        print(f"✅ QR Generated. Session ID: {session_id}")
        return qr_token, session_id
    else:
        print(f"❌ QR Generation Failed: {response.text}")
        return None, None

def submit_attendance(student_token, qr_token):
    url = f"{BASE_URL}/student/submit-attendance"
    # Samples inside the polygon
    samples = [
        {"latitude": 18.763277, "longitude": 73.698836, "accuracy": 10, "timestamp": "2024-11-24T10:00:00Z"},
        {"latitude": 18.763278, "longitude": 73.698837, "accuracy": 10, "timestamp": "2024-11-24T10:00:05Z"},
        {"latitude": 18.763279, "longitude": 73.698838, "accuracy": 10, "timestamp": "2024-11-24T10:00:10Z"},
        {"latitude": 18.763277, "longitude": 73.698836, "accuracy": 10, "timestamp": "2024-11-24T10:00:15Z"},
        {"latitude": 18.763278, "longitude": 73.698837, "accuracy": 10, "timestamp": "2024-11-24T10:00:20Z"},
        {"latitude": 18.763279, "longitude": 73.698838, "accuracy": 10, "timestamp": "2024-11-24T10:00:25Z"},
        {"latitude": 18.763277, "longitude": 73.698836, "accuracy": 10, "timestamp": "2024-11-24T10:00:30Z"},
        {"latitude": 18.763278, "longitude": 73.698837, "accuracy": 10, "timestamp": "2024-11-24T10:00:35Z"},
        {"latitude": 18.763279, "longitude": 73.698838, "accuracy": 10, "timestamp": "2024-11-24T10:00:40Z"},
        {"latitude": 18.763277, "longitude": 73.698836, "accuracy": 10, "timestamp": "2024-11-24T10:00:45Z"},
        {"latitude": 18.763278, "longitude": 73.698837, "accuracy": 10, "timestamp": "2024-11-24T10:00:50Z"},
        {"latitude": 18.763279, "longitude": 73.698838, "accuracy": 10, "timestamp": "2024-11-24T10:00:55Z"}
    ]
    
    headers = {"Authorization": f"Bearer {student_token}"}
    data = {
        "qr_token": qr_token,
        "samples": samples
    }
    
    response = requests.post(url, json=data, headers=headers)
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Attendance Submitted!")
        print(f"   Status: {result.get('status')}")
        print(f"   Inside Count: {result.get('inside_count')}")
        return True
    else:
        print(f"❌ Attendance Submission Failed: {response.text}")
        return False

def main():
    print_step("1. TEACHER REGISTRATION & LOGIN")
    t_email = "sim_teacher@test.com"
    t_pass = "pass123"
    register_user("teacher", "Sim Teacher", t_email, t_pass)
    t_token = login_user(t_email, t_pass, "teacher")
    
    if not t_token: return

    print_step("2. GENERATE QR CODE")
    qr_token, session_id = generate_qr(t_token)
    
    if not qr_token: return

    print_step("3. STUDENT REGISTRATION & LOGIN")
    s_roll = "SIM2025"
    s_pass = "pass123"
    register_user("student", "Sim Student", "sim_student@test.com", s_pass, s_roll)
    s_token = login_user(s_roll, s_pass, "student")
    
    if not s_token: return

    print_step("4. SUBMIT ATTENDANCE (Simulating GPS)")
    submit_attendance(s_token, qr_token)

if __name__ == "__main__":
    main()
