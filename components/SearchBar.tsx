import React, { useState, useEffect, useRef } from 'react';

interface SearchResult {
    id: string;
    type: 'campaign' | 'task' | 'asset' | 'service' | 'user' | 'project';
    title: string;
    subtitle: string;
    url?: string;
    icon?: string;
}

interface SearchBarProps {
    placeholder?: string;
    onNavigate?: (type: string, id: string) => void;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = "Search campaigns, tasks, assets...",
    onNavigate,
    className = "",
    size = 'md'
}) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Mock search function - replace with actual API call
    const performSearch = async (searchQuery: string): Promise<SearchResult[]> => {
        if (searchQuery.length < 2) return [];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 200));

        const mockData: SearchResult[] = [
            { id: '1', type: 'campaign', title: 'SEO Campaign 2024', subtitle: 'Active • 15 tasks remaining', icon: '📊' },
            { id: '2', type: 'task', title: 'Content Review Task', subtitle: 'Due tomorrow • High priority', icon: '✓' },
            { id: '3', type: 'asset', title: 'Brand Guidelines PDF', subtitle: 'Design asset • 2.3 MB', icon: '📁' },
            { id: '4', type: 'service', title: 'Digital Marketing Services', subtitle: 'Service page • Published', icon: '🔧' },
            { id: '5', type: 'user', title: 'John Smith', subtitle: 'Marketing Manager • Online', icon: '👤' },
            { id: '6', type: 'project', title: 'Website Redesign', subtitle: 'In progress • 65% complete', icon: '🚀' },
        ];

        return mockData.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    // Handle search with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (query.length >= 2) {
                setIsLoading(true);
                try {
                    const searchResults = await performSearch(query);
                    setResults(searchResults);
                    setShowResults(true);
                    setSelectedIndex(-1);
                } catch (error) {
                    console.error('Search error:', error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showResults || results.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && results[selectedIndex]) {
                    handleResultClick(results[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowResults(false);
                setSelectedIndex(-1);
                inputRef.current?.blur();
                break;
        }
    };

    // Handle result selection
    const handleResultClick = (result: SearchResult) => {
        setQuery('');
        setShowResults(false);
        setSelectedIndex(-1);

        if (onNavigate) {
            onNavigate(result.type, result.id);
        }
    };

    // Close results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard shortcut (Cmd/Ctrl + K)
    useEffect(() => {
        const handleKeyboardShortcut = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyboardShortcut);
        return () => document.removeEventListener('keydown', handleKeyboardShortcut);
    }, []);

    const sizeClasses = {
        sm: 'h-9 text-sm',
        md: 'h-11 text-sm',
        lg: 'h-12 text-base'
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                        className={`${iconSizes[size]} text-slate-400 group-focus-within:text-brand-600 transition-colors`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={`
            w-full pl-10 pr-20 ${sizeClasses[size]} 
            bg-slate-50 border border-slate-200 rounded-xl 
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent 
            transition-all duration-200 hover:bg-white
            ${showResults ? 'rounded-b-none' : ''}
          `}
                />

                <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2 pointer-events-none">
                    {isLoading && (
                        <div className="animate-spin w-4 h-4 border-2 border-slate-300 border-t-brand-600 rounded-full"></div>
                    )}
                    <div className="hidden sm:flex items-center gap-1">
                        <kbd className="inline-flex items-center border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-sans font-medium text-slate-500 bg-white">⌘</kbd>
                        <kbd className="inline-flex items-center border border-slate-300 rounded px-1.5 py-0.5 text-[10px] font-sans font-medium text-slate-500 bg-white">K</kbd>
                    </div>
                </div>
            </div>

            {/* Search Results Dropdown */}
            {showResults && (
                <div className="absolute top-full left-0 right-0 bg-white rounded-b-xl shadow-lg border border-slate-200 border-t-0 py-2 z-50 max-h-80 overflow-y-auto">
                    {results.length > 0 ? (
                        <>
                            {results.map((result, index) => (
                                <button
                                    key={result.id}
                                    className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 ${index === selectedIndex ? 'bg-brand-50 border-r-2 border-brand-500' : ''
                                        }`}
                                    onClick={() => handleResultClick(result)}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${result.type === 'campaign' ? 'bg-blue-100 text-blue-600' :
                                            result.type === 'task' ? 'bg-green-100 text-green-600' :
                                                result.type === 'asset' ? 'bg-purple-100 text-purple-600' :
                                                    result.type === 'service' ? 'bg-orange-100 text-orange-600' :
                                                        result.type === 'user' ? 'bg-indigo-100 text-indigo-600' :
                                                            'bg-pink-100 text-pink-600'
                                        }`}>
                                        {result.icon || (
                                            result.type === 'campaign' ? '📊' :
                                                result.type === 'task' ? '✓' :
                                                    result.type === 'asset' ? '📁' :
                                                        result.type === 'service' ? '🔧' :
                                                            result.type === 'user' ? '👤' : '🚀'
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-slate-900 text-sm truncate">{result.title}</div>
                                        <div className="text-xs text-slate-500 truncate">{result.subtitle}</div>
                                    </div>
                                    <div className="text-xs text-slate-400 capitalize">{result.type}</div>
                                </button>
                            ))}

                            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>Use ↑↓ to navigate, ↵ to select, esc to close</span>
                                    <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                        </>
                    ) : query.length >= 2 && !isLoading ? (
                        <div className="px-4 py-8 text-center">
                            <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <p className="text-sm text-slate-500">No results found for "{query}"</p>
                            <p className="text-xs text-slate-400 mt-1">Try different keywords or check spelling</p>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default SearchBar;