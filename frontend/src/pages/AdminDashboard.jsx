import { useState, useEffect } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
    const [pendingFaculty, setPendingFaculty] = useState([]);
    const [approvedFaculty, setApprovedFaculty] = useState([]);
    const [activeTab, setActiveTab] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [stats, setStats] = useState({ pendingFaculty: 0, approvedFaculty: 0, totalStudents: 0 });
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pendingRes, approvedRes, statsRes] = await Promise.all([
                API.get('/admin/pending-faculty'),
                API.get('/admin/approved-faculty'),
                API.get('/admin/stats'),
            ]);
            setPendingFaculty(pendingRes.data);
            setApprovedFaculty(approvedRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
    };

    const handleApprove = async (id, name) => {
        setActionLoading(id);
        try {
            await API.put(`/admin/approve-faculty/${id}`);
            showToast(`✅ ${name}'s faculty account has been approved!`, 'success');
            fetchData();
        } catch (error) {
            showToast(error.response?.data?.message || 'Approval failed', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id, name) => {
        if (!window.confirm(`Are you sure you want to reject and remove ${name}'s account? This cannot be undone.`)) {
            return;
        }
        setActionLoading(id);
        try {
            await API.delete(`/admin/reject-faculty/${id}`);
            showToast(`❌ ${name}'s faculty account has been rejected and removed.`, 'warning');
            fetchData();
        } catch (error) {
            showToast(error.response?.data?.message || 'Rejection failed', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const tabs = [
        { key: 'pending', label: 'Pending Requests', icon: '⏳', count: stats.pendingFaculty },
        { key: 'approved', label: 'Approved Faculty', icon: '✅', count: stats.approvedFaculty },
    ];

    const displayList = activeTab === 'pending' ? pendingFaculty : approvedFaculty;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-primary-50">
            <Navbar />

            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed top-20 right-4 z-50 animate-slide-up">
                    <div className={`px-6 py-4 rounded-2xl shadow-2xl text-white font-medium text-sm max-w-sm ${toast.type === 'success' ? 'bg-emerald-500' :
                            toast.type === 'warning' ? 'bg-amber-500' :
                                'bg-red-500'
                        }`}>
                        {toast.message}
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-3xl font-bold text-gray-900">🛡️ Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1">Manage faculty registrations and system users</p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-8 animate-slide-up">
                    <div className="glass-card rounded-2xl p-5 text-center card-hover">
                        <p className="text-3xl font-bold text-amber-600">{stats.pendingFaculty}</p>
                        <p className="text-sm text-gray-500 font-medium mt-1">⏳ Pending Faculty</p>
                    </div>
                    <div className="glass-card rounded-2xl p-5 text-center card-hover">
                        <p className="text-3xl font-bold text-emerald-600">{stats.approvedFaculty}</p>
                        <p className="text-sm text-gray-500 font-medium mt-1">✅ Approved Faculty</p>
                    </div>
                    <div className="glass-card rounded-2xl p-5 text-center card-hover">
                        <p className="text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
                        <p className="text-sm text-gray-500 font-medium mt-1">🎓 Total Students</p>
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
                            {tab.count > 0 && (
                                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key ? 'bg-white/20' : 'bg-gray-100'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="glass-card rounded-2xl p-12 text-center">
                        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-gray-500">Loading faculty data...</p>
                    </div>
                ) : displayList.length === 0 ? (
                    <div className="glass-card rounded-2xl p-12 text-center animate-fade-in">
                        <span className="text-5xl block mb-4">{activeTab === 'pending' ? '🎉' : '📭'}</span>
                        <h3 className="text-lg font-semibold text-gray-700">
                            {activeTab === 'pending' ? 'No pending faculty requests' : 'No approved faculty yet'}
                        </h3>
                        <p className="text-gray-500 mt-1">
                            {activeTab === 'pending'
                                ? 'All caught up! No faculty registrations are waiting for review.'
                                : 'Approved faculty members will appear here.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4 animate-slide-up">
                        {displayList.map((faculty, idx) => (
                            <div
                                key={faculty._id}
                                className="glass-card rounded-2xl p-6 card-hover"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center text-white text-lg font-bold shadow-lg">
                                            {faculty.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800">{faculty.name}</h3>
                                            <p className="text-sm text-gray-500">{faculty.email}</p>
                                            <div className="flex flex-wrap gap-3 mt-2">
                                                {faculty.department && (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
                                                        🏛️ {faculty.department}
                                                    </span>
                                                )}
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                                                    🆔 {faculty.collegeId}
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
                                                    📅 {new Date(faculty.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {activeTab === 'pending' && (
                                        <div className="flex gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => handleApprove(faculty._id, faculty.name)}
                                                disabled={actionLoading === faculty._id}
                                                className="btn-success text-sm py-2 px-4 disabled:opacity-50"
                                            >
                                                {actionLoading === faculty._id ? '...' : '✅ Approve'}
                                            </button>
                                            <button
                                                onClick={() => handleReject(faculty._id, faculty.name)}
                                                disabled={actionLoading === faculty._id}
                                                className="btn-danger text-sm py-2 px-4 disabled:opacity-50"
                                            >
                                                {actionLoading === faculty._id ? '...' : '❌ Reject'}
                                            </button>
                                        </div>
                                    )}
                                    {activeTab === 'approved' && (
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full">
                                            ✅ Active
                                        </span>
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

export default AdminDashboard;
