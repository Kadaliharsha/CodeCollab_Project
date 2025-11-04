import React from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const Navbar = ({ isAuthenticated, user, handleLogout, isOpen, setIsOpen }) => {
  const navigate = useNavigate();

  return (
    <header className="fixed w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <h2 className="text-gray-800 text-2xl font-bold flex items-center cursor-pointer"
              onClick={() => navigate("/")}>
            <span className="text-blue-600">&lt;</span>
            CodeCollab
            <span className="text-blue-600">/&gt;</span>
          </h2>

          {/* Desktop Links */}
          <nav className="hidden md:flex ml-10 space-x-8">
            <a href="#practice" className="text-gray-700 hover:text-blue-600 transition-colors">Practice</a>
            <a href="#problems" className="text-gray-700 hover:text-blue-600 transition-colors">Problems</a>
            <a href="#interview" className="text-gray-700 hover:text-blue-600 transition-colors">Interview Prep</a>
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

            {/* Hamburger */}
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
            <a href="#practice" className="block text-gray-700 hover:text-blue-600">Practice</a>
            <a href="#problems" className="block text-gray-700 hover:text-blue-600">Problems</a>
            <a href="#interview" className="block text-gray-700 hover:text-blue-600">Interview Prep</a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
