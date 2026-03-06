import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';

const BookHall = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [halls, setHalls] = useState([]);
    const [formData, setFormData] = useState({
        hall: '',
        date: searchParams.get('date') || '',
        timeSlot: '',
        eventName: '',
        expectedAttendance: '',
        requirements: '',
    });
    const [availability, setAvailability] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingHalls, setLoadingHalls] = useState(true);
    const [error, setError] = useState('');
    const [checkingAvailability, setCheckingAvailability] = useState(false);

    useEffect(() => {
        fetchHalls();
    }, []);

    useEffect(() => {
        if (formData.hall && formData.date) {
            checkAvailability();
        } else {
            setAvailability(null);
        }
    }, [formData.hall, formData.date]);

    const fetchHalls = async () => {
        try {
            const { data } = await API.get('/halls');
            setHalls(data);
        } catch (error) {
            console.error('Error fetching halls:', error);
        } finally {
            setLoadingHalls(false);
        }
    };

    const checkAvailability = async () => {
        setCheckingAvailability(true);
        try {
            const { data } = await API.get(`/bookings/availability?hallId=${formData.hall}&date=${formData.date}`);
            setAvailability(data);
        } catch (error) {
            console.error('Error checking availability:', error);
        } finally {
            setCheckingAvailability(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'hall' || name === 'date') {
            setFormData(prev => ({ ...prev, [name]: value, timeSlot: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await API.post('/bookings', {
                ...formData,
                expectedAttendance: parseInt(formData.expectedAttendance),
            });
            navigate(`/booking-confirmed/${data._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit booking request.');
        } finally {
            setLoading(false);
        }
    };

    const selectedHall = halls.find(h => h._id === formData.hall);

    // Get today's date in YYYY-MM-DD format for min date attribute
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-primary-50">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 transition-colors mb-4"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">📋 Book a Hall</h1>
                    <p className="text-gray-500 mt-1">Fill in the details below to request a hall booking</p>
                </div>

                {/* Form */}
                <div className="glass-card rounded-2xl p-6 sm:p-8 animate-slide-up">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-fade-in">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Hall Selection */}
                        <div>
                            <label htmlFor="hall-select" className="block text-sm font-semibold text-gray-700 mb-2">
                                Select Hall
                            </label>
                            {loadingHalls ? (
                                <div className="input-field flex items-center gap-2 text-gray-400">
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Loading halls...
                                </div>
                            ) : halls.length === 0 ? (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
                                    ⚠️ No halls available. Please ask a faculty member to add halls first.
                                </div>
                            ) : (
                                <select
                                    id="hall-select"
                                    name="hall"
                                    value={formData.hall}
                                    onChange={handleChange}
                                    className="input-field cursor-pointer"
                                    required
                                >
                                    <option value="">Choose a hall...</option>
                                    {halls.map((hall) => (
                                        <option key={hall._id} value={hall._id}>
                                            {hall.name} — {hall.location} (Capacity: {hall.capacity})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Selected Hall Info */}
                        {selectedHall && (
                            <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl animate-fade-in">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-lg">🏛️</div>
                                    <div>
                                        <p className="font-semibold text-primary-800">{selectedHall.name}</p>
                                        <p className="text-sm text-primary-600">{selectedHall.location} • Capacity: {selectedHall.capacity}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Date Selection */}
                        <div>
                            <label htmlFor="date-select" className="block text-sm font-semibold text-gray-700 mb-2">
                                Select Date
                            </label>
                            <input
                                id="date-select"
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                min={today}
                                className="input-field cursor-pointer"
                                required
                            />
                        </div>

                        {/* Time Slot with Availability */}
                        <div>
                            <label htmlFor="timeslot-select" className="block text-sm font-semibold text-gray-700 mb-2">
                                Time Slot
                                {checkingAvailability && (
                                    <span className="ml-2 text-xs text-gray-400 font-normal">Checking availability...</span>
                                )}
                            </label>
                            {availability ? (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {availability.slots.map((slot) => (
                                            <button
                                                key={slot.slot}
                                                type="button"
                                                disabled={!slot.available}
                                                onClick={() => setFormData({ ...formData, timeSlot: slot.slot })}
                                                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${formData.timeSlot === slot.slot
                                                        ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md'
                                                        : slot.available
                                                            ? 'border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50/50'
                                                            : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed line-through'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span>{slot.slot}</span>
                                                    {slot.available ? (
                                                        <span className="text-xs text-emerald-600 font-semibold">Available</span>
                                                    ) : (
                                                        <span className="text-xs text-red-500 font-semibold capitalize">{slot.status}</span>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    {availability.slots.every(s => !s.available) && (
                                        <p className="text-sm text-red-600 mt-2">⚠️ All slots are booked for this date. Try another date.</p>
                                    )}
                                </div>
                            ) : (
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-sm text-center">
                                    {formData.hall && formData.date
                                        ? 'Loading time slot availability...'
                                        : 'Select a hall and date to see available time slots'}
                                </div>
                            )}
                        </div>

                        {/* Event Name */}
                        <div>
                            <label htmlFor="event-name" className="block text-sm font-semibold text-gray-700 mb-2">
                                Event Name
                            </label>
                            <input
                                id="event-name"
                                type="text"
                                name="eventName"
                                value={formData.eventName}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="e.g., Annual Tech Symposium"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Expected Attendance */}
                            <div>
                                <label htmlFor="attendance" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Expected Attendance
                                </label>
                                <input
                                    id="attendance"
                                    type="number"
                                    name="expectedAttendance"
                                    value={formData.expectedAttendance}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="e.g., 100"
                                    min="1"
                                    max={selectedHall?.capacity || 9999}
                                    required
                                />
                                {selectedHall && (
                                    <p className="text-xs text-gray-500 mt-1">Max capacity: {selectedHall.capacity}</p>
                                )}
                            </div>

                            {/* Requirements */}
                            <div>
                                <label htmlFor="requirements" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Requirements <span className="font-normal text-gray-400">(optional)</span>
                                </label>
                                <input
                                    id="requirements"
                                    type="text"
                                    name="requirements"
                                    value={formData.requirements}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="e.g., Projector, Mic"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            id="submit-booking"
                            type="submit"
                            disabled={loading || !formData.hall || !formData.timeSlot}
                            className="w-full btn-primary text-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Submitting Request...
                                </span>
                            ) : (
                                '🚀 Submit Booking Request'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookHall;
