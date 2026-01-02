
import React, { useMemo } from 'react';

interface TimelineItem {
  id: number;
  name: string;
  start: string;
  end: string;
  status: string;
  owner?: string;
  ownerAvatar?: string;
  group?: string;
}

interface Dependency {
  from: number;
  to: number;
}

interface TimelineProps {
  items: TimelineItem[];
  dependencies?: Dependency[];
  title?: string;
}

const Timeline: React.FC<TimelineProps> = ({ items, dependencies = [], title }) => {
  const sortedItems = useMemo(() => 
    [...items].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()), 
  [items]);
  
  if (sortedItems.length === 0) return null;

  // Calculate Time Range
  const minDate = new Date(sortedItems[0].start).getTime();
  const maxDate = new Date(sortedItems.reduce((max, p) => p.end > max.end ? p : max, sortedItems[0]).end).getTime();
  // Add 5% buffer on both sides
  const buffer = (maxDate - minDate) * 0.05;
  const startTime = minDate - buffer;
  const totalDuration = (maxDate + buffer) - startTime;

  const getX = (date: string) => {
    return ((new Date(date).getTime() - startTime) / totalDuration) * 100;
  };

  const ROW_HEIGHT = 56; // px
  const HEADER_HEIGHT = 30; // px

  // Helper to find item coordinates for lines
  const getItemCoords = (itemId: number) => {
    const index = sortedItems.findIndex(i => i.id === itemId);
    if (index === -1) return null;
    const item = sortedItems[index];
    
    const startXPercent = getX(item.start);
    const endXPercent = getX(item.end);
    const y = index * ROW_HEIGHT + (ROW_HEIGHT / 2);
    
    return { startX: startXPercent, endX: endXPercent, y };
  };

  const getStatusColor = (status: string) => {
      const s = status.toLowerCase();
      if (s.includes('active') || s.includes('in_progress')) return 'bg-blue-500 border-blue-600';
      if (s.includes('completed') || s.includes('approved')) return 'bg-emerald-500 border-emerald-600';
      if (s.includes('planning') || s.includes('draft')) return 'bg-indigo-400 border-indigo-500';
      if (s.includes('blocked') || s.includes('failed') || s.includes('late')) return 'bg-rose-500 border-rose-600';
      return 'bg-slate-400 border-slate-500';
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-card border border-slate-100 overflow-hidden">
      {title && (
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
            <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center"><span className="w-3 h-3 bg-blue-500 rounded-sm mr-1"></span> Active</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-emerald-500 rounded-sm mr-1"></span> Done</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-rose-500 rounded-sm mr-1"></span> Blocked</div>
            </div>
        </div>
      )}
      
      <div className="relative overflow-x-auto overflow-y-hidden">
        <div className="min-w-[800px] relative" style={{ height: sortedItems.length * ROW_HEIGHT + HEADER_HEIGHT }}>
            
            {/* Grid Lines / Month Markers (Simplified) */}
            <div className="absolute inset-0 border-b border-slate-100 flex justify-between text-xs text-slate-400 pt-2 px-2 pointer-events-none">
                 <span>{new Date(startTime).toLocaleDateString()}</span>
                 <span>{new Date(startTime + totalDuration / 2).toLocaleDateString()}</span>
                 <span>{new Date(startTime + totalDuration).toLocaleDateString()}</span>
            </div>

            {/* Vertical Grid Lines */}
            <div className="absolute inset-0 flex justify-between pointer-events-none">
                 <div className="border-r border-slate-50 border-dashed h-full"></div>
                 <div className="border-r border-slate-50 border-dashed h-full"></div>
                 <div className="border-r border-slate-50 border-dashed h-full"></div>
            </div>

            {/* Dependency Lines (SVG Layer) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ top: HEADER_HEIGHT }}>
                {dependencies.map((dep, i) => {
                    const from = getItemCoords(dep.from);
                    const to = getItemCoords(dep.to);
                    if (!from || !to) return null;

                    // Draw curved line
                    const startX = `${from.endX}%`;
                    const startY = from.y;
                    const endX = `${to.startX}%`;
                    const endY = to.y;
                    
                    // Control points for Bezier curve
                    const midX = (from.endX + to.startX) / 2;

                    return (
                        <g key={i}>
                            <path 
                                d={`M ${startX} ${startY} C ${startX} ${startY}, ${startX} ${endY}, ${endX} ${endY}`}
                                fill="none"
                                stroke="#cbd5e1"
                                strokeWidth="2"
                                strokeDasharray={to.startX < from.endX ? "4" : "0"} // Dashed if backward dep
                                markerEnd="url(#arrowhead)"
                            />
                        </g>
                    );
                })}
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e1" />
                    </marker>
                </defs>
            </svg>

            {/* Timeline Items */}
            <div className="absolute inset-x-0 top-8 z-10">
                {sortedItems.map((item, index) => {
                    const left = getX(item.start);
                    const width = Math.max(getX(item.end) - left, 1); // Min 1% width
                    
                    return (
                        <div 
                            key={item.id} 
                            className="absolute h-10 w-full flex items-center group hover:z-20"
                            style={{ top: index * ROW_HEIGHT }}
                        >
                             {/* Task Bar */}
                             <div 
                                className={`absolute h-7 rounded-md shadow-sm border-l-4 text-white text-xs flex items-center px-2 cursor-pointer transition-all hover:scale-105 hover:shadow-md ${getStatusColor(item.status)}`}
                                style={{ left: `${left}%`, width: `${width}%` }}
                                title={`${item.name} (${item.start} - ${item.end})`}
                             >
                                 <span className="truncate font-medium drop-shadow-md mr-2">{item.name}</span>
                             </div>

                             {/* Label (Left of bar if early, Right if late) */}
                             {left < 50 ? (
                                 <div className="absolute text-xs text-slate-500 font-medium truncate pl-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `${left + width}%` }}>
                                     {item.group && <span className="text-slate-300 mr-1">[{item.group}]</span>}
                                 </div>
                             ) : (
                                 <div className="absolute text-xs text-slate-500 font-medium truncate pr-2 text-right pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{ right: `${100 - left}%` }}>
                                     {item.group && <span className="text-slate-300 mr-1">[{item.group}]</span>}
                                 </div>
                             )}

                             {/* Owner Avatar (Resource Allocation) */}
                             {item.owner && (
                                 <div 
                                    className="absolute flex items-center justify-center w-6 h-6 bg-white rounded-full border border-slate-200 shadow-sm z-20 -ml-3 hover:scale-110 transition-transform"
                                    style={{ left: `${left}%` }}
                                    title={`Assigned to: ${item.owner}`}
                                 >
                                     {item.ownerAvatar ? (
                                         <img src={item.ownerAvatar} alt={item.owner} className="w-full h-full rounded-full object-cover" />
                                     ) : (
                                         <span className="text-[10px] font-bold text-slate-600">{item.owner.charAt(0)}</span>
                                     )}
                                 </div>
                             )}
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
