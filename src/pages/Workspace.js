import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { dashboardService } from '../services/dashboard.service';
import { toast } from 'react-toastify';

const Workspace = () => {
    const { isDarkMode } = useContext(ThemeContext);
    const [isLoading, setIsLoading] = useState(true);
    const [activities, setActivities] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeRoles: 0,
        menuItems: 0,
        systemStatus: {
            database: 'Unknown',
            apiServer: 'Unknown',
            memoryUsage: '0%',
            uptime: '0 days'
        }
    });

    // Fetch dashboard data on component mount
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                
                // Fetch data in parallel
                const [statsData, activitiesData, systemStatusData] = await Promise.all([
                    dashboardService.getDashboardStats(),
                    dashboardService.getRecentActivities(),
                    dashboardService.getSystemStatus()
                ]);

                setStats({
                    totalUsers: statsData.totalUsers,
                    activeRoles: statsData.activeRoles,
                    menuItems: statsData.menuItems,
                    systemStatus: {
                        database: systemStatusData.database,
                        apiServer: systemStatusData.apiServer,
                        memoryUsage: systemStatusData.memoryUsage,
                        uptime: systemStatusData.uptime
                    }
                });

                setActivities(activitiesData);
            } catch (error) {
                toast.error('Failed to load dashboard data');
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();

        // Set up polling for real-time updates
        const interval = setInterval(fetchDashboardData, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    const handleViewAll = async () => {
        try {
            const moreActivities = await dashboardService.getRecentActivities({
                limit: 20, // Get more activities
                offset: activities.length
            });
            setActivities(prev => [...prev, ...moreActivities]);
        } catch (error) {
            toast.error('Failed to load more activities');
            console.error('Error loading more activities:', error);
        }
    };
    return (
        <div className={`p-6 min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-8">
                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Workspace</h1>
                {isLoading && (
                    <div className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">Recent Activities</h3>
                        <button 
                            onClick={handleViewAll}
                            className={`text-sm ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} transition-colors`}
                            disabled={isLoading}
                        >
                            View All
                        </button>
                    </div>
                    <div className="space-y-3">
                        {activities.map(activity => (
                            <div key={activity.id} className={`group flex items-start space-x-3 p-2 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{activity.text}</p>
                                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{activity.timestamp}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3 className="font-semibold text-lg mb-4">Quick Stats</h3>
                    <div className="space-y-4">
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Users</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalUsers.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Active Roles</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.activeRoles}</p>
                        </div>
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Menu Items</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.menuItems}</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="font-semibold text-lg mb-4">System Status</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Database</span>
                            <span className={`px-2 py-1 text-xs rounded ${
                                stats.systemStatus.database === 'Healthy' 
                                    ? isDarkMode 
                                        ? 'bg-green-900/30 text-green-300' 
                                        : 'bg-green-100 text-green-800'
                                    : isDarkMode 
                                        ? 'bg-red-900/30 text-red-300' 
                                        : 'bg-red-100 text-red-800'
                            }`}>
                                {stats.systemStatus.database}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>API Server</span>
                            <span className={`px-2 py-1 text-xs rounded ${
                                stats.systemStatus.apiServer === 'Running' 
                                    ? isDarkMode 
                                        ? 'bg-green-900/30 text-green-300' 
                                        : 'bg-green-100 text-green-800'
                                    : isDarkMode 
                                        ? 'bg-red-900/30 text-red-300' 
                                        : 'bg-red-100 text-red-800'
                            }`}>
                                {stats.systemStatus.apiServer}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Memory Usage</span>
                            <span className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                                {stats.systemStatus.memoryUsage}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Uptime</span>
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.systemStatus.uptime}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Workspace;