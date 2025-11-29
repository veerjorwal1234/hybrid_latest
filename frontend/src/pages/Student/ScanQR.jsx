import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import config from '../../config';
import { useNavigate } from 'react-router-dom';

const ScanQR = () => {
    const [scanResult, setScanResult] = useState(null);
    const [samples, setSamples] = useState([]);
    const [status, setStatus] = useState('Verifying'); // Verifying, Scanning, Sampling, Submitting, Done
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

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

    const handleVerify = async () => {
        try {
            const token = localStorage.getItem('token');
            // 1. Get options
            const optionsRes = await axios.post(`${config.API_URL}/api/webauthn/login/options`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const options = optionsRes.data;
            options.challenge = base64UrlToUint8Array(options.challenge);
            options.allowCredentials.forEach(cred => {
                cred.id = base64UrlToUint8Array(cred.id);
            });

            // 2. Get assertion
            const credential = await navigator.credentials.get({ publicKey: options });

            // 3. Verify
            const credentialJSON = {
                id: credential.id,
                rawId: arrayBufferToBase64Url(credential.rawId),
                type: credential.type,
                response: {
                    authenticatorData: arrayBufferToBase64Url(credential.response.authenticatorData),
                    clientDataJSON: arrayBufferToBase64Url(credential.response.clientDataJSON),
                    signature: arrayBufferToBase64Url(credential.response.signature),
                    userHandle: credential.response.userHandle ? arrayBufferToBase64Url(credential.response.userHandle) : null,
                },
            };

            await axios.post(`${config.API_URL}/api/webauthn/login/verify`, credentialJSON, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setStatus('Scanning');
        } catch (error) {
            console.error(error);
            if (error.response?.data?.error === 'No credential registered') {
                alert('Please register your device in the Dashboard first.');
                navigate('/student/dashboard');
            } else {
                alert('Verification failed: ' + (error.response?.data?.error || error.message));
            }
        }
    };

    useEffect(() => {
        if (status === 'Verifying') {
            // Auto-trigger verification or wait for user click?
            // Better to wait for user click to avoid "User gesture required" errors in some browsers
        }
    }, [status]);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.role !== 'student') {
                alert('Only students can scan QR codes. Please log in as a student.');
                navigate('/student/login');
                return;
            }
        } else {
            // Optional: Redirect if not logged in at all, though the token check later handles this too.
            // For better UX, we can redirect here.
            navigate('/student/login');
            return;
        }

        if (status === 'Scanning') {
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
            );

            scanner.render((decodedText) => {
                setScanResult(decodedText);
                setStatus('Sampling');
                scanner.clear();
            }, (error) => {
                // console.warn(error);
            });

            return () => {
                scanner.clear().catch(error => console.error("Failed to clear scanner", error));
            };
        }
    }, [status, navigate]);

    useEffect(() => {
        if (status === 'Sampling') {
            const maxSamples = 12;
            const intervalTime = 5000; // 5 seconds per sample = 12 samples in 1 minute

            const interval = setInterval(() => {
                // Get REAL GPS location from device
                if (navigator.geolocation) {
                    const getPosition = (highAccuracy = true) => {
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                const newSample = {
                                    latitude: position.coords.latitude,
                                    longitude: position.coords.longitude,
                                    accuracy: position.coords.accuracy,
                                    timestamp: new Date().toISOString()
                                };

                                setSamples(prev => {
                                    const updated = [...prev, newSample];
                                    if (updated.length >= maxSamples) {
                                        clearInterval(interval);
                                        setStatus('Submitting');
                                    }
                                    return updated;
                                });
                            },
                            (error) => {
                                console.error(`GPS Error (HighAccuracy: ${highAccuracy}):`, error);
                                if (highAccuracy && error.code !== error.PERMISSION_DENIED) {
                                    console.log("Retrying with low accuracy...");
                                    getPosition(false); // Retry with low accuracy
                                } else {
                                    let errMsg = error.message;
                                    if (error.code === error.PERMISSION_DENIED) errMsg = "Location permission denied.";
                                    else if (error.code === error.POSITION_UNAVAILABLE) errMsg = "Location unavailable.";
                                    else if (error.code === error.TIMEOUT) errMsg = "Location request timed out.";

                                    setMessage(`GPS Error: ${errMsg}. Try moving outdoors.`);
                                    clearInterval(interval);
                                    setStatus('Done');
                                }
                            },
                            {
                                enableHighAccuracy: highAccuracy,
                                timeout: 20000,
                                maximumAge: 5000
                            }
                        );
                    };

                    getPosition(true); // Start with high accuracy
                } else {
                    setMessage('GPS not supported on this device');
                    clearInterval(interval);
                    setStatus('Done');
                }
            }, intervalTime);

            return () => clearInterval(interval);
        }
    }, [status]);

    const handleRetry = () => {
        setSamples([]);
        setMessage('');
        setStatus('Scanning');
    };

    const testLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }
        alert("Testing Location Access... Please wait.");
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                alert(`Success! \nLat: ${pos.coords.latitude} \nLng: ${pos.coords.longitude} \nAccuracy: ${pos.coords.accuracy}m`);
            },
            (err) => {
                let reason = "Unknown";
                if (err.code === 1) reason = "Permission Denied (Check Browser/OS Settings)";
                if (err.code === 2) reason = "Position Unavailable (Weak Signal/No Wi-Fi)";
                if (err.code === 3) reason = "Timeout (Took too long)";
                alert(`Location Test Failed: ${reason}\nError Message: ${err.message}`);
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
        );
    };

    useEffect(() => {
        if (status === 'Submitting') {
            const submitAttendance = async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        setMessage('Error: No authentication token found. Please log in as a student.');
                        setStatus('Done');
                        return;
                    }
                    console.log('Submitting attendance with token:', token);
                    const response = await axios.post(`${config.API_URL}/api/student/submit-attendance`, {
                        qr_token: scanResult,
                        samples: samples
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    console.log('Submission Response:', response.data);
                    const count = response.data.inside_count !== undefined ? response.data.inside_count : 'N/A';
                    setMessage(`Attendance Marked: ${response.data.status} (Inside: ${count})`);
                    setStatus('Done');
                } catch (err) {
                    console.error('Full error:', err);
                    console.error('Error response:', err.response);
                    const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
                    setMessage(`Error submitting attendance: ${errorMsg}`);
                    setStatus('Done');
                }
            };
            submitAttendance();
        }
    }, [status, samples, scanResult]);

    return (
        <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            <h2 className="text-neon" style={{ marginBottom: '2rem', fontSize: '2.5rem', textAlign: 'center' }}>📱 Attendance Scanner</h2>

            {/* Diagnostic Button */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <button className="btn-neon-secondary" onClick={testLocation} style={{ padding: '8px 16px', fontSize: '0.9rem', border: 'none', background: 'transparent' }}>
                    🛠️ Test Location Access
                </button>
            </div>

            <div className="glass-card">
                {status === 'Verifying' && (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
                        <h4 className="text-neon" style={{ marginBottom: '1rem' }}>Identity Verification Required</h4>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Please verify your identity with your fingerprint to continue.</p>
                        <button
                            onClick={handleVerify}
                            className="btn-neon"
                            style={{ padding: '15px 30px', fontSize: '1.1rem' }}
                        >
                            🖐️ Verify Identity
                        </button>
                    </div>
                )}

                {status === 'Scanning' && (
                    <div>
                        <div id="reader"></div>
                        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>Scan the teacher's QR code to begin.</p>
                        <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                            <h5 style={{ color: 'var(--neon-cyan)', marginBottom: '1rem' }}>Debug: Manual Entry</h5>
                            <input
                                type="text"
                                className="input-glass"
                                placeholder="Paste QR Token here"
                                onChange={(e) => {
                                    if (e.target.value.length > 10) {
                                        setScanResult(e.target.value);
                                        setStatus('Sampling');
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}

                {status === 'Sampling' && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 1.5rem',
                            border: '4px solid var(--neon-cyan)',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        <h4 className="text-neon" style={{ marginBottom: '1rem' }}>Collecting GPS Samples...</h4>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Please stay in class. Sample {samples.length + 1} / 12</p>
                        {samples.length > 0 && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px' }}>
                                <p style={{ margin: '2px 0' }}>Last: {samples[samples.length - 1].latitude.toFixed(5)}, {samples[samples.length - 1].longitude.toFixed(5)}</p>
                                <p style={{ margin: '2px 0' }}>Accuracy: <span style={{ color: samples[samples.length - 1].accuracy > 100 ? '#ff4d4d' : '#00f3ff' }}>{Math.round(samples[samples.length - 1].accuracy)}m</span></p>
                            </div>
                        )}
                        <div style={{
                            width: '100%',
                            height: '10px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${(samples.length / 12) * 100}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-pink))',
                                transition: 'width 0.5s ease',
                                boxShadow: '0 0 10px var(--neon-cyan)'
                            }}></div>
                        </div>
                    </div>
                )}

                {status === 'Submitting' && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 1.5rem',
                            border: '4px solid var(--neon-pink)',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <h4 className="text-neon-pink">Submitting Attendance...</h4>
                    </div>
                )}

                {status === 'Done' && (
                    <div className="glass-card" style={{ textAlign: 'center' }}>
                        <h5 className="text-neon" style={{ marginBottom: '1.5rem' }}>{message}</h5>
                        <button className="btn-neon" onClick={() => navigate('/student/dashboard')} style={{ padding: '12px 24px', marginRight: '10px' }}>
                            Back to Dashboard
                        </button>
                        {message.includes('Error') && (
                            <button className="btn-neon-secondary" onClick={handleRetry} style={{ padding: '12px 24px', border: 'none', background: 'transparent' }}>
                                Retry
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScanQR;
