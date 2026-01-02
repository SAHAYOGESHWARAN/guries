import React, { useRef, useMemo, useState, useCallback } from 'react';

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
    value,
    onChange,
    placeholder = "Write your content here... Use Markdown syntax for formatting",
    rows = 12
}) => {
    const [showPreview, setShowPreview] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Calculate markdown stats
    const stats = useMemo(() => {
        const text = value || '';
        const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
        const characters = text.length;
        const lines = text.split('\n').length;
        const readTime = Math.ceil(words / 200); // Average reading speed: 200 words/min

        return { words, characters, lines, readTime };
    }, [value]);

    // Markdown formatting helper
    const insertMarkdown = useCallback((before: string, after: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

        onChange(newText);

        // Restore focus and selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        }, 0);
    }, [value, onChange]);

    // Simple markdown to HTML converter
    const renderMarkdown = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-3 mb-2">$1</h2>')
            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-2 mb-1">$1</h3>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
            .replace(/`(.*?)`/g, '<code class="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
            .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')
            .replace(/^• (.*$)/gim, '<li class="ml-4">• $1</li>')
            .replace(/\n\n/g, '</p><p class="mt-2">')
            .replace(/\n/g, '<br />');
    };

    return (
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
                Body Content Editor
                <span className="text-xs font-normal text-slate-500 ml-2">Write your main content with Markdown support</span>
            </label>

            {/* Markdown Toolbar */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-t-lg p-2 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-600 mr-2">QUICK FORMAT:</span>

                <button
                    type="button"
                    onClick={() => insertMarkdown('**', '**')}
                    className="px-2 py-1 text-xs font-bold bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors"
                    title="Bold"
                >
                    <strong>B</strong>
                </button>

                <button
                    type="button"
                    onClick={() => insertMarkdown('*', '*')}
                    className="px-2 py-1 text-xs font-bold bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors italic"
                    title="Italic"
                >
                    I
                </button>

                <button
                    type="button"
                    onClick={() => insertMarkdown('# ', '')}
                    className="px-2 py-1 text-xs font-bold bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors"
                    title="Heading"
                >
                    # H
                </button>

                <button
                    type="button"
                    onClick={() => insertMarkdown('- ', '')}
                    className="px-2 py-1 text-xs font-bold bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors"
                    title="List"
                >
                    • List
                </button>

                <button
                    type="button"
                    onClick={() => insertMarkdown('[', '](url)')}
                    className="px-2 py-1 text-xs font-bold bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors"
                    title="Link"
                >
                    [Link]
                </button>

                <button
                    type="button"
                    onClick={() => insertMarkdown('`', '`')}
                    className="px-2 py-1 text-xs font-mono bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors"
                    title="Code"
                >
                    `Code`
                </button>

                <div className="ml-auto flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className="px-3 py-1 text-xs font-medium bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                        {showPreview ? 'Edit' : 'Preview'}
                    </button>
                </div>
            </div>

            {/* Editor/Preview Area */}
            {!showPreview ? (
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-t-0 border-slate-200 rounded-b-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-mono"
                    placeholder={placeholder}
                    rows={rows}
                />
            ) : (
                <div className="w-full px-4 py-3 border-2 border-t-0 border-slate-200 rounded-b-lg text-sm bg-white min-h-[300px]">
                    <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(value || '') }}
                    />
                </div>
            )}

            {/* Stats Bar */}
            <div className="mt-2 flex items-center gap-4 text-xs text-slate-600">
                <span className="text-xs text-slate-500">
                    <span className="font-medium">Tip:</span> Use Markdown syntax for formatting
                </span>
                <div className="ml-auto flex items-center gap-4">
                    <span>Words <strong className="text-purple-600">{stats.words}</strong></span>
                    <span>Read Time <strong className="text-purple-600">{stats.readTime} min</strong></span>
                    <span>Characters <strong className="text-purple-600">{stats.characters}</strong></span>
                    <span>Lines <strong className="text-purple-600">{stats.lines}</strong></span>
                    <span className="text-green-600 font-medium">✓ Auto-saved</span>
                </div>
            </div>
        </div>
    );
};

export default MarkdownEditor;
