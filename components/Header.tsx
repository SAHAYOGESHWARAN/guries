import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/useData';
import type { Notification } from '../types';
import Tooltip from './Tooltip';

interface HeaderProps {
  onNavigate: (view: string, id: number | null) => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, onLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: notifications } = useData<Notification>('notifications');
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-14 flex items-center justify-between px-5 bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 transition-all duration-200">

      {/* Search Area */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <svg className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-brand-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search campaigns, tasks, assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ui-input w-full pl-9 pr-16 py-1.5 text-sm"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
            <kbd className="inline-flex items-center border border-slate-200 rounded px-1.5 text-[10px] font-sans font-medium text-slate-400">⌘K</kbd>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">

        {/* Help */}
        <Tooltip content="Open the help center and onboarding guides" position="bottom">
          <button className="hidden md:flex items-center text-xs font-medium text-slate-500 hover:text-brand-600 transition-colors px-3 py-1.5 rounded-md hover:bg-slate-50">
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Help Center
          </button>
        </Tooltip>

        <div className="h-5 w-px bg-slate-200 hidden md:block"></div>

        {/* Notifications */}
        <div className="relative">
          <Tooltip content="View today's notifications and alerts" position="bottom">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
              )}
            </button>
          </Tooltip>
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            className="flex items-center gap-3 focus:outline-none"
            onClick={() => setShowProfile(!showProfile)}
          >
            <img className="h-8 w-8 rounded-full border border-slate-200 shadow-sm object-cover" src="https://ui-avatars.com/api/?name=Guires&background=4f46e5&color=fff&size=32" alt="User" />
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-slate-700 leading-none">Guires Admin</p>
              <p className="text-[10px] font-medium text-slate-500 mt-0.5">Administrator</p>
            </div>
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 animate-fade-in origin-top-right ring-1 ring-black/5">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <p className="text-sm font-semibold text-slate-800">Guires Admin</p>
                <p className="text-xs text-slate-500 truncate">admin@guires.com</p>
              </div>
              <div className="py-1">
                <button onClick={() => onNavigate('settings', null)} className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors">
                  <svg className="mr-3 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Settings
                </button>
              </div>
              <div className="border-t border-slate-100 py-1">
                <button onClick={onLogout} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
                  <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;