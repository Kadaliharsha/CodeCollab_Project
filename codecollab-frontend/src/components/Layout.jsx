import React from 'react';
import Sidebar from './Sidebar';
import { clearToken, getUsername } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const Layout = ({ 
  children, 
  sidebarContent, 
  sidebarTitle = "CodeCollab",
  sidebarClassName = ""
}) => {
  const navigate = useNavigate();
  const username = getUsername();

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white">
      {/* Sidebar */}
      <Sidebar
        title={sidebarTitle}
        className={sidebarClassName}
      >
        {sidebarContent}
      </Sidebar>

      {/* Main Content */}
      <div className="ml-16 flex flex-col h-full">
        {/* Top Bar */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">CodeCollab</h2>
          <div className="flex items-center gap-3">
            {username && <span className="text-sm text-gray-400">{username}</span>}
            <button
              onClick={() => { clearToken(); navigate('/auth'); }}
              className="px-3 py-1.5 text-sm bg-gray-700 border border-gray-600 rounded hover:bg-gray-650"
            >
              Logout
            </button>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;