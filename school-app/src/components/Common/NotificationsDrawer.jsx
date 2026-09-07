import React from 'react';
import { X, Check, Bell, Calendar, DollarSign, UserX, Award, Trash2 } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

export const NotificationsDrawer = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, clearNotifications, setActiveTab } = useSchool();

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'leave':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'payroll':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'attendance':
        return <UserX className="w-4 h-4 text-rose-600" />;
      case 'event':
        return <Award className="w-4 h-4 text-indigo-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleNotificationClick = (item) => {
    markNotificationRead(item.id);
    if (item.linkTab) {
      setActiveTab(item.linkTab);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Notifications</h3>
                <p className="text-xs text-slate-500">School alerts & approval updates</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  title="Clear all"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs">No unread notifications right now.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                    item.read
                      ? 'bg-slate-50/70 border-slate-200/80 text-slate-600'
                      : 'bg-white border-indigo-200 shadow-xs ring-1 ring-indigo-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 mt-0.5">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold truncate">{item.title}</span>
                        <span className="text-[11px] text-slate-400 whitespace-nowrap">{item.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-indigo-600 hover:underline">
                          View details →
                        </span>
                        {!item.read && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100 text-indigo-700">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
            <span className="text-xs text-slate-500">
              Live updates enabled for Oakridge Academy
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
