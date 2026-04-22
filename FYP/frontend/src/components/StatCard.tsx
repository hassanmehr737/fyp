import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    color?: string;
    trend?: {
        value: number;
        isUp: boolean;
    };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, description, color = 'var(--accent)', trend }) => {
    return (
        <div className="stat-card">
            <div className="stat-card-header">
                <div className="stat-card-icon" style={{ backgroundColor: `${color}15`, color: color }}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={`stat-card-trend ${trend.isUp ? 'up' : 'down'}`}>
                        {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%
                    </div>
                )}
            </div>
            <div className="stat-card-content">
                <h3 className="stat-card-title">{title}</h3>
                <div className="stat-card-value">{value}</div>
                {description && <p className="stat-card-desc">{description}</p>}
            </div>
        </div>
    );
};

export default StatCard;
