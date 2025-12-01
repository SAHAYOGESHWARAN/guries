
import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top', className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isKeyboardFocus, setIsKeyboardFocus] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const positionClasses: Record<NonNullable<TooltipProps['position']>, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const show = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setIsVisible(true), 80);
  };

  const hide = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setIsVisible(false), 60);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={() => { setIsKeyboardFocus(true); show(); }}
      onBlur={() => { setIsKeyboardFocus(false); hide(); }}
      tabIndex={0}
      aria-describedby={isVisible ? 'tooltip' : undefined}
    >
      {children}
      {isVisible && (
        <div 
          id="tooltip"
          role="tooltip"
          className={`absolute z-50 w-max max-w-xs px-2.5 py-1.5 text-[11px] font-medium text-slate-50 bg-slate-900/95 rounded-md shadow-lg border border-slate-700/70 animate-fade-in backdrop-blur-sm ${positionClasses[position]}`}
        >
          <span className="block">{content}</span>
          {/* Arrow */}
          <div className={`absolute w-2 h-2 bg-slate-800 rotate-45 
            ${position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' : ''}
            ${position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' : ''}
            ${position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' : ''}
            ${position === 'right' ? 'right-full top-1/2 -translate-y-1/2 -mr-1' : ''}
          `}></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
