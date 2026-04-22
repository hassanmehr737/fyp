import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, BarChart3, Search, GraduationCap, ClipboardList, LogOut, User, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/analysis', label: 'Analyse Email', icon: Search },
    { path: '/training', label: 'Training', icon: GraduationCap },
    { path: '/evaluation', label: 'Evaluation', icon: ClipboardList },
];

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();

    async function handleLogout() {
        try {
            await logout();
            navigate('/login');
        } catch {
            console.error('Logout failed');
        }
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Brand */}
                <Link to="/" className="navbar-brand">
                    <Shield size={22} className="navbar-brand-icon" />
                    <span className="navbar-brand-text">PhishGuard AI</span>
                </Link>

                {/* Navigation links — only show when logged in */}
                {currentUser && (
                    <div className="navbar-links">
                        {navItems.map(({ path, label, icon: Icon }) => (
                            <Link
                                key={path}
                                to={path}
                                className={`nav-link ${location.pathname === path ? 'active' : ''}`}
                            >
                                <Icon size={16} />
                                <span>{label}</span>
                            </Link>
                        ))}
                    </div>
                )}

                {/* User area */}
                <div className="navbar-right">
                    {currentUser ? (
                        <>
                            <div className="navbar-user">
                                <div className="navbar-avatar">
                                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                                </div>
                                <span className="navbar-username">
                                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                                </span>
                            </div>
                            <button id="logout-btn" onClick={handleLogout} className="navbar-logout-btn" title="Sign out">
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <div className="navbar-auth-links">
                            <Link to="/login" className="navbar-login-link">
                                <LogIn size={16} />
                                <span>Sign In</span>
                            </Link>
                            <Link to="/signup" className="navbar-signup-link">
                                <User size={16} />
                                <span>Sign Up</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
