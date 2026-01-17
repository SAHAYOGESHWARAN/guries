import React from 'react';
import AITaskAllocationSuggestions from '../components/AITaskAllocationSuggestions';

interface AITaskAllocationSuggestionsViewProps {
    onNavigate?: (view: string, id?: string) => void;
}

const AITaskAllocationSuggestionsView: React.FC<AITaskAllocationSuggestionsViewProps> = ({ onNavigate }) => {
    return <AITaskAllocationSuggestions onNavigate={onNavigate} />;
};

export default AITaskAllocationSuggestionsView;
