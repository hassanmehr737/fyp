import React from 'react';
import Navbar from './Navbar';
import { Shield } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">
                {children}
            </main>
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-logo">
                        <Shield className="logo-icon text-gradient" size={28} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} />
                        <span className="logo-text">PhishGuard <span className="logo-ai">AI</span></span>
                    </div>
                    <div className="footer-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Contact Support</a>
                    </div>
                    <p className="copyright">© 2026 PhishGuard AI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
