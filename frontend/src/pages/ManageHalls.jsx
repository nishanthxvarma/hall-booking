import { useState, useEffect } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';

const ManageHalls = () => {
    const [halls, setHalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingHall, setEditingHall] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        capacity: '',
        amenities: '',
        timeSlots: [''],
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchHalls();
    }, []);

    const fetchHalls = async () => {
        try {
            const { data } = await API.get('/halls');
            setHalls(data);
        } catch (error) {
            console.error('Error fetching halls:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', location: '', capacity: '', amenities: '', timeSlots: [''] });
        setEditingHall(null);
        setShowForm(false);
    };

    const handleEdit = (hall) => {
        setFormData({
            name: hall.name,
            location: hall.location,
            capacity: hall.capacity,
            amenities: hall.amenities || '',
            timeSlots: hall.timeSlots.length ? hall.timeSlots : [''],
        });
        setEditingHall(hall._id);
        setShowForm(true);
    };

    const addTimeSlot = () => {
        setFormData({ ...formData, timeSlots: [...formData.timeSlots, ''] });
    };

    const removeTimeSlot = (index) => {
        const newSlots = formData.timeSlots.filter((_, i) => i !== index);
        setFormData({ ...formData, timeSlots: newSlots.length ? newSlots : [''] });
    };

    const updateTimeSlot = (index, value) => {
        const newSlots = [...formData.timeSlots];
        newSlots[index] = value;
        setFormData({ ...formData, timeSlots: newSlots });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const filteredSlots = formData.timeSlots.filter(s => s.trim() !== '');
        if (filteredSlots.length === 0) {
            alert('Please add at least one time slot');
            setSubmitting(false);
            return;
        }

        try {
            const payload = {
                ...formData,
                capacity: parseInt(formData.capacity),
                timeSlots: filteredSlots,
            };

            if (editingHall) {
                await API.put(`/halls/${editingHall}`, payload);
            } else {
                await API.post('/halls', payload);
            }

            fetchHalls();
            resetForm();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save hall');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this hall?')) return;
        try {
            await API.delete(`/halls/${id}`);
            fetchHalls();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete hall');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-primary-50">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">🏛️ Manage Halls</h1>
                        <p className="text-gray-500 mt-1">Add, edit, and manage hall details and time slots</p>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                        className="btn-primary text-sm"
                    >
                        + Add New Hall
                    </button>
                </div>

                {/* Add/Edit Form */}
                {showForm && (
                    <div className="glass-card rounded-2xl p-6 mb-8 animate-scale-in">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            {editingHall ? '✏️ Edit Hall' : '➕ Add New Hall'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hall Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-field"
                                        placeholder="e.g., Seminar Hall A"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="input-field"
                                        placeholder="e.g., Block A, 2nd Floor"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Capacity</label>
                                    <input
                                        type="number"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                        className="input-field"
                                        placeholder="e.g., 200"
                                        min="1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Amenities <span className="text-gray-400 font-normal">(optional)</span></label>
                                    <input
                                        type="text"
                                        value={formData.amenities}
                                        onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                                        className="input-field"
                                        placeholder="e.g., Projector, AC, Sound System"
                                    />
                                </div>
                            </div>

                            {/* Time Slots */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-gray-700">Time Slots</label>
                                    <button
                                        type="button"
                                        onClick={addTimeSlot}
                                        className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                                    >
                                        + Add Slot
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {formData.timeSlots.map((slot, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={slot}
                                                onChange={(e) => updateTimeSlot(index, e.target.value)}
                                                className="input-field flex-1"
                                                placeholder="e.g., 9:00 AM - 11:00 AM"
                                            />
                                            {formData.timeSlots.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTimeSlot(index)}
                                                    className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="btn-secondary text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn-primary text-sm disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : editingHall ? 'Update Hall' : 'Add Hall'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Halls List */}
                {loading ? (
                    <div className="glass-card rounded-2xl p-12 text-center">
                        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-gray-500">Loading halls...</p>
                    </div>
                ) : halls.length === 0 ? (
                    <div className="glass-card rounded-2xl p-12 text-center animate-fade-in">
                        <span className="text-5xl block mb-4">🏛️</span>
                        <h3 className="text-lg font-semibold text-gray-700">No halls added yet</h3>
                        <p className="text-gray-500 mt-1">Click "Add New Hall" to add your first hall</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
                        {halls.map((hall) => (
                            <div key={hall._id} className="glass-card rounded-2xl p-5 card-hover">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">{hall.name}</h3>
                                        <p className="text-sm text-gray-500">{hall.location}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEdit(hall)}
                                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors text-sm"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(hall._id)}
                                            className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors text-sm"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">👥 Capacity: {hall.capacity}</span>
                                    {hall.amenities && (
                                        <span className="flex items-center gap-1">🛠️ {hall.amenities}</span>
                                    )}
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-gray-500 mb-1.5">Time Slots:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {hall.timeSlots.map((slot, idx) => (
                                            <span key={idx} className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium border border-primary-100">
                                                {slot}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageHalls;
