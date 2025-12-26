import React, { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth, UserRole, AuthUser } from '../hooks/useAuth';
import Tooltip from './Tooltip';
import SearchBar from './SearchBar';
import NotificationPanel from './NotificationPanel';

interface HeaderProps {
  onNavigate: (view: string, id: number | null) => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, onLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const { user, isAdmin, setCurrentUser } = useAuth();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll
  } = useNotifications({ enableSound: true, enableBrowserNotifications: true });

  // Role switcher for demo purposes
  const handleRoleSwitch = (role: UserRole) => {
    const newUser: AuthUser = {
      id: user?.id || 1,
      name: role === 'admin' ? 'Admin User' : 'Regular User',
      email: role === 'admin' ? 'admin@guires.com' : 'user@guires.com',
      role: role,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    setCurrentUser(newUser);
    setShowRoleSwitcher(false);
  };

  // Animate bell when new notification arrives
  useEffect(() => {
    if (unreadCount > 0 && !showNotifications) {
      setHasNewNotification(true);
      const timer = setTimeout(() => setHasNewNotification(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.notifications-container')) setShowNotifications(false);
      if (!target.closest('.profile-container')) setShowProfile(false);
      if (!target.closest('.help-container')) setShowHelpCenter(false);
      if (!target.closest('.role-switcher-container')) setShowRoleSwitcher(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 transition-all duration-200">

      {/* Enhanced Search Area */}
      <div className="flex-1 max-w-2xl">
        <SearchBar
          placeholder="Search campaigns, tasks, assets, services..."
          onNavigate={(type, id) => {
            // Handle navigation based on type and id
            console.log('Navigate to:', type, id);
            // You can implement navigation logic here
          }}
          size="md"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 lg:gap-4">

        {/* Help Center */}
        <div className="relative help-container">
          <Tooltip content="Open help center and guides" position="bottom">
            <button
              onClick={() => setShowHelpCenter(!showHelpCenter)}
              className="hidden lg:flex items-center text-xs font-medium text-slate-500 hover:text-brand-600 transition-colors px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Help
            </button>
          </Tooltip>

          {/* Mobile Help Button */}
          <button
            onClick={() => setShowHelpCenter(!showHelpCenter)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Help Center Dropdown */}
          {showHelpCenter && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-3 z-50 animate-fade-in">
              <div className="px-4 pb-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800 text-sm">Help & Support</h3>
                <p className="text-xs text-slate-500 mt-1">Get help and learn how to use the platform</p>
              </div>

              <div className="py-2">
                <button
                  onClick={() => { onNavigate('knowledge-base', null); setShowHelpCenter(false); }}
                  className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 text-sm">Knowledge Base</div>
                    <div className="text-xs text-slate-500">Browse articles and guides</div>
                  </div>
                </button>

                <button className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 text-sm">Video Tutorials</div>
                    <div className="text-xs text-slate-500">Watch step-by-step guides</div>
                  </div>
                </button>

                <button className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 text-sm">Live Chat Support</div>
                    <div className="text-xs text-slate-500">Get instant help from our team</div>
                  </div>
                </button>

                <button className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 text-sm">Getting Started</div>
                    <div className="text-xs text-slate-500">Quick onboarding checklist</div>
                  </div>
                </button>
              </div>

              <div className="px-4 pt-3 border-t border-slate-100">
                <div className="text-xs text-slate-500 mb-2">Need more help?</div>
                <button className="text-xs text-brand-600 hover:text-brand-700 font-medium">Contact Support →</button>
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-slate-200 hidden lg:block"></div>

        {/* Role Switcher for Demo */}
        <div className="relative role-switcher-container">
          <Tooltip content="Switch user role for testing" position="bottom">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isAdmin
                ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {isAdmin ? 'Admin' : 'User'}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </Tooltip>

          {/* Role Switcher Dropdown */}
          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-fade-in">
              <div className="px-3 pb-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Switch Role (Demo)</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => handleRoleSwitch('admin')}
                  className={`w-full px-3 py-2 text-left text-sm flex items-center gap-3 transition-colors ${isAdmin ? 'bg-purple-50 text-purple-800' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isAdmin ? 'bg-purple-200' : 'bg-slate-100'
                    }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">Admin</div>
                    <div className="text-xs text-slate-500">Full QC review access</div>
                  </div>
                  {isAdmin && (
                    <svg className="w-4 h-4 ml-auto text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => handleRoleSwitch('user')}
                  className={`w-full px-3 py-2 text-left text-sm flex items-center gap-3 transition-colors ${!isAdmin ? 'bg-blue-50 text-blue-800' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${!isAdmin ? 'bg-blue-200' : 'bg-slate-100'
                    }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">User</div>
                    <div className="text-xs text-slate-500">View & resubmit rework</div>
                  </div>
                  {!isAdmin && (
                    <svg className="w-4 h-4 ml-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-slate-200 hidden lg:block"></div>

        {/* Enhanced Notifications */}
        <div className="relative notifications-container">
          <Tooltip content="View notifications and alerts" position="bottom">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setHasNewNotification(false);
              }}
              className={`relative p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 ${hasNewNotification ? 'animate-bell-ring' : ''}`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </Tooltip>

          {/* Enhanced Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 z-50 animate-fade-in">
              <NotificationPanel
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onClearAll={clearAll}
              />
            </div>
          )}
        </div>

        {/* Enhanced Profile */}
        <div className="relative profile-container">
          <button
            className="flex items-center gap-2 lg:gap-3 focus:outline-none hover:bg-slate-50 rounded-lg p-1 lg:p-2 transition-colors"
            onClick={() => setShowProfile(!showProfile)}
          >
            <img className="h-8 w-8 lg:h-9 lg:w-9 rounded-full border-2 border-slate-200 shadow-sm object-cover" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=${isAdmin ? '7c3aed' : '3b82f6'}&color=fff&size=36`} alt="User" />
            <div className="hidden lg:block text-left">
              <p className="text-sm font-semibold text-slate-700 leading-none">{user?.name || 'User'}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">{isAdmin ? 'Administrator' : 'User'}</p>
            </div>
            <svg className="w-4 h-4 text-slate-400 hidden lg:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Enhanced Profile Dropdown */}
          {showProfile && (
            <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-lg border border-slate-100 py-3 z-50 animate-fade-in origin-top-right">
              <div className="px-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <img className="h-12 w-12 rounded-full border-2 border-slate-200 shadow-sm object-cover" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=${isAdmin ? '7c3aed' : '3b82f6'}&color=fff&size=48`} alt="User" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">{user?.name || 'User'}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                        {isAdmin ? 'Admin' : 'User'}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                        Online
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="py-2">
                <button
                  onClick={() => { onNavigate('settings', null); setShowProfile(false); }}
                  className="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                >
                  <svg className="mr-3 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Account Settings
                </button>

                <button className="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  <svg className="mr-3 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </button>

                <button className="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  <svg className="mr-3 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Notifications
                </button>

                <button className="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  <svg className="mr-3 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Appearance
                </button>
              </div>

              <div className="border-t border-slate-100 py-2">
                <button
                  onClick={() => { onLogout(); setShowProfile(false); }}
                  className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
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