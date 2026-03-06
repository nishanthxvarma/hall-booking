import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        collegeId: '',
        clubName: '',
        department: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [pendingApproval, setPendingApproval] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const { data } = await API.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                collegeId: formData.collegeId,
                clubName: formData.clubName,
                department: formData.department,
            });

            // Faculty accounts are pending — show success message, don't auto-login
            if (data.pendingApproval) {
                setPendingApproval(true);
                return;
            }

            // Students login immediately
            login(data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Show pending approval success screen for faculty
    if (pendingApproval) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-blue-900 p-4">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
                </div>
                <div className="relative w-full max-w-md animate-scale-in">
                    <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500/20 rounded-full mb-6">
                            <span className="text-5xl">⏳</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Registration Successful!</h2>
                        <p className="text-blue-200 mb-6 leading-relaxed">
                            Your faculty account has been created and is now <span className="text-amber-400 font-semibold">pending admin approval</span>.
                            You will be able to log in once an administrator verifies and approves your account.
                        </p>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                            <p className="text-sm text-blue-300">
                                <span className="text-white font-semibold">💡 What happens next?</span><br />
                                The system administrator will review your details and approve your account.
                                Please check back and try logging in later.
                            </p>
                        </div>
                        <Link
                            to="/login"
                            className="inline-block w-full py-3.5 bg-gradient-to-r from-primary-500 to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/50 hover:-translate-y-0.5 transition-all duration-300 text-center"
                        >
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-blue-900 p-4 py-12">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-lg animate-scale-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl mb-4">
                        <span className="text-3xl">🏛️</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-blue-200">Join the Smart Hall Booking System</p>
                </div>

                {/* Form Card */}
                <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200 text-sm animate-fade-in">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-blue-100 mb-3">I am a</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'student' })}
                                    className={`p-4 rounded-xl border-2 text-center transition-all duration-300 ${formData.role === 'student'
                                        ? 'border-primary-400 bg-primary-500/20 text-white shadow-lg shadow-primary-500/20'
                                        : 'border-white/20 text-blue-200 hover:border-white/40'
                                        }`}
                                >
                                    <span className="text-2xl block mb-1">🎓</span>
                                    <span className="font-semibold text-sm">Student / Club</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'faculty' })}
                                    className={`p-4 rounded-xl border-2 text-center transition-all duration-300 ${formData.role === 'faculty'
                                        ? 'border-primary-400 bg-primary-500/20 text-white shadow-lg shadow-primary-500/20'
                                        : 'border-white/20 text-blue-200 hover:border-white/40'
                                        }`}
                                >
                                    <span className="text-2xl block mb-1">👨‍🏫</span>
                                    <span className="font-semibold text-sm">Faculty / Admin</span>
                                </button>
                            </div>
                        </div>

                        {/* Faculty approval notice */}
                        {formData.role === 'faculty' && (
                            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-xs animate-fade-in">
                                🛡️ <span className="font-semibold">Note:</span> Faculty accounts require admin approval before you can log in. Your account will be reviewed after registration.
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-semibold text-blue-100 mb-2">Full Name</label>
                                <input
                                    id="register-name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400 outline-none transition-all text-sm"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-blue-100 mb-2">College ID</label>
                                <input
                                    id="register-college-id"
                                    type="text"
                                    name="collegeId"
                                    value={formData.collegeId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400 outline-none transition-all text-sm"
                                    placeholder="COL2024001"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-blue-100 mb-2">Email Address</label>
                            <input
                                id="register-email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400 outline-none transition-all text-sm"
                                placeholder="your@email.com"
                                required
                            />
                        </div>

                        {formData.role === 'student' ? (
                            <div>
                                <label className="block text-sm font-semibold text-blue-100 mb-2">Club Name</label>
                                <input
                                    id="register-club"
                                    type="text"
                                    name="clubName"
                                    value={formData.clubName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400 outline-none transition-all text-sm"
                                    placeholder="e.g., Coding Club, Music Society"
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-semibold text-blue-100 mb-2">Department</label>
                                <input
                                    id="register-department"
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400 outline-none transition-all text-sm"
                                    placeholder="e.g., Computer Science, Administration"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-semibold text-blue-100 mb-2">Password</label>
                                <input
                                    id="register-password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400 outline-none transition-all text-sm"
                                    placeholder="Min 6 characters"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-blue-100 mb-2">Confirm Password</label>
                                <input
                                    id="register-confirm-password"
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400 outline-none transition-all text-sm"
                                    placeholder="Repeat password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            id="register-submit"
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/50 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-blue-200 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-white font-semibold hover:text-primary-300 transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
