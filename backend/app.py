import os
from flask import Flask, jsonify
# Trigger reload
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from extensions import db

# Load environment variables
load_dotenv()

# Initialize extensions (removed local db definition)

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev_secret_key')
    # Use absolute path to ensure correct DB file is used
    basedir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(basedir, 'instance', 'attendance.db')
    
    # Use DATABASE_URL if available (Supabase), else fallback to local SQLite
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', f'sqlite:///{db_path}')
    
    # Fix for some Postgres providers (like Heroku/Render) using 'postgres://' instead of 'postgresql://'
    if app.config['SQLALCHEMY_DATABASE_URI'].startswith("postgres://"):
        app.config['SQLALCHEMY_DATABASE_URI'] = app.config['SQLALCHEMY_DATABASE_URI'].replace("postgres://", "postgresql://", 1)
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    # Allow both localhost and production frontend URL
    origins = [frontend_url, "http://localhost:5173", "http://localhost:5174"]
    CORS(app, resources={r"/*": {"origins": origins}}, supports_credentials=True)
    db.init_app(app)
    
    # Register Blueprints
    from routes.auth import auth_bp
    from routes.teacher import teacher_bp
    from routes.student import student_bp
    from routes.webauthn_routes import webauthn_bp
    from routes.notifications import notifications_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(teacher_bp, url_prefix='/api/teacher') # Changed to /api/teacher for consistency or specific teacher routes
    app.register_blueprint(student_bp, url_prefix='/api/student') # Changed to /api/student
    app.register_blueprint(webauthn_bp, url_prefix='/api/webauthn')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    
    # Create database tables
    with app.app_context():
        db.create_all()
        
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5001, host='0.0.0.0')
