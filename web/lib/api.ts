const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const getUser = () => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setAuth = (token: string, user: any) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const apiCall = async (
  endpoint: string,
  options: RequestInit & { skipAuth?: boolean } = {}
) => {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token && !options.skipAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    if (response.status === 401) {
      logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }

    if (isJson && data?.message) {
      throw new Error(data.message);
    }

    throw new Error(`Request failed (${response.status}). Please verify NEXT_PUBLIC_API_URL points to the backend.`);
  }

  if (!isJson) {
    throw new Error('Unexpected non-JSON response from API. Check NEXT_PUBLIC_API_URL and backend availability.');
  }

  return data;
};

// Authentication endpoints
export const authApi = {
  login: (email: string, password: string) =>
    apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    }),
  register: (data: any) =>
    apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    }),
  getCurrentUser: () => apiCall('/api/auth/me'),
  logout: () => apiCall('/api/auth/logout', { method: 'POST' }),
};

// User endpoints
export const userApi = {
  getAll: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiCall(`/api/users${query}`);
  },
  getById: (id: string) => apiCall(`/api/users/${id}`),
  create: (data: any) =>
    apiCall('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall(`/api/users/${id}`, {
      method: 'DELETE',
    }),
  search: (query: string) => apiCall(`/api/users/search?query=${query}`),
  getTeam: () => apiCall('/api/users/team/members'),
};

// Attendance endpoints
export const attendanceApi = {
  checkIn: () =>
    apiCall('/api/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  checkOut: () =>
    apiCall('/api/attendance/check-out', {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  getToday: () => apiCall('/api/attendance/today'),
  getRecords: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiCall(`/api/attendance/my-records${query}`);
  },
  getStats: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiCall(`/api/attendance/stats${query}`);
  },
  getTeamAttendance: (date?: string) =>
    apiCall(`/api/attendance/team/attendance?${date ? `date=${date}` : ''}`),
};

// Leave endpoints
export const leaveApi = {
  apply: (data: any) =>
    apiCall('/api/leave/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMyLeaves: () => apiCall('/api/leave/my-leaves'),
  getBalance: () => apiCall('/api/leave/balance'),
  getPending: () => apiCall('/api/leave/pending'),
  approve: (id: string) =>
    apiCall(`/api/leave/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({}),
    }),
  reject: (id: string, reason: string) =>
    apiCall(`/api/leave/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ rejectionReason: reason }),
    }),
};

// Payroll endpoints
export const payrollApi = {
  getMyPayroll: () => apiCall('/api/payroll/my-payroll'),
  getById: (id: string) => apiCall(`/api/payroll/${id}`),
  getSalaryDetails: () => apiCall('/api/payroll/salary/details'),
  generate: (data: any) =>
    apiCall('/api/payroll/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAll: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiCall(`/api/payroll${query}`);
  },
  markAsPaid: (id: string) =>
    apiCall(`/api/payroll/${id}/mark-paid`, {
      method: 'PUT',
      body: JSON.stringify({}),
    }),
};

// Performance endpoints
export const performanceApi = {
  getMyReviews: () => apiCall('/api/performance/my-reviews'),
  addReview: (data: any) =>
    apiCall('/api/performance/add-review', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getTeamReviews: () => apiCall('/api/performance/team/reviews'),
  getUserHistory: (userId: string) => apiCall(`/api/performance/user/${userId}`),
  getAll: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiCall(`/api/performance${query}`);
  },
  update: (id: string, data: any) =>
    apiCall(`/api/performance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall(`/api/performance/${id}`, {
      method: 'DELETE',
    }),
};
