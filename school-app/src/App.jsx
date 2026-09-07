import React, { useState, useEffect } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { LoginView } from './components/Auth/LoginView';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Common/Toast';
import { NotificationsDrawer } from './components/Common/NotificationsDrawer';
import { GlobalSearchModal } from './components/Common/GlobalSearchModal';
import { QuickActionModal } from './components/Common/QuickActionModal';

// Views
import { DashboardView } from './components/Dashboard/DashboardView';
import { StudentsView } from './components/Students/StudentsView';
import { StaffView } from './components/Staff/StaffView';
import { AttendanceView } from './components/Attendance/AttendanceView';
import { PayrollView } from './components/Payroll/PayrollView';
import { LeavesView } from './components/Leaves/LeavesView';
import { ActivitiesView } from './components/Activities/ActivitiesView';
import { ClassesView } from './components/Classes/ClassesView';
import { SettingsView } from './components/Settings/SettingsView';

// Modals
import { StudentEnrollModal } from './components/Students/StudentEnrollModal';
import { StaffEnrollModal } from './components/Staff/StaffEnrollModal';
import { ApplyLeaveModal } from './components/Leaves/ApplyLeaveModal';
import { StudentProfileModal } from './components/Students/StudentProfileModal';
import { StaffProfileModal } from './components/Staff/StaffProfileModal';

function MainAppContent() {
  const {
    isAuthenticated,
    activeTab,
    toastMessage,
    globalSearchOpen,
    setGlobalSearchOpen,
    quickActionOpen,
    setQuickActionOpen,
    rolePermissions
  } = useSchool();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [enrollStudentModalOpen, setEnrollStudentModalOpen] = useState(false);
  const [hireStaffModalOpen, setHireStaffModalOpen] = useState(false);
  const [applyLeaveModalOpen, setApplyLeaveModalOpen] = useState(false);

  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState(null);
  const [selectedStaffForProfile, setSelectedStaffForProfile] = useState(null);

  // Keyboard shortcut for Command+K search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setGlobalSearchOpen]);

  // If not authenticated, display the Login Screen
  if (!isAuthenticated) {
    return (
      <>
        <LoginView />
        <Toast toast={toastMessage} onClose={() => {}} />
      </>
    );
  }

  // Verify if activeTab is allowed for current role; fallback to dashboard
  const isTabAllowed = rolePermissions.allowedTabs.includes(activeTab);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50 text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation Bar */}
      <Navbar
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenQuickAction={() => setQuickActionOpen(true)}
        onOpenGlobalSearch={() => setGlobalSearchOpen(true)}
      />

      {/* Main Layout (Fixed Sidebar + Independent Scrolling Content) */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* Fixed Left Sidebar with its own scroll */}
        <Sidebar />

        {/* Independent Scrolling Content Pane with RBAC Module Guard */}
        <main className="flex-1 h-full overflow-y-auto min-h-0 bg-slate-50/60 pb-16">
          {!isTabAllowed ? (
            <div className="p-12 text-center max-w-lg mx-auto space-y-4 my-12 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <span className="text-2xl">🔒</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Access Restricted by Role</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your current perspective (<strong>{rolePermissions.title}</strong>) does not have permission to access the <strong>{activeTab}</strong> module.
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  onOpenEnrollStudent={() => setEnrollStudentModalOpen(true)}
                  onOpenHireStaff={() => setHireStaffModalOpen(true)}
                  onOpenApplyLeave={() => setApplyLeaveModalOpen(true)}
                />
              )}

              {activeTab === 'students' && <StudentsView />}

              {activeTab === 'staff' && <StaffView />}

              {activeTab === 'attendance' && <AttendanceView />}

              {activeTab === 'payroll' && <PayrollView />}

              {activeTab === 'leaves' && <LeavesView />}

              {activeTab === 'activities' && <ActivitiesView />}

              {activeTab === 'classes' && <ClassesView />}

              {activeTab === 'settings' && <SettingsView />}
            </>
          )}
        </main>

      </div>

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      {/* Global Command+K Search Modal */}
      <GlobalSearchModal
        isOpen={globalSearchOpen}
        onClose={() => setGlobalSearchOpen(false)}
        onSelectStudent={(s) => setSelectedStudentForProfile(s)}
        onSelectStaff={(st) => setSelectedStaffForProfile(st)}
      />

      {/* Quick Action Modal (Role Filtered) */}
      <QuickActionModal
        isOpen={quickActionOpen}
        onClose={() => setQuickActionOpen(false)}
        onOpenEnrollStudent={() => setEnrollStudentModalOpen(true)}
        onOpenHireStaff={() => setHireStaffModalOpen(true)}
        onOpenApplyLeave={() => setApplyLeaveModalOpen(true)}
      />

      {/* Global Action Modals triggered anywhere */}
      {enrollStudentModalOpen && (
        <StudentEnrollModal
          isOpen={enrollStudentModalOpen}
          onClose={() => setEnrollStudentModalOpen(false)}
        />
      )}

      {hireStaffModalOpen && (
        <StaffEnrollModal
          isOpen={hireStaffModalOpen}
          onClose={() => setHireStaffModalOpen(false)}
        />
      )}

      {applyLeaveModalOpen && (
        <ApplyLeaveModal
          isOpen={applyLeaveModalOpen}
          onClose={() => setApplyLeaveModalOpen(false)}
        />
      )}

      {selectedStudentForProfile && (
        <StudentProfileModal
          student={selectedStudentForProfile}
          isOpen={!!selectedStudentForProfile}
          onClose={() => setSelectedStudentForProfile(null)}
          onEdit={() => {}}
        />
      )}

      {selectedStaffForProfile && (
        <StaffProfileModal
          staffMember={selectedStaffForProfile}
          isOpen={!!selectedStaffForProfile}
          onClose={() => setSelectedStaffForProfile(null)}
          onEdit={() => {}}
        />
      )}

      {/* Toast Notification */}
      <Toast toast={toastMessage} onClose={() => {}} />

    </div>
  );
}

export default function App() {
  return (
    <SchoolProvider>
      <MainAppContent />
    </SchoolProvider>
  );
}
