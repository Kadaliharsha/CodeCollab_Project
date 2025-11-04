import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUsername, getToken } from "../utils/auth";
import { buildApiUrl } from '../utils/apiConfig';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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

  const stats = [
    { label: "Active Users", value: "1,000+" },
    { label: "Coding Sessions", value: "5,000+" },
    { label: "Languages", value: "10+" },
    { label: "Uptime", value: "99.9%" }
  ];


  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-sky-50 to-blue-100">
      {/* Header */}
      <Navbar
        isAuthenticated={isAuthenticated}
        user={user}
        handleLogout={handleLogout}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      {/* Main Content */}
      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section className="text-center py-20 md:py-28">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Code Together Learn Together
            </span>
            <br />
            <span className="text-gray-800">Together in Real-Time</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Collaborate on coding problems, practice interviews, and build
            skills with peers in a seamless, real-time environment.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-full border border-blue-200 hover:bg-blue-100 hover:scale-105 transition-all duration-300">
              Real-Time Collaboration
            </span>
            <span className="px-4 py-2 bg-green-50 text-green-700 font-medium rounded-full border border-green-200 hover:bg-green-100 hover:scale-105 transition-all duration-300">
              Multi-Language Support
            </span>
            <span className="px-4 py-2 bg-pink-50 text-pink-700 font-medium rounded-full border border-pink-200 hover:bg-pink-100 hover:scale-105 transition-all duration-300">
              Interview Tools
            </span>
          </div>

          <div className="pt-15 flex justify-center space-x-6">
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

          {/* Features Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-6 lg:px-8 py-16">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="group bg-gradient-to-br from-white/80 to-blue-50/60 backdrop-blur-lg rounded-2xl border border-blue-100 shadow-lg hover:shadow-blue-300/40  hover:scale-105 hover:-translate-y-1 transition-all duration-500 flex flex-col items-center justify-center text-center p-10 md:aspect-square"          
              >
                <h3 className="text-4xl font-extrabold text-blue-600 mb-2">
                  {stat.value}
                </h3>
                <p className="text-gray-700 text-base sm:text-lg lg:text-xl font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default HomePage;