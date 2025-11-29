import requests

BASE_URL = 'http://localhost:5001/api'

def register():
    url = f"{BASE_URL}/auth/register"
    data = {
        "role": "student",
        "name": "Test Student",
        "roll_number": "101",
        "password": "password",
        "semester": "1",
        "branch": "CS"
    }
    try:
        response = requests.post(url, json=data)
        if response.status_code == 201:
            print("Registration successful")
        elif response.status_code == 400 and "already exists" in response.text:
            print("User already exists")
        else:
            print(f"Registration failed: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Registration failed: {e}")

if __name__ == "__main__":
    register()
