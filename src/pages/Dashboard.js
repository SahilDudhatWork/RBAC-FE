import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { userAPI } from '../api/users';
import { roleAPI } from '../api/roles';
import { menuAPI } from '../api/menus';
import { activitiesAPI } from '../api/activities';

// Activity Item Component
const ActivityItem = ({ icon, title, description, time, onClick }) => (
    <div
        className="flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
        onClick={onClick}
    >
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-lg mr-3 text-gray-800 dark:text-gray-200">
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-300">{description}</p>
        </div>
        <div className="ml-4 flex-shrink-0">
            <p className="text-xs text-gray-500 dark:text-gray-400">{time}</p>
        </div>
    </div>
);

// Stat Card Component
const StatCard = ({ title, value, icon, color = 'blue', loading = false, onClick }) => {
    const colors = {
        blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
        purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        yellow: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    };

    return (
        <div
            className={`bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-all hover:shadow-md ${onClick ? 'cursor-pointer transform hover:-translate-y-1' : ''}`}
            onClick={onClick}
        >
            <div className="p-5">
                <div className="flex items-center">
                    <div className={`p-3 rounded-full ${colors[color]} mr-4`}>
                        <span className="text-xl">{icon}</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">{title}</p>
                        {loading ? (
                            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
                        ) : (
                            <p className="text-2xl font-bold">{value}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const { user, hasPermission } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeRoles: 0,
        menuItems: 0,
        totalPermissions: 0
    });
    const [recentActivities, setRecentActivities] = useState([]);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch all data in parallel
            const [usersRes, rolesRes, menusRes, activitiesRes] = await Promise.all([
                userAPI.getUsers(),
                roleAPI.getRoles(),
                menuAPI.getMenus(),
                activitiesAPI.getRecentActivities()
                    .then(activities => 
                        activities.map(activity => ({
                            id: activity._id || activity.id,
                            icon: getActivityIcon(activity.type),
                            title: formatActivityTitle(activity),
                            description: activity.description || formatActivityDescription(activity),
                            timestamp: activity.createdAt || activity.timestamp,
                            type: activity.type,
                            data: activity.data || {}
                        }))
                    )
                    .catch(error => {
                        console.error('Error fetching activities:', error);
                        return [];
                    })
            ]);

            // Calculate stats
            const totalUsers = Array.isArray(usersRes) ? usersRes.length : 0;
            const activeRoles = Array.isArray(rolesRes) ? rolesRes.filter(role => role.isActive).length : 0;
            const menuItems = Array.isArray(menusRes) ? menusRes.length : 0;

            // Calculate total permissions across all roles
            let totalPermissions = 0;
            if (Array.isArray(rolesRes)) {
                rolesRes.forEach(role => {
                    if (role.permissions && Array.isArray(role.permissions)) {
                        totalPermissions += role.permissions.reduce((count, perm) => {
                            return count + (perm.read ? 1 : 0) + (perm.create ? 1 : 0) +
                                (perm.edit ? 1 : 0) + (perm.delete ? 1 : 0);
                        }, 0);
                    }
                });
            }

            setStats({
                totalUsers,
                activeRoles,
                menuItems,
                totalPermissions
            });

            setRecentActivities(activitiesRes);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleQuickAction = async (action) => {
        setIsActionLoading(true);
        try {
            const isSuperAdmin = user?.role?.roleName === 'superAdmin';
            switch (action) {
                case 'addUser':
                    if (isSuperAdmin || hasPermission('Users', 'create')) {
                        navigate('/users');
                    } else {
                        toast.error('You do not have permission to add users');
                    }
                    break;
                case 'createRole':
                    if (isSuperAdmin || hasPermission('Roles', 'create')) {
                        navigate('/roles');
                    } else {
                        toast.error('You do not have permission to create roles');
                    }
                    break;
                case 'managePermissions':
                    if (isSuperAdmin || hasPermission('Permissions', 'manage')) {
                        navigate('/permissions');
                    } else {
                        toast.error('You do not have permission to manage permissions');
                    }
                    break;
                default:
                    break;
            }
        } catch (err) {
            console.error('Error performing action:', err);
            toast.error('Failed to perform action');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleStatClick = (stat) => {
        switch (stat) {
            case 'users':
                if (hasPermission('Users', 'read')) navigate('/users');
                break;
            case 'roles':
                if (hasPermission('Roles', 'read')) navigate('/roles');
                break;
            case 'menus':
                if (hasPermission('Menus', 'read')) navigate('/menus');
                break;
            default:
                break;
        }
    };

    const handleActivityClick = (activity) => {
        // Handle activity item click based on activity type
        switch (activity.type) {
            case 'user_created':
                if (hasPermission('Users', 'read') && activity.data.userId) {
                    navigate(`/users/${activity.data.userId}`);
                }
                break;
            case 'role_updated':
                if (hasPermission('Roles', 'read') && activity.data.roleId) {
                    navigate(`/roles/${activity.data.roleId}`);
                }
                break;
            case 'permission_changed':
                navigate('/roles');
                break;
            default:
                console.log('Activity clicked:', activity);
        }
    };

    const getActivityIcon = (activityType) => {
        const icons = {
            'user_created': '👤',
            'user_updated': '✏️',
            'user_deleted': '🗑️',
            'role_created': '🆕',
            'role_updated': '🔧',
            'permission_changed': '🔐',
            'login': '🔑',
            'logout': '🚪',
            'system': '⚙️',
            'default': 'ℹ️'
        };
        return icons[activityType] || icons['default'];
    };

    const formatActivityTitle = (activity) => {
        const titles = {
            'user_created': 'New User Registered',
            'user_updated': 'User Updated',
            'user_deleted': 'User Deleted',
            'role_created': 'New Role Created',
            'role_updated': 'Role Updated',
            'permission_changed': 'Permissions Modified',
            'login': 'User Login',
            'logout': 'User Logout',
            'default': 'System Activity'
        };
        return titles[activity.type] || activity.title || titles['default'];
    };

    const formatActivityDescription = (activity) => {
        if (activity.description) return activity.description;
        
        const user = activity.data?.userName || 'A user';
        const role = activity.data?.roleName || 'a role';
        
        const descriptions = {
            'user_created': `${user} created a new account`,
            'user_updated': `${user}'s profile was updated`,
            'user_deleted': `${user} was removed from the system`,
            'role_created': `New role '${role}' was created`,
            'role_updated': `Role '${role}' was modified`,
            'permission_changed': `Permissions for role '${role}' were updated`,
            'login': `${user} logged in to the system`,
            'logout': `${user} logged out`,
            'default': 'A system activity occurred'
        };
        
        return descriptions[activity.type] || 'An activity occurred';
    };

    // Format time to relative time (e.g., "2 minutes ago")
    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        let interval = Math.floor(seconds / 31536000);
        if (interval >= 1) return `${interval} year${interval === 1 ? '' : 's'} ago`;

        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) return `${interval} month${interval === 1 ? '' : 's'} ago`;

        interval = Math.floor(seconds / 86400);
        if (interval >= 1) return `${interval} day${interval === 1 ? '' : 's'} ago`;

        interval = Math.floor(seconds / 3600);
        if (interval >= 1) return `${interval} hour${interval === 1 ? '' : 's'} ago`;

        interval = Math.floor(seconds / 60);
        if (interval >= 1) return `${interval} minute${interval === 1 ? '' : 's'} ago`;

        return 'Just now';
    };

    // Check if user has permission to view dashboard
    if (!hasPermission('Dashboard', 'read')) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center p-6 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                        <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">Access Denied</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">You don't have permission to view this page.</p>
                    <div className="mt-6">
                        <button
                            onClick={() => navigate('/')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
                <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
                <div className="text-center max-w-md">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                        <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">Something went wrong</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{error}</p>
                    <div className="mt-6">
                        <button
                            onClick={fetchDashboardData}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600"
                        >
                            <svg className={`-ml-1 mr-2 h-5 w-5 ${loading ? 'animate-spin' : ''} text-white`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            Try again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                            Welcome back, <span className="font-medium text-gray-800 dark:text-gray-100">{user?.name || 'User'}</span>! Here's what's happening with your RBAC system.
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <button
                            onClick={fetchDashboardData}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            disabled={loading}
                        >
                            <svg className={`-ml-1 mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers.toLocaleString()}
                    icon="👥"
                    color="blue"
                    loading={loading}
                    onClick={() => handleStatClick('users')}
                />
                <StatCard
                    title="Active Roles"
                    value={stats.activeRoles.toLocaleString()}
                    icon="🛡️"
                    color="green"
                    loading={loading}
                    onClick={() => handleStatClick('roles')}
                />
                <StatCard
                    title="Menu Items"
                    value={stats.menuItems.toLocaleString()}
                    icon="📋"
                    color="purple"
                    loading={loading}
                    onClick={() => handleStatClick('menus')}
                />
                <StatCard
                    title="Permissions"
                    value={stats.totalPermissions.toLocaleString()}
                    icon="🔑"
                    color="yellow"
                    loading={loading}
                />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Activity</h2>
                                <button
                                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none"
                                    onClick={() => navigate('/activities')}
                                >
                                    View All
                                </button>
                            </div>
                            {recentActivities.length > 0 ? (
                                <div className="space-y-4">
                                    {recentActivities.map((activity) => (
                                        <ActivityItem
                                            key={activity.id}
                                            icon={activity.icon}
                                            title={activity.title}
                                            description={activity.description}
                                            time={formatTimeAgo(activity.timestamp)}
                                            onClick={() => handleActivityClick(activity)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 dark:text-gray-400">No recent activities found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <button
                                    className="w-full flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-wait"
                                    onClick={() => handleQuickAction('addUser')}
                                    disabled={isActionLoading || !hasPermission('Users', 'create')}
                                >
                                    <span className="mr-2">➕</span>
                                    <span>Add New User</span>
                                </button>
                                <button
                                    className="w-full flex items-center p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-wait"
                                    onClick={() => handleQuickAction('createRole')}
                                    disabled={isActionLoading || !hasPermission('Roles', 'create')}
                                >
                                    <span className="mr-2">👥</span>
                                    <span>Create New Role</span>
                                </button>
                                <button
                                    className="w-full flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-wait"
                                    onClick={() => handleQuickAction('managePermissions')}
                                    disabled={isActionLoading || !hasPermission('Permissions', 'manage')}
                                >
                                    <span className="mr-2">🔐</span>
                                    <span>Manage Permissions</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">System Status</h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">API Status</span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                        <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                                            <circle cx="4" cy="4" r="3" />
                                        </svg>
                                        Operational
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Database</span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                        <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                                            <circle cx="4" cy="4" r="3" />
                                        </svg>
                                        Connected
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Updated</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {new Date().toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;