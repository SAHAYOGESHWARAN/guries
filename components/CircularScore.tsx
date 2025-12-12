import React from 'react';

interface CircularScoreProps {
    score: number;
    label: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    showEmbedButton?: boolean;
    className?: string;
}

const CircularScore: React.FC<CircularScoreProps> = ({
    score,
    label,
    size = 'md',
    showEmbedButton = false,
    className = ''
}) => {
    // Ensure score is between 0 and 100
    const normalizedScore = Math.max(0, Math.min(100, score));

    // Calculate stroke dash array for the progress circle
    const radius = size === 'xs' ? 20 : size === 'sm' ? 30 : size === 'lg' ? 50 : 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

    // Determine color based on score
    const getScoreColor = (score: number) => {
        if (score >= 80) return '#10B981'; // Green
        if (score >= 60) return '#F59E0B'; // Yellow/Orange
        return '#EF4444'; // Red
    };

    const scoreColor = getScoreColor(normalizedScore);

    // Size configurations
    const sizeConfig = {
        xs: {
            container: 'w-12 h-12',
            svg: 'w-12 h-12',
            text: 'text-xs font-bold',
            label: 'text-[10px]',
            strokeWidth: 3
        },
        sm: {
            container: 'w-20 h-20',
            svg: 'w-20 h-20',
            text: 'text-lg font-bold',
            label: 'text-xs',
            strokeWidth: 4
        },
        md: {
            container: 'w-32 h-32',
            svg: 'w-32 h-32',
            text: 'text-2xl font-bold',
            label: 'text-sm',
            strokeWidth: 6
        },
        lg: {
            container: 'w-40 h-40',
            svg: 'w-40 h-40',
            text: 'text-3xl font-bold',
            label: 'text-base',
            strokeWidth: 8
        }
    };

    const config = sizeConfig[size];

    return (
        <div className={`flex flex-col items-center space-y-2 ${className}`}>
            <div className={`relative ${config.container}`}>
                <svg className={config.svg} viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth={config.strokeWidth}
                    />

                    {/* Progress circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke={scoreColor}
                        strokeWidth={config.strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        transform="rotate(-90 50 50)"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>

                {/* Score text in center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`${config.text} text-slate-800`}>
                        {normalizedScore}%
                    </span>
                </div>
            </div>

            {/* Label */}
            <div className="text-center">
                <p className={`${config.label} text-slate-600 font-medium`}>
                    {label}
                </p>
                {showEmbedButton && (
                    <button className="mt-1 px-3 py-1 text-xs bg-slate-100 text-slate-600 rounded-md border hover:bg-slate-200 transition-colors">
                        Embed widget
                    </button>
                )}
            </div>
        </div>
    );
};

export default CircularScore;