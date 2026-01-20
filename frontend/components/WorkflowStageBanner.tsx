import React from 'react';

interface WorkflowStageBannerProps {
    workflowStage?: string;
}

const WorkflowStageBanner: React.FC<WorkflowStageBannerProps> = ({ workflowStage }) => {
    // Only show banner for specific workflow stages
    if (!workflowStage || !['Moved to CW', 'Moved to GD', 'Moved to WD'].includes(workflowStage)) {
        return null;
    }

    const getStageConfig = (stage: string) => {
        switch (stage) {
            case 'Moved to CW':
                return {
                    emoji: '✍️',
                    title: 'CW is working on this asset',
                    description: 'Content Writing team is currently editing this asset. Please do not make changes until they complete their work.',
                    bgColor: 'bg-purple-50',
                    borderColor: 'border-purple-400',
                    textColor: 'text-purple-900'
                };
            case 'Moved to GD':
                return {
                    emoji: '🎨',
                    title: 'GD is working on this asset',
                    description: 'Graphic Design team is currently working on this asset. Please do not make changes until they complete their work.',
                    bgColor: 'bg-pink-50',
                    borderColor: 'border-pink-400',
                    textColor: 'text-pink-900'
                };
            case 'Moved to WD':
                return {
                    emoji: '💻',
                    title: 'WD is working on this asset',
                    description: 'Web Development team is currently working on this asset. Please do not make changes until they complete their work.',
                    bgColor: 'bg-cyan-50',
                    borderColor: 'border-cyan-400',
                    textColor: 'text-cyan-900'
                };
            default:
                return null;
        }
    };

    const config = getStageConfig(workflowStage);
    if (!config) return null;

    return (
        <div className={`mb-6 p-5 rounded-xl border-2 flex items-center gap-4 shadow-md ${config.bgColor} ${config.borderColor} ${config.textColor}`}>
            <span className="text-3xl flex-shrink-0">{config.emoji}</span>
            <div className="flex-1">
                <p className="font-bold text-lg">{config.title}</p>
                <p className="text-sm opacity-90 mt-1">{config.description}</p>
            </div>
        </div>
    );
};

export default WorkflowStageBanner;
