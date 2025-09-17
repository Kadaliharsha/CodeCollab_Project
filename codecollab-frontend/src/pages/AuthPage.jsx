import React, { useState } from 'react';
import { Code2, Github, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { setToken, setUsername, getToken } from '../utils/auth';

function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsernameState] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ username: '', password:''});
  const [rememberMe, setRememberMe] = useState(true);


  // Check if user is trying to join a room
  const pendingRoomJoin = localStorage.getItem('pendingRoomJoin');

  const validate = () => {
    const next = { username: '', password: ''};
    if (username.trim().length < 3) next.username = 'Username must be at least 3 characters';
    if (password.length < 6) next.password = 'Password must be at least 6 characters';
    setFieldErrors(next);
    return !next.username && !next.password;
  };

  React.useEffect(() => {
    const token = getToken();
    if (token) navigate('/');
  }, [navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with:', { username, password, isLogin });
    setError('');
    if (!validate()) return;

    // Basic client-side validation
    // if (username.trim().length < 3) {
    //   setError('Username must be at least 3 characters.');
    //   return;
    // }
    // if (password.length < 6) {
    //   setError('Password must be at least 6 characters.');
    //   return;
    // }
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      setIsLoading(true);
      console.log('Making request to:', `http://127.0.0.1:5001${endpoint}`);
      console.log('Request body:', JSON.stringify({ username, password }));
      
      const response = await fetch(`http://127.0.0.1:5001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const data = await response.json();
      console.log('Auth response data:', data);

      if (!response.ok) {
        setError(data.error || data.message || 'Authentication failed.');
        return;
      }

      if (isLogin) {
        console.log('Login success block reached!');
        console.log('Data received:', data);
        
        // If login is successful, save the token and username
        setToken(data.access_token, rememberMe);
        setUsername(data.username || username);
        
        // Check if there's a pending room join
        if (pendingRoomJoin) {
          localStorage.removeItem('pendingRoomJoin');
          console.log('Navigating to room:', pendingRoomJoin);
          navigate(`/room/${pendingRoomJoin}`);
        } else {
          // Go to homepage if no pending room join
          console.log('Navigating to home page');
          // Add a small delay to ensure localStorage is updated
          setTimeout(() => {
            navigate('/');
          }, 100);
        }
      } else {
        // If signup is successful, save the token and username
        setToken(data.access_token, rememberMe);
        setUsername(data.username || username);
        
        // Check if there's a pending room join
        if (pendingRoomJoin) {
          localStorage.removeItem('pendingRoomJoin');
          navigate(`/room/${pendingRoomJoin}`);
        } else {
          // Go to homepage if no pending room join
          // Add a small delay to ensure localStorage is updated
          setTimeout(() => {
            navigate('/');
          }, 100);
        }
      }

    } catch (error) {
      console.error('Authentication failed:', error);
      setError('Failed to connect to the server. Is it running?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-indigo-400">
            <Code2 size={28} />
            <span className="font-semibold tracking-wide">CodeCollab</span>
          </div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-white">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-center text-sm text-gray-400">Collaborative coding with real-time sync</p>
          
          {/* Show helpful message if user is trying to join a room */}
          {pendingRoomJoin && (
            <div className="mt-4 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-lg">
              <p className="text-indigo-300 text-sm text-center">
                🔗 You're trying to join a room. Please {isLogin ? 'sign in' : 'create an account'} to continue.
              </p>
            </div>
          )}
          
          <p className="mt-2 text-center text-sm text-gray-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {isLogin ? 'Sign up here' : 'Sign in here'}
            </button>
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-850 bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700/50">
          <div>
          <label htmlFor="username" className="text-sm font-medium text-gray-300">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsernameState(e.target.value);
              if (fieldErrors.username) setFieldErrors(prev => ({ ...prev, username: '' }));
            }}
            aria-invalid={!!fieldErrors.username}
            aria-describedby={fieldErrors.username ? 'username-error' : undefined}
            required
            className={`w-full px-3 py-2 mt-1 text-white bg-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              fieldErrors.username ? 'border-red-500' : 'border-gray-600'
            }`}
          />
          {fieldErrors.username && (
            <p id="username-error" className="mt-1 text-xs text-red-400">{fieldErrors.username}</p>
          )}
          </div>
          <div>
          <label htmlFor="password" className="text-sm font-medium text-gray-300">
            Password
          </label>
          <div className="relative">
          <input
            id="password"
            type={passwordVisible ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
            }}
            aria-invalid={!!fieldErrors.password}
            aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            required
            className={`w-full px-3 py-2 mt-1 pr-10 text-white bg-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              fieldErrors.password ? 'border-red-500' : 'border-gray-600'
            }`}
        />
          <button
            type="button"
            onClick={() => setPasswordVisible(v => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
            aria-label={passwordVisible ? 'Hide password' : 'Show password'}
          >
            {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {fieldErrors.password && (
          <p id="password-error" className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
        )}
        </div>

        <div className="flex items-center justify-between">
          <label className= "inline-flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
            />
            Remember Me
          </label>

          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            Forgot password?
          </button>
        </div>

          {/* Submit */}
          <button 
            type="submit" 
            disabled={isLoading || username.trim().length < 3 || password.length < 6}
            className="w-full py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Log In' : 'Register')}
          </button>

          {/* Top-level error */}
          {error && (
            <div className="text-red-400 text-sm text-center">
              {error}
            </div>
          )}
        </form>

        {/* Optional social section (placeholders) */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-700" />
          <span className="text-gray-400 text-xs">or continue with</span>
          <div className="h-px flex-1 bg-gray-700" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 py-2.5 bg-gray-800/60 border border-gray-700 rounded-md text-gray-200 hover:bg-gray-800 transition-colors">
            <Github size={18} /> GitHub
          </button>
          <button className="flex items-center justify-center gap-2 py-2.5 bg-gray-800/60 border border-gray-700 rounded-md text-gray-200 hover:bg-gray-800 transition-colors">
            <Mail size={18} /> Email link
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
