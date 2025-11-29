import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config';
import { useParams, useNavigate } from 'react-router-dom';

const ViewAttendance = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    // Manual Attendance State
    const [showManualModal, setShowManualModal] = useState(false);
    const [manualForm, setManualForm] = useState({
        student_name: '',
        roll_number: '',
        remarks: ''
    });
    const [manualLoading, setManualLoading] = useState(false);

    // Helper to safely get stats (handles "Invalid Attempt" key)
    const getStat = (stats, key) => {
        if (!stats) return 0;
        if (stats[key] !== undefined) return stats[key];
        if (key === 'Invalid' && stats['Invalid Attempt'] !== undefined)
            return stats['Invalid Attempt'];
        return 0;
    };

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.role !== 'teacher') {
                alert('Only teachers can view attendance. Please log in as a teacher.');
                navigate('/teacher/login');
                return;
            }
        } else {
            navigate('/teacher/login');
            return;
        }
    }, [navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setFetchError('Not authenticated – please log in as a teacher.');
                    navigate('/teacher/login');
                    return;
                }
                const response = await axios.get(
                    `${config.API_URL}/api/teacher/attendance/${sessionId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setData(response.data);
                setFetchError(null);
            } catch (err) {
                console.error('⚠️ Attendance fetch error:', err);
                const msg = err.response?.data?.error || err.message || 'Failed to load attendance data.';
                setFetchError(msg);
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [sessionId, navigate]);

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        setManualLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${config.API_URL}/api/teacher/manual-attendance`, {
                session_id: sessionId,
                ...manualForm
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Reset form and close modal
            setManualForm({ student_name: '', roll_number: '', remarks: '' });
            setShowManualModal(false);
            alert('Manual attendance added successfully!');

            // Refresh data immediately
            // We can just wait for the next interval or trigger a fetch, but alert is blocking anyway
        } catch (err) {
            console.error('Manual attendance error:', err);
            alert(err.response?.data?.error || 'Failed to add manual attendance');
        } finally {
            setManualLoading(false);
        }
    };

    if (loading) return <div className="text-center mt-5">Loading...</div>;
    if (fetchError) {
        return (
            <div className="text-center mt-5 text-danger">
                <h4>⚠️ Unable to load attendance data</h4>
                <p>{fetchError}</p>
                <button className="btn btn-primary mt-3" onClick={() => window.location.reload()}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Live Attendance Monitor</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowManualModal(true)}
                    style={{ background: 'var(--neon-cyan)', border: 'none' }}
                >
                    + Add Manual Attendance
                </button>
            </div>

            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card p-3 bg-success text-white text-center">
                        <h3>{getStat(data.stats, 'Present')}</h3>
                        <p>Present</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card p-3 bg-warning text-dark text-center">
                        <h3>{getStat(data.stats, 'Late')}</h3>
                        <p>Late</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card p-3 bg-danger text-white text-center">
                        <h3>{getStat(data.stats, 'Short')}</h3>
                        <p>Short</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card p-3 bg-secondary text-white text-center">
                        <h3>{getStat(data.stats, 'Invalid')}</h3>
                        <p>Invalid</p>
                    </div>
                </div>
            </div>

            <div className="card p-4 mb-4">
                <h4>Student List</h4>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Roll Number</th>
                            <th>Name</th>
                            <th>Inside Count</th>
                            <th>Total Samples</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.students.map((student, index) => (
                            <tr key={index}>
                                <td>{student.roll_number}</td>
                                <td>{student.student_name}</td>
                                <td>{student.inside_count}</td>
                                <td>{student.total_samples}</td>
                                <td>
                                    <span className={`badge status-${student.status.toLowerCase()}`}>
                                        {student.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {data.manual_students && data.manual_students.length > 0 && (
                <div className="card p-4">
                    <h4>Students Registered Manually</h4>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Roll Number</th>
                                <th>Name</th>
                                <th>Remarks</th>
                                <th>Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.manual_students.map((student, index) => (
                                <tr key={index}>
                                    <td>{student.roll_number}</td>
                                    <td>{student.student_name}</td>
                                    <td>{student.remarks}</td>
                                    <td>{new Date(student.timestamp).toLocaleTimeString()}</td>
                                    <td>
                                        <span className="badge bg-success">Present (Manual)</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Manual Attendance Modal */}
            {showManualModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div className="glass-card" style={{ width: '400px', padding: '2rem', background: '#1a1a2e', border: '1px solid var(--neon-cyan)' }}>
                        <h4 style={{ color: 'var(--neon-cyan)', marginBottom: '1.5rem' }}>Add Manual Attendance</h4>
                        <form onSubmit={handleManualSubmit}>
                            <div className="mb-3">
                                <label className="form-label text-white">Student Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={manualForm.student_name}
                                    onChange={e => setManualForm({ ...manualForm, student_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label text-white">Roll Number</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={manualForm.roll_number}
                                    onChange={e => setManualForm({ ...manualForm, roll_number: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label text-white">Remarks / Reason</label>
                                <textarea
                                    className="form-control"
                                    value={manualForm.remarks}
                                    onChange={e => setManualForm({ ...manualForm, remarks: e.target.value })}
                                    placeholder="e.g. Internet issue, Emergency"
                                    required
                                />
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowManualModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={manualLoading}
                                    style={{ background: 'var(--neon-cyan)', border: 'none' }}
                                >
                                    {manualLoading ? 'Adding...' : 'Add Student'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewAttendance;
