import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, GraduationCap, BarChart3, ArrowRight } from 'lucide-react';

const Home: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section id="hero" className="hero-section">
                <div className="hero-background">
                    <div className="grid-overlay"></div>
                    <div className="glow-orb orb-1"></div>
                    <div className="glow-orb orb-2"></div>
                </div>

                <div className="hero-content">
                    <div className="badge-new">New: Version 2.0 with GPT-4o Analysis</div>
                    <h1 className="hero-title">
                        Master the Art of <span className="text-gradient">Phishing Detection</span>
                    </h1>
                    <p className="hero-subtitle">
                        An advanced AI-powered platform designed to train your instincts and analyze threats in real-time using cutting-edge Large Language Models.
                    </p>
                    <div className="hero-cta">
                        <button className="btn-primary lg" onClick={() => navigate('/training')}>Start Training Now</button>
                        <button className="btn-secondary lg" onClick={() => navigate('/analysis')}>Explore Analysis</button>
                    </div>

                    <div className="hero-stats">
                        <div className="stat-item">
                            <span className="stat-value">99.8%</span>
                            <span className="stat-label">Detection Accuracy</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-value">50k+</span>
                            <span className="stat-label">Trained Users</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-value">2</span>
                            <span className="stat-label">AI Models</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-grid">
                <div className="feature-card" onClick={() => navigate('/analysis')}>
                    <div className="feature-icon"><Search size={40} className="text-gradient" /></div>
                    <h3 className="feature-title">Real-time Analysis</h3>
                    <p className="feature-desc">Paste any suspicious email and get instant breakdown from OpenAI and Claude.</p>
                    <div className="feature-footer">Launch Tool <ArrowRight size={16} style={{ marginLeft: '4px' }} /></div>
                </div>

                <div className="feature-card highlighted" onClick={() => navigate('/training')}>
                    <div className="feature-icon"><GraduationCap size={40} className="text-gradient" /></div>
                    <h3 className="feature-title">Adaptive Training</h3>
                    <p className="feature-desc">Interactive modules from Beginner to Advanced. Learn to spot the subtlest red flags.</p>
                    <div className="feature-footer">View Modules <ArrowRight size={16} style={{ marginLeft: '4px' }} /></div>
                </div>

                <div className="feature-card" onClick={() => navigate('/dashboard')}>
                    <div className="feature-icon"><BarChart3 size={40} className="text-gradient" /></div>
                    <h3 className="feature-title">Progress Tracking</h3>
                    <p className="feature-desc">Visualize your improvement over time with detailed accuracy metrics and badges.</p>
                    <div className="feature-footer">Open Dashboard <ArrowRight size={16} style={{ marginLeft: '4px' }} /></div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="mission-section">
                <div className="mission-content">
                    <h2 className="section-title">Our Mission</h2>
                    <p className="mission-text">
                        In an era of increasingly sophisticated social engineering, PhishGuard AI empowers individuals
                        and organizations with the tools and knowledge to stay one step ahead of cybercriminals.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default Home;
