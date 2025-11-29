from flask import Blueprint, request, jsonify, session
from webauthn import (
    generate_registration_options,
    verify_registration_response,
    generate_authentication_options,
    verify_authentication_response,
    options_to_json,
    options_to_json,
    base64url_to_bytes,
)
from webauthn.helpers import bytes_to_base64url
from webauthn.helpers.structs import (
    AuthenticatorSelectionCriteria,
    UserVerificationRequirement,
    RegistrationCredential,
    AuthenticationCredential,
    AuthenticatorAttestationResponse,
    AuthenticatorAssertionResponse,
    AuthenticatorAttestationResponse,
    AuthenticatorAssertionResponse,
    PublicKeyCredentialType,
    PublicKeyCredentialType,
    PublicKeyCredentialDescriptor,
    AuthenticatorAttachment,
)
from extensions import db
from models import Student
from utils.token import verify_token

webauthn_bp = Blueprint('webauthn', __name__)

RP_ID = 'localhost'
RP_NAME = 'Hybrid Smart Attendance'
ORIGIN = ['http://localhost:5173', 'http://localhost:5174']

@webauthn_bp.route('/register/options', methods=['POST'])
def register_options():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'Missing token'}), 401
    
    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    if not payload or payload.get('role') != 'student':
        return jsonify({'error': 'Unauthorized'}), 401
        
    student = Student.query.get(payload['id'])
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    if student.credential_id:
        return jsonify({'error': 'Fingerprint already registered'}), 400

    options = generate_registration_options(
        rp_id=RP_ID,
        rp_name=RP_NAME,
        user_id=str(student.id).encode(),
        user_name=student.roll_number,
        user_display_name=student.name,
        authenticator_selection=AuthenticatorSelectionCriteria(
            user_verification=UserVerificationRequirement.PREFERRED,
            authenticator_attachment=AuthenticatorAttachment.PLATFORM
        )
    )
    
    # Store challenge in DB
    # Store challenge in DB
    # options.challenge is bytes. We need to store it as base64url string.
    from webauthn.helpers import bytes_to_base64url
    encoded_challenge = bytes_to_base64url(options.challenge)
    print(f"DEBUG: Storing challenge for user {student.id}: {encoded_challenge}")
    student.current_challenge = encoded_challenge
    db.session.commit()
    
    return options_to_json(options)

@webauthn_bp.route('/register/verify', methods=['POST'])
def register_verify():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'Missing token'}), 401
    
    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    if not payload or payload.get('role') != 'student':
        return jsonify({'error': 'Unauthorized'}), 401
        
    student = Student.query.get(payload['id'])
    
    # Retrieve challenge from DB
    challenge = student.current_challenge
    if not challenge:
        return jsonify({'error': 'No challenge found'}), 400
        
    try:
        print(f"DEBUG: Verifying registration for user {student.id}")
        print(f"DEBUG: Stored challenge: {challenge}")
        # print(f"DEBUG: Request data: {request.data}") 
        
        # Manually construct RegistrationCredential
        data = request.json
        credential = RegistrationCredential(
            id=data['id'],
            raw_id=base64url_to_bytes(data['rawId']),
            response=AuthenticatorAttestationResponse(
                client_data_json=base64url_to_bytes(data['response']['clientDataJSON']),
                attestation_object=base64url_to_bytes(data['response']['attestationObject']),
            ),
            type=PublicKeyCredentialType.PUBLIC_KEY
        )

        registration_verification = verify_registration_response(
            credential=credential,
            expected_challenge=base64url_to_bytes(challenge),
            expected_origin=ORIGIN,
            expected_rp_id=RP_ID,
        )
        
        # Check if credential_id is bytes before decoding
        cred_id = registration_verification.credential_id
        if isinstance(cred_id, bytes):
            cred_id = bytes_to_base64url(cred_id)
            
        # Check if public_key is bytes before decoding
        pub_key = registration_verification.credential_public_key
        if isinstance(pub_key, bytes):
            pub_key = bytes_to_base64url(pub_key)
            
        student.credential_id = cred_id
        student.public_key = pub_key
        student.sign_count = registration_verification.sign_count
        student.current_challenge = None # Clear challenge
        db.session.commit()
        
        print("DEBUG: Registration verified successfully")
        return jsonify({'verified': True})
    except Exception as e:
        print(f"DEBUG: Registration verification failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400

@webauthn_bp.route('/login/options', methods=['POST'])
def login_options():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'Missing token'}), 401
    
    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    student = Student.query.get(payload['id'])
    
    if not student.credential_id:
        return jsonify({'error': 'No credential registered'}), 400

    options = generate_authentication_options(
        rp_id=RP_ID,
        allow_credentials=[PublicKeyCredentialDescriptor(id=base64url_to_bytes(student.credential_id))],
    )
    
    from webauthn.helpers import bytes_to_base64url
    student.current_challenge = bytes_to_base64url(options.challenge)
    db.session.commit()
    
    return options_to_json(options)

@webauthn_bp.route('/login/verify', methods=['POST'])
def login_verify():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'Missing token'}), 401
    
    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    student = Student.query.get(payload['id'])
    
    challenge = student.current_challenge
    if not challenge:
        return jsonify({'error': 'No challenge found'}), 400
    
    try:
        # Manually construct AuthenticationCredential
        data = request.json
        credential = AuthenticationCredential(
            id=data['id'],
            raw_id=base64url_to_bytes(data['rawId']),
            response=AuthenticatorAssertionResponse(
                client_data_json=base64url_to_bytes(data['response']['clientDataJSON']),
                authenticator_data=base64url_to_bytes(data['response']['authenticatorData']),
                signature=base64url_to_bytes(data['response']['signature']),
                user_handle=base64url_to_bytes(data['response']['userHandle']) if data['response'].get('userHandle') else None
            ),
            type=PublicKeyCredentialType.PUBLIC_KEY
        )

        authentication_verification = verify_authentication_response(
            credential=credential,
            expected_challenge=base64url_to_bytes(challenge),
            expected_origin=ORIGIN,
            expected_rp_id=RP_ID,
            credential_public_key=base64url_to_bytes(student.public_key),
            credential_current_sign_count=student.sign_count,
        )
        
        student.sign_count = authentication_verification.new_sign_count
        student.current_challenge = None # Clear challenge
        db.session.commit()
        
        return jsonify({'verified': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
