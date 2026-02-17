import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
    onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 4000, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => onClose(id), duration);
        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const bgColor = {
        success: 'bg-emerald-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-amber-500'
    }[type];

    const Icon = {
        success: CheckCircle,
        error: AlertCircle,
        info: Info,
        warning: AlertCircle
    }[type];

    return (
        <div className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in-right`}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium flex-1">{message}</span>
            <button
                onClick={() => onClose(id)}
                className="flex-shrink-0 hover:opacity-80 transition-opacity"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Toast;
