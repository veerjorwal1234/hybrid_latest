import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';

const TeacherDashboard = () => {
    const [recentSessions, setRecentSessions] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [sessionToDelete, setSessionToDelete] = React.useState(null);
    const [currentTime, setCurrentTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    React.useEffect(() => {
        const fetchRecentSessions = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${config.API_URL}/api/teacher/recent-sessions`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setRecentSessions(response.data);
            } catch (error) {
                console.error('Error fetching recent sessions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentSessions();
    }, []);

    const handleDeleteSession = (sessionId) => {
        setSessionToDelete(sessionId);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!sessionToDelete) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${config.API_URL}/api/teacher/session/${sessionToDelete}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setRecentSessions(prevSessions => prevSessions.filter(session => session.session_id !== sessionToDelete));
            setDeleteModalOpen(false);
            setSessionToDelete(null);
        } catch (error) {
            console.error('Error deleting session:', error);
            alert('Error deleting session');
        }
    };

    const cancelDelete = () => {
        setDeleteModalOpen(false);
        setSessionToDelete(null);
    };

    const formatTimeLeft = (expiresAt) => {
        if (!expiresAt) return 'N/A';
        const expiry = new Date(expiresAt);
        // Adjust for timezone if needed, but assuming expiresAt is UTC and we compare with local or UTC
        // Actually, expires_at from backend is UTC (datetime.utcnow()).
        // new Date(expiresAt + 'Z') might be needed if isoformat doesn't include Z
        const now = new Date();
        // Backend sends isoformat which might not have Z. Let's treat it as UTC.
        const expiryDate = new Date(expiresAt.endsWith('Z') ? expiresAt : expiresAt + 'Z');

        const diff = expiryDate - now;

        if (diff <= 0) return 'Expired';

        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        return `${minutes}m ${seconds}s`;
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 className="text-neon-pink" style={{ marginBottom: '2rem', fontSize: '2.5rem' }}>👨‍🏫 Teacher Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <h4 style={{ color: 'var(--neon-pink)', marginBottom: '1rem', fontSize: '1.5rem' }}>🎯 Start New Session</h4>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Generate a QR code for students to scan.</p>
                    <Link to="/teacher/generate-qr" className="btn-neon-secondary" style={{ textDecoration: 'none', display: 'inline-block', padding: '12px 24px', border: 'none', background: 'transparent' }}>Generate QR Code</Link>
                </div>
                <div className="glass-card" style={{ textAlign: 'center' }}>
                    <h4 style={{ color: 'var(--neon-cyan)', marginBottom: '1rem', fontSize: '1.5rem' }}>📈 View Reports</h4>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>AI-powered insights and analytics.</p>
                    <Link to="/teacher/reports" className="btn-neon" style={{ textDecoration: 'none', display: 'inline-block', padding: '12px 24px' }}>🤖 Generate AI Report</Link>
                </div>
            </div>

            <div className="glass-card">
                <h3 style={{ color: 'var(--neon-purple)', marginBottom: '1.5rem' }}>📅 Recent 10 Sessions</h3>
                {loading ? (
                    <p style={{ color: 'var(--text-muted)' }}>Loading recent sessions...</p>
                ) : recentSessions.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {recentSessions.map((session) => (
                            <div key={session.session_id} style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                border: '1px solid rgba(255, 255, 255, 0.05)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div>
                                        <h4 style={{ color: 'var(--neon-blue)', margin: 0, fontSize: '1.2rem' }}>{session.subject}</h4>
                                        <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
                                            {session.classroom} • {session.year} - {session.course} • {session.date} • {session.start_time} - {session.end_time}
                                        </p>
                                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
                                            <span style={{ color: 'var(--neon-green)' }}>
                                                👥 Total Present: {session.students.length}
                                            </span>
                                            <span style={{ color: 'var(--neon-yellow)' }}>
                                                ⏳ QR Expires: {formatTimeLeft(session.expires_at)}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <Link to={`/teacher/view-attendance/${session.session_id}`} style={{ color: 'var(--neon-cyan)', textDecoration: 'none', fontSize: '0.9rem' }}>
                                            View Live &rarr;
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteSession(session.session_id)}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid var(--neon-red)',
                                                color: 'var(--neon-red)',
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseOver={(e) => e.target.style.background = 'rgba(255, 0, 0, 0.1)'}
                                            onMouseOut={(e) => e.target.style.background = 'transparent'}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                {session.students.length > 0 ? (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)' }}>Roll No</th>
                                                    <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)' }}>Name</th>
                                                    <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)' }}>Time</th>
                                                    <th style={{ padding: '8px', textAlign: 'left', color: 'var(--text-muted)' }}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {session.students.map((student, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                        <td style={{ padding: '8px' }}>{student.roll_number}</td>
                                                        <td style={{ padding: '8px' }}>{student.name}</td>
                                                        <td style={{ padding: '8px' }}>{student.time}</td>
                                                        <td style={{ padding: '8px' }}>
                                                            <span style={{
                                                                color: student.status === 'Present' ? 'var(--neon-green)' :
                                                                    student.status === 'Late' ? 'var(--neon-yellow)' : 'var(--neon-red)'
                                                            }}>
                                                                {student.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem', margin: 0 }}>No attendance marked yet.</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-muted)' }}>No recent sessions found.</p>
                )}
            </div>

            {/* Custom Delete Modal */}
            {deleteModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div className="glass-card" style={{ padding: '2rem', maxWidth: '400px', width: '90%', textAlign: 'center', border: '1px solid var(--neon-red)' }}>
                        <h3 style={{ color: 'var(--neon-red)', marginBottom: '1rem' }}>⚠️ Delete Session?</h3>
                        <p style={{ color: 'var(--text-main)', marginBottom: '2rem' }}>
                            Are you sure you want to delete this session? This action cannot be undone and all attendance data will be lost.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                            <button
                                onClick={cancelDelete}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--text-muted)',
                                    background: 'transparent',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'var(--neon-red)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    boxShadow: '0 0 15px rgba(255, 0, 0, 0.4)'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;
