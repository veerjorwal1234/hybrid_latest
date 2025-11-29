import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const NavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user'));

    const hiddenPaths = [
        '/',
        '/student/login',
        '/teacher/login',
        '/student/register',
        '/teacher/register',
        '/student/dashboard',
        '/teacher/dashboard'
    ];

    const hideBackButton = hiddenPaths.includes(location.pathname);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/student/login');
    };

    return (
        <nav className="navbar-glass" style={{ position: 'sticky', top: 0, zIndex: 1000, marginBottom: '2rem' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {!hideBackButton && (
                        <button
                            onClick={() => navigate(-1)}
                            className="btn"
                            style={{
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                            }}
                            title="Go Back"
                        >
                            &#8592;
                        </button>
                    )}
                    <Link className="navbar-brand" to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none', color: '#ffffff' }}>
                        ⚡ Smart Attendance
                    </Link>
                </div>
                <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0, gap: '2rem', alignItems: 'center' }}>
                    {!user ? (
                        <>
                            <li>
                                <Link className="nav-link-glow" to="/student/login" style={{ textDecoration: 'none' }}>Student Login</Link>
                            </li>
                            <li>
                                <Link className="nav-link-glow" to="/teacher/login" style={{ textDecoration: 'none' }}>Teacher Login</Link>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <span style={{ color: '#ffffff', fontWeight: '600' }}>Welcome, {user.name}</span>
                            </li>
                            <li>
                                <button className="btn-neon" onClick={handleLogout}>Logout</button>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default NavBar;
