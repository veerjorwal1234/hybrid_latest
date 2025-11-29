from app import create_app, db
from models import Teacher
from werkzeug.security import generate_password_hash

app = create_app()
with app.app_context():
    db.drop_all()
    db.create_all()
    print("Database reset.")
    
    teacher = Teacher(
        name="Manual Test Teacher",
        email="manual_test@example.com",
        password_hash=generate_password_hash("password123")
    )
    db.session.add(teacher)
    db.session.commit()
    print("Test teacher created.")
