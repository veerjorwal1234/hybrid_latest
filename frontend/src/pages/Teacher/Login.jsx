import React, { useState } from 'react';
import axios from 'axios';
import config from '../../config';
import { useNavigate, Link } from 'react-router-dom';

const TeacherLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${config.API_URL}/api/auth/login`, {
                role: 'teacher',
                identifier: email,
                password
            });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/teacher/dashboard');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div style={{ width: '100%', maxWidth: '450px' }}>
                <div className="glass-card">
                    <h3 className="text-neon-pink" style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>👨‍🏫 Teacher Login</h3>
                    {error && <div style={{ background: 'rgba(255, 0, 0, 0.2)', border: '1px solid red', padding: '10px', borderRadius: '8px', marginBottom: '15px', color: '#ff4d4d' }}>{error}</div>}
                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Email</label>
                            <input
                                type="email"
                                className="input-glass"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Password</label>
                            <input
                                type="password"
                                className="input-glass"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                        <button type="submit" className="btn-neon-secondary" style={{ width: '100%', padding: '12px', border: 'none', background: 'transparent' }}>Login</button>
                    </form>
                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <Link to="/teacher/register" style={{ textDecoration: 'none', color: '#ffffff', fontWeight: 'bold' }}>Don't have an account? Register</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherLogin;
