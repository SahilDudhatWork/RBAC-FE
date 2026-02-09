import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <Sidebar />
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <Header />
                
                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
                    <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6">
                        {children || <Outlet />}
                    </div>
                </main>
                
                {/* Footer (optional) */}
                <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-6">
                    <div className="container mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
                        © {new Date().getFullYear()} RBAC Demo System. All rights reserved.
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Layout;
