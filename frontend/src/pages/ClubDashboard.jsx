import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import Calendar from '../components/Calendar';

const ClubDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ pending: 0, approved: 0, upcoming: 0, rejected: 0 });
    const [recentBookings, setRecentBookings] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, bookingsRes] = await Promise.all([
                API.get('/bookings/stats'),
                API.get('/bookings'),
            ]);
            setStats(statsRes.data);
            setRecentBookings(bookingsRes.data.slice(0, 5));
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        navigate(`/book-hall?date=${date}`);
    };

    const statCards = [
        { title: 'Pending Requests', value: stats.pending, icon: '⏳', color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50' },
        { title: 'Upcoming Events', value: stats.upcoming, icon: '📅', color: 'from-blue-400 to-blue-600', bg: 'bg-blue-50' },
        { title: 'Approved Bookings', value: stats.approved, icon: '✅', color: 'from-emerald-400 to-green-600', bg: 'bg-emerald-50' },
        { title: 'Rejected', value: stats.rejected, icon: '❌', color: 'from-red-400 to-red-600', bg: 'bg-red-50' },
    ];

    const getStatusClass = (status) => {
        const map = { pending: 'status-pending', approved: 'status-approved', rejected: 'status-rejected', changes_requested: 'status-changes' };
        return map[status] || 'status-pending';
    };

    const getStatusLabel = (status) => {
        const map = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected', changes_requested: 'Changes' };
        return map[status] || status;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-primary-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Header */}
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome, <span className="gradient-text">{user?.clubName || user?.name}!</span>
                    </h1>
                    <p className="text-gray-500 mt-1">Here's an overview of your hall booking activity</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {statCards.map((card, idx) => (
                        <div key={idx} className="glass-card rounded-2xl p-5 card-hover animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center text-lg`}>
                                    {card.icon}
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{loading ? '—' : card.value}</p>
                            <p className="text-xs font-medium text-gray-500 mt-0.5">{card.title}</p>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Calendar */}
                    <div className="lg:col-span-1 animate-slide-up" style={{ animationDelay: '200ms' }}>
                        <h2 className="text-lg font-bold text-gray-800 mb-4">📅 Select a Date</h2>
                        <Calendar onDateSelect={handleDateSelect} selectedDate={selectedDate} />
                        <p className="text-xs text-gray-500 mt-3 text-center">Click a date to start booking</p>
                    </div>

                    {/* Recent Bookings */}
                    <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '300ms' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-800">📋 Recent Bookings</h2>
                            <button
                                onClick={() => navigate('/my-bookings')}
                                className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                            >
                                View All →
                            </button>
                        </div>

                        {loading ? (
                            <div className="glass-card rounded-2xl p-8 text-center">
                                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3"></div>
                                <p className="text-gray-500">Loading bookings...</p>
                            </div>
                        ) : recentBookings.length === 0 ? (
                            <div className="glass-card rounded-2xl p-8 text-center">
                                <span className="text-4xl block mb-3">📭</span>
                                <p className="text-gray-600 font-medium">No bookings yet</p>
                                <p className="text-gray-400 text-sm mt-1">Select a date from the calendar to book a hall</p>
                                <button
                                    onClick={() => navigate('/book-hall')}
                                    className="btn-primary mt-4 text-sm"
                                >
                                    Book a Hall
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentBookings.map((booking) => (
                                    <div key={booking._id} className="glass-card rounded-xl p-4 card-hover">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800">{booking.eventName}</h3>
                                                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">🏛️ {booking.hall?.name}</span>
                                                    <span className="flex items-center gap-1">📅 {booking.date}</span>
                                                    <span className="flex items-center gap-1">🕐 {booking.timeSlot}</span>
                                                </div>
                                            </div>
                                            <span className={`status-badge ${getStatusClass(booking.status)}`}>
                                                {getStatusLabel(booking.status)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <button
                                onClick={() => navigate('/book-hall')}
                                className="glass-card rounded-xl p-4 card-hover text-left group"
                            >
                                <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">📋</span>
                                <p className="font-semibold text-gray-800 text-sm">Book a Hall</p>
                                <p className="text-xs text-gray-500">Submit a new request</p>
                            </button>
                            <button
                                onClick={() => navigate('/my-bookings')}
                                className="glass-card rounded-xl p-4 card-hover text-left group"
                            >
                                <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">📑</span>
                                <p className="font-semibold text-gray-800 text-sm">My Bookings</p>
                                <p className="text-xs text-gray-500">Track all requests</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClubDashboard;
