from app import create_app, db
from models import Student

app = create_app()

with app.app_context():
    student = Student.query.filter_by(roll_number='101').first()
    if student:
        student.credential_id = None
        student.public_key = None
        student.sign_count = 0
        db.session.commit()
        print(f"Fingerprint reset for student: {student.name} ({student.roll_number})")
    else:
        print("Student not found")
