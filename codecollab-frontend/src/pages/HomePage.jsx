import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsername, getToken } from '../utils/auth';

// Add animation keyframes for gradient
const styles = `
  @keyframes gradient-x {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .animate-gradient-x {
    background-size: 200% 200%;
    animation: gradient-x 15s ease infinite;
  }
`;

function HomePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Add style tag to head on mount
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    return () => styleElement.remove();
  }, []);

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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900">
      {/* Header */}
      <header className="fixed w-full z-50 bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h2 className="text-blue-900 text-2xl font-bold transition-transform duration-200 hover:scale-[1.03] hover:drop-shadow flex items-center">
                <span className="text-indigo-400">&lt;</span>
                CodeCollab
                <span className="text-indigo-400">/&gt;</span>
              </h2>
              {/* Navigation Links */}
              <nav className="hidden md:flex ml-10 space-x-8">
                <button className="text-blue-900 px-3 py-2 rounded-md text-sm font-medium">
                  Practice
                </button>
                <button className="text-blue-900 hover:text-indigo-400 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium">
                  Problems
                </button>
                <button className="text-blue-900 hover:text-indigo-400 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium">
                  Interview Prep
                </button>
              </nav>
            </div>

            {/* Authentication Buttons */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-green-400 hidden md:inline">Welcome, {user?.username || 'User'}!</span>
                  <button 
                    className="text-gray-300 hover:text-red-400 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 transform hover:scale-105"
                  onClick={() => navigate('/auth')}
                >
                  Login / Sign Up
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 animate-gradient-x">
                  Master Your Code
                </span>
                <br />
                <span className="text-white">Together in Real-Time</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto">
                Experience the future of collaborative coding with real-time pair programming,
                instant code execution, and powerful interview tools.
              </p>
          
          <div className="flex justify-center space-x-6">
            {isAuthenticated ? (
              <>
                <button 
                  onClick={handleCreateRoom}
                  disabled={isLoading}
                  className="relative overflow-hidden bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105 shadow-xl hover:shadow-indigo-500/50 disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Room...' : 'Create a New Room'}
                </button>
                <button 
                  onClick={handleJoinRoom}
                  className="relative overflow-hidden bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105 shadow-xl hover:shadow-green-500/50"
                >
                  Join Existing Room
                </button>
              </>
            ) : (
              <button 
                onClick={() => navigate('/auth')}
                className="relative overflow-hidden bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-12 rounded-xl text-lg transition-all transform hover:scale-105 shadow-xl hover:shadow-indigo-500/50"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
        {/* End Hero Section */}

        {/* Features Section - CodeSignal Inspired */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-indigo-500/30 transition-all duration-300">
            <div className="text-indigo-400 text-4xl mb-4">⌨️</div>
            <h3 className="text-xl font-bold text-white mb-3">Real-Time Collaboration</h3>
            <p className="text-gray-300">Code together in real-time with friends, developers, and tutors. Perfect for interviews, tutoring, and pair programming.</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-indigo-500/30 transition-all duration-300">
            <div className="text-indigo-400 text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-white mb-3">Multi-Language Support</h3>
            <p className="text-gray-300">Write and execute code in multiple programming languages. Instant feedback with our secure execution engine.</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 hover:border-indigo-500/30 transition-all duration-300">
            <div className="text-indigo-400 text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-3">Interview Tools</h3>
            <p className="text-gray-300">Comprehensive interview preparation with problem sets, test cases, and performance tracking.</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-b from-gray-800/50 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-indigo-400 mb-2">1,000+</div>
                <div className="text-gray-300">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-indigo-400 mb-2">5,000+</div>
                <div className="text-gray-300">Coding Sessions</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-indigo-400 mb-2">10+</div>
                <div className="text-gray-300">Languages</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-indigo-400 mb-2">99.9%</div>
                <div className="text-gray-300">Uptime</div>
              </div>
            </div>
          </div>
        </div>
        {/* End of main content */}
        </div>
        {/* Added closing tag for relative overflow-hidden div */}
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Problems</a></li>
                <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Interview Prep</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">API</a></li>
                <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">GitHub</a></li>
                <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Twitter</a></li>
                <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>Built with Flask, React, and Docker. © 2025 CodeCollab. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;