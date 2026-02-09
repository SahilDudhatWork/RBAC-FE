import { userAPI } from '../api/users';
import { roleAPI } from '../api/roles';
import { menuAPI } from '../api/menus';
import axiosInstance from '../api/axios';

const getDashboardStats = async () => {
  try {
    // Fetch data in parallel
    const [users, roles, menus] = await Promise.all([
      userAPI.getUsers(),
      roleAPI.getRoles(),
      menuAPI.getMenus()
    ]);

    return {
      totalUsers: users.length,
      activeUsers: users.filter(user => user.isActive).length,
      activeRoles: roles.length,
      menuItems: menus.length
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return default values if there's an error
    return {
      totalUsers: 0,
      activeUsers: 0,
      activeRoles: 0,
      menuItems: 0
    };
  }
};

const getRecentActivities = async (params = {}) => {
  try {
    // In a real app, this would come from an activities/audit log endpoint
    // For now, we'll simulate some recent activities based on the last created items
    const [recentUsers, recentRoles, recentMenus] = await Promise.all([
      userAPI.getUsers(),
      roleAPI.getRoles(),
      menuAPI.getMenus()
    ]);

    // Map recent items to activities
    const userActivities = recentUsers
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 2)
      .map((user, index) => ({
        id: `user-${user.id}`,
        text: `New user registered: ${user.name || user.email}`,
        timestamp: formatTimeAgo(user.createdAt),
        type: 'user'
      }));

    const roleActivities = recentRoles
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 2)
      .map((role, index) => ({
        id: `role-${role.id}`,
        text: `New role created: ${role.roleName}`,
        timestamp: formatTimeAgo(role.createdAt),
        type: 'role'
      }));

    const menuActivities = recentMenus
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 1)
      .map((menu, index) => ({
        id: `menu-${menu.id}`,
        text: `New menu item added: ${menu.name}`,
        timestamp: formatTimeAgo(menu.createdAt),
        type: 'menu'
      }));

    // Combine and sort all activities by timestamp
    const activities = [...userActivities, ...roleActivities, ...menuActivities]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, params.limit || 5);

    return activities;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
};

// Helper function to format timestamps
const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Some time ago';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const getSystemStatus = async () => {
  try {
    // Check API health
    const healthRes = await axiosInstance.get('/health');
    
    // Get server metrics (simulated)
    const memoryUsage = Math.floor(Math.random() * 30) + 50; // 50-80%
    const uptimeDays = Math.floor(Math.random() * 30) + 1; // 1-30 days
    
    return {
      database: healthRes.data.db === 'connected' ? 'Healthy' : 'Unhealthy',
      apiServer: 'Running',
      memoryUsage: `${memoryUsage}%`,
      uptime: `${uptimeDays} day${uptimeDays !== 1 ? 's' : ''}`
    };
  } catch (error) {
    console.error('Error fetching system status:', error);
    return {
      database: 'Unknown',
      apiServer: 'Unknown',
      memoryUsage: '0%',
      uptime: '0 days'
    };
  }
};

export const dashboardService = {
  getDashboardStats,
  getRecentActivities,
  getSystemStatus
};
