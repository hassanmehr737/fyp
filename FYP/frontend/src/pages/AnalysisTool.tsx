import React, { useState } from 'react';
import { Search, ShieldAlert, CheckCircle, AlertTriangle, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { apiService } from '../services/apiService';

const AnalysisTool: React.FC = () => {
    const [emailContent, setEmailContent] = useState('');
    const [subject, setSubject] = useState('');
    const [sender, setSender] = useState('');
    const [providers, setProviders] = useState<string[]>(['openai']);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleAnalyze = async () => {
        if (!emailContent.trim()) return;

        setLoading(true);
        setResult(null);
        try {
            const data = await apiService.analyzeEmail({
                emailContent,
                subject,
                sender,
                providers,
                promptStrategy: 'chain-of-thought'
            });
            setResult(data.data);
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (classification: string) => {
        switch (classification) {
            case 'phishing': return <ShieldAlert className="text-error" />;
            case 'legitimate': return <CheckCircle className="text-success" />;
            default: return <AlertTriangle className="text-warning" />;
        }
    };

    return (
        <div className="analysis-container">
            <header className="page-header">
                <h1 className="page-title">Real-time Email Analysis</h1>
                <p className="page-subtitle">Paste email content below to get an instant safety assessment from multiple AI models.</p>
            </header>

            <div className="analysis-grid">
                <div className="input-panel">
                    <div className="form-group">
                        <label>Subject (Optional)</label>
                        <input
                            type="text"
                            placeholder="e.g. Action Required: Your account has been suspended"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Sender Address (Optional)</label>
                        <input
                            type="text"
                            placeholder="e.g. security@paypa1-support.com"
                            value={sender}
                            onChange={(e) => setSender(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email Body</label>
                        <textarea
                            placeholder="Paste the full content of the email here..."
                            value={emailContent}
                            onChange={(e) => setEmailContent(e.target.value)}
                            rows={10}
                        ></textarea>
                    </div>

                    <div className="provider-selection">
                        <label>AI Providers to Use</label>
                        <div className="checkbox-group">
                            {['openai', 'anthropic'].map(p => (
                                <label key={p} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={providers.includes(p)}
                                        onChange={(e) => {
                                            if (e.target.checked) setProviders([...providers, p]);
                                            else setProviders(providers.filter(x => x !== p));
                                        }}
                                    />
                                    {p.charAt(0).toUpperCase() + p.slice(1)}
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        className="btn-primary lg w-full"
                        disabled={loading || !emailContent.trim()}
                        onClick={handleAnalyze}
                    >
                        {loading ? <><Loader2 className="animate-spin" size={20} /> Analyzing...</> : <><Send size={20} /> Run Analysis</>}
                    </button>
                </div>

                <div className="results-panel">
                    {!result && !loading && (
                        <div className="empty-results">
                            <div className="empty-icon"><Search size={48} /></div>
                            <h3>Ready for Analysis</h3>
                            <p>Enter email details on the left and click "Run Analysis" to see results here.</p>
                        </div>
                    )}

                    {loading && (
                        <div className="loading-results">
                            <Loader2 className="animate-spin" size={48} />
                            <h3>Analyzing Threats...</h3>
                            <p>Consulting {providers.length} AI models for a comprehensive assessment.</p>
                        </div>
                    )}

                    {result && (
                        <div className="result-content">
                            <div className={`consensus-banner ${result.consensus}`}>
                                <div className="consensus-icon">{getStatusIcon(result.consensus)}</div>
                                <div className="consensus-info">
                                    <div className="consensus-label">Consensus Verdict</div>
                                    <div className="consensus-value">{result.consensus.toUpperCase()}</div>
                                </div>
                                <div className="agreement-badge">
                                    {Math.round(result.agreementLevel * 100)}% Agreement
                                </div>
                            </div>

                            <div className="provider-results">
                                <h3 className="section-subtitle">Model Breakdowns</h3>
                                {result.results.map((r: any, idx: number) => (
                                    <div key={idx} className="model-result-card">
                                        <div className="model-header">
                                            <span className="model-name">{r.provider}</span>
                                            <span className={`model-tag ${r.classification}`}>{r.classification}</span>
                                            <span className="model-confidence">{Math.round(r.confidence * 100)}% confidence</span>
                                        </div>
                                        <div className="model-explanation prose dark:prose-invert max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {r.explanation}
                                            </ReactMarkdown>
                                        </div>
                                        {r.indicators.length > 0 && (
                                            <div className="model-indicators">
                                                {r.indicators.map((ind: any, i: number) => (
                                                    <div key={i} className={`indicator-tag ${ind.severity}`}>
                                                        {ind.type}: {ind.description}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalysisTool;
