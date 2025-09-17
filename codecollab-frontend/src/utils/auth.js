export const getToken = () =>
    localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  
  export const setToken = (token, remember = true) => {
    (remember ? localStorage : sessionStorage).setItem('authToken', token);
  };
  
  export const clearToken = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('username');
    // Clear any conflicting auth keys
    localStorage.removeItem('userId');
    localStorage.removeItem('useremail');
    localStorage.removeItem('role');
  };
  
  export const getUsername = () => {
    return localStorage.getItem('username') || 'User';
  };
  export const setUsername = (u) => {
    // Clear any potentially conflicting keys first
    const conflictingKeys = ['userId', 'useremail', 'role', 'user'];
    conflictingKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    });
    
    localStorage.setItem('username', u);
  };
  
  export const authFetch = async (url, options = {}) => {
    const token = getToken();
    const headers = {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      clearToken();
      window.location.href = '/auth';
      return Promise.reject(new Error('Unauthorized'));
    }
    return res;
  };