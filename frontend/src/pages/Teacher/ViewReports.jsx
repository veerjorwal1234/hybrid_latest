import React, { useState } from 'react';
import axios from 'axios';
import config from '../../config';
import { useNavigate } from 'react-router-dom';

const ViewReports = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [recordsAnalyzed, setRecordsAnalyzed] = useState(0);
    const navigate = useNavigate();

    const generateReport = async () => {
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));

            if (!token || user?.role !== 'teacher') {
                navigate('/teacher/login');
                return;
            }

            setLoading(true);
            setError('');
            setReport(null);

            const response = await axios.post(`${config.API_URL}/api/teacher/generate-report`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setReport(response.data.report);
            setRecordsAnalyzed(response.data.records_analyzed);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to generate report');
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 className="text-neon" style={{ marginBottom: '2rem', fontSize: '2.5rem', textAlign: 'center' }}>
                📊 AI-Powered Reports
            </h2>

            {!loading && !report && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h3 style={{ color: 'var(--neon-cyan)', marginBottom: '1rem', fontSize: '1.8rem' }}>
                        🤖 Generate Intelligent Report
                    </h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>
                        Let AI analyze your attendance data and provide insights, patterns, and recommendations.
                    </p>
                    <button
                        className="btn-neon"
                        onClick={generateReport}
                        style={{ padding: '15px 30px', fontSize: '1.1rem' }}
                    >
                        ✨ Generate Report with Gemini AI
                    </button>
                </div>
            )}

            {loading && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 1.5rem',
                        border: '6px solid var(--neon-cyan)',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <h3 style={{ color: 'var(--neon-cyan)', marginBottom: '1rem' }}>🤖 AI is analyzing your data...</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Gemini is processing attendance patterns and generating insights</p>
                </div>
            )}

            {error && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: '#ff4d4d', marginBottom: '1.5rem', fontSize: '1.1rem' }}>❌ {error}</p>
                    <button className="btn-neon" onClick={generateReport} style={{ padding: '12px 24px', marginRight: '1rem' }}>
                        🔄 Try Again
                    </button>
                    <button className="btn-neon-secondary" onClick={() => navigate('/teacher/dashboard')} style={{ padding: '12px 24px', border: 'none', background: 'transparent' }}>
                        Back to Dashboard
                    </button>
                </div>
            )}

            {report && !loading && (
                <div style={{ display: 'grid', gap: '2rem' }}>
                    {/* Header Stats */}
                    <div className="glass-card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(0, 243, 255, 0.1), rgba(255, 0, 255, 0.1))' }}>
                        <h3 style={{ color: 'var(--neon-cyan)', marginBottom: '0.5rem' }}>
                            ✅ Report Generated Successfully
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Analyzed {recordsAnalyzed} attendance records using Gemini AI
                        </p>
                    </div>

                    {/* Summary Section */}
                    <div className="glass-card">
                        <h3 style={{ color: 'var(--neon-cyan)', marginBottom: '1.5rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            📝 Summary
                        </h3>
                        <p style={{ color: '#ffffff', lineHeight: '1.8', fontSize: '1.05rem' }}>
                            {report.summary || 'No summary available'}
                        </p>
                    </div>

                    {/* Insights Section */}
                    {report.insights && report.insights.length > 0 && (
                        <div className="glass-card">
                            <h3 style={{ color: 'var(--neon-pink)', marginBottom: '1.5rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                💡 Key Insights
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {report.insights.map((insight, index) => (
                                    <li key={index} style={{
                                        padding: '1rem',
                                        marginBottom: '1rem',
                                        background: 'rgba(255, 0, 255, 0.05)',
                                        borderLeft: '4px solid var(--neon-pink)',
                                        borderRadius: '8px',
                                        color: '#ffffff',
                                        fontSize: '1rem'
                                    }}>
                                        <span style={{ color: 'var(--neon-pink)', marginRight: '0.5rem' }}>▸</span>
                                        {insight}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Recommendations Section */}
                    {report.recommendations && report.recommendations.length > 0 && (
                        <div className="glass-card">
                            <h3 style={{ color: '#22c55e', marginBottom: '1.5rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                🎯 Recommendations
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {report.recommendations.map((recommendation, index) => (
                                    <li key={index} style={{
                                        padding: '1rem',
                                        marginBottom: '1rem',
                                        background: 'rgba(34, 197, 94, 0.05)',
                                        borderLeft: '4px solid #22c55e',
                                        borderRadius: '8px',
                                        color: '#ffffff',
                                        fontSize: '1rem'
                                    }}>
                                        <span style={{ color: '#22c55e', marginRight: '0.5rem' }}>✓</span>
                                        {recommendation}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Raw Response (Debug) */}
                    {report.raw_response && (
                        <details className="glass-card" style={{ cursor: 'pointer' }}>
                            <summary style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '0.5rem' }}>
                                View Full AI Response
                            </summary>
                            <pre style={{
                                background: 'rgba(0, 0, 0, 0.3)',
                                padding: '1rem',
                                borderRadius: '8px',
                                color: 'var(--text-muted)',
                                fontSize: '0.85rem',
                                overflow: 'auto',
                                marginTop: '1rem',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {report.raw_response}
                            </pre>
                        </details>
                    )}

                    {/* Actions */}
                    <div style={{ textAlign: 'center', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button className="btn-neon" onClick={generateReport} style={{ padding: '12px 24px' }}>
                            🔄 Generate New Report
                        </button>
                        <button className="btn-neon-secondary" onClick={() => navigate('/teacher/dashboard')} style={{ padding: '12px 24px', border: 'none', background: 'transparent' }}>
                            ← Back to Dashboard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewReports;
