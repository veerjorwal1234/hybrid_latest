import requests

BASE_URL = 'http://localhost:5001/api'

def login():
    url = f"{BASE_URL}/auth/login"
    data = {
        "identifier": "101",
        "password": "password",
        "role": "student"
    }
    try:
        response = requests.post(url, json=data)
        response.raise_for_status()
        print("Login successful")
        return response.json().get('token')
    except Exception as e:
        print(f"Login failed: {e}")
        print(response.text)
        return None

def get_register_options(token):
    url = f"{BASE_URL}/webauthn/register/options"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    try:
        response = requests.post(url, headers=headers)
        response.raise_for_status()
        print("Get options successful")
        print(response.json())
    except Exception as e:
        print(f"Get options failed: {e}")
        print(response.text)

if __name__ == "__main__":
    token = login()
    if token:
        get_register_options(token)
