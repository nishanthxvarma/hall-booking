import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const studentLinks = [
        { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
        { to: '/book-hall', label: 'Book Hall', icon: '📋' },
        { to: '/my-bookings', label: 'My Bookings', icon: '📑' },
    ];

    const facultyLinks = [
        { to: '/faculty-dashboard', label: 'Approvals', icon: '✅' },
        { to: '/manage-halls', label: 'Manage Halls', icon: '🏛️' },
    ];

    const adminLinks = [
        { to: '/admin-dashboard', label: 'Faculty Approvals', icon: '🛡️' },
    ];

    const links = user?.role === 'admin'
        ? adminLinks
        : user?.role === 'faculty'
            ? facultyLinks
            : studentLinks;

    const homeLink = user?.role === 'admin'
        ? '/admin-dashboard'
        : user?.role === 'faculty'
            ? '/faculty-dashboard'
            : '/dashboard';

    return (
        <nav className="sticky top-0 z-50 glass-card border-b border-white/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to={homeLink} className="flex items-center gap-2 group">
                        <div className="w-9 h-9 gradient-bg rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-all">
                            HB
                        </div>
                        <span className="hidden sm:block font-bold text-gray-800 group-hover:text-primary-600 transition-colors">
                            Hall Booking
                        </span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {links.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.to)
                                    ? 'bg-primary-100 text-primary-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <span>{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* User Info & Logout */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold text-gray-800 leading-tight">{user?.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            Logout
                        </button>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {mobileOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="md:hidden pb-3 animate-fade-in">
                        {links.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(link.to)
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <span>{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
