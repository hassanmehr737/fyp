import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldAlert, CheckCircle, AlertTriangle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const TrainingExercise: React.FC = () => {
    const { moduleId } = useParams<{ moduleId: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [module, setModule] = useState<any>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<any>(null);
    const [showExplanation, setShowExplanation] = useState(false);

    useEffect(() => {
        const fetchModule = async () => {
            try {
                const data = await apiService.getModuleById(moduleId!);
                setModule(data.data);
            } catch (error) {
                console.error('Failed to fetch module:', error);
                navigate('/training');
            } finally {
                setLoading(false);
            }
        };
        fetchModule();
    }, [moduleId, navigate]);

    const handleSubmit = async (answer: string) => {
        if (!currentUser) return;
        
        setSubmitting(true);
        try {
            const result = await apiService.submitTrainingAnswer({
                emailId: module.emails[currentIndex].id,
                userAnswer: answer,
                moduleId: module.id,
                userId: currentUser.uid
            });
            setFeedback(result.data);
            setShowExplanation(true);
        } catch (error) {
            console.error('Submission failed:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < module.emails.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setFeedback(null);
            setShowExplanation(false);
        } else {
            navigate('/training');
        }
    };

    if (loading) return <div className="loading-container"><Loader2 className="animate-spin" /> Loading exercise...</div>;
    if (!module) return null;

    const currentEmail = module.emails[currentIndex];

    return (
        <motion.div 
            className="exercise-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="exercise-header">
                <button className="btn-back" onClick={() => navigate('/training')}>
                    <ArrowLeft size={18} /> Back to Training
                </button>
                <div className="exercise-progress">
                    Module: {module.title} • Question {currentIndex + 1} of {module.emails.length}
                    <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${((currentIndex + 1) / module.emails.length) * 100}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="exercise-layout">
                <motion.div 
                    className="email-view"
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <div className="email-header-card">
                        <div className="header-field">
                            <span className="label">From:</span>
                            <span className="value">{currentEmail.sender}</span>
                        </div>
                        <div className="header-field">
                            <span className="label">Subject:</span>
                            <span className="value font-bold">{currentEmail.subject}</span>
                        </div>
                    </div>
                    <div className="email-body-card">
                        {currentEmail.body}
                    </div>
                </motion.div>

                <div className="interaction-panel">
                    <AnimatePresence mode="wait">
                        {!showExplanation ? (
                            <motion.div 
                                key="decision"
                                className="decision-panel"
                                initial={{ x: 30, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                            >
                                <h3>What's your verdict?</h3>
                                <p>Analyze the email carefully and choose the classification that fits best.</p>

                                <div className="action-buttons">
                                    <button
                                        className="decision-btn legitimate"
                                        disabled={submitting}
                                        onClick={() => handleSubmit('legitimate')}
                                    >
                                        <CheckCircle size={24} />
                                        <span>Legitimate</span>
                                        <small>Looks safe to me</small>
                                    </button>

                                    <button
                                        className="decision-btn suspicious"
                                        disabled={submitting}
                                        onClick={() => handleSubmit('suspicious')}
                                    >
                                        <AlertTriangle size={24} />
                                        <span>Suspicious</span>
                                        <small>Proceed with caution</small>
                                    </button>

                                    <button
                                        className="decision-btn phishing"
                                        disabled={submitting}
                                        onClick={() => handleSubmit('phishing')}
                                    >
                                        <ShieldAlert size={24} />
                                        <span>Phishing</span>
                                        <small>Malicious attempt</small>
                                    </button>
                                </div>

                                {submitting && (
                                    <div className="submitting-overlay">
                                        <Loader2 className="animate-spin" size={32} />
                                        <span>Consulting PhishGuard AI...</span>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="feedback"
                                className={`feedback-panel ${feedback.isCorrect ? 'correct' : 'incorrect'}`}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', damping: 15 }}
                            >
                                <div className="feedback-header">
                                    {feedback.isCorrect ? (
                                        <><CheckCircle className="text-success" size={32} /> <h3>Correct!</h3></>
                                    ) : (
                                        <><ShieldAlert className="text-error" size={32} /> <h3>Not quite.</h3></>
                                    )}
                                </div>

                                <div className="feedback-summary">
                                    The correct verdict was <span className="highlight">{feedback.correctAnswer}</span>.
                                </div>

                                <div className="ai-explanation">
                                    <div className="explanation-label">AI Analysis:</div>
                                    <div className="explanation-text">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {feedback.explanation}
                                        </ReactMarkdown>
                                    </div>
                                </div>

                                {feedback.indicators && feedback.indicators.length > 0 && (
                                    <div className="key-indicators">
                                        <div className="explanation-label">Key Red Flags:</div>
                                        <ul className="indicators-list">
                                            {feedback.indicators.map((ind: any, i: number) => (
                                                <li key={i}>{ind.description}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <button className="btn-primary lg w-full" onClick={handleNext}>
                                    {currentIndex < module.emails.length - 1 ? 'Next Email' : 'Complete Module'} <ArrowRight size={20} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default TrainingExercise;
