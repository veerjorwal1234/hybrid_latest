import requests
import sys

BASE_URL = "http://localhost:5001/api/auth/register"

def create_user():
    print("--- Create New User ---")
    print("1. Teacher")
    print("2. Student")
    choice = input("Select Role (1/2): ").strip()
    
    if choice == '1':
        role = 'teacher'
        name = input("Enter Name: ").strip()
        email = input("Enter Email: ").strip()
        password = input("Enter Password: ").strip()
        
        payload = {
            "role": "teacher",
            "name": name,
            "email": email,
            "password": password
        }
        
    elif choice == '2':
        role = 'student'
        name = input("Enter Name: ").strip()
        roll_number = input("Enter Roll Number: ").strip()
        password = input("Enter Password: ").strip()
        
        payload = {
            "role": "student",
            "name": name,
            "roll_number": roll_number,
            "password": password
        }
    else:
        print("Invalid choice.")
        return

    try:
        response = requests.post(BASE_URL, json=payload)
        if response.status_code == 201:
            print(f"\n✅ Success! {role.capitalize()} created.")
        else:
            print(f"\n❌ Error: {response.json().get('error', 'Unknown error')}")
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to the backend. Is the server running on port 5001?")

if __name__ == "__main__":
    create_user()
