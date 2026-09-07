import React from 'react';
import {
  X,
  UserPlus,
  Briefcase,
  CalendarCheck,
  DollarSign,
  FileText,
  Award,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

export const QuickActionModal = ({
  isOpen,
  onClose,
  onOpenEnrollStudent,
  onOpenHireStaff,
  onOpenApplyLeave
}) => {
  const { setActiveTab, generateMonthlyPayroll, permissions, currentRole, rolePermissions } = useSchool();

  if (!isOpen) return null;

  const allActions = [
    {
      id: 'enroll-student',
      title: 'Enroll New Student',
      desc: 'Register a new student with grade, guardian & transport info',
      icon: <UserPlus className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50 hover:bg-indigo-100/80 border-indigo-200',
      allowed: permissions?.canEnrollStudents,
      action: () => {
        onClose();
        if (onOpenEnrollStudent) onOpenEnrollStudent();
        else setActiveTab('students');
      }
    },
    {
      id: 'onboard-staff',
      title: 'Onboard Staff Member',
      desc: 'Hire teacher/admin with salary package & joining date',
      icon: <Briefcase className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200',
      allowed: permissions?.canHireStaff,
      action: () => {
        onClose();
        if (onOpenHireStaff) onOpenHireStaff();
        else setActiveTab('staff');
      }
    },
    {
      id: 'mark-attendance',
      title: 'Mark Today Attendance',
      desc: 'Take daily roll call for students & staff members',
      icon: <CalendarCheck className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50 hover:bg-blue-100/80 border-blue-200',
      allowed: permissions?.canMarkAttendance,
      action: () => {
        onClose();
        setActiveTab('attendance');
      }
    },
    {
      id: 'apply-leave',
      title: 'Apply Staff Leave',
      desc: 'Submit casual, sick or annual leave request for faculty',
      icon: <FileText className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50 hover:bg-amber-100/80 border-amber-200',
      allowed: permissions?.canApplyLeave,
      action: () => {
        onClose();
        if (onOpenApplyLeave) onOpenApplyLeave();
        else setActiveTab('leaves');
      }
    },
    {
      id: 'generate-payroll',
      title: 'Generate Monthly Payroll',
      desc: 'Compute salaries, allowances, deductions and print payslips',
      icon: <DollarSign className="w-5 h-5 text-teal-600" />,
      bg: 'bg-teal-50 hover:bg-teal-100/80 border-teal-200',
      allowed: permissions?.canGeneratePayroll,
      action: () => {
        onClose();
        generateMonthlyPayroll('September', 2026);
        setActiveTab('payroll');
      }
    },
    {
      id: 'manage-club',
      title: 'Manage Club / Activity',
      desc: 'Organize extracurriculars, record student achievements & awards',
      icon: <Award className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-50 hover:bg-purple-100/80 border-purple-200',
      allowed: permissions?.canManageActivities,
      action: () => {
        onClose();
        setActiveTab('activities');
      }
    }
  ];

  // Filter actions based on role permissions
  const availableActions = allActions.filter(a => a.allowed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 p-6 animate-scale-in">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Quick Actions</h3>
              <p className="text-xs text-slate-500">
                Filtered shortcuts for <strong>{rolePermissions?.title || currentRole}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {availableActions.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <ShieldAlert className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">No authorized quick actions</p>
            <p className="text-xs text-slate-400">Your role has view-only access for current modules.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {availableActions.map((item) => (
              <div
                key={item.id}
                onClick={item.action}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${item.bg}`}
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="p-1.5 bg-white rounded-lg shadow-2xs">
                    {item.icon}
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm">{item.title}</h4>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
