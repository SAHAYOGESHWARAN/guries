
import React from 'react';

interface ChartProps {
    title?: string;
    className?: string;
    children?: React.ReactNode;
}

export const ChartCard: React.FC<ChartProps> = ({ title, className, children }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md h-full flex flex-col ${className || ''}`}>
        {title && <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>}
        <div className="flex-1 min-h-[200px]">
            {children}
        </div>
    </div>
);

interface BarChartProps {
    data: { id: string | number; name: string; value: number }[];
    color: string;
    maxValue?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ data, color, maxValue }) => {
    const max = maxValue || Math.max(...data.map(d => d.value), 0);
    return (
        <div className="space-y-4 h-full overflow-y-auto">
            {data.map(item => (
                <div key={item.id} className="flex items-center">
                    <span className="text-sm text-gray-600 w-32 truncate" title={item.name}>{item.name}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 ml-2">
                        <div
                            className={`${color} h-4 rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold transition-all duration-500`}
                            style={{ width: `${max > 0 ? (item.value / max) * 100 : 0}%` }}
                        >
                            {item.value > 0 && item.value.toLocaleString()}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

interface LineChartProps {
    data: { label: string; value: number }[];
    color: string;
    title?: string;
}

export const LineChart: React.FC<LineChartProps> = ({ data, color }) => {
    const width = 500;
    const height = 200;
    const padding = 30;
    const maxValue = Math.max(...data.map(d => d.value), 10);
    const minValue = 0;

    const getX = (index: number) => padding + (index / (data.length - 1)) * (width - 2 * padding);
    const getY = (value: number) => height - padding - ((value - minValue) / (maxValue - minValue)) * (height - 2 * padding);

    const path = data.map((point, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(point.value)}`).join(' ');

    return (
        <div className="w-full h-full min-h-[200px]">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
                {/* Y-axis labels */}
                <text x="5" y={padding} className="text-[10px] fill-current text-gray-400">{maxValue.toLocaleString()}</text>
                <text x="5" y={height - padding} className="text-[10px] fill-current text-gray-400">{minValue.toLocaleString()}</text>
                <line x1={padding} y1={padding} x2={padding} y2={height - padding} className="stroke-current text-gray-200" />
                
                {/* X-axis labels */}
                {data.map((point, i) => (
                    <text key={i} x={getX(i)} y={height - padding + 15} textAnchor="middle" className="text-[10px] fill-current text-gray-400">{point.label}</text>
                ))}
                 <line x1={padding} y1={height - padding} x2={width-padding} y2={height - padding} className="stroke-current text-gray-200" />

                {/* Line */}
                <path d={path} className={`stroke-current ${color}`} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />

                {/* Points */}
                {data.map((point, i) => (
                    <circle key={i} cx={getX(i)} cy={getY(point.value)} r="3" className={`fill-current ${color}`} />
                ))}
            </svg>
        </div>
    );
};

interface DonutChartProps {
    value: number;
    color: string;
    label?: string;
    size?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({ value, color, label, size = 140 }) => {
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(value, 100) / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    <circle
                        className="text-gray-100"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        r={radius}
                        cx={size / 2}
                        cy={size / 2}
                    />
                    <circle
                        className={color}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        fill="transparent"
                        r={radius}
                        cx={size / 2}
                        cy={size / 2}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute text-center">
                    <span className="text-3xl font-bold text-gray-800">{value}%</span>
                </div>
            </div>
            {label && <p className="mt-2 text-sm text-gray-500 font-medium">{label}</p>}
        </div>
    );
};

interface ScatterChartProps {
    data: { x: number; y: number; label: string; category: string }[];
    xAxisLabel: string;
    yAxisLabel: string;
}

export const ScatterChart: React.FC<ScatterChartProps> = ({ data, xAxisLabel, yAxisLabel }) => {
    const width = 500;
    const height = 300;
    const padding = 40;

    const maxX = Math.max(...data.map(d => d.x), 10) * 1.1;
    const maxY = Math.max(...data.map(d => d.y), 10) * 1.1;

    const getX = (val: number) => padding + (val / maxX) * (width - 2 * padding);
    const getY = (val: number) => height - padding - (val / maxY) * (height - 2 * padding);

    return (
         <div className="w-full h-full min-h-[200px]">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
                 {/* Axis Lines */}
                 <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="stroke-gray-300 stroke-2" />
                 <line x1={padding} y1={padding} x2={padding} y2={height - padding} className="stroke-gray-300 stroke-2" />

                 {/* Labels */}
                 <text x={width / 2} y={height - 5} textAnchor="middle" className="text-xs fill-gray-500 font-bold">{xAxisLabel}</text>
                 <text x={5} y={height / 2} transform={`rotate(-90 10 ${height/2})`} textAnchor="middle" className="text-xs fill-gray-500 font-bold">{yAxisLabel}</text>

                 {/* Grid Lines (Optional - subtle) */}
                 {Array.from({ length: 5 }).map((_, i) => {
                     const y = padding + (i / 4) * (height - 2 * padding);
                     return <line key={i} x1={padding} y1={y} x2={width - padding} y2={y} className="stroke-gray-100" strokeDasharray="4 4" />;
                 })}

                 {/* Points */}
                 {data.map((point, i) => (
                     <g key={i} transform={`translate(${getX(point.x)}, ${getY(point.y)})`}>
                         <circle r="6" className={`fill-blue-500 opacity-80 hover:opacity-100 cursor-pointer transition-opacity`} />
                         <title>{`${point.label} (${point.category}): ${xAxisLabel}=${point.x}, ${yAxisLabel}=${point.y}`}</title>
                         <text y="-10" textAnchor="middle" className="text-[10px] fill-gray-600 font-medium">{point.label}</text>
                     </g>
                 ))}
            </svg>
        </div>
    );
}
