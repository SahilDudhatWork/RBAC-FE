import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { menuAPI } from '../api/menus';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

const Menus = () => {
    const { isDarkMode } = useContext(ThemeContext);
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMenu, setEditingMenu] = useState(null);
    const { hasPermission } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        path: '',
        icon: '',
        order: 0,
        isActive: true,
    });

    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        try {
            const data = await menuAPI.getMenus();
            setMenus(data);
        } catch (error) {
            toast.error('Failed to fetch menus');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMenu) {
                await menuAPI.updateMenu(editingMenu.id, formData);
                toast.success('Menu updated successfully');
            } else {
                await menuAPI.createMenu(formData);
                toast.success('Menu created successfully');
            }
            setShowModal(false);
            setEditingMenu(null);
            setFormData({ name: '', path: '', icon: '', order: 0, isActive: true });
            fetchMenus();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (menu) => {
        setEditingMenu(menu);
        setFormData({
            name: menu.name,
            path: menu.path,
            icon: menu.icon || '',
            order: menu.order,
            isActive: menu.isActive,
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this menu?')) return;

        try {
            await menuAPI.deleteMenu(id);
            toast.success('Menu deleted successfully');
            fetchMenus();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Delete failed');
        }
    };

    if (loading) {
        return (
            <div className={`flex justify-center items-center h-64 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDarkMode ? 'border-blue-400' : 'border-primary-600'}`}></div>
            </div>
        );
    }

    return (
        <div className={`p-6 min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Menu Management</h1>
                    <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Manage system navigation menus</p>
                </div>
                {hasPermission('Menu Management', 'create') && (
                    <button
                        onClick={() => {
                            setEditingMenu(null);
                            setFormData({ name: '', path: '', icon: '', order: 0, isActive: true });
                            setShowModal(true);
                        }}
                        className={`px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isDarkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {/* <FiPlus /> */}
                        <span>+ Add Menu</span>
                    </button>
                )}
            </div>

            <div className={`rounded-lg shadow overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>Name</span>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>Path</span>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>Icon</span>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>Order</span>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>Status</span>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>Created By</span>
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'} ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            {menus.length > 0 ? (
                                menus.map((menu) => (
                                    <tr key={menu.id} className={`hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {menu.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                                {menu.path}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                                                {menu.icon || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                                                {menu.order}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${menu.isActive
                                                ? isDarkMode
                                                    ? 'bg-green-900/30 text-green-300'
                                                    : 'bg-green-100 text-green-800'
                                                : isDarkMode
                                                    ? 'bg-red-900/30 text-red-300'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {menu.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                                {menu.createdBy?.name || 'System'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            {hasPermission('Menu Management', 'edit') && (
                                                <button
                                                    onClick={() => handleEdit(menu)}
                                                    className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'} transition-colors`}
                                                    title="Edit"
                                                >
                                                    <FiEdit2 className="w-5 h-5" />
                                                </button>
                                            )}
                                            {hasPermission('Menu Management', 'delete') && (
                                                <button
                                                    onClick={() => handleDelete(menu.id)}
                                                    className={`${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'} transition-colors`}
                                                    title="Delete"
                                                >
                                                    <FiTrash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-sm">
                                        <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} py-8`}>
                                            No menu items found. Start by adding a new menu.
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className={`rounded-lg max-w-md w-full shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="p-6">
                            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {editingMenu ? 'Edit Menu' : 'Create Menu'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Menu Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className={`block w-full rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} border p-2`}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Path
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.path}
                                        onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                                        className={`block w-full rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} border p-2`}
                                        placeholder="/path"
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Icon Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        className={`block w-full rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} border p-2`}
                                        placeholder="home, users, settings, etc."
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Order
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                        className={`block w-full rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} border p-2`}
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className={`rounded ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                                    />
                                    <label htmlFor="isActive" className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Active
                                    </label>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingMenu(null);
                                        }}
                                        className={`px-4 py-2 text-sm font-medium rounded-md ${isDarkMode ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className={`ml-3 px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isDarkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                                    >
                                        {editingMenu ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Menus;