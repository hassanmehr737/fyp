import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { GraduationCap, BookOpen, CheckCircle, ChevronRight, Loader2, Award, Target, Trophy } from 'lucide-react';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const TrainingCenter: React.FC = () => {
    const { currentUser } = useAuth();
    const [modules, setModules] = useState<any[]>([]);
    const [progress, setProgress] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTrainingData = async () => {
            if (!currentUser) return;
            try {
                const modulesData = await apiService.getModules();
                const progressData = await apiService.getUserProgress(currentUser.uid);
                setModules(modulesData.data);
                setProgress(progressData.data);
            } catch (error) {
                console.error('Failed to fetch training data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrainingData();
    }, [currentUser]);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                <p className="text-slate-500 font-medium tracking-wide">Syncing your learning path...</p>
            </div>
        );
    }

    return (
        <motion.div 
            className="training-container-v2"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="training-hero-v2">
                <motion.h1 className="page-title" variants={itemVariants}>
                    Training <span className="text-gradient">Academy</span>
                </motion.h1>
                <motion.p className="page-subtitle" variants={itemVariants}>
                    Elevate your cybersecurity posture through AI-driven simulations and expert-curated modules.
                </motion.p>
            </div>

            <div className="training-grid-v2">
                <div className="main-content-v2">
                    <motion.h2 className="section-subtitle mb-6 block font-bold text-slate-400 uppercase tracking-widest text-xs" variants={itemVariants}>
                        Recommended Path
                    </motion.h2>
                    <div className="modules-list-v2">
                        <AnimatePresence>
                            {modules.map((module) => {
                                const moduleProgress = progress?.modules?.find((p: any) => p.moduleId === module.id);
                                const isCompleted = moduleProgress?.completedEmails >= module.emailCount;
                                const accuracy = moduleProgress ? Math.round((moduleProgress.correctAnswers / moduleProgress.completedEmails) * 100) : 0;
                                const diffClass = `difficulty-${module.difficulty.toLowerCase()}`;

                                return (
                                    <motion.div 
                                        key={module.id} 
                                        className={`module-card-v2 glass-card ${isCompleted ? 'completed' : ''}`}
                                        variants={itemVariants}
                                        whileHover={{ x: 10 }}
                                    >
                                        <div className="module-info-v2">
                                            <span className={`module-difficulty-v2 ${diffClass}`}>{module.difficulty}</span>
                                            <h3 className="module-title-v2">{module.title}</h3>
                                            <p className="module-desc-v2">{module.description}</p>
                                            <div className="module-meta-v2">
                                                <span><BookOpen size={16} className="text-blue-400" /> {module.emailCount} Emails</span>
                                                <span><GraduationCap size={16} className="text-purple-400" /> {module.category.replace('-', ' ')}</span>
                                            </div>
                                        </div>
                                        <div className="module-action-v2">
                                            {isCompleted ? (
                                                <div className="flex flex-col items-center">
                                                    <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-2">
                                                        <CheckCircle className="text-emerald-500" size={24} />
                                                    </div>
                                                    <span className="text-xs font-bold text-emerald-500 uppercase">{accuracy}% Score</span>
                                                </div>
                                            ) : (
                                                <button className="btn-primary" onClick={() => navigate(`/training/${module.id}`)}>
                                                    {moduleProgress ? 'Continue' : 'Begin'} <ChevronRight size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="sidebar-v2">
                    <motion.div className="sidebar-card-v2 glass-card" variants={itemVariants}>
                        <h3 className="sidebar-title-v2"><Target size={20} className="text-blue-400" /> Mastery Progress</h3>
                        <div className="stats-grid-v2">
                            <div className="stat-card-v2">
                                <span className="value">{progress?.summary?.overallAccuracy || 0}%</span>
                                <span className="label">Accuracy</span>
                            </div>
                            <div className="stat-card-v2">
                                <span className="value">{progress?.summary?.totalCompleted || 0}</span>
                                <span className="label">Analyzed</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div className="sidebar-card-v2 glass-card" variants={itemVariants}>
                        <h3 className="sidebar-title-v2"><Award size={20} className="text-purple-400" /> Achievements</h3>
                        <div className="badges-showcase-v2">
                            {(progress?.summary?.badges || []).map((badge: any) => (
                                <div key={badge.id} className="badge-item-v2" title={badge.description}>
                                    <span className="badge-icon-v2">{badge.icon}</span>
                                    <span className="badge-name-v2">{badge.name}</span>
                                </div>
                            ))}
                            {(!progress?.summary?.badges || progress?.summary?.badges.length === 0) && (
                                <div className="col-span-2 text-center py-4 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-xs text-slate-500 italic">No badges earned yet.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div className="sidebar-card-v2 glass-card bg-gradient-to-br from-blue-600/10 to-purple-600/10" variants={itemVariants}>
                        <h3 className="sidebar-title-v2"><Trophy size={20} className="text-yellow-400" /> Current Streak</h3>
                        <div className="text-center py-4">
                            <span className="text-4xl font-extrabold text-h">{progress?.summary?.currentStreak || 0}</span>
                            <p className="text-sm text-slate-400 mt-2">Days Active</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default TrainingCenter;
