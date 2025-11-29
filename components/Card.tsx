import React from 'react';

interface CardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'increase' | 'decrease';
  subtext?: string;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, value, icon, change, changeType, subtext, className }) => {
  const isIncrease = changeType === 'increase';
  const changeColor = isIncrease ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-rose-600 bg-rose-50 border-rose-100';
  const changeIcon = isIncrease ? '↑' : '↓';

  return (
    <div className={`bg-white p-5 rounded-xl border border-slate-200 shadow-card hover:shadow-lg transition-all duration-300 group ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
           <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
           <h3 className="text-2xl font-bold text-slate-900 tracking-tight group-hover:text-brand-600 transition-colors">{value}</h3>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors border border-slate-100 group-hover:border-brand-100">
          {icon}
        </div>
      </div>
      
      {(change || subtext) && (
        <div className="flex items-center text-sm mt-2">
          {change && (
             <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${changeColor} mr-2`}>
                <span className="mr-1">{changeIcon}</span> {change}
             </span>
          )}
          {subtext ? (
              <span className="text-slate-400 text-xs">{subtext}</span>
          ) : (
              change && <span className="text-slate-400 text-xs">vs last period</span>
          )}
        </div>
      )}
    </div>
  );
};

export default Card;