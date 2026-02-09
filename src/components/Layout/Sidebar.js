import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { user, logout, getMenuItems } = useAuth();
    const navigate = useNavigate();
    
    const menuItems = getMenuItems();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-xl font-semibold text-gray-800 dark:text-white">RBAC System</span>
                </div>
                
                {/* Navigation */}
                <div className="flex-1 flex flex-col overflow-y-auto">
                    <nav className="flex-1 px-2 py-4 space-y-1">
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `group flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                                        isActive
                                            ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                                    }`
                                }
                            >
                                <span className="mr-3 text-lg">{item.icon}</span>
                                {item.name}
                            </NavLink>
                        ))}
                    </nav>
                </div>
                
                {/* User Profile */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white">
                                {user?.name || 'User'}
                            </span>
                            <p className="text-sm text-gray-500 truncate">
                                {user?.role?.name || 'Role'}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="ml-2 p-1 text-gray-400 hover:text-gray-500"
                            title="Logout"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
