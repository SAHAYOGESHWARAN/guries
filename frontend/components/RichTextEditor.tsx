import React, { useRef } from 'react';
import { Bold, Italic, List, Link2, Heading2, Heading3 } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    placeholder = 'Write your content here...',
    rows = 10
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const insertMarkdown = (before: string, after: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

        onChange(newText);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        }, 0);
    };

    const toolbarButtons = [
        { icon: Bold, label: 'Bold', action: () => insertMarkdown('**', '**') },
        { icon: Italic, label: 'Italic', action: () => insertMarkdown('*', '*') },
        { icon: Heading2, label: 'Heading 2', action: () => insertMarkdown('## ', '') },
        { icon: Heading3, label: 'Heading 3', action: () => insertMarkdown('### ', '') },
        { icon: List, label: 'Bullet List', action: () => insertMarkdown('- ', '') },
        { icon: Link2, label: 'Link', action: () => insertMarkdown('[', '](url)') },
    ];

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="flex gap-1 p-2 bg-gray-50 border-b border-gray-300">
                {toolbarButtons.map((btn) => (
                    <button
                        key={btn.label}
                        onClick={btn.action}
                        title={btn.label}
                        className="p-2 hover:bg-gray-200 rounded transition-colors"
                    >
                        <btn.icon size={18} className="text-gray-700" />
                    </button>
                ))}
            </div>

            {/* Editor */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="w-full p-3 font-mono text-sm focus:outline-none resize-none"
            />
        </div>
    );
};

export default RichTextEditor;
