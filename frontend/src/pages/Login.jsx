import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [pendingMessage, setPendingMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setPendingMessage('');
        setLoading(true);

        try {
            const { data } = await API.post('/auth/login', { email, password });
            login(data);
            if (data.role === 'admin') {
                navigate('/admin-dashboard');
            } else if (data.role === 'faculty') {
                navigate('/faculty-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            const response = err.response?.data;
            if (response?.pendingApproval) {
                setPendingMessage(response.message);
            } else {
                setError(response?.message || 'Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-blue-900 p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md animate-scale-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl mb-4">
                        <span className="text-3xl">🏛️</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-blue-200">Sign in to access your hall booking dashboard</p>
                </div>

                {/* Form Card */}
                <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200 text-sm animate-fade-in">
                            ⚠️ {error}
                        </div>
                    )}

                    {pendingMessage && (
                        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-sm animate-fade-in">
                            ⏳ {pendingMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-blue-100 mb-2">Email Address</label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400 outline-none transition-all"
                                placeholder="your@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-blue-100 mb-2">Password</label>
                            <input
                                id="login-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400 outline-none transition-all"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/50 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-blue-200 text-sm">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-white font-semibold hover:text-primary-300 transition-colors">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
