import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBookings();
    }, [activeTab]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const { data } = await API.get(`/bookings?status=${activeTab}`);
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { key: 'all', label: 'All', icon: '📋' },
        { key: 'pending', label: 'Pending', icon: '⏳' },
        { key: 'approved', label: 'Approved', icon: '✅' },
        { key: 'rejected', label: 'Rejected', icon: '❌' },
    ];

    const handleDownloadPDF = async (bookingId) => {
        try {
            const response = await API.get(`/bookings/${bookingId}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `approval-${bookingId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading PDF:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-primary-50">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-3xl font-bold text-gray-900">📑 My Bookings</h1>
                    <p className="text-gray-500 mt-1">Track all your hall booking requests</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 animate-slide-up">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${activeTab === tab.key
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Bookings List */}
                {loading ? (
                    <div className="glass-card rounded-2xl p-12 text-center">
                        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-gray-500">Loading bookings...</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="glass-card rounded-2xl p-12 text-center animate-fade-in">
                        <span className="text-5xl block mb-4">📭</span>
                        <h3 className="text-lg font-semibold text-gray-700">No bookings found</h3>
                        <p className="text-gray-500 mt-1">
                            {activeTab === 'all'
                                ? "You haven't made any booking requests yet."
                                : `No ${activeTab} bookings found.`}
                        </p>
                        <button
                            onClick={() => navigate('/book-hall')}
                            className="btn-primary mt-4 text-sm"
                        >
                            Book a Hall
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-slide-up">
                        {bookings.map((booking, idx) => (
                            <div
                                key={booking._id}
                                className="glass-card rounded-2xl p-5 card-hover"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-gray-800">{booking.eventName}</h3>
                                            <StatusBadge status={booking.status} />
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1.5">
                                                <span className="text-base">🏛️</span>
                                                {booking.hall?.name}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <span className="text-base">📅</span>
                                                {booking.date}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <span className="text-base">🕐</span>
                                                {booking.timeSlot}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <span className="text-base">👥</span>
                                                {booking.expectedAttendance} attendees
                                            </span>
                                        </div>
                                        {booking.facultyComments && (
                                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                                <p className="text-xs font-semibold text-blue-600 mb-0.5">Faculty Comments:</p>
                                                <p className="text-sm text-blue-800">{booking.facultyComments}</p>
                                            </div>
                                        )}
                                    </div>

                                    {booking.status === 'approved' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDownloadPDF(booking._id)}
                                                className="btn-success text-sm py-2 px-4"
                                            >
                                                📄 Download PDF
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookings;
