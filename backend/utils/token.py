import jwt
import time
from flask import current_app

def generate_token(payload, expires_in_minutes=60):
    payload['exp'] = int(time.time() + (expires_in_minutes * 60))
    return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')

def verify_token(token):
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def generate_qr_token(teacher_id, session_id, expires_at):
    payload = {
        'teacher_id': teacher_id,
        'session_id': session_id,
        'exp': expires_at
    }
    return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
