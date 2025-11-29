import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import { QRCodeSVG } from 'qrcode.react';
import { Link, useNavigate } from 'react-router-dom';

const GenerateQR = () => {
    const [qrToken, setQrToken] = useState('');
    const [sessionId, setSessionId] = useState('');
    const [polygon, setPolygon] = useState('[[18.77650087426464, 73.69443644062979], [18.757928884141037, 73.66731143492491], [18.74377631173372, 73.6876308776894], [18.762875716118945, 73.7193882307322]]');

    // New Form State
    const [formData, setFormData] = useState({
        classroom_name: '',
        subject_name: '',
        date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        year: '',
        course: ''
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.role !== 'teacher') {
                alert('Only teachers can generate QR codes. Please log in as a teacher.');
                navigate('/teacher/login');
                return;
            }
        } else {
            navigate('/teacher/login');
            return;
        }
    }, [navigate]);

    const handleGenerate = async () => {
        // Validation
        if (!formData.classroom_name || !formData.subject_name || !formData.date || !formData.start_time || !formData.end_time || !formData.year || !formData.course) {
            alert('Please fill in all class details before generating QR code.');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('You are not logged in as a teacher. Please log in first.');
                navigate('/teacher/login');
                return;
            }
            const response = await axios.post(`${config.API_URL}/api/teacher/generate-qr`, {
                polygon: JSON.parse(polygon),
                ...formData
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setQrToken(response.data.qr_token);
            setSessionId(response.data.session_id);
        } catch (err) {
            console.error('QR Generation Error:', err);
            console.error('Error response:', err.response);
            const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
            alert(`Error generating QR Code: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 160px)' }}>
            <div style={{ width: '100%', maxWidth: '800px' }}>
                {!qrToken ? (
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <h2 className="text-neon-pink" style={{ marginBottom: '1.5rem', fontSize: '2rem', textAlign: 'center' }}>🎯 Generate Class QR Code</h2>
                        <h4 style={{ color: 'var(--neon-pink)', marginBottom: '1rem' }}>📝 Class Details</h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '0.8rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Classroom Name</label>
                                <input type="text" name="classroom_name" value={formData.classroom_name} onChange={handleInputChange} className="input-glass" placeholder="e.g. Room 101" style={{ marginBottom: 0, padding: '10px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Subject Name</label>
                                <input type="text" name="subject_name" value={formData.subject_name} onChange={handleInputChange} className="input-glass" placeholder="e.g. Mathematics" style={{ marginBottom: 0, padding: '10px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Course Year</label>
                                <input type="text" name="year" value={formData.year} onChange={handleInputChange} className="input-glass" placeholder="e.g. 2024" style={{ marginBottom: 0, padding: '10px' }} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '0.8rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Course</label>
                                <input type="text" name="course" value={formData.course} onChange={handleInputChange} className="input-glass" placeholder="e.g. B.Tech" style={{ marginBottom: 0, padding: '10px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Date</label>
                                <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="input-glass" style={{ marginBottom: 0, padding: '10px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Start Time</label>
                                <input type="time" name="start_time" value={formData.start_time} onChange={handleInputChange} className="input-glass" style={{ marginBottom: 0, padding: '10px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>End Time</label>
                                <input type="time" name="end_time" value={formData.end_time} onChange={handleInputChange} className="input-glass" style={{ marginBottom: 0, padding: '10px' }} />
                            </div>
                        </div>

                        <h4 style={{ color: 'var(--neon-pink)', marginBottom: '0.8rem', marginTop: '1rem' }}>📍 Geofence Definition</h4>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <textarea
                                className="input-glass"
                                rows="2"
                                value={polygon}
                                onChange={(e) => setPolygon(e.target.value)}
                                placeholder="[[lat1, lng1], [lat2, lng2], ...]"
                                style={{ fontSize: '0.85rem', fontFamily: 'monospace', resize: 'vertical', marginBottom: 0, padding: '10px' }}
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="btn-neon-secondary"
                            style={{ width: '100%', padding: '12px', border: 'none', background: 'transparent', opacity: loading ? 0.5 : 1 }}
                        >
                            {loading ? '⏳ Generating...' : '✨ Generate QR Code'}
                        </button>
                    </div>
                ) : (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                        <h4 style={{ color: 'var(--neon-cyan)', marginBottom: '1rem', fontSize: '1.8rem' }}>📱 Your QR Code</h4>
                        <div style={{
                            background: 'white',
                            padding: '15px',
                            borderRadius: '16px',
                            display: 'inline-block',
                            marginBottom: '1rem',
                            boxShadow: '0 0 30px rgba(0, 243, 255, 0.3)'
                        }}>
                            <QRCodeSVG value={qrToken} size={200} />
                        </div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Session ID: <span className="text-neon">{sessionId}</span></p>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', wordBreak: 'break-all', fontSize: '0.85rem' }}>Token: <span className="text-neon">{qrToken}</span></p>

                        <div style={{ textAlign: 'left', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '1rem' }}>
                            <p style={{ margin: '4px 0', color: 'var(--text-main)' }}><strong>Class:</strong> {formData.classroom_name}</p>
                            <p style={{ margin: '4px 0', color: 'var(--text-main)' }}><strong>Subject:</strong> {formData.subject_name}</p>
                            <p style={{ margin: '4px 0', color: 'var(--text-main)' }}><strong>Time:</strong> {formData.start_time} - {formData.end_time}</p>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <Link
                                to={`/teacher/view-attendance/${sessionId}`}
                                className="btn-neon"
                                style={{ textDecoration: 'none', display: 'inline-block', padding: '12px 24px' }}
                            >
                                📊 View Live Attendance
                            </Link>
                            <button
                                onClick={() => setQrToken('')}
                                className="btn-neon-secondary"
                                style={{ padding: '12px 24px', border: '1px solid var(--neon-pink)', background: 'transparent', color: 'var(--neon-pink)', cursor: 'pointer' }}
                            >
                                🔄 Generate Another
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenerateQR;
