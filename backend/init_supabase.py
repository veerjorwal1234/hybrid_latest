from app import create_app
from extensions import db

app = create_app()
with app.app_context():
    try:
        db.create_all()
        print("Tables created successfully")
    except Exception as e:
        print(f"Error creating tables: {e}")
