import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ViewHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                const user = JSON.parse(localStorage.getItem('user'));

                if (!token || user?.role !== 'student') {
                    navigate('/student/login');
                    return;
                }

                const response = await axios.get('http://localhost:5001/api/student/history', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setHistory(response.data.history);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to fetch history');
                setLoading(false);
            }
        };

        fetchHistory();
    }, [navigate]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Present': return 'status-present';
            case 'Late': return 'status-late';
            case 'Short': return 'status-short';
            default: return 'status-invalid';
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 className="text-neon" style={{ marginBottom: '2rem', fontSize: '2.5rem', textAlign: 'center' }}>📊 My Attendance History</h2>

            {loading && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        margin: '0 auto 1rem',
                        border: '4px solid var(--neon-cyan)',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <p style={{ color: 'var(--text-muted)' }}>Loading your attendance records...</p>
                </div>
            )}

            {error && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: '#ff4d4d', marginBottom: '1rem' }}>❌ {error}</p>
                    <button className="btn-neon" onClick={() => navigate('/student/dashboard')} style={{ padding: '10px 20px' }}>
                        Back to Dashboard
                    </button>
                </div>
            )}

            {!loading && !error && history.length === 0 && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>📭 No Attendance Records Yet</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>You haven't marked any attendance yet. Scan a QR code to get started!</p>
                    <button className="btn-neon" onClick={() => navigate('/student/scan-qr')} style={{ padding: '12px 24px' }}>
                        Scan QR Code
                    </button>
                </div>
            )}

            {!loading && !error && history.length > 0 && (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {history.map((record) => (
                        <div key={record.id} className="glass-card" style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto',
                            gap: '1.5rem',
                            alignItems: 'center',
                            transition: 'transform 0.2s ease'
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                    <h4 style={{ color: 'var(--neon-cyan)', margin: 0, fontSize: '1.2rem' }}>
                                        {record.subject_name}
                                    </h4>
                                    <span className={`status-badge ${getStatusColor(record.status)}`}>
                                        {record.status}
                                    </span>
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                    📅 {record.date} • 🕐 {record.time}
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    <span style={{ color: '#ffffff' }}>GPS Samples:</span> {record.inside_count}/{record.total_samples} inside geofence
                                </div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    background: record.status === 'Present' ? 'rgba(0, 255, 0, 0.1)' :
                                        record.status === 'Late' ? 'rgba(255, 165, 0, 0.1)' :
                                            record.status === 'Short' ? 'rgba(255, 0, 0, 0.1)' :
                                                'rgba(128, 128, 128, 0.1)',
                                    border: `3px solid ${record.status === 'Present' ? '#0f0' :
                                        record.status === 'Late' ? 'orange' :
                                            record.status === 'Short' ? '#ff4d4d' : '#888'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2rem',
                                    boxShadow: `0 0 20px ${record.status === 'Present' ? 'rgba(0, 255, 0, 0.3)' :
                                        record.status === 'Late' ? 'rgba(255, 165, 0, 0.3)' :
                                            'rgba(255, 0, 0, 0.3)'}`
                                }}>
                                    {record.status === 'Present' ? '✓' :
                                        record.status === 'Late' ? '⚠' :
                                            record.status === 'Short' ? '!' : '✗'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button className="btn-neon-secondary" onClick={() => navigate('/student/dashboard')} style={{ padding: '10px 24px', border: 'none', background: 'transparent' }}>
                    ← Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default ViewHistory;
