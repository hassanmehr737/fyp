import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { type ReactNode } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AnalysisTool from './pages/AnalysisTool';
import TrainingCenter from './pages/TrainingCenter';
import TrainingExercise from './pages/TrainingExercise';
import Evaluation from './pages/Evaluation';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Protects pages that require login
function PrivateRoute({ children }: { children: ReactNode }) {
    const { currentUser } = useAuth();
    return currentUser ? <>{children}</> : <Navigate to="/login" replace />;
}

// Redirects logged-in users away from login/signup
function PublicRoute({ children }: { children: ReactNode }) {
    const { currentUser } = useAuth();
    return !currentUser ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
    return (
        <Routes>
            {/* Public routes — no auth needed */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

            {/* Protected routes — must be logged in */}
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/analysis" element={<PrivateRoute><AnalysisTool /></PrivateRoute>} />
            <Route path="/training" element={<PrivateRoute><TrainingCenter /></PrivateRoute>} />
            <Route path="/training/:moduleId" element={<PrivateRoute><TrainingExercise /></PrivateRoute>} />
            <Route path="/evaluation" element={<PrivateRoute><Evaluation /></PrivateRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <Layout>
                    <AppRoutes />
                </Layout>
            </Router>
        </AuthProvider>
    );
}

export default App;
