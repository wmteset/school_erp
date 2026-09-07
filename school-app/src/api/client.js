// Central API Client for Oakridge School ERP
// Automatically attaches auth token and role header

const API_BASE = '/api';

export const getAuthToken = () => {
  try {
    return localStorage.getItem('eduvibe_auth_token') || '';
  } catch {
    return '';
  }
};

export const getStoredRole = () => {
  try {
    return localStorage.getItem('eduvibe_role_v1') || 'admin';
  } catch {
    return 'admin';
  }
};

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const role = getStoredRole();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(role ? { 'x-user-role': role } : {}),
    ...(options.headers || {}),
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMsg = '';

      if (typeof errorData === 'string') {
        errorMsg = errorData;
      } else if (typeof errorData?.message === 'string') {
        errorMsg = errorData.message;
      } else if (Array.isArray(errorData?.message)) {
        errorMsg = errorData.message.join(', ');
      } else if (errorData?.error && typeof errorData.error === 'object') {
        if (typeof errorData.error.message === 'string') {
          errorMsg = errorData.error.message;
        } else if (Array.isArray(errorData.error.message)) {
          errorMsg = errorData.error.message.join(', ');
        } else if (typeof errorData.error.error === 'string') {
          errorMsg = errorData.error.error;
        }
      } else if (typeof errorData?.error === 'string') {
        errorMsg = errorData.error;
      }

      if (!errorMsg || errorMsg === '[object Object]') {
        errorMsg = `HTTP ${response.status}: ${response.statusText || 'Request failed'}`;
      }

      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = errorData;
      throw err;
    }

    return await response.json();
  } catch (err) {
    const message = err.message || 'Network request failed';
    console.error(`API Error [${options.method || 'GET'} ${endpoint}]:`, message);
    throw err;
  }
}

export const forgotPasswordApi = (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
export const verifyOtpApi = (payload) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify(payload) });
export const resetPasswordApi = (payload) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) });

export const api = {
  // --- Auth ---
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    getMe: () => request('/auth/me'),
    getUsers: () => request('/auth/users'),
    getRoles: () => request('/auth/roles'),
    switchRole: (role) => request('/auth/switch-role', { method: 'POST', body: JSON.stringify({ role }) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    forgotPassword: forgotPasswordApi,
    verifyOtp: verifyOtpApi,
    resetPassword: resetPasswordApi,
  },

  // --- School Info ---
  schoolInfo: {
    get: () => request('/school-info'),
    update: (data) => request('/school-info', { method: 'PATCH', body: JSON.stringify(data) }),
  },

  // --- Students ---
  students: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/students${query ? `?${query}` : ''}`);
    },
    getNextRollNumber: () => request('/students/next-roll-number'),
    getById: (id) => request(`/students/${id}`),
    create: (data) => request('/students', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/students/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/students/${id}`, { method: 'DELETE' }),
  },

  // --- Staff ---
  staff: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/staff${query ? `?${query}` : ''}`);
    },
    getById: (id) => request(`/staff/${id}`),
    create: (data) => request('/staff', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/staff/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/staff/${id}`, { method: 'DELETE' }),
  },

  // --- Attendance ---
  attendance: {
    getDaily: (date) => request(`/attendance/daily?date=${date}`),
    getMonthlyMatrix: (year, month, targetType) =>
      request(`/attendance/monthly-matrix?year=${year}&month=${month}&targetType=${targetType}`),
    mark: (payload) => request('/attendance/mark', { method: 'POST', body: JSON.stringify(payload) }),
    bulkMark: (payload) => request('/attendance/bulk-mark', { method: 'POST', body: JSON.stringify(payload) }),
  },

  // --- Leaves ---
  leaves: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/leaves${query ? `?${query}` : ''}`);
    },
    getById: (id) => request(`/leaves/${id}`),
    apply: (data) => request('/leaves/apply', { method: 'POST', body: JSON.stringify(data) }),
    review: (id, data) => request(`/leaves/${id}/review`, { method: 'PATCH', body: JSON.stringify(data) }),
  },

  // --- Payroll ---
  payroll: {
    getAll: () => request('/payroll'),
    getCycle: (month, year) => request(`/payroll/cycle?month=${month}&year=${year}`),
    getById: (id) => request(`/payroll/${id}`),
    generate: (month, year) => request('/payroll/generate', { method: 'POST', body: JSON.stringify({ month, year }) }),
    updateStaffPayout: (payrollId, staffId, payload) =>
      request(`/payroll/${payrollId}/staff/${staffId}/payout`, { method: 'PATCH', body: JSON.stringify(payload) }),
    disburseAll: (id) => request(`/payroll/${id}/disburse-all`, { method: 'POST' }),
  },

  // --- Activities ---
  activities: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/activities${query ? `?${query}` : ''}`);
    },
    getById: (id) => request(`/activities/${id}`),
    create: (data) => request('/activities', { method: 'POST', body: JSON.stringify(data) }),
    enrollStudent: (id, payload) => request(`/activities/${id}/enroll`, { method: 'POST', body: JSON.stringify(payload) }),
    removeStudent: (id, studentId) => request(`/activities/${id}/members/${studentId}`, { method: 'DELETE' }),
    addAchievement: (id, achievement) => request(`/activities/${id}/achievements`, { method: 'POST', body: JSON.stringify(achievement) }),
  },

  // --- Classes ---
  classes: {
    getAll: () => request('/classes'),
    getById: (id) => request(`/classes/${id}`),
    create: (data) => request('/classes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/classes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },

  // --- Notifications ---
  notifications: {
    getAll: () => request('/notifications'),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => request('/notifications/read-all', { method: 'PATCH' }),
    clear: () => request('/notifications/clear', { method: 'DELETE' }),
  },

  // --- Database ---
  database: {
    export: () => request('/database/export'),
    reset: () => request('/database/reset', { method: 'POST' }),
  },
};
