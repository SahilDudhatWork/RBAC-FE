import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiUsers, FiShield, FiMenu, FiSettings, FiBriefcase, FiLogOut } from 'react-icons/fi';

const Sidebar = () => {
    const { user, logout, getMenuItems } = useAuth();
    const navigate = useNavigate();

    const menuItems = getMenuItems();

    const getIcon = (iconName) => {
        const icons = {
            'home': <FiHome className="w-5 h-5" />,
            'users': <FiUsers className="w-5 h-5" />,
            'shield': <FiShield className="w-5 h-5" />,
            'menu': <FiMenu className="w-5 h-5" />,
            'settings': <FiSettings className="w-5 h-5" />,
            'briefcase': <FiBriefcase className="w-5 h-5" />
        };
        return icons[iconName] || <FiHome className="w-5 h-5" />;
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="h-screen w-64 bg-white shadow-lg flex flex-col">
            <div className="p-6 border-b">
                <h1 className="text-2xl font-bold text-primary-600">RBAC System</h1>
                <p className="text-sm text-gray-600 mt-1">Role-Based Access Control</p>
            </div>

            <div className="p-4 border-b">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-primary-600">
                            {user?.name?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <p className="font-medium text-gray-800">{user?.name}</p>
                        <p className="text-sm text-gray-600 capitalize">{user?.role?.roleName}</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-2">
                    {menuItems.map((item) => (
                        <li key={item.name}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-primary-50 text-primary-600 font-medium'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`
                                }
                            >
                                {getIcon(item.icon)}
                                <span>{item.name}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-4 border-t">
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                    <FiLogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;