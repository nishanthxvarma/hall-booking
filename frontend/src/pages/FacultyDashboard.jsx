import { useState, useEffect } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';

const FacultyDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [activeTab, setActiveTab] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [commentModal, setCommentModal] = useState({ open: false, bookingId: null, action: '' });
    const [comment, setComment] = useState('');
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

    useEffect(() => {
        fetchBookings();
        fetchStats();
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

    const fetchStats = async () => {
        try {
            const { data } = await API.get('/bookings/stats');
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleAction = async (bookingId, status) => {
        if (status === 'changes_requested' || status === 'rejected') {
            setCommentModal({ open: true, bookingId, action: status });
            return;
        }
        await submitAction(bookingId, status, '');
    };

    const submitAction = async (bookingId, status, facultyComments) => {
        setActionLoading(bookingId);
        try {
            await API.put(`/bookings/${bookingId}/status`, { status, facultyComments });
            fetchBookings();
            fetchStats();
            setCommentModal({ open: false, bookingId: null, action: '' });
            setComment('');
        } catch (error) {
            alert(error.response?.data?.message || 'Action failed');
        } finally {
            setActionLoading(null);
        }
    };

    const tabs = [
        { key: 'pending', label: 'Pending', icon: '⏳', count: stats.pending },
        { key: 'approved', label: 'Approved', icon: '✅', count: stats.approved },
        { key: 'rejected', label: 'Rejected', icon: '❌', count: stats.rejected },
        { key: 'all', label: 'All', icon: '📋', count: null },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-primary-50">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-3xl font-bold text-gray-900">✅ Faculty Approval Dashboard</h1>
                    <p className="text-gray-500 mt-1">Review and manage hall booking requests</p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-8 animate-slide-up">
                    <div className="glass-card rounded-2xl p-5 text-center card-hover">
                        <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
                        <p className="text-sm text-gray-500 font-medium mt-1">⏳ Pending</p>
                    </div>
                    <div className="glass-card rounded-2xl p-5 text-center card-hover">
                        <p className="text-3xl font-bold text-emerald-600">{stats.approved}</p>
                        <p className="text-sm text-gray-500 font-medium mt-1">✅ Approved</p>
                    </div>
                    <div className="glass-card rounded-2xl p-5 text-center card-hover">
                        <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                        <p className="text-sm text-gray-500 font-medium mt-1">❌ Rejected</p>
                    </div>
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
                            {tab.count !== null && tab.count > 0 && (
                                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key ? 'bg-white/20' : 'bg-gray-100'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Booking Cards */}
                {loading ? (
                    <div className="glass-card rounded-2xl p-12 text-center">
                        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-gray-500">Loading requests...</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="glass-card rounded-2xl p-12 text-center animate-fade-in">
                        <span className="text-5xl block mb-4">📭</span>
                        <h3 className="text-lg font-semibold text-gray-700">No {activeTab} requests</h3>
                        <p className="text-gray-500 mt-1">
                            {activeTab === 'pending' ? 'All caught up! No pending requests to review.' : `No ${activeTab} bookings found.`}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4 animate-slide-up">
                        {bookings.map((booking, idx) => (
                            <div
                                key={booking._id}
                                className="glass-card rounded-2xl p-6 card-hover"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-bold text-gray-800">{booking.eventName}</h3>
                                            <StatusBadge status={booking.status} />
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Requested by <span className="font-semibold text-gray-700">{booking.requestedBy?.name}</span>
                                            {booking.requestedBy?.clubName && (
                                                <span className="text-primary-600"> ({booking.requestedBy.clubName})</span>
                                            )}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        {new Date(booking.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <p className="text-xs text-gray-500 font-medium">Hall</p>
                                        <p className="font-semibold text-gray-800 text-sm mt-0.5">{booking.hall?.name}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <p className="text-xs text-gray-500 font-medium">Date</p>
                                        <p className="font-semibold text-gray-800 text-sm mt-0.5">{booking.date}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <p className="text-xs text-gray-500 font-medium">Time</p>
                                        <p className="font-semibold text-gray-800 text-sm mt-0.5">{booking.timeSlot}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <p className="text-xs text-gray-500 font-medium">Attendance</p>
                                        <p className="font-semibold text-gray-800 text-sm mt-0.5">{booking.expectedAttendance}</p>
                                    </div>
                                </div>

                                {booking.requirements && (
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                                        <p className="text-xs font-semibold text-blue-600 mb-0.5">Requirements</p>
                                        <p className="text-sm text-blue-800">{booking.requirements}</p>
                                    </div>
                                )}

                                {booking.facultyComments && booking.status !== 'pending' && (
                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl mb-4">
                                        <p className="text-xs font-semibold text-gray-600 mb-0.5">Your Comments</p>
                                        <p className="text-sm text-gray-800">{booking.facultyComments}</p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                {booking.status === 'pending' && (
                                    <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
                                        <button
                                            onClick={() => handleAction(booking._id, 'approved')}
                                            disabled={actionLoading === booking._id}
                                            className="btn-success text-sm py-2.5 px-5 disabled:opacity-50"
                                        >
                                            {actionLoading === booking._id ? '...' : '✅ Approve'}
                                        </button>
                                        <button
                                            onClick={() => handleAction(booking._id, 'changes_requested')}
                                            disabled={actionLoading === booking._id}
                                            className="btn-warning text-sm py-2.5 px-5 disabled:opacity-50"
                                        >
                                            ✏️ Suggest Changes
                                        </button>
                                        <button
                                            onClick={() => handleAction(booking._id, 'rejected')}
                                            disabled={actionLoading === booking._id}
                                            className="btn-danger text-sm py-2.5 px-5 disabled:opacity-50"
                                        >
                                            ❌ Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Comment Modal */}
            {commentModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                            {commentModal.action === 'rejected' ? '❌ Reject Booking' : '✏️ Suggest Changes'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            {commentModal.action === 'rejected'
                                ? 'Please provide a reason for rejecting this request.'
                                : 'Describe the changes you would like the student to make.'}
                        </p>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="input-field min-h-[120px] resize-none"
                            placeholder="Enter your comments..."
                            autoFocus
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setCommentModal({ open: false, bookingId: null, action: '' });
                                    setComment('');
                                }}
                                className="btn-secondary flex-1 text-sm py-2.5"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => submitAction(commentModal.bookingId, commentModal.action, comment)}
                                className={`flex-1 text-sm py-2.5 ${commentModal.action === 'rejected' ? 'btn-danger' : 'btn-warning'
                                    }`}
                            >
                                {commentModal.action === 'rejected' ? 'Reject' : 'Submit Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyDashboard;
