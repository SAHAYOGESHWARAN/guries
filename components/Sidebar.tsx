import React, { useState } from 'react';
import { NAV_ITEMS, NavItem } from '../constants';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const NavLink: React.FC<{ item: NavItem, isChild?: boolean, currentView: string, setCurrentView: (view: string) => void }> = ({ item, isChild = false, currentView, setCurrentView }) => {
  const isActive = currentView === item.id;

  // High-contrast active state logic
  const baseClasses = "group flex items-center px-2.5 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer mb-0.5 mx-2";
  const activeClasses = "bg-brand-600 text-white shadow-sm ring-1 ring-brand-500";
  const inactiveClasses = "text-slate-400 hover:bg-slate-800 hover:text-white";
  const childClasses = isChild ? "pl-8 text-xs" : "";

  return (
    <a onClick={(e) => { e.preventDefault(); setCurrentView(item.id); }} className={`${baseClasses} ${childClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      <span className={`flex-shrink-0 transition-colors duration-200 ${isChild ? '' : 'mr-3'}`}>
        {/* Icons are slightly dimmed when inactive */}
        {React.cloneElement(item.icon as React.ReactElement<any>, {
          className: `w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`
        })}
      </span>
      <span className="truncate">{item.name}</span>
      {isActive && !isChild && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-glow"></div>}
    </a>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const [openSections, setOpenSections] = useState<string[]>(['MAIN', 'REPOSITORIES']);

  const toggleSection = (title: string) => {
    setOpenSections(prev => prev.includes(title) ? prev.filter(s => s !== title) : [...prev, title]);
  };

  return (
    <div className="flex flex-col h-full bg-[#0F172A] border-r border-slate-800 w-[260px] flex-shrink-0 transition-all duration-300 ease-in-out">
      {/* Brand Header */}
      <div className="h-14 flex items-center px-5 border-b border-slate-800 bg-[#0F172A] sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-glow">
            <span className="font-bold text-base leading-none font-sans">G</span>
          </div>
          <div>
            <h1 className="font-bold text-white text-sm tracking-tight">Guires</h1>
            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Marketing OS</p>
          </div>
        </div>
      </div>

      {/* Scrollable Nav */}
      <nav className="flex-1 overflow-y-auto py-6 px-1 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
        {NAV_ITEMS.map((section) => (
          <div key={section.title} className="mb-4">
            {section.items ? (
              <>
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex justify-between items-center px-5 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-300 transition-colors group"
                >
                  <span>{section.title}</span>
                  <span className={`text-slate-600 group-hover:text-slate-400`}>
                    <ChevronIcon expanded={openSections.includes(section.title)} />
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSections.includes(section.title) ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="mt-1">
                    {section.items.map((item) => (
                      <NavLink key={item.id} item={item} isChild={true} currentView={currentView} setCurrentView={setCurrentView} />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              section.item && <NavLink key={section.item.id} item={section.item} currentView={currentView} setCurrentView={setCurrentView} />
            )}
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800 bg-[#0B1120]">
        <button
          onClick={() => setCurrentView('settings')}
          className="flex items-center w-full p-2 rounded-lg hover:bg-slate-800 transition-colors group text-left"
        >
          <div className="relative mr-3">
            <img src="https://ui-avatars.com/api/?name=Guires&background=4f46e5&color=fff&size=32" alt="Admin" className="w-8 h-8 rounded-full border border-slate-600 group-hover:border-brand-500 transition-colors" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0B1120] rounded-full"></span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">Guires Admin</p>
            <p className="text-xs text-slate-500 truncate group-hover:text-slate-400">System Admin</p>
          </div>
          <div className="text-slate-500 group-hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;