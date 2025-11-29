import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const user = JSON.parse(localStorage.getItem('user'));
    const isTeacher = user && user.role === 'teacher';

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${config.API_URL}/api/notifications/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch notifications');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${config.API_URL}/api/notifications/`,
                { title, message },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess('Notification created successfully!');
            setTitle('');
            setMessage('');
            fetchNotifications(); // Refresh list
        } catch (err) {
            setError('Failed to create notification');
        }
    };

    if (loading) return <div className="text-center mt-5">Loading...</div>;

    return (
        <div className="container mt-4">
            <h2 className="mb-4">📢 Notifications</h2>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {isTeacher && (
                <div className="card mb-4 shadow-sm">
                    <div className="card-header bg-primary text-white">
                        <h5 className="mb-0">Create New Notification</h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Message</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                ></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary">Post Notification</button>
                        </form>
                    </div>
                </div>
            )}

            <div className="list-group">
                {notifications.length === 0 ? (
                    <div className="text-center text-muted">No notifications yet.</div>
                ) : (
                    notifications.map((notif) => (
                        <div key={notif.id} className="list-group-item list-group-item-action flex-column align-items-start mb-3 shadow-sm border-0 rounded">
                            <div className="d-flex w-100 justify-content-between">
                                <h5 className="mb-1 text-primary">{notif.title}</h5>
                                <small className="text-muted">{new Date(notif.created_at).toLocaleString()}</small>
                            </div>
                            <p className="mb-1">{notif.message}</p>
                            <small className="text-muted">Posted by: {notif.teacher_name}</small>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
