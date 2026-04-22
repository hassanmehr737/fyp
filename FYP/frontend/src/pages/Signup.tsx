import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, User, Briefcase, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Signup: React.FC = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        technicalBackground: 'none',
        ageGroup: '18-24',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            return setError('Passwords do not match.');
        }
        if (form.password.length < 6) {
            return setError('Password must be at least 6 characters.');
        }

        setLoading(true);
        try {
            await signup(form.email, form.password, form.name, form.technicalBackground, form.ageGroup);
            navigate('/dashboard');
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                setError('An account with this email already exists.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password is too weak. Use at least 6 characters.');
            } else {
                setError('Failed to create account. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogle() {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle();
            navigate('/dashboard');
        } catch {
            setError('Google sign-in failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card auth-card-wide">
                <div className="auth-logo">
                    <div className="auth-logo-icon">
                        <Shield size={32} />
                    </div>
                    <h1 className="auth-logo-text">PhishGuard AI</h1>
                </div>

                <h2 className="auth-title">Create your account</h2>
                <p className="auth-subtitle">Start your cybersecurity journey today</p>

                {error && (
                    <div className="auth-error">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-field">
                        <label className="auth-label">Full Name</label>
                        <div className="auth-input-wrapper">
                            <User size={16} className="auth-input-icon" />
                            <input
                                id="signup-name"
                                name="name"
                                type="text"
                                className="auth-input"
                                placeholder="Muhammad Hassan"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label className="auth-label">Email address</label>
                        <div className="auth-input-wrapper">
                            <Mail size={16} className="auth-input-icon" />
                            <input
                                id="signup-email"
                                name="email"
                                type="email"
                                className="auth-input"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="auth-row">
                        <div className="auth-field">
                            <label className="auth-label">Password</label>
                            <div className="auth-input-wrapper">
                                <Lock size={16} className="auth-input-icon" />
                                <input
                                    id="signup-password"
                                    name="password"
                                    type="password"
                                    className="auth-input"
                                    placeholder="Min 6 characters"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">Confirm Password</label>
                            <div className="auth-input-wrapper">
                                <CheckCircle size={16} className="auth-input-icon" />
                                <input
                                    id="signup-confirm-password"
                                    name="confirmPassword"
                                    type="password"
                                    className="auth-input"
                                    placeholder="Repeat password"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="auth-row">
                        <div className="auth-field">
                            <label className="auth-label">Technical Background</label>
                            <div className="auth-input-wrapper">
                                <Briefcase size={16} className="auth-input-icon" />
                                <select
                                    id="signup-tech-background"
                                    name="technicalBackground"
                                    className="auth-input auth-select"
                                    value={form.technicalBackground}
                                    onChange={handleChange}
                                >
                                    <option value="none">Non-technical</option>
                                    <option value="basic">Basic (some IT knowledge)</option>
                                    <option value="intermediate">Intermediate (IT student)</option>
                                    <option value="advanced">Advanced (IT professional)</option>
                                </select>
                            </div>
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">Age Group</label>
                            <div className="auth-input-wrapper">
                                <User size={16} className="auth-input-icon" />
                                <select
                                    id="signup-age-group"
                                    name="ageGroup"
                                    className="auth-input auth-select"
                                    value={form.ageGroup}
                                    onChange={handleChange}
                                >
                                    <option value="18-24">18–24</option>
                                    <option value="25-34">25–34</option>
                                    <option value="35-44">35–44</option>
                                    <option value="45-54">45–54</option>
                                    <option value="55+">55+</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button id="signup-submit" type="submit" className="auth-btn-primary" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-divider"><span>or continue with</span></div>

                <button id="google-signup" onClick={handleGoogle} disabled={loading} className="auth-btn-google">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Sign up with Google</span>
                </button>

                <p className="auth-switch">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-link">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
