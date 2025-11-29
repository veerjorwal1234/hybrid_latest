import React, { useState } from 'react';
import axios from 'axios';
import config from '../../config';
import { useNavigate, Link } from 'react-router-dom';

const StudentRegister = () => {
    const [name, setName] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [password, setPassword] = useState('');
    const [semester, setSemester] = useState('');
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
        formData.append('role', 'student');
        formData.append('name', name);
        formData.append('roll_number', rollNumber);
        formData.append('password', password);
        formData.append('semester', semester);
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
            setTimeout(() => navigate('/student/login'), 2000);
        } catch (err) {
            console.error("Registration Error:", err);
            const msg = err.response?.data?.error || err.message || 'Registration failed';
            setError(msg);
            alert(msg);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 140px)' }}>
            <div style={{ width: '100%', maxWidth: '800px' }}>
                <div className="glass-card" style={{ padding: '2.5rem' }}>
                    <h3 className="text-neon" style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>🎓 Student Registration</h3>
                    {error && <div style={{ background: 'rgba(255, 0, 0, 0.2)', border: '1px solid red', padding: '10px', borderRadius: '8px', marginBottom: '15px', color: '#ff4d4d' }}>{error}</div>}
                    {success && <div style={{ background: 'rgba(0, 255, 0, 0.2)', border: '1px solid #0f0', padding: '10px', borderRadius: '8px', marginBottom: '15px', color: '#0f0' }}>{success}</div>}
                    <form onSubmit={handleRegister}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Name</label>
                                <input
                                    type="text"
                                    className="input-glass"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    required
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Roll Number</label>
                                <input
                                    type="text"
                                    className="input-glass"
                                    value={rollNumber}
                                    onChange={(e) => setRollNumber(e.target.value)}
                                    placeholder="Enter your roll number"
                                    required
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Branch</label>
                                <input
                                    type="text"
                                    className="input-glass"
                                    value={branch}
                                    onChange={(e) => setBranch(e.target.value)}
                                    placeholder="e.g. Computer Science"
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Semester</label>
                                <input
                                    type="text"
                                    className="input-glass"
                                    value={semester}
                                    onChange={(e) => setSemester(e.target.value)}
                                    placeholder="e.g. 5th Semester"
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Password</label>
                                <input
                                    type="password"
                                    className="input-glass"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create a password"
                                    required
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Profile Photo</label>
                                <input
                                    type="file"
                                    className="input-glass"
                                    onChange={(e) => setPhoto(e.target.files[0])}
                                    accept="image/*"
                                    style={{ marginBottom: 0, padding: '10px' }}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-neon" style={{ width: '100%', padding: '12px', marginTop: '2rem' }}>Register</button>
                    </form>
                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <Link to="/student/login" style={{ textDecoration: 'none', color: '#ffffff', fontWeight: 'bold' }}>Already have an account? Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentRegister;
