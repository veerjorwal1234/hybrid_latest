from app import create_app, db
from models import Student
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    student = Student.query.filter_by(roll_number='101').first()
    if student:
        student.password_hash = generate_password_hash('password')
        db.session.commit()
        print(f"Password reset for student: {student.name} ({student.roll_number})")
    else:
        print("Student not found")
