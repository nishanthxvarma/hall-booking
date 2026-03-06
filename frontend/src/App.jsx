import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ClubDashboard from './pages/ClubDashboard';
import BookHall from './pages/BookHall';
import MyBookings from './pages/MyBookings';
import FacultyDashboard from './pages/FacultyDashboard';
import ManageHalls from './pages/ManageHalls';
import BookingConfirmed from './pages/BookingConfirmed';
import AdminDashboard from './pages/AdminDashboard';

const HomeRedirect = () => {
    const { user, loading } = useAuth();

    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;

    if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (user.role === 'faculty') return <Navigate to="/faculty-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Student Routes */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <ClubDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/book-hall" element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <BookHall />
                        </ProtectedRoute>
                    } />
                    <Route path="/my-bookings" element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <MyBookings />
                        </ProtectedRoute>
                    } />
                    <Route path="/booking-confirmed/:id" element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <BookingConfirmed />
                        </ProtectedRoute>
                    } />

                    {/* Faculty Routes */}
                    <Route path="/faculty-dashboard" element={
                        <ProtectedRoute allowedRoles={['faculty']}>
                            <FacultyDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/manage-halls" element={
                        <ProtectedRoute allowedRoles={['faculty']}>
                            <ManageHalls />
                        </ProtectedRoute>
                    } />

                    {/* Admin Routes */}
                    <Route path="/admin-dashboard" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Default */}
                    <Route path="/" element={<HomeRedirect />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
