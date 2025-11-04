import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUsername, getToken } from "../utils/auth";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { buildApiUrl } from '../utils/apiConfig';

function HomePage() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    const token = getToken();
    if (token) {
      setIsAuthenticated(true);
      const username = getUsername() || "User";
      setUser({ username });
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const handleCreateRoom = async () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(buildApiUrl("api/rooms"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert("Session expired. Please log in again.");
          handleLogout();
        } else {
          const err = await response.json();
          alert(err.error || "Failed to create room.");
        }
        return;
      }

      const data = await response.json();
      if (data.room_id) navigate(`/room/${data.room_id}`);
    } catch (error) {
      console.error("Create room failed:", error);
      alert("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = () => {
    const roomId = prompt("Enter the room ID:");
    if (!roomId) return;
    if (!isAuthenticated) {
      localStorage.setItem("pendingRoomJoin", roomId);
      navigate("/auth");
    } else {
      navigate(`/room/${roomId}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    localStorage.removeItem("username");
    setIsAuthenticated(false);
    setUser(null);
    navigate("/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="fixed w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <h2 className="text-gray-800 text-2xl font-bold flex items-center">
              <span className="text-blue-600">&lt;</span>
              CodeCollab
              <span className="text-blue-600">/&gt;</span>
            </h2>

            {/* Desktop Links */}
            <nav className="hidden md:flex ml-10 space-x-8">
              <a
                href="#practice"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Practice
              </a>
              <a
                href="#problems"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Problems
              </a>
              <a
                href="#interview"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Interview Prep
              </a>
            </nav>

            {/* Auth + Hamburger */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-gray-700 hidden md:inline">
                    Welcome, {user?.username || "User"}!
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-500 px-3 py-2 text-sm font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/auth")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Login / Sign Up
                </button>
              )}

              {/* Hamburger (for links only) */}
              <button
                className="md:hidden text-gray-700 hover:text-blue-600"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Links */}
        {isOpen && (
          <div className="md:hidden bg-white shadow-lg border-t border-gray-200">
            <nav className="px-4 py-4 space-y-4">
              <a
                href="#practice"
                className="block text-gray-700 hover:text-blue-600"
              >
                Practice
              </a>
              <a
                href="#problems"
                className="block text-gray-700 hover:text-blue-600"
              >
                Problems
              </a>
              <a
                href="#interview"
                className="block text-gray-700 hover:text-blue-600"
              >
                Interview Prep
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section className="text-center py-20 md:py-28">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Master Your Code
            </span>
            <br />
            <span className="text-gray-800">Together in Real-Time</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Real-time collaboration, instant code execution, and powerful
            interview tools — built with Flask, React, and Docker.
          </p>

          <div className="flex justify-center space-x-6">
            {isAuthenticated ? (
              <>
                <button
                  onClick={handleCreateRoom}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-md disabled:bg-gray-400"
                >
                  {isLoading ? "Creating..." : "Create a New Room"}
                </button>
                <button
                  onClick={handleJoinRoom}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-md"
                >
                  Join Room
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-xl text-lg shadow-md"
              >
                Get Started
              </button>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: "⌨️",
              title: "Real-Time Collaboration",
              desc: "Pair program, interview, or learn together in real-time.",
            },
            {
              icon: "🚀",
              title: "Multi-Language Support",
              desc: "Execute code securely in multiple languages with Docker.",
            },
            {
              icon: "📊",
              title: "Interview Tools",
              desc: "Integrated problems, test cases, and performance tracking.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white shadow-md p-8 rounded-2xl border border-gray-200 hover:border-blue-300 transition-all"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* Stats Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">1,000+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">5,000+</div>
              <div className="text-gray-600">Coding Sessions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">10+</div>
              <div className="text-gray-600">Languages</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#">Features</a></li>
                <li><a href="#">Problems</a></li>
                <li><a href="#">Interview Prep</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#">Documentation</a></li>
                <li><a href="#">API</a></li>
                <li><a href="#">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#">About</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#">GitHub</a></li>
                <li><a href="#">Twitter</a></li>
                <li><a href="#">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500">
            <p>Built with Flask, React, and Docker. © 2025 CodeCollab.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;