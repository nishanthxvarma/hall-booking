import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';

const BookingConfirmed = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBooking();
    }, [id]);

    const fetchBooking = async () => {
        try {
            const { data } = await API.get(`/bookings/${id}`);
            setBooking(data);
        } catch (error) {
            console.error('Error fetching booking:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const response = await API.get(`/bookings/${id}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `approval-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading PDF:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-primary-50">
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                    <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    const isApproved = booking?.status === 'approved';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-primary-50">
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="glass-card rounded-3xl p-8 text-center animate-scale-in">
                    {/* Success Icon */}
                    <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 animate-bounce-in ${isApproved ? 'bg-emerald-100' : 'bg-primary-100'
                        }`}>
                        {isApproved ? (
                            <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        {isApproved ? 'Booking Approved! 🎉' : 'Request Submitted Successfully!'}
                    </h1>
                    <p className="text-gray-500 mb-8">
                        {isApproved
                            ? 'Your hall booking has been approved by the faculty.'
                            : 'Your booking request has been submitted and is pending faculty approval.'
                        }
                    </p>

                    {/* Booking Details */}
                    {booking && (
                        <div className="bg-gray-50 rounded-2xl p-6 text-left mb-8">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Booking Details</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-sm text-gray-600">Event</span>
                                    <span className="font-semibold text-gray-800">{booking.eventName}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-sm text-gray-600">Hall</span>
                                    <span className="font-semibold text-gray-800">{booking.hall?.name}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-sm text-gray-600">Date</span>
                                    <span className="font-semibold text-gray-800">{booking.date}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-sm text-gray-600">Time</span>
                                    <span className="font-semibold text-gray-800">{booking.timeSlot}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-sm text-gray-600">Attendance</span>
                                    <span className="font-semibold text-gray-800">{booking.expectedAttendance}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm text-gray-600">Status</span>
                                    <span className={`status-badge ${booking.status === 'approved' ? 'status-approved' :
                                            booking.status === 'pending' ? 'status-pending' :
                                                booking.status === 'rejected' ? 'status-rejected' : 'status-changes'
                                        }`}>
                                        {booking.status === 'changes_requested' ? 'Changes Requested' : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {isApproved && (
                            <button onClick={handleDownloadPDF} className="btn-success text-sm">
                                📄 Download Approval PDF
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/my-bookings')}
                            className="btn-secondary text-sm"
                        >
                            📑 View All Bookings
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="btn-primary text-sm"
                        >
                            🏠 Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmed;
