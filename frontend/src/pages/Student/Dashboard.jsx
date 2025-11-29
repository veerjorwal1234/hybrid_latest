import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';

const StudentDashboard = () => {
    const [registering, setRegistering] = useState(false);

    // Helper to convert base64url to Uint8Array
    const base64UrlToUint8Array = (base64Url) => {
        const padding = '='.repeat((4 - base64Url.length % 4) % 4);
        const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    // Helper to convert ArrayBuffer to base64url
    const arrayBufferToBase64Url = (buffer) => {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    };

    const handleRegisterDevice = async () => {
        setRegistering(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('No token found. Please login again.');
                return;
            }

            // 1. Get options from server
            console.log('Requesting registration options...');
            let optionsRes;
            try {
                optionsRes = await axios.post(`${config.API_URL}/api/webauthn/register/options`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (err) {
                console.error('Options Request Failed:', err);
                const msg = err.response?.data?.error || err.message;
                throw new Error(msg);
            }

            const options = optionsRes.data;
            console.log('Options received:', options);

            options.challenge = base64UrlToUint8Array(options.challenge);
            options.user.id = base64UrlToUint8Array(options.user.id);

            // 2. Create credential
            console.log('Creating credential...');
            let credential;
            try {
                credential = await navigator.credentials.create({ publicKey: options });
            } catch (err) {
                console.error('Credential Creation Failed:', err);
                throw new Error(`Credential Creation Failed: ${err.name} - ${err.message}`);
            }

            // 3. Send to server
            console.log('Verifying credential...');
            const credentialJSON = {
                id: credential.id,
                rawId: arrayBufferToBase64Url(credential.rawId),
                type: credential.type,
                response: {
                    attestationObject: arrayBufferToBase64Url(credential.response.attestationObject),
                    clientDataJSON: arrayBufferToBase64Url(credential.response.clientDataJSON),
                },
            };

            try {
                await axios.post(`${config.API_URL}/api/webauthn/register/verify`, credentialJSON, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (err) {
                console.error('Verification Request Failed:', err);
                throw new Error(`Verification Request Failed: ${err.message}`);
            }

            alert('Device registered successfully! You can now use fingerprint for attendance.');
        } catch (error) {
            console.error(error);
            alert('Registration failed: ' + error.message);
        } finally {
            setRegistering(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 className="text-neon" style={{ marginBottom: '2rem', fontSize: '2.5rem' }}>🎓 Student Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <h4 style={{ color: 'var(--neon-cyan)', marginBottom: '1rem', fontSize: '1.5rem' }}>📱 Mark Attendance</h4>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Scan the QR code displayed by your teacher to start attendance.</p>
                    <Link to="/student/scan-qr" className="btn-neon" style={{ textDecoration: 'none', display: 'inline-block', padding: '12px 24px' }}>Scan QR Code</Link>
                </div>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <h4 style={{ color: 'var(--neon-pink)', marginBottom: '1rem', fontSize: '1.5rem' }}>📊 My History</h4>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>View your past attendance records.</p>
                    <Link to="/student/history" className="btn-neon-secondary" style={{ textDecoration: 'none', display: 'inline-block', padding: '12px 24px', border: 'none', background: 'transparent' }}>View History</Link>
                </div>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <h4 style={{ color: 'var(--neon-purple)', marginBottom: '1rem', fontSize: '1.5rem' }}>📱 Device Security</h4>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Register your device for faster access.</p>
                    <button
                        onClick={handleRegisterDevice}
                        disabled={registering}
                        className="btn-neon-secondary"
                        style={{ padding: '12px 24px', border: 'none', background: 'transparent' }}
                    >
                        {registering ? 'Registering...' : '🖐️ Register Fingerprint'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
