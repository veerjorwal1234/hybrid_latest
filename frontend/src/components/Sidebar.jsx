
import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import config from '../config';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/student/login');
    };

    const isActive = (path) => location.pathname === path;

    const linkStyle = (path) => ({
        display: 'block',
        padding: '12px 20px',
        margin: '8px 0',
        borderRadius: '12px',
        textDecoration: 'none',
        color: isActive(path) ? '#fff' : 'rgba(255,255,255,0.7)',
        backgroundColor: isActive(path) ? 'rgba(255,255,255,0.1)' : 'transparent',
        transition: 'all 0.3s ease',
        fontWeight: isActive(path) ? '600' : '400',
        border: isActive(path) ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
    });

    const fileInputRef = React.useRef(null);

    const handlePhotoClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('photo', file);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${config.API_URL}/api/auth/upload-photo`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                const updatedUser = { ...user, photo_path: data.photo_path };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                window.location.reload(); // Reload to show new image
            } else {
                alert('Failed to upload photo');
            }
        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Error uploading photo');
        }
    };

    return (
        <div style={{
            width: '280px',
            height: '100vh',
            background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            padding: '2rem',
            boxShadow: '4px 0 15px rgba(0,0,0,0.3)',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 1000
        }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h2 style={{
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    background: 'linear-gradient(to right, #fff, #a5a5a5)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: 0,
                    marginBottom: '1.5rem'
                }}>
                    ⚡ Smart<br />Attendance
                </h2>

                {(user && (user.role === 'student' || user.role === 'teacher')) && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                            onClick={handlePhotoClick}
                            style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                border: '3px solid var(--neon-cyan)',
                                boxShadow: '0 0 15px rgba(0, 243, 255, 0.3)',
                                marginBottom: '0.5rem',
                                cursor: 'pointer',
                                position: 'relative'
                            }}
                            title="Click to change photo"
                        >
                            <img
                                src={user.photo_path ? `${config.API_URL}${user.photo_path}?t=${new Date().getTime()}` : 'https://via.placeholder.com/150'}
                                alt="Profile"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                fontSize: '0.8rem',
                                padding: '2px'
                            }}>
                                Edit
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{user.name}</div>
                        {user.role === 'student' && (
                            <>
                                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>{user.roll_number}</div>
                                {user.branch && <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>{user.branch}</div>}
                                {user.semester && <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Semester: {user.semester}</div>}
                            </>
                        )}
                        {user.role === 'teacher' && (
                            <>
                                {user.subject && <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>{user.subject}</div>}
                                {user.branch && <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>{user.branch}</div>}
                            </>
                        )}
                    </div>
                )}
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '1rem' }}>
                {!user ? (
                    <>
                        <Link to="/student/login" style={linkStyle('/student/login')}>
                            🎓 Student Login
                        </Link>
                        <Link to="/teacher/login" style={linkStyle('/teacher/login')}>
                            👨‍🏫 Teacher Login
                        </Link>
                    </>
                ) : (
                    <>
                        <div style={{
                            padding: '0 0 1rem 0',
                            marginBottom: '1rem',
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            fontSize: '0.9rem',
                            color: 'rgba(255,255,255,0.5)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            Menu
                        </div>

                        {/* Student Links */}
                        {location.pathname.includes('/student') && (
                            <>
                                <Link to="/student/dashboard" style={linkStyle('/student/dashboard')}>
                                    📊 Dashboard
                                </Link>
                                <Link to="/student/scan-qr" style={linkStyle('/student/scan-qr')}>
                                    📷 Scan QR
                                </Link>
                                <Link to="/student/history" style={linkStyle('/student/history')}>
                                    📅 History
                                </Link>
                                <Link to="/student/notifications" style={linkStyle('/student/notifications')}>
                                    🔔 Notifications
                                </Link>
                            </>
                        )}

                        {/* Teacher Links */}
                        {location.pathname.includes('/teacher') && (
                            <>
                                <Link to="/teacher/dashboard" style={linkStyle('/teacher/dashboard')}>
                                    📊 Dashboard
                                </Link>
                                <Link to="/teacher/generate-qr" style={linkStyle('/teacher/generate-qr')}>
                                    🎫 Generate QR
                                </Link>
                                <Link to="/teacher/reports" style={linkStyle('/teacher/reports')}>
                                    📈 Reports
                                </Link>
                                <Link to="/teacher/notifications" style={linkStyle('/teacher/notifications')}>
                                    🔔 Notifications
                                </Link>
                            </>
                        )}

                        <button
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'rgba(255, 59, 59, 0.2)',
                                color: '#ff6b6b',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'background 0.3s',
                                marginTop: '1rem'
                            }}
                            onMouseOver={(e) => e.target.style.background = 'rgba(255, 59, 59, 0.3)'}
                            onMouseOut={(e) => e.target.style.background = 'rgba(255, 59, 59, 0.2)'}
                        >
                            Logout
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
