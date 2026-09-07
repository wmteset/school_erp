import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  CalendarCheck2,
  DollarSign,
  Palmtree,
  Trophy,
  BookOpen,
  Settings
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';

export const Sidebar = () => {
  const {
    activeTab,
    setActiveTab,
    students,
    staff,
    leaveRequests,
    activities,
    classes,
    rolePermissions
  } = useSchool();

  const pendingLeaves = leaveRequests.filter(l => l.status === 'Pending').length;

  const allNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      badge: null
    },
    {
      id: 'students',
      label: 'Students Directory',
      icon: <GraduationCap className="w-5 h-5" />,
      badge: students.length
    },
    {
      id: 'staff',
      label: 'Staff & Faculty',
      icon: <Users className="w-5 h-5" />,
      badge: staff.length
    },
    {
      id: 'attendance',
      label: 'Attendance Hub',
      icon: <CalendarCheck2 className="w-5 h-5" />,
      badge: 'Live'
    },
    {
      id: 'payroll',
      label: 'Salaries & Payroll',
      icon: <DollarSign className="w-5 h-5" />,
      badge: null
    },
    {
      id: 'leaves',
      label: 'Staff Leaves',
      icon: <Palmtree className="w-5 h-5" />,
      badge: pendingLeaves > 0 ? pendingLeaves : null,
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      id: 'activities',
      label: 'Extracurricular & Clubs',
      icon: <Trophy className="w-5 h-5" />,
      badge: activities.length
    },
    {
      id: 'classes',
      label: 'Classes & Sections',
      icon: <BookOpen className="w-5 h-5" />,
      badge: classes.length
    },
    {
      id: 'settings',
      label: 'Settings & Data Center',
      icon: <Settings className="w-5 h-5" />,
      badge: null
    }
  ];

  // Filter nav items based on active role permissions
  const allowedNavItems = allNavItems.filter(item =>
    rolePermissions.allowedTabs.includes(item.id)
  );

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto border-r border-slate-800 select-none z-20">
      
      {/* Navigation Links List */}
      <div className="flex-1 py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Permitted Modules</span>
          <span className="text-slate-400">{allowedNavItems.length} active</span>
        </div>

        {allowedNavItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </div>

              {item.badge !== null && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    item.badgeColor || (isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700')
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

    </aside>
  );
};
