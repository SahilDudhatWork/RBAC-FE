import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));

                try {
                    const userData = await authAPI.getMe();
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));

                    const perms = await authAPI.getPermissions();
                    setPermissions(perms);
                } catch (error) {
                    console.error('Failed to fetch user data:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const data = await authAPI.login(email, password);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));

            setToken(data.token);
            setUser(data);

            const perms = await authAPI.getPermissions();
            setPermissions(perms);

            toast.success('Login successful!');
            return data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setPermissions({});
        toast.success('Logged out successfully');
    };

    const hasPermission = (menu, action = 'read') => {
        // If no menu is provided, deny access
        if (!menu) return false;
        
        // If permissions are not loaded yet, deny access
        if (Object.keys(permissions).length === 0) return false;
        
        // Find the menu in permissions
        const menuPermission = permissions[menu];
        
        // If menu doesn't exist or action is not defined, deny access
        if (!menuPermission || typeof menuPermission[action] === 'undefined') {
            console.warn(`Permission check failed: ${action} on ${menu}`);
            return false;
        }
        
        return menuPermission[action] === true;
    };

    const getMenuItems = () => {
        if (!permissions || Object.keys(permissions).length === 0) {
            return [];
        }

        return Object.entries(permissions)
            .filter(([_, perm]) => perm && typeof perm === 'object' && perm.read === true)
            .map(([name, perm]) => {
                // Map API menu names to frontend menu names
                const menuMap = {
                    'Dashboard': { name: 'Dashboard', icon: '📊' },
                    'Users': { name: 'Users', icon: '👥' },
                    'Roles': { name: 'Roles', icon: '🛡️' },
                    'Menu Management': { name: 'Menus', icon: '📋' },
                    'Products': { name: 'Products', icon: '📦' },
                    'Settings': { name: 'Settings', icon: '⚙️' },
                    'Workspace': { name: 'Workspace', icon: '💼' }
                };

                const menuItem = menuMap[name] || { name, icon: '📄' };
                
                return {
                    name: menuItem.name,
                    path: perm.path || `/${name.toLowerCase().replace(/\s+/g, '')}`,
                    icon: menuItem.icon,
                    permissions: {
                        read: perm.read || false,
                        create: perm.create || false,
                        edit: perm.edit || false,
                        delete: perm.delete || false
                    }
                };
            })
            .sort((a, b) => {
                const order = ['Dashboard', 'Users', 'Roles', 'Menus', 'Products', 'Settings', 'Workspace'];
                const indexA = order.indexOf(a.name);
                const indexB = order.indexOf(b.name);
                
                // If both items are in the order array, sort them according to the order
                if (indexA !== -1 && indexB !== -1) {
                    return indexA - indexB;
                }
                
                // If only one item is in the order array, put it first
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;
                
                // If neither is in the order array, sort alphabetically
                return a.name.localeCompare(b.name);
            });
    };

    const value = {
        user,
        token,
        permissions,
        loading,
        login,
        logout,
        hasPermission,
        getMenuItems,
        setUser,
        setPermissions
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

