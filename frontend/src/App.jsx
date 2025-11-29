import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import StudentLogin from './pages/Student/Login';
import StudentRegister from './pages/Student/Register';
import StudentDashboard from './pages/Student/Dashboard';
import ViewHistory from './pages/Student/ViewHistory';
import TeacherLogin from './pages/Teacher/Login';
import TeacherRegister from './pages/Teacher/Register';
import TeacherDashboard from './pages/Teacher/Dashboard';
import GenerateQR from './pages/Teacher/GenerateQR';
import ViewAttendance from './pages/Teacher/ViewAttendance';
import ViewReports from './pages/Teacher/ViewReports';
import Notifications from './pages/Notifications';
import ScanQR from './pages/Student/ScanQR';
import Sidebar from './components/Sidebar';
import NavBar from './components/NavBar';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/student/login" />} />

            {/* Student Routes */}
            <Route path="/student/login" element={<StudentLogin />} />
            <Route path="/student/register" element={<StudentRegister />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/scan-qr" element={<ScanQR />} />
            <Route path="/student/history" element={<ViewHistory />} />
            <Route path="/student/notifications" element={<Notifications />} />

            {/* Teacher Routes */}
            <Route path="/teacher/login" element={<TeacherLogin />} />
            <Route path="/teacher/register" element={<TeacherRegister />} />
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/generate-qr" element={<GenerateQR />} />
            <Route path="/teacher/view-attendance/:sessionId" element={<ViewAttendance />} />
            <Route path="/teacher/reports" element={<ViewReports />} />
            <Route path="/teacher/notifications" element={<Notifications />} />
        </Routes>
    );
};

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const authPaths = [
        '/',
        '/student/login',
        '/teacher/login',
        '/student/register',
        '/teacher/register'
    ];

    const isAuthPage = authPaths.includes(location.pathname);

    // Back button logic for internal pages
    const hiddenBackPaths = [
        ...authPaths,
        '/student/dashboard',
        '/teacher/dashboard'
    ];
    const showBackButton = !hiddenBackPaths.includes(location.pathname);

    if (isAuthPage) {
        return (
            <>
                <NavBar />
                <div className="container mt-4">
                    <AppRoutes />
                </div>
            </>
        );
    }

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ flex: 1, marginLeft: '280px', padding: '2rem', minHeight: '100vh' }}>
                {showBackButton && (
                    <div style={{ marginBottom: '1rem' }}>
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
                    </div>
                )}
                <div className="container">
                    <AppRoutes />
                </div>
            </div>
        </div>
    );
};

function App() {
    return (
        <Router>
            <Layout />
        </Router>
    );
}

export default App;
