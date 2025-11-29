from app import create_app, db
from models import Student

app = create_app()

with app.app_context():
    student = Student.query.filter_by(roll_number='102').first()
    if student:
        print(f"Student found: {student.name}, {student.roll_number}")
        print(f"Password hash: {student.password_hash}")
        print(f"Credential ID: {student.credential_id}")
    else:
        print("Student not found")
