import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Target, TrendingUp, AlertTriangle, CheckCircle, Loader2, ArrowRight, ShieldAlert } from 'lucide-react';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const Evaluation: React.FC = () => {
    const { currentUser } = useAuth();
    const [session, setSession] = useState<any>(null);
    const [comparison, setComparison] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<any[]>([]);
    const [step, setStep] = useState<'intro' | 'test' | 'results'>('intro');

    useEffect(() => {
        const fetchHistory = async () => {
            if (!currentUser) return;
            try {
                const result = await apiService.compareEvaluationResults(currentUser.uid);
                setComparison(result.data);
            } catch (error) {
                console.error('Failed to fetch history:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [currentUser]);

    const handleStart = async (type: 'pre-test' | 'post-test') => {
        if (!currentUser) return;
        setStarting(true);
        try {
            const result = await apiService.startEvaluation({ userId: currentUser.uid, type });
            setSession(result.data);
            setCurrentIndex(0);
            setAnswers([]);
            setStep('test');
        } catch (error) {
            console.error('Failed to start session:', error);
        } finally {
            setStarting(false);
        }
    };

    const handleSubmitAnswer = async (answer: string) => {
        const newAnswers = [...answers, { emailId: session.emails[currentIndex].id, userAnswer: answer }];
        setAnswers(newAnswers);

        try {
            // Optional: We could submit one by one, but for evaluation we typically submit all at once or session tracks it.
            // The backend implementation of Evaluation.ts shows start, answer, complete
            await apiService.submitEvaluationAnswer({
                sessionId: session.sessionId,
                emailId: session.emails[currentIndex].id,
                userAnswer: answer
            });
        } catch (err) {
            console.error('Failed to submit answer:', err);
        }

        if (currentIndex < session.emails.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setLoading(true);
            try {
                const result = await apiService.completeEvaluation(session.sessionId);
                setComparison(result.data);
                setStep('results');
            } catch (error) {
                console.error('Failed to complete session:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading && step === 'intro') return <div className="loading-container"><Loader2 className="animate-spin" /> Fetching records...</div>;

    return (
        <div className="evaluation-container">
            <header className="page-header">
                <h1 className="page-title">Skill Evaluation</h1>
                <p className="page-subtitle">Measure your baseline and track your improvement through formal testing.</p>
            </header>

            {step === 'intro' && (
                <div className="eval-intro-grid">
                    <div className="eval-card main-action">
                        <div className="eval-icon-bg"><Target size={40} /></div>
                        <h2>New Assessment</h2>
                        <p>Take a controlled test to evaluate your current phishing detection level. No AI feedback will be provided during the test.</p>
                        <div className="action-row">
                            <button
                                className="btn-primary"
                                disabled={starting}
                                onClick={() => handleStart('pre-test')}
                            >
                                Start Pre-Test
                            </button>
                            <button
                                className="btn-secondary"
                                disabled={starting || !comparison?.preTest}
                                onClick={() => handleStart('post-test')}
                            >
                                Start Post-Test
                            </button>
                        </div>
                        {starting && <div className="starting-text"><Loader2 className="animate-spin" size={16} /> Initializing session...</div>}
                    </div>

                    <div className="eval-card stats-summary">
                        <h3>Comparison Status</h3>
                        {comparison?.preTest ? (
                            <div className="comparison-view">
                                <div className="comp-item">
                                    <span className="label">Pre-Test Accuracy</span>
                                    <span className="value">{comparison.preTest.score}%</span>
                                    <span className="date">{new Date(comparison.preTest.date).toLocaleDateString()}</span>
                                </div>
                                {comparison.postTest ? (
                                    <div className="comp-item highlight">
                                        <span className="label">Post-Test Accuracy</span>
                                        <span className="value">{comparison.postTest.score}%</span>
                                        <span className="trend">
                                            <TrendingUp size={16} /> +{comparison.improvement}% Improvement
                                        </span>
                                    </div>
                                ) : (
                                    <div className="comp-empty">
                                        <p>Complete your training modules to unlock the Post-Test and see your improvement!</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="comp-empty-all">
                                <p>No evaluation records found. Start with a Pre-Test to establish your baseline.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {step === 'test' && session && (
                <div className="eval-test-view">
                    <div className="test-header">
                        <h3>{session.type === 'pre-test' ? 'Baseline Assessment' : 'Final Evaluation'}</h3>
                        <div className="test-progress">
                            Question {currentIndex + 1} of {session.emails.length}
                        </div>
                    </div>

                    <div className="test-content">
                        <div className="email-display">
                            <div className="email-meta">
                                <div><strong>From:</strong> {session.emails[currentIndex].sender}</div>
                                <div><strong>Subject:</strong> {session.emails[currentIndex].subject}</div>
                            </div>
                            <div className="email-body">
                                {session.emails[currentIndex].body}
                            </div>
                        </div>

                        <div className="test-actions">
                            <h4>Classification:</h4>
                            <div className="action-buttons horizontal">
                                <button className="decision-btn mini legitimate" onClick={() => handleSubmitAnswer('legitimate')}>
                                    <CheckCircle size={20} /> Legitimate
                                </button>
                                <button className="decision-btn mini suspicious" onClick={() => handleSubmitAnswer('suspicious')}>
                                    <AlertTriangle size={20} /> Suspicious
                                </button>
                                <button className="decision-btn mini phishing" onClick={() => handleSubmitAnswer('phishing')}>
                                    <ShieldAlert size={20} /> Phishing
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {step === 'results' && comparison && (
                <div className="eval-results-view">
                    <div className="results-hero">
                        <div className="hero-icon"><ClipboardCheck size={64} className="text-gradient" /></div>
                        <h2>Evaluation Complete!</h2>
                        <p>Your results have been processed and your profile updated.</p>
                    </div>

                    <div className="results-grid">
                        <div className="result-stat-card">
                            <span className="label">Latest Score</span>
                            <span className="value">{comparison.postTest?.score || comparison.preTest?.score}%</span>
                        </div>
                        {comparison.improvement > 0 && (
                            <div className="result-stat-card highlight">
                                <span className="label">Improvement</span>
                                <span className="value">+{comparison.improvement}%</span>
                            </div>
                        )}
                    </div>

                    <button className="btn-primary lg" onClick={() => setStep('intro')}>
                        Return to Overview <ArrowRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Evaluation;
