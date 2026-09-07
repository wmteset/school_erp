// SchoolContext.jsx - Central State, Backend Sync & RBAC Engine
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, getAuthToken, getStoredRole, forgotPasswordApi, verifyOtpApi, resetPasswordApi } from '../api/client';
import {
  INITIAL_SCHOOL_INFO,
  INITIAL_STAFF,
  INITIAL_STUDENTS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_PAYROLL_RECORDS,
  INITIAL_ACTIVITIES,
  INITIAL_CLASSES,
  INITIAL_ATTENDANCE,
  INITIAL_NOTIFICATIONS
} from '../data/initialData';

export const ROLE_PERMISSIONS = {
  admin: {
    id: 'admin',
    label: 'Super Admin',
    title: 'Super Administrator',
    badge: 'Full Master Access',
    description: 'Full ERP control, user perspective management & system configuration',
    allowedTabs: ['dashboard', 'students', 'staff', 'attendance', 'payroll', 'leaves', 'activities', 'classes', 'settings'],
    permissions: {
      canEnrollStudents: true,
      canEditStudents: true,
      canDeleteStudents: true,
      canHireStaff: true,
      canEditStaff: true,
      canDeleteStaff: true,
      canViewCompensation: true,
      canMarkAttendance: true,
      canGeneratePayroll: true,
      canDisbursePayroll: true,
      canApplyLeave: true,
      canReviewLeave: true,
      canManageActivities: true,
      canManageClasses: true,
      canModifySettings: true,
      canResetDatabase: true,
    }
  },
  principal: {
    id: 'principal',
    label: 'Principal',
    title: 'School Principal',
    badge: 'Executive Academic Access',
    description: 'Academic oversight, faculty evaluations, leave approvals & institutional registers',
    allowedTabs: ['dashboard', 'students', 'staff', 'attendance', 'leaves', 'activities', 'classes', 'settings'],
    permissions: {
      canEnrollStudents: true,
      canEditStudents: true,
      canDeleteStudents: true,
      canHireStaff: true,
      canEditStaff: true,
      canDeleteStaff: false,
      canViewCompensation: false,
      canMarkAttendance: true,
      canGeneratePayroll: false,
      canDisbursePayroll: false,
      canApplyLeave: true,
      canReviewLeave: true,
      canManageActivities: true,
      canManageClasses: true,
      canModifySettings: true,
      canResetDatabase: false,
    }
  },
  teacher: {
    id: 'teacher',
    label: 'Teacher / Faculty',
    title: 'Faculty / Class Coordinator',
    badge: 'Faculty Classroom Access',
    description: 'Daily roll call, student directory, class timetable, clubs & self leave requests',
    allowedTabs: ['dashboard', 'students', 'attendance', 'leaves', 'activities', 'classes'],
    permissions: {
      canEnrollStudents: false,
      canEditStudents: false,
      canDeleteStudents: false,
      canHireStaff: false,
      canEditStaff: false,
      canDeleteStaff: false,
      canViewCompensation: false,
      canMarkAttendance: true,
      canGeneratePayroll: false,
      canDisbursePayroll: false,
      canApplyLeave: true,
      canReviewLeave: false,
      canManageActivities: true,
      canManageClasses: false,
      canModifySettings: false,
      canResetDatabase: false,
    }
  },
  accountant: {
    id: 'accountant',
    label: 'Finance / Bursar',
    title: 'Chief Accountant / Bursar',
    badge: 'Finance & Payroll Access',
    description: 'Faculty salary packages, monthly payroll disbursements, payslips & tax records',
    allowedTabs: ['dashboard', 'staff', 'payroll', 'leaves', 'settings'],
    permissions: {
      canEnrollStudents: false,
      canEditStudents: false,
      canDeleteStudents: false,
      canHireStaff: false,
      canEditStaff: true,
      canDeleteStaff: false,
      canViewCompensation: true,
      canMarkAttendance: false,
      canGeneratePayroll: true,
      canDisbursePayroll: true,
      canApplyLeave: true,
      canReviewLeave: false,
      canManageActivities: false,
      canManageClasses: false,
      canModifySettings: true,
      canResetDatabase: false,
    }
  }
};

const SchoolContext = createContext();

const STORAGE_KEYS = {
  AUTH_TOKEN: 'eduvibe_auth_token',
  CURRENT_USER: 'eduvibe_user_v1',
  ROLE: 'eduvibe_role_v1',
  ACTIVE_TAB: 'eduvibe_active_tab_v1',
};

