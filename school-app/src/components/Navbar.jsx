import React, { useState, useRef, useEffect } from 'react';
import {
  School,
  Search,
  Bell,
  Sparkles,
  Calendar,
  ChevronDown,
  Shield,
  Briefcase,
  GraduationCap,
  UserCheck,
  LogOut,
  User,
  Mail,
  Building
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { formatDate } from '../utils/helpers';

export const Navbar = ({ onOpenNotifications, onOpenQuickAction, onOpenGlobalSearch }) => {
  const {
    schoolInfo,
    currentRole,
    currentUser,
    logout,
    notifications,
    rolePermissions,
    selectedDate,
    setSelectedDate
  } = useSchool();

  const todayStr = new Date().toISOString().split('T')[0];

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getRoleIcon = () => {
    switch (currentRole) {
      case 'principal': return <GraduationCap className="w-4 h-4 text-emerald-600" />;
      case 'teacher': return <UserCheck className="w-4 h-4 text-amber-600" />;
      case 'accountant': return <Briefcase className="w-4 h-4 text-teal-600" />;
      default: return <Shield className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 backdrop-blur-md shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: School Logo & Title */}
        <div className="flex items-center gap-3 min-w-max">
          {schoolInfo.logo ? (
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-md shadow-indigo-100/50 flex items-center justify-center shrink-0">
              <img src={schoolInfo.logo} alt="School Logo" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 shrink-0">
              <School className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-800 tracking-tight leading-tight m-0">
                {schoolInfo.name}
              </h1>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {schoolInfo.academicYear}
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block truncate max-w-xs m-0">
              {schoolInfo.headerSubtitle || schoolInfo.affiliation || schoolInfo.tagline}
            </p>
          </div>
        </div>

        {/* Center: Search input */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={onOpenGlobalSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-100/80 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl border border-slate-200/60 transition-all text-sm group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              <span>Search students, staff, classes, clubs...</span>
            </div>
            <kbd className="text-[11px] font-medium bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-500 shadow-2xs">
              ⌘K / ESC
            </kbd>
          </button>
        </div>

        {/* Right: Date, Quick Action, Notifications & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Dynamic Selectable Datepicker Tag */}
          <div className="relative flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200/80 rounded-xl text-xs text-slate-700 font-medium transition-colors group cursor-pointer shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0 pointer-events-none" />
            <div className="flex items-center gap-1 pointer-events-none">
              <span className="font-semibold text-slate-500 hidden lg:inline">
                {selectedDate === todayStr ? 'Today:' : 'Date:'}
              </span>
              <span className="font-bold text-slate-800">
                {formatDate(selectedDate)}
              </span>
            </div>
            {/* HTML5 Native Datepicker overlay */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(e.target.value);
                }
              }}
              aria-label="Select active date"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            />
            {selectedDate !== todayStr && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDate(todayStr);
                }}
                className="relative z-20 ml-1 px-1.5 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-md transition-colors shadow-2xs cursor-pointer"
                title="Reset date to today"
              >
                Today
              </button>
            )}
          </div>

          {/* Quick Action Button */}
          <button
            onClick={onOpenQuickAction}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all hover:shadow cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quick Action</span>
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 bg-slate-100 hover:bg-slate-200/80 text-slate-600 rounded-xl transition-colors border border-slate-200/60 cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(prev => !prev)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl transition-colors text-xs font-medium text-slate-700 cursor-pointer"
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt=""
                  className="w-6 h-6 rounded-lg object-cover border border-slate-200"
                />
              ) : (
                <div className="w-6 h-6 rounded-lg bg-white shadow-2xs flex items-center justify-center">
                  {getRoleIcon()}
                </div>
              )}
              <div className="hidden md:flex flex-col text-left">
                <span className="font-semibold leading-tight truncate max-w-[120px]">
                  {currentUser?.name || rolePermissions.label}
                </span>
                <span className="text-[10px] text-slate-400 leading-none">
                  {rolePermissions.label}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 animate-scale-in">
                
                {/* User Identity Header */}
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                  <div className="flex items-center gap-3">
                    {currentUser?.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                        {currentUser?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-sm truncate">
                        {currentUser?.name || 'Administrator'}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {currentUser?.email || `${currentRole}@oakridge.edu`}
                      </div>
                      <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <span>{rolePermissions.label}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Details & Role Scope */}
                <div className="px-4 py-2.5 text-xs text-slate-600 space-y-1.5 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-semibold text-slate-700 truncate max-w-[130px]">
                      {currentUser?.department || 'Administration'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Access Scope:</span>
                    <span className="font-semibold text-emerald-600">
                      {rolePermissions.allowedTabs.length} Modules Active
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <div className="pt-1.5 px-2">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out of Session</span>
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
