export const getToken = () =>
    localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  
  export const setToken = (token, remember = true) => {
    (remember ? localStorage : sessionStorage).setItem('authToken', token);
  };
  
  export const clearToken = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
  };
  
  export const getUsername = () => localStorage.getItem('username') || '';
  export const setUsername = (u) => localStorage.setItem('username', u);
  
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