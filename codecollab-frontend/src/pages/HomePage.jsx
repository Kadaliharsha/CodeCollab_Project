import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsername, getToken } from '../utils/auth';

function HomePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Check authentication status on component mount
  useEffect(() => {
    const authToken = getToken();
    if (authToken) {
      // For now, just check if token exists
      // We can add token validation later when the backend endpoint is ready
      setIsAuthenticated(true);
      const username = getUsername() || 'User';
      setUser({ username }); // Use actual username from localStorage
      
      // TODO: Uncomment this when the backend endpoint is ready
      // validateToken(authToken);
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  // Function to validate token with backend (for future use)
  const validateToken = async (token) => {
    try {
      const response = await fetch('http://127.0.0.1:5001/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.log('Token validation failed:', error);
      // Keep user logged in for now, we'll validate on actual API calls
    }
  };

  const handleCreateRoom = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5001/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401 || response.status === 422) {
          alert('Your session has expired. Please log in again.');
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          setIsAuthenticated(false);
          setUser(null);
          navigate('/auth');
        } else {
          alert(`Error creating room: ${errorData.error || 'An unknown error occurred.'}`);
        }
        return;
      }

      const data = await response.json();
      const newRoomId = data.room_id;

      if (newRoomId) {
        navigate(`/room/${newRoomId}`);
      }

    } catch (error) {
      console.error("Failed to create room:", error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert("Failed to connect to the server. Is it running?");
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = () => {
    const roomId = prompt("Enter the room ID to join:");
    if (roomId && roomId.trim()) {
      if (!isAuthenticated) {
        // Store the room ID to redirect after login
        localStorage.setItem('pendingRoomJoin', roomId.trim());
        navigate('/auth');
      } else {
        navigate(`/room/${roomId.trim()}`);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('username'); // Also clear username
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-gray-800/80 backdrop-blur-md shadow-md">
        <h2 className="text-white text-2xl font-bold transition-transform duration-200 hover:scale-[1.03] hover:drop-shadow">
          CodeCollab
        </h2>
        <nav className="space-x-4">
          <button 
            className="text-gray-300 hover:text-indigo-400 transition-colors duration-200 hover:underline underline-offset-4 decoration-2 decoration-indigo-400/60"
            onClick={() => navigate('/')}
          >
            Home
          </button>
          {isAuthenticated ? (
            <>
              <span className="text-green-400">Welcome, {user?.username || 'User'}!</span>
              <button 
                className="text-gray-300 hover:text-red-400 transition-colors duration-200 hover:underline underline-offset-4 decoration-2 decoration-red-400/60"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <button 
              className="text-gray-300 hover:text-indigo-400 transition-colors duration-200 hover:underline underline-offset-4 decoration-2 decoration-indigo-400/60"
              onClick={() => navigate('/auth')}
            >
              Login / Sign Up
            </button>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-grow p-4">
        <div className="text-center max-w-2xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 md:p-10 shadow-lg transition-all duration-300 hover:shadow-2xl hover:border-indigo-400/30">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-300 transform hover:scale-[1.02] drop-shadow hover:drop-shadow-xl">
            CodeCollab
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 transition-colors duration-200">
            The real-time, multi-language collaborative coding environment built for developers.
          </p>
          
          {isAuthenticated ? (
            <div className="space-y-4">
              <button 
                onClick={handleCreateRoom}
                disabled={isLoading}
                className="relative overflow-hidden bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-indigo-500/50 disabled:bg-gray-500 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400 before:absolute before:inset-0 before:bg-white/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity"
              >
                {isLoading ? 'Creating Room...' : 'Create a New Room'}
              </button>
              <div className="text-gray-400">or</div>
              <button 
                onClick={handleJoinRoom}
                className="relative overflow-hidden bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-green-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-400 before:absolute before:inset-0 before:bg-white/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity"
              >
                Join Existing Room
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-400 mb-4">Please log in or create an account to start collaborating</p>
              <button 
                onClick={() => navigate('/auth')}
                className="relative overflow-hidden bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-indigo-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400 before:absolute before:inset-0 before:bg-white/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity"
              >
                Login / Sign Up
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-gray-500 text-sm transition-colors duration-200 hover:text-gray-300">
        Built with Flask, React, and Docker.
      </footer>
    </div>
  );
}

export default HomePage;