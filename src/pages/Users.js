import { useState, useEffect, useContext } from 'react';
import { userAPI } from '../api/users';
import { roleAPI } from '../api/roles';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiEye, FiEyeOff, FiPlus, FiUsers, FiUserCheck, FiUserX, FiShield } from 'react-icons/fi';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const { hasPermission, user: currentUser } = useAuth();
    const { isDarkMode } = useContext(ThemeContext);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roleName: 'user',
    });
    const [showPassword, setShowPassword] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersData, rolesData] = await Promise.all([
                userAPI.getUsers(),
                roleAPI.getRoles()
            ]);
            setUsers(usersData);
            setRoles(rolesData);
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await userAPI.updateUser(editingUser.id, formData);
                toast.success('User updated successfully');
            } else {
                await userAPI.createUser(formData);
                toast.success('User created successfully');
            }
            setShowModal(false);
            setEditingUser(null);
            setFormData({ name: '', email: '', password: '', roleName: 'user' });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            roleName: user.Role?.roleName || user.role?.roleName || 'user',
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await userAPI.deleteUser(id);
            toast.success('User deleted successfully');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Delete failed');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Users</h1>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-2`}>Manage system users and their roles</p>
                </div>
                {hasPermission('Users', 'create') && (
                    <button
                        onClick={() => {
                            setEditingUser(null);
                            setFormData({ name: '', email: '', password: '', roleName: 'user' });
                            setShowModal(true);
                        }}
                        className="btn-primary flex items-center space-x-2"
                    >
                        <FiPlus />
                        <span>Add User</span>
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className={`bg-gradient-to-br ${isDarkMode ? 'from-blue-900/30 to-blue-800/30 border-blue-700' : 'from-blue-50 to-blue-100 border-blue-200'} border rounded-xl p-5 transition-all hover:shadow-lg`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>Total Users</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-blue-900'} mt-1`}>{users.length}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/40' : 'bg-blue-100'}`}>
                            <FiUsers className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        </div>
                    </div>
                </div>
                <div className={`bg-gradient-to-br ${isDarkMode ? 'from-emerald-900/30 to-emerald-800/30 border-emerald-700' : 'from-emerald-50 to-emerald-100 border-emerald-200'} border rounded-xl p-5 transition-all hover:shadow-lg`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>Active Users</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-emerald-900'} mt-1`}>
                                {users.filter(u => u.isActive).length}
                            </p>
                        </div>
                        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-emerald-900/40' : 'bg-emerald-100'}`}>
                            <FiUserCheck className={`w-6 h-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        </div>
                    </div>
                </div>
                <div className={`bg-gradient-to-br ${isDarkMode ? 'from-amber-900/30 to-amber-800/30 border-amber-700' : 'from-amber-50 to-amber-100 border-amber-200'} border rounded-xl p-5 transition-all hover:shadow-lg`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>Inactive Users</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-amber-900'} mt-1`}>
                                {users.filter(u => !u.isActive).length}
                            </p>
                        </div>
                        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-amber-900/40' : 'bg-amber-100'}`}>
                            <FiUserX className={`w-6 h-6 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                        </div>
                    </div>
                </div>
                <div className={`bg-gradient-to-br ${isDarkMode ? 'from-violet-900/30 to-violet-800/30 border-violet-700' : 'from-violet-50 to-violet-100 border-violet-200'} border rounded-xl p-5 transition-all hover:shadow-lg`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-violet-300' : 'text-violet-800'}`}>Admin Users</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-violet-900'} mt-1`}>
                                {users.filter(u => (u.Role?.roleName || u.role?.roleName) === 'admin' || (u.Role?.roleName || u.role?.roleName) === 'superAdmin').length}
                            </p>
                        </div>
                        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-violet-900/40' : 'bg-violet-100'}`}>
                            <FiShield className={`w-6 h-6 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
                        </div>
                    </div>
                </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
                <div className="overflow-x-auto">
                    <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>

                        {/* HEADER */}
                        <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                            <tr>
                                {["Name", "Email", "Role", "Status", "Created By", "Actions"].map((head) => (
                                    <th
                                        key={head}
                                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                    >
                                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>
                                            {head}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        {/* BODY */}
                        <tbody
                            className={`divide-y ${isDarkMode ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}
                        >
                            {users.map((user) => {
                                const userRoleName = user.Role?.roleName || user.role?.roleName;

                                return (
                                    <tr
                                        key={user.id || user._id}
                                        className={`transition-colors hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                                    >
                                        {/* NAME */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center 
                    ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-primary-100 text-primary-600'}`}>
                                                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                                </div>

                                                <div className="ml-4">
                                                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {user.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* EMAIL */}
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                            {user.email}
                                        </td>

                                        {/* ROLE */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                                                {userRoleName}
                                            </span>
                                        </td>

                                        {/* STATUS */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${user.isActive
                                                    ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800')
                                                    : (isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800')
                                                }`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>

                                        {/* CREATED BY */}
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                            {user.createdBy?.name || 'System'}
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                disabled={userRoleName === 'superAdmin'}
                                                className={`${userRoleName === 'superAdmin' 
                                                    ? (isDarkMode ? 'text-blue-400' : 'text-blue-400') 
                                                    : (isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900')
                                                } ${userRoleName === 'superAdmin' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                title={userRoleName === 'superAdmin' ? 'Super Admin cannot be edited' : 'Edit user'}
                                            >
                                                <FiEdit2 className="w-5 h-5" />
                                            </button>

                                            <button
                                                onClick={() => handleDelete(user.id || user._id)}
                                                disabled={userRoleName === 'superAdmin'}
                                                className={`${userRoleName === 'superAdmin' 
                                                    ? (isDarkMode ? 'text-red-300' : 'text-red-300') 
                                                    : (isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900')
                                                } ${userRoleName === 'superAdmin' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                title={userRoleName === 'superAdmin' ? 'Super Admin cannot be deleted' : 'Delete user'}
                                            >
                                                <FiTrash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>


            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">
                            {editingUser ? 'Edit User' : 'Create User'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            {!editingUser && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required={!editingUser}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="input-field pr-10"
                                            minLength="6"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role
                                </label>
                                <select
                                    value={formData.roleName}
                                    onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                                    className="input-field"
                                    disabled={!hasPermission('Users', 'edit')}
                                >
                                    {roles
                                        .filter(role => {
                                            const currentUserRoleName = currentUser.Role?.roleName || currentUser.role?.roleName;
                                            if (currentUserRoleName === 'superAdmin') return true;
                                            if (currentUserRoleName === 'admin') return role.roleName !== 'superAdmin';
                                            return false;
                                        })
                                        .map(role => (
                                            <option key={role.id || role._id} value={role.roleName}>
                                                {role.roleName.charAt(0).toUpperCase() + role.roleName.slice(1).replace(/([A-Z])/g, ' $1')}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingUser(null);
                                    }}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingUser ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;