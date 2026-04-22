import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, ShieldAlert, Award, Clock, Search, GraduationCap } from 'lucide-react';
import { apiService } from '../services/apiService';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const Dashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;
        const fetchDashboardData = async () => {
            try {
                const statsData = await apiService.getUserStats(currentUser.uid);
                const activityData = await apiService.getRecentActivity(currentUser.uid);
                setStats(statsData.data);
                setActivities(activityData.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [currentUser]);

    if (loading) {
        return <div className="loading-container">Loading your security profile...</div>;
    }

    return (
        <div className="dashboard-container">
            <header className="page-header">
                <h1 className="page-title">Security Dashboard</h1>
                <p className="page-subtitle">
                    Welcome back, <strong>{currentUser?.displayName || currentUser?.email?.split('@')[0]}</strong>!
                    Here's an overview of your phishing detection performance.
                </p>
            </header>

            <div className="stats-grid">
                <StatCard
                    title="Total Analyses"
                    value={stats?.totalAnalyses || 0}
                    icon={BarChart3}
                    trend={{ value: 12, isUp: true }}
                    description="Emails scanned so far"
                />
                <StatCard
                    title="Overall Accuracy"
                    value={`${stats?.overallAccuracy || 0}%`}
                    icon={TrendingUp}
                    color="#10b981"
                    trend={{ value: 5, isUp: true }}
                    description="Vs. last week (+4%)"
                />
                <StatCard
                    title="Phishing Caught"
                    value={stats?.phishingDetected || 0}
                    icon={ShieldAlert}
                    color="#ef4444"
                    description="True positives detected"
                />
                <StatCard
                    title="Current Streak"
                    value={stats?.currentStreak || 0}
                    icon={Award}
                    color="#f59e0b"
                    description="Daily login milestone"
                />
            </div>

            <div className="dashboard-content-grid">
                {/* Performance Chart */}
                <div className="dashboard-card chart-card">
                    <div className="card-header">
                        <h3 className="card-title">Performance Trend</h3>
                    </div>
                    <div className="card-body" style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.weeklyProgress || []}>
                                <defs>
                                    <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="week" stroke="var(--text)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-h)' }}
                                />
                                <Area type="monotone" dataKey="accuracy" stroke="var(--accent)" fillOpacity={1} fill="url(#colorAccuracy)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="dashboard-card activity-card">
                    <div className="card-header">
                        <h3 className="card-title">Recent Activity</h3>
                        <button className="btn-text">View All</button>
                    </div>
                    <div className="card-body">
                        <div className="activity-list">
                            {activities.map((activity, index) => (
                                <div key={index} className="activity-item">
                                    <div className={`activity-icon-container ${activity.result}`}>
                                        {activity.type === 'analysis' && <Search size={16} />}
                                        {activity.type === 'training' && <GraduationCap size={16} />}
                                        {activity.type === 'badge' && <Award size={16} />}
                                    </div>
                                    <div className="activity-info">
                                        <div className="activity-desc">{activity.description}</div>
                                        <div className="activity-meta">
                                            <span className={`activity-result-tag ${activity.result}`}>{activity.result}</span>
                                            <span className="activity-time">
                                                <Clock size={12} style={{ marginRight: '4px' }} />
                                                {new Date(activity.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Performance */}
            <div className="dashboard-card category-card">
                <div className="card-header">
                    <h3 className="card-title">Strengths by Category</h3>
                </div>
                <div className="card-body">
                    <div className="category-performance-grid">
                        {stats?.categoryPerformance?.map((item: any, index: number) => (
                            <div key={index} className="category-item">
                                <div className="category-header">
                                    <span className="category-name">{item.category.replace('-', ' ')}</span>
                                    <span className="category-accuracy">{item.accuracy}%</span>
                                </div>
                                <div className="progress-bar-container">
                                    <div className="progress-bar-fill" style={{ width: `${item.accuracy}%`, backgroundColor: item.accuracy > 80 ? '#10b981' : item.accuracy > 60 ? '#f59e0b' : '#ef4444' }}></div>
                                </div>
                                <div className="category-meta">{item.totalAttempts} samples analyzed</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
