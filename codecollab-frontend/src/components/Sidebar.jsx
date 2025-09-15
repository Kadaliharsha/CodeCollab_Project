import React, { useState } from 'react';

const Sidebar = ({ 
  children, 
  title = "CodeCollab",
  className = ""
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <aside 
      className={`
        fixed lg:block inset-y-0 left-0 z-50
        bg-gray-950 border-r border-gray-800 
        transform transition-all duration-300 ease-in-out
        ${isHovered ? 'w-64' : 'w-16 lg:w-16'}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 min-h-[60px]">
          {isHovered ? (
            <>
              <h1 className="text-xl font-bold text-indigo-400">
                {title}
              </h1>
              <div className="w-6"></div> {/* Spacer for centering */}
            </>
          ) : (
            <div className="w-full flex justify-center">
              <h1 className="text-xl font-bold text-indigo-400">
                CC
              </h1>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isHovered ? children : (
            <div className="p-2">
              {/* Collapsed state icons */}
              <div className="space-y-4">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-gray-400">🏠</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-gray-400">👥</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-gray-400">⚙️</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;