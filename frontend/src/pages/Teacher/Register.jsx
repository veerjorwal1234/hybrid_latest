import React, { useState } from 'react';
import axios from 'axios';
import config from '../../config';
import { useNavigate, Link } from 'react-router-dom';

const TeacherRegister = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [subject, setSubject] = useState('');
    const [branch, setBranch] = useState('');
    const [photo, setPhoto] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('role', 'teacher');
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('subject', subject);
        formData.append('branch', branch);
        if (photo) {
            formData.append('photo', photo);
        }

        try {
            await axios.post(`${config.API_URL}/api/auth/register`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/teacher/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: '900px' }}>
                <div className="glass-card" style={{ padding: '2.5rem' }}>
                    <h3 className="text-neon-pink" style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2.2rem' }}>👨‍🏫 Teacher Registration</h3>
                    {error && <div style={{ background: 'rgba(255, 0, 0, 0.2)', border: '1px solid red', padding: '10px', borderRadius: '8px', marginBottom: '15px', color: '#ff4d4d' }}>{error}</div>}
                    {success && <div style={{ background: 'rgba(0, 255, 0, 0.2)', border: '1px solid #0f0', padding: '10px', borderRadius: '8px', marginBottom: '15px', color: '#0f0' }}>{success}</div>}

                    <form onSubmit={handleRegister}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                            {/* Left Column */}
                            <div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Name</label>
                                    <input
                                        type="text"
                                        className="input-glass"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your full name"
                                        required
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Email</label>
                                    <input
                                        type="email"
                                        className="input-glass"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Password</label>
                                    <input
                                        type="password"
                                        className="input-glass"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Create a password"
                                        required
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Subject</label>
                                    <input
                                        type="text"
                                        className="input-glass"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="e.g. Mathematics"
                                        required
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Branch</label>
                                    <input
                                        type="text"
                                        className="input-glass"
                                        value={branch}
                                        onChange={(e) => setBranch(e.target.value)}
                                        placeholder="e.g. CSE"
                                        required
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Profile Photo (Optional)</label>
                                    <input
                                        type="file"
                                        className="input-glass"
                                        onChange={(e) => setPhoto(e.target.files[0])}
                                        accept="image/*"
                                        style={{ padding: '8px', width: '100%' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn-neon-secondary" style={{ width: '100%', padding: '15px', border: 'none', background: 'transparent', fontSize: '1.1rem' }}>Register</button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <Link to="/teacher/login" style={{ textDecoration: 'none', color: '#ffffff', fontWeight: 'bold' }}>Already have an account? Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherRegister;
