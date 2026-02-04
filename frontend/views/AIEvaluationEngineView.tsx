import React from 'react';
import AIEvaluationEngine from '../components/AIEvaluationEngine';

interface AIEvaluationEngineViewProps {
    onNavigate?: (view: string, id?: string) => void;
}

export default function AIEvaluationEngineView({ onNavigate }: AIEvaluationEngineViewProps) {
    return <AIEvaluationEngine onNavigate={onNavigate} />;
}