export const SchoolProvider = ({ children }) => {
  // Authentication State
  const [authToken, setAuthToken] = useState(() => getAuthToken());
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) return JSON.parse(saved);
      // Auto-fallback default session
      return {
        id: 'USR-ADMIN',
        name: 'Dr. Arthur Pendelton',
        email: 'admin@oakridge.edu',
        role: 'admin',
        title: 'Super Administrator',
        department: 'Administration',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        isActive: true,
      };
    } catch {
      return null;
    }
  });

  const [currentRole, setCurrentRoleState] = useState(() => getStoredRole());
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB) || 'dashboard';
    } catch {
      return 'dashboard';
    }
  });

  // Domain Data States (initialized with defaults, then updated from backend)
  const [schoolInfo, setSchoolInfoState] = useState(INITIAL_SCHOOL_INFO);
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [leaveRequests, setLeaveRequests] = useState(INITIAL_LEAVE_REQUESTS);
  const [payrollRecords, setPayrollRecords] = useState(INITIAL_PAYROLL_RECORDS);
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [classes, setClasses] = useState(INITIAL_CLASSES);
  const [attendance, setAttendance] = useState(INITIAL_ATTENDANCE);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const [selectedDateState, setSelectedDateState] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const setSelectedDate = useCallback((dateVal) => {
    const today = new Date().toISOString().split('T')[0];
    if (typeof dateVal === 'function') {
      setSelectedDateState(prev => {
        const nextVal = dateVal(prev);
        return nextVal > today ? today : nextVal;
      });
    } else {
      setSelectedDateState(dateVal > today ? today : dateVal);
    }
  }, []);

  const selectedDate = selectedDateState;
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Sync activeTab to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
  }, [activeTab]);

  // Load all initial data from NestJS backend
  const refreshAllData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      // Parallel fetch for speed
      const [
        infoRes,
        studentsRes,
        staffRes,
        leavesRes,
        payrollRes,
        activitiesRes,
        classesRes,
        notifsRes,
        attRes
      ] = await Promise.allSettled([
        api.schoolInfo.get(),
        api.students.getAll(),
        api.staff.getAll(),
        api.leaves.getAll(),
        api.payroll.getAll(),
        api.activities.getAll(),
        api.classes.getAll(),
        api.notifications.getAll(),
        api.attendance.getDaily(selectedDate)
      ]);

      if (infoRes.status === 'fulfilled' && infoRes.value) {
        setSchoolInfoState(infoRes.value);
      }
      if (studentsRes.status === 'fulfilled' && Array.isArray(studentsRes.value)) {
        setStudents(studentsRes.value);
      }
      if (staffRes.status === 'fulfilled' && Array.isArray(staffRes.value)) {
        setStaff(staffRes.value);
      }
      if (leavesRes.status === 'fulfilled' && Array.isArray(leavesRes.value)) {
        setLeaveRequests(leavesRes.value);
      }
      if (payrollRes.status === 'fulfilled' && Array.isArray(payrollRes.value)) {
        setPayrollRecords(payrollRes.value);
      }
      if (activitiesRes.status === 'fulfilled' && Array.isArray(activitiesRes.value)) {
        setActivities(activitiesRes.value);
      }
      if (classesRes.status === 'fulfilled' && Array.isArray(classesRes.value)) {
        setClasses(classesRes.value);
      }
      if (notifsRes.status === 'fulfilled' && Array.isArray(notifsRes.value)) {
        setNotifications(notifsRes.value);
      }
      if (attRes.status === 'fulfilled' && attRes.value) {
        setAttendance(prev => ({
          ...prev,
          [selectedDate]: {
            students: attRes.value.students || {},
            staff: attRes.value.staff || {}
          }
        }));
      }

      setIsBackendConnected(true);
    } catch (err) {
      console.warn('Backend sync fallback to local store:', err.message);
      setIsBackendConnected(false);
    } finally {
      setIsLoadingData(false);
    }
  }, [selectedDate]);

  // Initial load on mount
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Fetch daily attendance whenever selectedDate changes
  useEffect(() => {
    let isMounted = true;
    api.attendance.getDaily(selectedDate)
      .then(res => {
        if (isMounted && res) {
          setAttendance(prev => ({
            ...prev,
            [selectedDate]: {
              students: res.students || {},
              staff: res.staff || {}
            }
          }));
        }
      })
      .catch(() => {
        // Fallback to local attendance map
      });
    return () => { isMounted = false; };
  }, [selectedDate]);

  // --- Authentication Methods ---
  const login = async (credentials) => {
    try {
      const res = await api.auth.login(credentials);
      if (res.token) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, res.token);
        setAuthToken(res.token);
      }
      if (res.user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(res.user));
        setCurrentUser(res.user);
      }
      if (res.role) {
        localStorage.setItem(STORAGE_KEYS.ROLE, res.role);
        setCurrentRoleState(res.role);
        const roleConfig = ROLE_PERMISSIONS[res.role] || ROLE_PERMISSIONS.admin;
        if (!roleConfig.allowedTabs.includes(activeTab)) {
          setActiveTab('dashboard');
        }
      }

      showToast(`Welcome back, ${res.user?.name || 'User'}! Perspective: ${res.roleConfig?.label || res.role}`, 'success');
      refreshAllData();
      return res;
    } catch (err) {
      let errText = 'Invalid credentials. Please check your email and password.';
      if (typeof err.message === 'string' && err.message.trim() && err.message !== '[object Object]') {
        errText = err.message;
      } else if (err.data && typeof err.data.message === 'string') {
        errText = err.data.message;
      } else if (err.data && Array.isArray(err.data.message)) {
        errText = err.data.message.join(', ');
      }
      showToast(errText, 'error');
      throw new Error(errText);
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout().catch(() => {});
    } finally {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      setAuthToken(null);
      setCurrentUser(null);
      showToast('Logged out successfully.', 'info');
    }
  };

  const forgotPassword = async (email) => {
    try {
      if (typeof forgotPasswordApi === 'function') {
        return await forgotPasswordApi(email);
      }
      return await api.auth.forgotPassword(email);
    } catch (err) {
      let errText = 'Failed to request password reset OTP.';
      if (typeof err.message === 'string' && err.message.trim() && err.message !== '[object Object]') {
        errText = err.message;
      }
      showToast(errText, 'error');
      throw new Error(errText);
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      if (typeof verifyOtpApi === 'function') {
        return await verifyOtpApi({ email, otp });
      }
      return await api.auth.verifyOtp({ email, otp });
    } catch (err) {
      let errText = 'Invalid or expired OTP code.';
      if (typeof err.message === 'string' && err.message.trim() && err.message !== '[object Object]') {
        errText = err.message;
      }
      showToast(errText, 'error');
      throw new Error(errText);
    }
  };

  const resetPassword = async (email, newPassword, verificationCode) => {
    try {
      let res;
      if (typeof resetPasswordApi === 'function') {
        res = await resetPasswordApi({ email, newPassword, verificationCode });
      } else {
        res = await api.auth.resetPassword({ email, newPassword, verificationCode });
      }
      showToast(res.message || 'Password reset successfully! All prior sessions ended.', 'success');
      return res;
    } catch (err) {
      let errText = 'Failed to reset password.';
      if (typeof err.message === 'string' && err.message.trim() && err.message !== '[object Object]') {
        errText = err.message;
      }
      showToast(errText, 'error');
      throw new Error(errText);
    }
  };

  const setCurrentRole = async (newRole) => {
    const roleConfig = ROLE_PERMISSIONS[newRole] || ROLE_PERMISSIONS.admin;
    setCurrentRoleState(newRole);
    localStorage.setItem(STORAGE_KEYS.ROLE, newRole);

    if (!roleConfig.allowedTabs.includes(activeTab)) {
      setActiveTab('dashboard');
    }

    try {
      const res = await api.auth.switchRole(newRole);
      if (res.user) {
        setCurrentUser(res.user);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(res.user));
      }
      if (res.token) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, res.token);
        setAuthToken(res.token);
      }
    } catch {
      // Offline fallback
    }

    showToast(`Perspective switched to ${roleConfig.title} (${roleConfig.allowedTabs.length} modules accessible)`, 'info');
  };

  // --- School Info Actions ---
  const setSchoolInfo = async (infoData) => {
    try {
      const updated = await api.schoolInfo.update(infoData);
      setSchoolInfoState(updated);
      showToast('Institution settings updated and synchronized with backend!', 'success');
      return updated;
    } catch (err) {
      setSchoolInfoState(infoData);
      showToast('Updated locally (offline mode)', 'info');
      return infoData;
    }
  };

  // --- Student Actions ---
  const addStudent = async (studentData) => {
    try {
      const payload = {
        ...studentData,
        status: studentData.status || 'Active',
        admissionDate: studentData.admissionDate || new Date().toISOString().split('T')[0],
        activities: studentData.activities || [],
        awards: studentData.awards || [],
        avatar: studentData.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80`
      };

      if (!studentData.id || studentData.id.startsWith('STU-temp')) {
        delete payload.id;
      }

      const created = await api.students.create(payload);
      setStudents(prev => [created, ...prev.filter(s => s.id !== created.id)]);
      showToast(`Student ${created.firstName} ${created.lastName} enrolled successfully!`, 'success');
      markStudentAttendance(selectedDate, created.id, 'P', 'Newly enrolled');
      return created;
    } catch (err) {
      let errText = 'Failed to enroll student.';
      if (typeof err.message === 'string' && err.message.trim() && err.message !== '[object Object]') {
        errText = err.message;
      }
      showToast(errText, 'error');
      throw new Error(errText);
    }
  };

  const updateStudent = async (id, updatedData) => {
    try {
      const updated = await api.students.update(id, updatedData);
      setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
      showToast('Student details updated successfully.', 'success');
      return updated;
    } catch (err) {
      let errText = 'Failed to update student.';
      if (typeof err.message === 'string' && err.message.trim() && err.message !== '[object Object]') {
        errText = err.message;
      }
      showToast(errText, 'error');
      throw new Error(errText);
    }
  };

  const deleteStudent = async (id) => {
    try {
      await api.students.delete(id);
      setStudents(prev => prev.filter(item => item.id !== id));
      showToast('Student removed successfully.', 'info');
    } catch (err) {
      let errText = 'Failed to remove student.';
      if (typeof err.message === 'string' && err.message.trim() && err.message !== '[object Object]') {
        errText = err.message;
      }
      showToast(errText, 'error');
      throw new Error(errText);
    }
  };

  // --- Staff Actions ---
  const addStaff = async (staffData) => {
    try {
      const payload = {
        ...staffData,
        status: staffData.status || 'Active',
        joiningDate: staffData.joiningDate || new Date().toISOString().split('T')[0],
        avatar: staffData.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80`,
        salary: {
          baseSalary: Number(staffData.salary?.baseSalary) || 5000,
          hra: Number(staffData.salary?.hra) || 1100,
          transportAllowance: Number(staffData.salary?.transportAllowance) || 350,
          specialAllowance: Number(staffData.salary?.specialAllowance) || 250,
          pfDeduction: Number(staffData.salary?.pfDeduction) || 320,
          taxDeduction: Number(staffData.salary?.taxDeduction) || 420,
          bankName: staffData.salary?.bankName || 'Chase National Bank',
          accountNumber: staffData.salary?.accountNumber || '•••• 1234',
          taxId: staffData.salary?.taxId || 'TAX-US-99000'
        },
        leaveBalance: {
          casualTotal: Number(staffData.leaveBalance?.casualTotal) || 12,
          casualUsed: Number(staffData.leaveBalance?.casualUsed) || 0,
          sickTotal: Number(staffData.leaveBalance?.sickTotal) || 10,
          sickUsed: Number(staffData.leaveBalance?.sickUsed) || 0,
          annualTotal: Number(staffData.leaveBalance?.annualTotal) || 15,
          annualUsed: Number(staffData.leaveBalance?.annualUsed) || 0,
          maternityTotal: Number(staffData.leaveBalance?.maternityTotal) || (staffData.gender === 'Female' ? 90 : 15),
          maternityUsed: Number(staffData.leaveBalance?.maternityUsed) || 0
        }
      };

      if (!staffData.id || staffData.id.startsWith('STF-temp')) {
        delete payload.id;
      }

      const created = await api.staff.create(payload);
      setStaff(prev => [created, ...prev.filter(st => st.id !== created.id)]);
      showToast(`Staff member ${created.firstName} ${created.lastName} onboarded successfully!`, 'success');
      markStaffAttendance(selectedDate, created.id, 'P', 'Active staff');
      return created;
    } catch (err) {
      let errText = 'Failed to onboard staff member.';
      if (typeof err.message === 'string' && err.message.trim() && err.message !== '[object Object]') {
        errText = err.message;
      }
      showToast(errText, 'error');
      throw new Error(errText);
    }
  };

  const updateStaff = async (id, updatedData) => {
    try {
      const updated = await api.staff.update(id, updatedData);
      setStaff(prev => prev.map(st => st.id === id ? { ...st, ...updated } : st));
      showToast('Staff profile and compensation updated successfully.', 'success');
      return updated;
    } catch (err) {
      let errText = 'Failed to update staff member.';
      if (typeof err.message === 'string' && err.message.trim() && err.message !== '[object Object]') {
        errText = err.message;
      }
      showToast(errText, 'error');
      throw new Error(errText);
    }
  };

  const deleteStaff = async (id) => {
    try {
      await api.staff.delete(id);
      setStaff(prev => prev.filter(item => item.id !== id));
      showToast('Staff member removed successfully.', 'info');
    } catch (err) {
      let errText = 'Failed to remove staff member.';
      if (typeof err.message === 'string' && err.message.trim() && err.message !== '[object Object]') {
        errText = err.message;
      }
      showToast(errText, 'error');
      throw new Error(errText);
    }
  };

  // --- Attendance Actions ---
  const markStudentAttendance = async (date, studentId, status, note = '') => {
    setAttendance(prev => {
      const day = prev[date] || { students: {}, staff: {} };
      return {
        ...prev,
        [date]: {
          ...day,
          students: {
            ...day.students,
            [studentId]: { status, note }
          }
        }
      };
    });

    try {
      await api.attendance.mark({
        date,
        targetType: 'student',
        targetId: studentId,
        status,
        note
      });
    } catch (err) {
      console.warn('Backend mark attendance error:', err.message);
    }
  };

  const markStaffAttendance = async (date, staffId, status, note = '') => {
    setAttendance(prev => {
      const day = prev[date] || { students: {}, staff: {} };
      return {
        ...prev,
        [date]: {
          ...day,
          staff: {
            ...day.staff,
            [staffId]: { status, note }
          }
        }
      };
    });

    try {
      await api.attendance.mark({
        date,
        targetType: 'staff',
        targetId: staffId,
        status,
        note
      });
    } catch (err) {
      console.warn('Backend staff mark attendance error:', err.message);
    }
  };

  const bulkMarkStudents = async (date, studentIds, status) => {
    setAttendance(prev => {
      const day = prev[date] || { students: {}, staff: {} };
      const updatedStudents = { ...day.students };
      studentIds.forEach(id => {
        updatedStudents[id] = { status, note: status === 'P' ? 'Present' : 'Marked in bulk' };
      });
      return {
        ...prev,
        [date]: {
          ...day,
          students: updatedStudents
        }
      };
    });
    showToast(`Marked ${studentIds.length} students as ${status === 'P' ? 'Present' : status === 'A' ? 'Absent' : status === 'L' ? 'Late' : 'Excused'}.`);

    try {
      await api.attendance.bulkMark({
        date,
        targetType: 'student',
        records: studentIds.map(id => ({ targetId: id, status, note: 'Bulk marked' }))
      });
    } catch (err) {
      console.warn('Backend bulk mark error:', err.message);
    }
  };

  const bulkMarkStaff = async (date, staffIds, status) => {
    setAttendance(prev => {
      const day = prev[date] || { students: {}, staff: {} };
      const updatedStaff = { ...day.staff };
      staffIds.forEach(id => {
        updatedStaff[id] = { status, note: status === 'P' ? 'Present' : 'Marked in bulk' };
      });
      return {
        ...prev,
        [date]: {
          ...day,
          staff: updatedStaff
        }
      };
    });
    showToast(`Marked ${staffIds.length} staff members as ${status === 'P' ? 'Present' : status === 'A' ? 'Absent' : 'Excused'}.`);

    try {
      await api.attendance.bulkMark({
        date,
        targetType: 'staff',
        records: staffIds.map(id => ({ targetId: id, status, note: 'Bulk marked' }))
      });
    } catch (err) {
      console.warn('Backend staff bulk mark error:', err.message);
    }
  };

  // Helper to calculate student attendance %
  const getStudentAttendanceRate = (studentId) => {
    const dates = Object.keys(attendance);
    if (!dates.length) return 100;
    let presentCount = 0;
    let totalRecorded = 0;
    dates.forEach(d => {
      const rec = attendance[d]?.students?.[studentId];
      if (rec) {
        totalRecorded++;
        if (rec.status === 'P' || rec.status === 'L') presentCount++;
      }
    });
    if (totalRecorded === 0) return 96;
    return Math.round((presentCount / totalRecorded) * 100);
  };

  // Helper to calculate staff attendance %
  const getStaffAttendanceRate = (staffId) => {
    const dates = Object.keys(attendance);
    if (!dates.length) return 100;
    let presentCount = 0;
    let totalRecorded = 0;
    dates.forEach(d => {
      const rec = attendance[d]?.staff?.[staffId];
      if (rec) {
        totalRecorded++;
        if (rec.status === 'P' || rec.status === 'L' || rec.status === 'E') presentCount++;
      }
    });
    if (totalRecorded === 0) return 98;
    return Math.round((presentCount / totalRecorded) * 100);
  };

  // --- Leave Management Actions ---
  const applyLeaveRequest = async (leaveData) => {
    const targetStaff = staff.find(s => s.id === leaveData.staffId);
    const newLeave = {
      id: `LV-2026-${String(leaveRequests.length + 85).padStart(3, '0')}`,
      staffId: leaveData.staffId,
      staffName: targetStaff ? `${targetStaff.firstName} ${targetStaff.lastName}` : 'Staff Member',
      department: targetStaff?.department || 'General',
      leaveType: leaveData.leaveType || 'Casual Leave',
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      daysCount: leaveData.daysCount || 1,
      reason: leaveData.reason || 'Personal request',
      substituteTeacher: leaveData.substituteTeacher || 'Internal arrangement',
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0],
      reviewedBy: null,
      reviewRemarks: null
    };

    setLeaveRequests(prev => [newLeave, ...prev]);
    showToast('Leave request submitted successfully for administrative approval.');

    try {
      const created = await api.leaves.apply(leaveData);
      setLeaveRequests(prev => prev.map(l => l.id === newLeave.id ? created : l));
    } catch (err) {
      console.warn('Backend apply leave error:', err.message);
    }

    return newLeave;
  };

  const reviewLeaveRequest = async (leaveId, newStatus, remarks = '') => {
    let affectedStaffId = null;
    let leaveType = '';
    let daysCount = 1;
    let startDate = '';

    setLeaveRequests(prev => prev.map(req => {
      if (req.id === leaveId) {
        affectedStaffId = req.staffId;
        leaveType = req.leaveType;
        daysCount = req.daysCount;
        startDate = req.startDate;
        return {
          ...req,
          status: newStatus,
          reviewedBy: currentRole === 'admin' ? 'Super Administrator' : 'Dr. Arthur Pendelton',
          reviewRemarks: remarks || (newStatus === 'Approved' ? 'Approved by Administration' : 'Rejected as per policy')
        };
      }
      return req;
    }));

    // If approved, update staff's leave balances locally
    if (newStatus === 'Approved' && affectedStaffId) {
      setStaff(prev => prev.map(s => {
        if (s.id === affectedStaffId) {
          const balances = { ...(s.leaveBalance || { casualTotal: 12, casualUsed: 0, sickTotal: 10, sickUsed: 0, annualTotal: 15, annualUsed: 0 }) };
          if (leaveType.includes('Casual')) balances.casualUsed = (balances.casualUsed || 0) + daysCount;
          else if (leaveType.includes('Sick')) balances.sickUsed = (balances.sickUsed || 0) + daysCount;
          else if (leaveType.includes('Annual')) balances.annualUsed = (balances.annualUsed || 0) + daysCount;
          return { ...s, leaveBalance: balances };
        }
        return s;
      }));

      if (startDate) {
        markStaffAttendance(startDate, affectedStaffId, 'E', `Approved ${leaveType}`);
      }
    }

    showToast(`Leave request ${leaveId} has been ${newStatus.toLowerCase()}.`);

    try {
      await api.leaves.review(leaveId, { status: newStatus, remarks });
    } catch (err) {
      console.warn('Backend review leave error:', err.message);
    }
  };

  // --- Payroll Actions ---
  const generateMonthlyPayroll = async (monthName = 'September', yearNum = 2026) => {
    const existing = payrollRecords.find(p => p.month === monthName && p.year === yearNum);
    if (existing) {
      showToast(`Payroll for ${monthName} ${yearNum} is already generated.`, 'info');
      return existing;
    }

    const staffRecords = staff.map(st => {
      const base = st.salary?.baseSalary || 4500;
      const hra = st.salary?.hra || 1000;
      const transport = st.salary?.transportAllowance || 350;
      const special = st.salary?.specialAllowance || 250;
      const bonus = 0;
      const grossEarnings = base + hra + transport + special + bonus;

      const pf = st.salary?.pfDeduction || 300;
      const tax = st.salary?.taxDeduction || 400;
      const unpaidLeaveDeduction = 0;
      const totalDeductions = pf + tax + unpaidLeaveDeduction;
      const netSalary = grossEarnings - totalDeductions;

      return {
        staffId: st.id,
        staffName: `${st.firstName} ${st.lastName}`,
        role: st.role,
        department: st.department,
        baseSalary: base,
        hra,
        transportAllowance: transport,
        specialAllowance: special,
        bonus,
        grossEarnings,
        pfDeduction: pf,
        taxDeduction: tax,
        unpaidLeaveDeduction,
        totalDeductions,
        netSalary,
        paymentStatus: 'Pending',
        paymentMethod: 'Bank Transfer',
        transactionRef: `TXN-ACH-${Math.floor(1000000 + Math.random() * 9000000)}`,
        paidDate: null
      };
    });

    const newPayroll = {
      id: `PAY-${yearNum}-${monthName.substring(0, 3).toUpperCase()}`,
      month: monthName,
      year: yearNum,
      disbursementDate: `${yearNum}-${monthName === 'September' ? '09' : '10'}-30`,
      status: 'Draft',
      staffRecords
    };

    setPayrollRecords(prev => [newPayroll, ...prev]);
    showToast(`Generated payroll draft for ${monthName} ${yearNum} (${staff.length} staff members).`);

    try {
      const created = await api.payroll.generate(monthName, yearNum);
      setPayrollRecords(prev => prev.map(p => p.id === newPayroll.id ? created : p));
    } catch (err) {
      console.warn('Backend generate payroll error:', err.message);
    }

    return newPayroll;
  };

  const updateStaffPayrollRecord = async (payrollId, staffId, newStatus, method = 'Bank Transfer') => {
    setPayrollRecords(prev => prev.map(pr => {
      if (pr.id === payrollId) {
        const updatedStaffRecords = pr.staffRecords.map(sr => {
          if (sr.staffId === staffId) {
            return {
              ...sr,
              paymentStatus: newStatus,
              paymentMethod: method,
              paidDate: newStatus === 'Paid' ? (sr.paidDate || new Date().toISOString().split('T')[0]) : null
            };
          }
          return sr;
        });

        const allPaid = updatedStaffRecords.every(sr => sr.paymentStatus === 'Paid');
        const anyPaid = updatedStaffRecords.some(sr => sr.paymentStatus === 'Paid');

        return {
          ...pr,
          status: allPaid ? 'Paid' : anyPaid ? 'Processing' : 'Draft',
          staffRecords: updatedStaffRecords
        };
      }
      return pr;
    }));

    showToast(`Updated payout status to ${newStatus}.`);

    try {
      await api.payroll.updateStaffPayout(payrollId, staffId, { paymentStatus: newStatus, paymentMethod: method });
    } catch (err) {
      console.warn('Backend payout update error:', err.message);
    }
  };

  const disburseAllPayroll = async (payrollId) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setPayrollRecords(prev => prev.map(pr => {
      if (pr.id === payrollId) {
        return {
          ...pr,
          status: 'Paid',
          disbursementDate: todayStr,
          staffRecords: pr.staffRecords.map(sr => ({
            ...sr,
            paymentStatus: 'Paid',
            paidDate: todayStr
          }))
        };
      }
      return pr;
    }));
    showToast(`All salaries disbursed successfully for ${payrollId}!`);

    try {
      await api.payroll.disburseAll(payrollId);
    } catch (err) {
      console.warn('Backend disburse all error:', err.message);
    }
  };

  // --- Activities Actions ---
  const addActivity = async (actData) => {
    const newAct = {
      ...actData,
      id: `ACT-${String(activities.length + 1).padStart(2, '0')}`,
      enrolledStudents: actData.enrolledStudents || [],
      achievements: actData.achievements || [],
      badgeColor: actData.badgeColor || 'indigo'
    };
    setActivities(prev => [...prev, newAct]);
    showToast(`Activity "${newAct.name}" created successfully!`);

    try {
      const created = await api.activities.create(actData);
      setActivities(prev => prev.map(a => a.id === newAct.id ? created : a));
    } catch (err) {
      console.warn('Backend activity create error:', err.message);
    }

    return newAct;
  };

  const enrollStudentInActivity = async (activityId, studentId, role = 'Member') => {
    const stud = students.find(s => s.id === studentId);
    if (!stud) return;

    setActivities(prev => prev.map(act => {
      if (act.id === activityId) {
        const alreadyIn = act.enrolledStudents.some(item => item.studentId === studentId);
        if (alreadyIn) return act;
        return {
          ...act,
          enrolledStudents: [
            ...act.enrolledStudents,
            { studentId, studentName: `${stud.firstName} ${stud.lastName}`, role }
          ]
        };
      }
      return act;
    }));

    showToast(`${stud.firstName} enrolled in activity!`);

    try {
      await api.activities.enrollStudent(activityId, { studentId, studentName: `${stud.firstName} ${stud.lastName}`, role });
    } catch (err) {
      console.warn('Backend enroll student error:', err.message);
    }
  };

  const removeStudentFromActivity = async (activityId, studentId) => {
    setActivities(prev => prev.map(act => {
      if (act.id === activityId) {
        return {
          ...act,
          enrolledStudents: act.enrolledStudents.filter(item => item.studentId !== studentId)
        };
      }
      return act;
    }));
    showToast('Student removed from activity.');

    try {
      await api.activities.removeStudent(activityId, studentId);
    } catch (err) {
      console.warn('Backend remove member error:', err.message);
    }
  };

  const addAchievementToActivity = async (activityId, achievement) => {
    setActivities(prev => prev.map(act => {
      if (act.id === activityId) {
        return {
          ...act,
          achievements: [achievement, ...(act.achievements || [])]
        };
      }
      return act;
    }));
    showToast('New achievement and award recorded!');

    try {
      await api.activities.addAchievement(activityId, achievement);
    } catch (err) {
      console.warn('Backend achievement error:', err.message);
    }
  };

  // --- Classes Actions ---
  const addClass = async (classData) => {
    const newClass = {
      ...classData,
      id: `CLS-${classData.grade.replace(/\s+/g, '')}${classData.section}`
    };
    setClasses(prev => [...prev, newClass]);
    showToast(`Class ${newClass.grade} ${newClass.section} added successfully!`);

    try {
      await api.classes.create(classData);
    } catch (err) {
      console.warn('Backend class create error:', err.message);
    }
  };

  const updateClass = async (id, classData) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, ...classData } : c));
    showToast('Class updated successfully.');

    try {
      await api.classes.update(id, classData);
    } catch (err) {
      console.warn('Backend class update error:', err.message);
    }
  };

  // --- Global State Reset & Backup ---
  const resetToDefaultData = async () => {
    try {
      await api.database.reset();
      await refreshAllData();
      showToast('All operational records cleared. Master Admin user retained.', 'info');
    } catch (err) {
      setSchoolInfoState(INITIAL_SCHOOL_INFO);
      setStaff(INITIAL_STAFF);
      setStudents(INITIAL_STUDENTS);
      setLeaveRequests(INITIAL_LEAVE_REQUESTS);
      setPayrollRecords(INITIAL_PAYROLL_RECORDS);
      setActivities(INITIAL_ACTIVITIES);
      setClasses(INITIAL_CLASSES);
      setAttendance(INITIAL_ATTENDANCE);
      setNotifications(INITIAL_NOTIFICATIONS);
      showToast('All operational data cleared locally.', 'info');
    }
  };

  const exportBackupJSON = async () => {
    try {
      const res = await api.database.export();
      const blob = new Blob([JSON.stringify(res.data || res, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `oakridge_school_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Live database backup JSON exported successfully!');
    } catch {
      const backupData = {
        schoolInfo,
        staff,
        students,
        leaveRequests,
        payrollRecords,
        activities,
        classes,
        attendance,
        notifications,
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eduvibe_school_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('School data backup JSON exported.');
    }
  };

  const importBackupJSON = (jsonData) => {
    try {
      if (jsonData.schoolInfo) setSchoolInfoState(jsonData.schoolInfo);
      if (jsonData.staff) setStaff(jsonData.staff);
      if (jsonData.students) setStudents(jsonData.students);
      if (jsonData.leaveRequests) setLeaveRequests(jsonData.leaveRequests);
      if (jsonData.payrollRecords) setPayrollRecords(jsonData.payrollRecords);
      if (jsonData.activities) setActivities(jsonData.activities);
      if (jsonData.classes) setClasses(jsonData.classes);
      if (jsonData.attendance) setAttendance(jsonData.attendance);
      if (jsonData.notifications) setNotifications(jsonData.notifications);
      showToast('School data restored successfully from backup!');
    } catch (err) {
      showToast('Failed to import JSON data. Invalid format.', 'error');
    }
  };

  // Statistics Computations
  const totalStudentsCount = students.length;
  const totalStaffCount = staff.length;
  
  // Selected date's student attendance computation
  const todayStudentAttMap = attendance[selectedDate]?.students || {};
  const todayMarkedStudents = Object.values(todayStudentAttMap);
  const presentStudentsToday = todayMarkedStudents.filter(s => s.status === 'P' || s.status === 'L').length;
  const studentAttendanceRateToday = students.length > 0 
    ? (todayMarkedStudents.length > 0 ? Math.round((presentStudentsToday / students.length) * 100) : 0)
    : 100;

  // Selected date's staff attendance computation
  const todayStaffAttMap = attendance[selectedDate]?.staff || {};
  const todayMarkedStaff = Object.values(todayStaffAttMap);
  const presentStaffToday = todayMarkedStaff.filter(s => s.status === 'P' || s.status === 'L' || s.status === 'E').length;
  const staffAttendanceRateToday = staff.length > 0
    ? (todayMarkedStaff.length > 0 ? Math.round((presentStaffToday / staff.length) * 100) : 0)
    : 100;

  // Pending leaves count
  const pendingLeavesCount = leaveRequests.filter(l => l.status === 'Pending').length;

  // Monthly payroll total
  const latestPayroll = payrollRecords[0];
  const monthlyPayrollTotal = staff.reduce((sum, st) => {
    const base = st.salary?.baseSalary || 4500;
    const hra = st.salary?.hra || 1000;
    const trans = st.salary?.transportAllowance || 350;
    const spec = st.salary?.specialAllowance || 250;
    const pf = st.salary?.pfDeduction || 300;
    const tax = st.salary?.taxDeduction || 400;
    return sum + (base + hra + trans + spec - pf - tax);
  }, 0);

  const activeRolePermissions = ROLE_PERMISSIONS[currentRole] || ROLE_PERMISSIONS.admin;

  const value = {
    // Auth & User Session
    currentUser,
    authToken,
    isAuthenticated: !!currentUser,
    login,
    logout,
    forgotPassword,
    verifyOtp,
    resetPassword,
    currentRole,
    setCurrentRole,
    rolePermissions: activeRolePermissions,
    permissions: activeRolePermissions.permissions,

    // Backend Connectivity
    isBackendConnected,
    isLoadingData,
    refreshAllData,

    // State
    schoolInfo,
    setSchoolInfo,
    staff,
    students,
    leaveRequests,
    payrollRecords,
    activities,
    classes,
    attendance,
    notifications,
    activeTab,
    setActiveTab,
    selectedDate,
    setSelectedDate,
    searchQuery,
    setSearchQuery,
    globalSearchOpen,
    setGlobalSearchOpen,
    quickActionOpen,
    setQuickActionOpen,
    toastMessage,
    showToast,

    // Statistics
    totalStudentsCount,
    totalStaffCount,
    studentAttendanceRateToday,
    staffAttendanceRateToday,
    pendingLeavesCount,
    monthlyPayrollTotal,
    latestPayroll,

    // Methods
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentAttendanceRate,

    addStaff,
    updateStaff,
    deleteStaff,
    getStaffAttendanceRate,

    markStudentAttendance,
    markStaffAttendance,
    bulkMarkStudents,
    bulkMarkStaff,

    applyLeaveRequest,
    reviewLeaveRequest,

    generateMonthlyPayroll,
    updateStaffPayrollRecord,
    disburseAllPayroll,

    addActivity,
    enrollStudentInActivity,
    removeStudentFromActivity,
    addAchievementToActivity,

    addClass,
    updateClass,

    resetToDefaultData,
    exportBackupJSON,
    importBackupJSON,

    markNotificationRead: (id) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      api.notifications.markRead(id).catch(() => {});
    },
    clearNotifications: () => {
      setNotifications([]);
      api.notifications.clear().catch(() => {});
    }
  };

  return (
    <SchoolContext.Provider value={value}>
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
