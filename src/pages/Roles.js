import { useState, useEffect, useCallback, useContext } from 'react';
import { roleAPI } from '../api/roles';
import { menuAPI } from '../api/menus';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import {
    FiEdit2, FiTrash2, FiPlus, FiChevronDown, FiChevronUp,
    FiCheck, FiX, FiLock, FiUnlock, FiEye, FiEyeOff,
    FiGrid, FiList, FiSearch, FiFilter, FiUsers
} from 'react-icons/fi';

const Roles = () => {
    const { isDarkMode } = useContext(ThemeContext);
    const { hasPermission } = useAuth();

    const [roles, setRoles] = useState([]);
    const [filteredRoles, setFilteredRoles] = useState([]);
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [expandedRole, setExpandedRole] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [submitting, setSubmitting] = useState(false);

    // Theme classes
    const themeClasses = {
        bg: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
        text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
        textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
        border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
        cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
        cardBorder: isDarkMode ? 'border-gray-700' : 'border-gray-200',
        inputBg: isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900',
        hoverBg: isDarkMode ? 'hover:bg-gray-700/80' : 'hover:bg-gray-50',
        buttonPrimary: isDarkMode
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-blue-500/20'
            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-blue-500/30',
        buttonSecondary: isDarkMode
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-800',
        formBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
        formBorder: isDarkMode ? 'border-gray-700' : 'border-gray-200',
        label: isDarkMode ? 'text-gray-300' : 'text-gray-700',
        checkbox: isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300',
        modalBg: isDarkMode ? 'bg-gray-800/95' : 'bg-white',
        modalOverlay: isDarkMode ? 'bg-black/70' : 'bg-black/50',
        modalHeader: isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-r from-gray-50 to-white border-gray-200',
        radioActive: isDarkMode ? 'bg-blue-500' : 'bg-blue-600',
        radioInactive: isDarkMode ? 'border-gray-500' : 'border-gray-300',
        iconBg: (color) => isDarkMode ? `bg-${color}-900/30` : `bg-${color}-100`,
        iconColor: (color) => isDarkMode ? `text-${color}-400` : `text-${color}-600`
    };

    const [formData, setFormData] = useState({
        roleName: '',
        description: '',
        isActive: true,
        permissions: [],
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const filtered = Array.isArray(roles)
            ? roles.filter(role => {
                if (!role) return false;
                const name = role.roleName || '';
                const desc = role.description || '';
                const createdAt = role.createdAt ? new Date(role.createdAt).toLocaleString() : '';
                const search = searchTerm.toLowerCase();
                return name.toLowerCase().includes(search) ||
                    desc.toLowerCase().includes(search) ||
                    createdAt.toLowerCase().includes(search);
            })
            : [];
        setFilteredRoles(filtered);
    }, [searchTerm, roles]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [rolesData, menusData] = await Promise.all([
                roleAPI.getRoles().catch(() => []),  // Return empty array on error
                menuAPI.getMenus().catch(() => [])   // Return empty array on error
            ]);

            // Process roles to match the expected structure
            const processedRoles = Array.isArray(rolesData)
                ? rolesData.map(role => ({
                    ...role,
                    // Extract permissions from Menus array
                    permissions: Array.isArray(role.Menus)
                        ? role.Menus.map(menu => {
                            // Get the menu ID - check both id and _id
                            const menuId = menu.id || menu._id;
                            return {
                                menu: menuId,
                                menuName: menu.name,
                                read: menu.Permission?.read || false,
                                create: menu.Permission?.create || false,
                                edit: menu.Permission?.edit || false,
                                delete: menu.Permission?.delete || false
                            };
                        })
                        : []
                }))
                : [];

            setRoles(processedRoles);
            setFilteredRoles(processedRoles);
            setMenus(Array.isArray(menusData) ? menusData : []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data');
            // Ensure we have empty arrays if there's an error
            setRoles([]);
            setFilteredRoles([]);
            setMenus([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionChange = useCallback((menuId, permissionType) => {
        setFormData(prev => {
            // Ensure permissions is an array
            const permissions = Array.isArray(prev.permissions) ? [...prev.permissions] : [];
            const existingPermissionIndex = permissions.findIndex(p => p && p.menu === menuId);

            if (existingPermissionIndex >= 0) {
                // Create a new array with the updated permission
                const updatedPermissions = [...permissions];
                const currentPermission = { ...updatedPermissions[existingPermissionIndex] };

                // Toggle the specific permission
                currentPermission[permissionType] = !currentPermission[permissionType];

                // If read is being turned off, turn off all other permissions
                if (permissionType === 'read' && !currentPermission.read) {
                    currentPermission.create = false;
                    currentPermission.edit = false;
                    currentPermission.delete = false;
                }

                // If creating non-read permission, ensure read is true
                if (permissionType !== 'read' && currentPermission[permissionType]) {
                    currentPermission.read = true;
                }

                updatedPermissions[existingPermissionIndex] = currentPermission;
                return { ...prev, permissions: updatedPermissions };
            } else {
                // Create new permission entry
                const newPermission = {
                    menu: menuId,
                    read: permissionType === 'read',
                    create: permissionType === 'create',
                    edit: permissionType === 'edit',
                    delete: permissionType === 'delete'
                };

                // If creating non-read permission, ensure read is true
                if (permissionType !== 'read') {
                    newPermission.read = true;
                    newPermission[permissionType] = true;
                }

                return { ...prev, permissions: [...permissions, newPermission] };
            }
        });
    }, []);

    const handleBulkPermission = (menuId, enabled) => {
        setFormData(prev => {
            const permissions = Array.isArray(prev.permissions) ? [...prev.permissions] : [];
            const existingPermissionIndex = permissions.findIndex(p => p && p.menu === menuId);

            if (existingPermissionIndex >= 0) {
                // Create a new array with the updated permission
                const updatedPermissions = [...permissions];
                updatedPermissions[existingPermissionIndex] = {
                    ...updatedPermissions[existingPermissionIndex],
                    menu: menuId,
                    read: enabled,
                    create: enabled,
                    edit: enabled,
                    delete: enabled
                };
                return { ...prev, permissions: updatedPermissions };
            } else if (enabled) {
                // Add new permission if it doesn't exist and enabled is true
                return {
                    ...prev,
                    permissions: [
                        ...permissions,
                        {
                            menu: menuId,
                            read: true,
                            create: true,
                            edit: true,
                            delete: true
                        }
                    ]
                };
            } else {
                // If disabling and permission doesn't exist, add it with all false
                return {
                    ...prev,
                    permissions: [
                        ...permissions,
                        {
                            menu: menuId,
                            read: false,
                            create: false,
                            edit: false,
                            delete: false
                        }
                    ]
                };
            }
        });
    };

    const getPermissionForMenu = (menuId) => {
        if (!formData.permissions || !Array.isArray(formData.permissions)) {
            return {
                read: false,
                create: false,
                edit: false,
                delete: false
            };
        }

        const permission = formData.permissions.find(p => p && p.menu === menuId);

        return permission || {
            read: false,
            create: false,
            edit: false,
            delete: false
        };
    };

    const handleSubmit = async (e) => {
        if (submitting) return;
        e.preventDefault();
        setSubmitting(true);

        try {
            // Validate form
            if (!formData.roleName || !formData.roleName.trim()) {
                toast.error('Role name is required');
                return;
            }

            // Prepare the data to send
            const permissions = Array.isArray(formData.permissions)
                ? formData.permissions
                : [];

            // Map permissions to include menu IDs - send as 'menu' not 'menuId'
            const permissionData = [];

            // Iterate through menus to build permission data
            if (Array.isArray(menus)) {
                menus.forEach(menu => {
                    const menuId = menu.id || menu._id;
                    const menuPerms = getPermissionForMenu(menuId);

                    // Only include permissions where read is true
                    if (menuPerms.read) {
                        permissionData.push({
                            menu: menuId,  // <-- Send as 'menu' not 'menuId'
                            read: true,
                            create: menuPerms.create || false,
                            edit: menuPerms.edit || false,
                            delete: menuPerms.delete || false
                        });
                    }
                });
            }

            const roleData = {
                roleName: formData.roleName.trim(),
                description: formData.description ? formData.description.trim() : '',
                isActive: formData.isActive !== false,
                permissions: permissionData
            };

            console.log('Sending role data:', roleData);

            if (editingRole) {
                if (['superAdmin', 'admin', 'user'].includes(editingRole.roleName)) {
                    delete roleData.roleName;
                }
                // Use id for API call
                await roleAPI.updateRole(editingRole.id, roleData);
                toast.success('Role updated successfully');
            } else {
                await roleAPI.createRole(roleData);
                toast.success('Role created successfully');
            }

            setShowModal(false);
            setEditingRole(null);
            setFormData({
                roleName: '',
                description: '',
                permissions: [],
                isActive: true
            });
            fetchData();
        } catch (error) {
            console.error('Error submitting role:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Operation failed';
            toast.error(`Error: ${errorMessage}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (role) => {
        // Find the role with full permissions data
        const fullRole = roles.find(r => r.id === role.id) || role;

        // Get all menu IDs
        const menuIds = Array.isArray(menus) ? menus.map(menu => menu.id) : [];

        // Initialize permissions for all menus
        const formPermissions = [];

        menuIds.forEach(menuId => {
            const existingPermission = fullRole.permissions?.find(p => p.menu === menuId);

            formPermissions.push({
                menu: menuId,
                read: existingPermission?.read || false,
                create: existingPermission?.create || false,
                edit: existingPermission?.edit || false,
                delete: existingPermission?.delete || false
            });
        });

        setEditingRole(fullRole);
        setFormData({
            roleName: fullRole.roleName || '',
            description: fullRole.description || '',
            isActive: fullRole.isActive !== false,
            permissions: formPermissions
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) return;

        try {
            await roleAPI.deleteRole(id);
            toast.success('Role deleted successfully');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Delete failed');
        }
    };

    const toggleRoleStatus = async (role) => {
        try {
            await roleAPI.updateRole(role.id || role._id, { isActive: !role.isActive });
            toast.success(`Role ${!role.isActive ? 'activated' : 'deactivated'} successfully`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update role status');
        }
    };

    const PermissionBadge = ({ hasPermission, label }) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${hasPermission
            ? 'bg-emerald-100 text-emerald-800'
            : 'bg-gray-100 text-gray-800'
            }`}>
            {hasPermission ? <FiCheck className="mr-1" /> : <FiX className="mr-1" />}
            {label}
        </span>
    );

    if (loading) {
        return (
            <div className={`flex flex-col items-center justify-center min-h-[70vh] space-y-6 ${themeClasses.bg} ${themeClasses.text}`}>
                <div className="relative">
                    <div className={`w-16 h-16 border-4 ${isDarkMode ? 'border-gray-700' : 'border-primary-100'} rounded-full`}></div>
                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="text-center">
                    <p className={`text-lg font-medium ${themeClasses.text}`}>Loading roles</p>
                    <p className={`text-sm ${themeClasses.textSecondary}`}>Please wait while we fetch the data</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen ${themeClasses.bg} ${themeClasses.text}`}>
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div>
                                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Role Management</h1>
                                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-2`}>Manage user roles and permissions across the system</p>
                            </div>
                        </div>
                    </div>
                    {hasPermission('Roles', 'create') && (
                        <button
                            onClick={() => {
                                setEditingRole(null);
                                setFormData({
                                    roleName: '',
                                    description: '',
                                    isActive: true,
                                    permissions: []
                                });
                                setShowModal(true);
                            }}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:shadow-lg ${themeClasses.buttonPrimary}`}
                        >
                            <FiPlus className="w-5 h-5" />
                            Add New Role
                        </button>
                    )}
                </div>

                {/* Filters and Search */}
                <div className={`rounded-xl shadow-sm border ${themeClasses.cardBorder} p-4 mb-6 ${themeClasses.cardBg}`}>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <FiSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} w-5 h-5`} />
                            <input
                                type="text"
                                placeholder="Search roles by name or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full pl-12 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${themeClasses.inputBg} ${isDarkMode ? 'placeholder-gray-400' : 'placeholder-gray-500'}`}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-1 flex`}>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? (isDarkMode ? 'bg-gray-600' : 'bg-white shadow-sm') : (isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200')}`}
                                    title="Grid View"
                                >
                                    <FiGrid className={`w-5 h-5 ${viewMode === 'grid' ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') : (isDarkMode ? 'text-gray-300' : 'text-gray-600')}`} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? (isDarkMode ? 'bg-gray-600' : 'bg-white shadow-sm') : (isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200')}`}
                                    title="List View"
                                >
                                    <FiList className={`w-5 h-5 ${viewMode === 'list' ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') : (isDarkMode ? 'text-gray-300' : 'text-gray-600')}`} />
                                </button>
                            </div>
                            <button className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                                <FiFilter className="w-5 h-5" />
                                <span className="hidden sm:inline">Filter</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className={`bg-gradient-to-br ${isDarkMode ? 'from-blue-900/30 to-blue-800/30 border-blue-700' : 'from-blue-50 to-blue-100 border-blue-200'} border rounded-xl p-5 transition-all hover:shadow-lg`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>Total Roles</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-blue-900'} mt-1`}>{roles.length}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/40' : 'bg-blue-100'}`}>
                            <FiUsers className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        </div>
                    </div>
                </div>
                <div className={`bg-gradient-to-br ${isDarkMode ? 'from-emerald-900/30 to-emerald-800/30 border-emerald-700' : 'from-emerald-50 to-emerald-100 border-emerald-200'} border rounded-xl p-5 transition-all hover:shadow-lg`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>Active Roles</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-emerald-900'} mt-1`}>
                                {roles?.filter(r => r.isActive).length}
                            </p>
                        </div>
                        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-emerald-900/40' : 'bg-emerald-100'}`}>
                            <FiUnlock className={`w-6 h-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        </div>
                    </div>
                </div>
                <div className={`bg-gradient-to-br ${isDarkMode ? 'from-amber-900/30 to-amber-800/30 border-amber-700' : 'from-amber-50 to-amber-100 border-amber-200'} border rounded-xl p-5 transition-all hover:shadow-lg`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>Default Roles</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-amber-900'} mt-1`}>
                                {roles?.filter(r => ['superAdmin', 'admin', 'user'].includes(r.roleName)).length}
                            </p>
                        </div>
                        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-amber-900/40' : 'bg-amber-100'}`}>
                            <FiLock className={`w-6 h-6 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                        </div>
                    </div>
                </div>
                <div className={`bg-gradient-to-br ${isDarkMode ? 'from-violet-900/30 to-violet-800/30 border-violet-700' : 'from-violet-50 to-violet-100 border-violet-200'} border rounded-xl p-5 transition-all hover:shadow-lg`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-violet-300' : 'text-violet-800'}`}>Custom Roles</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-violet-900'} mt-1`}>
                                {roles?.filter(r => !['superAdmin', 'admin', 'user'].includes(r.roleName)).length}
                            </p>
                        </div>
                        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-violet-900/40' : 'bg-violet-100'}`}>
                            <FiEdit2 className={`w-6 h-6 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Roles List/Grid */}
            {filteredRoles.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-16 text-center">
                        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                            <FiUsers className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No roles found</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            {searchTerm ? 'No roles match your search criteria.' : 'Get started by creating your first role.'}
                        </p>
                        {hasPermission('Roles', 'create') && (
                            <button
                                onClick={() => {
                                    setEditingRole(null);
                                    setFormData({
                                        roleName: '',
                                        description: '',
                                        isActive: true,
                                        permissions: []
                                    });
                                    setShowModal(true);
                                }}
                                className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-medium rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl ${isDarkMode ? 'shadow-primary-900/20' : ''}`}
                            >
                                <FiPlus className="w-5 h-5" />
                                Create New Role
                            </button>
                        )}
                    </div>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                    {filteredRoles.map((role) => {
                        const roleId = role.id || role._id;
                        return (
                     <div className={isDarkMode ? "dark" : ""}>
  <div
    key={roleId}
    className="group rounded-2xl shadow-sm hover:shadow-xl border transition-all duration-300 overflow-hidden
    bg-white border-gray-200 text-gray-900
    dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:hover:border-primary-500"
  >
    <div className="p-6">
      {/* Role Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold capitalize truncate">
              {role.roleName}
            </h3>

            <div className="flex items-center gap-1">
              {role.isActive ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  Inactive
                </span>
              )}

              {['superAdmin', 'admin', 'user'].includes(role.roleName) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  <FiLock className="w-3 h-3" />
                  Default
                </span>
              )}
            </div>
          </div>

          {role.description && (
            <p className="line-clamp-2 mb-3 text-gray-600 dark:text-gray-400">
              {role.description}
            </p>
          )}
        </div>

        <div className="ml-2 flex-shrink-0">
          <button
            onClick={() => toggleRoleStatus(role)}
            className={`p-2 rounded-lg transition-colors ${
              hasPermission('Roles', 'edit')
                ? 'hover:bg-gray-100 dark:hover:bg-gray-700'
                : 'cursor-not-allowed'
            }`}
            disabled={
              !hasPermission('Roles', 'edit') ||
              ['superAdmin'].includes(role.roleName)
            }
          >
            {role.isActive ? (
              <FiEye className="w-5 h-5 text-emerald-600" />
            ) : (
              <FiEyeOff className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
          <p className="text-2xl font-bold">
            {role.permissions?.filter(p => p.read).length || 0}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Menus</p>
        </div>

        <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
          <p className="text-2xl font-bold">
            {role.permissions?.reduce(
              (acc, p) =>
                acc +
                (p.create ? 1 : 0) +
                (p.edit ? 1 : 0) +
                (p.delete ? 1 : 0),
              0
            ) || 0}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Actions</p>
        </div>

        <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
          <p className="text-sm font-bold">
            {role.createdAt
              ? new Date(role.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'N/A'}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Created</p>
        </div>
      </div>

      {/* Permissions Preview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Key Permissions
          </p>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {role.permissions?.filter(p => p.read).length || 0} of {menus.length}{' '}
            menus
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {role.permissions?.slice(0, 3).map(
            (perm, idx) =>
              perm.read && (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200
                  dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                >
                  {perm.menuName || perm.menu?.name || 'Menu'}
                </span>
              )
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          By:{' '}
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {role.createdBy?.name || 'System'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setExpandedRole(expandedRole === roleId ? null : roleId)
            }
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors dark:hover:bg-gray-700"
          >
            {expandedRole === roleId ? (
              <>
                <FiChevronUp className="w-4 h-4" />
                Hide
              </>
            ) : (
              <>
                <FiChevronDown className="w-4 h-4" />
                Details
              </>
            )}
          </button>
        </div>
      </div>
    </div>

    {/* Expanded Permissions */}
    {expandedRole === roleId && (
      <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-700 pt-6">
        <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-primary-500 rounded-full"></div>
          All Permissions
        </h4>

        <div className="space-y-3">
          {role.permissions?.map(
            (permission, index) =>
              permission.read && (
                <div
                  key={index}
                  className="rounded-xl p-4 bg-gray-50 dark:bg-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {permission.menuName ||
                        permission.menu?.name ||
                        'Menu'}
                    </span>

                    <div className="flex items-center gap-2">
                      <PermissionBadge hasPermission={permission.read} label="View" />
                      <PermissionBadge hasPermission={permission.create} label="Create" />
                      <PermissionBadge hasPermission={permission.edit} label="Edit" />
                      <PermissionBadge hasPermission={permission.delete} label="Delete" />
                    </div>
                  </div>
                </div>
              )
          )}
        </div>
      </div>
    )}
  </div>
</div>

                        );
                    })}
                </div>
            ) : (
                /* List View */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Permissions
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {filteredRoles.map((role) => {
                                    const roleId = role.id || role._id;
                                    return (
                                        <tr key={roleId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg">
                                                            <FiUsers className="w-5 h-5 text-primary-600" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900 capitalize">{role.roleName}</h4>
                                                            {role.description && (
                                                                <p className="text-sm text-gray-600 truncate max-w-xs">{role.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${role.isActive
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        <div className={`w-2 h-2 rounded-full ${role.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                                                        {role.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                    {['superAdmin', 'admin', 'user'].includes(role.roleName) && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                            <FiLock className="w-3 h-3" />
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {role.permissions?.filter(p => p.read).length || 0}
                                                    </span>
                                                    <span className="text-sm text-gray-600">menus</span>
                                                    <span className="mx-2 text-gray-300">•</span>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {role.permissions?.reduce((acc, p) => acc + (p.create ? 1 : 0) + (p.edit ? 1 : 0) + (p.delete ? 1 : 0), 0) || 0}
                                                    </span>
                                                    <span className="text-sm text-gray-600">actions</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {new Date(role.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    by {role.createdBy?.name || 'System'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setExpandedRole(expandedRole === roleId ? null : roleId)}
                                                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                    >
                                                        {expandedRole === roleId ? (
                                                            <FiChevronUp className="w-5 h-5" />
                                                        ) : (
                                                            <FiChevronDown className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                    {hasPermission('Roles', 'edit') && (
                                                        <button
                                                            onClick={() => handleEdit(role)}
                                                            disabled={['superAdmin'].includes(role.roleName)}
                                                            className={`p-2 rounded-lg transition-colors ${['superAdmin'].includes(role.roleName)
                                                                ? 'opacity-50 cursor-not-allowed'
                                                                : 'hover:bg-blue-50 text-blue-600 hover:text-blue-700'
                                                                }`}
                                                        >
                                                            <FiEdit2 className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    {hasPermission('Roles', 'delete') && !['superAdmin', 'admin', 'user'].includes(role.roleName) && (
                                                        <button
                                                            onClick={() => handleDelete(roleId)}
                                                            className="p-2 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
                                                        >
                                                            <FiTrash2 className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {editingRole ? 'Edit Role' : 'Create New Role'}
                                    </h2>
                                    <p className="text-gray-600 mt-1">
                                        {editingRole ? 'Modify role details and permissions' : 'Define a new role and set permissions'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingRole(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <FiX className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto">
                            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                                {/* Basic Information */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <FiUsers className="w-5 h-5 text-blue-600" />
                                        </div>
                                        Basic Information
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Role Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.roleName}
                                                onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                                placeholder="e.g., Content Manager"
                                                disabled={editingRole && ['superAdmin', 'admin', 'user'].includes(editingRole.roleName)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Status
                                            </label>
                                            <div className="flex items-center gap-4 mt-2">
                                                <label className="flex items-center gap-2">
                                                    <div className="relative">
                                                        <input
                                                            type="radio"
                                                            name="status"
                                                            checked={formData.isActive}
                                                            onChange={() => setFormData({ ...formData, isActive: true })}
                                                            className="sr-only"
                                                        />
                                                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center">
                                                            {formData.isActive && <div className="w-2 h-2 rounded-full bg-primary-600"></div>}
                                                        </div>
                                                    </div>
                                                    <span className="text-gray-700">Active</span>
                                                </label>
                                                <label className="flex items-center gap-2">
                                                    <div className="relative">
                                                        <input
                                                            type="radio"
                                                            name="status"
                                                            checked={!formData.isActive}
                                                            onChange={() => setFormData({ ...formData, isActive: false })}
                                                            className="sr-only"
                                                        />
                                                        <div className="w-4 h-4 rounded-full border-2 border-gray-300">
                                                            {!formData.isActive && <div className="w-2 h-2 rounded-full bg-primary-600"></div>}
                                                        </div>
                                                    </div>
                                                    <span className="text-gray-700">Inactive</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                            rows="3"
                                            placeholder="Describe the purpose of this role..."
                                        />
                                    </div>
                                </div>

                                {/* Permissions Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                                            <div className="p-2 bg-emerald-100 rounded-lg">
                                                <FiLock className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            Permissions
                                            <span className="text-sm font-normal text-gray-500">
                                                ({formData.permissions?.filter(p => p.read).length || 0} of {menus.length} menus selected)
                                            </span>
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (Array.isArray(menus)) {
                                                        menus.forEach(menu => {
                                                            const menuId = menu.id || menu._id;
                                                            handleBulkPermission(menuId, true);
                                                        });
                                                    }
                                                }}
                                                className="px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                                            >
                                                Select All
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (Array.isArray(menus)) {
                                                        menus.forEach(menu => {
                                                            const menuId = menu.id || menu._id;
                                                            handleBulkPermission(menuId, false);
                                                        });
                                                    }
                                                }}
                                                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                    </div>

                                    {/* Permissions Grid */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {loading ? (
                                            <div className="col-span-2 flex justify-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                            </div>
                                        ) : Array.isArray(menus) && menus.length > 0 ? menus.map((menu) => {
                                            const menuId = menu.id || menu._id;
                                            const menuPerms = getPermissionForMenu(menuId);
                                            const hasReadAccess = menuPerms.read || false;

                                            return (
                                                <div key={menuId} className={`border rounded-xl transition-all duration-300 ${hasReadAccess
                                                    ? 'border-primary-200 bg-gradient-to-br from-primary-50 to-white shadow-sm'
                                                    : 'border-gray-200 bg-white'
                                                    }`}>
                                                    <div className="p-4">
                                                        {/* Menu Header */}
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`p-2 rounded-lg ${hasReadAccess
                                                                    ? 'bg-primary-100 text-primary-600'
                                                                    : 'bg-gray-100 text-gray-500'
                                                                    }`}>
                                                                    <div className="w-5 h-5 flex items-center justify-center">
                                                                        {hasReadAccess ? '✓' : '-'}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-medium text-gray-900">{menu.name}</h4>
                                                                    {menu.description && (
                                                                        <p className="text-xs text-gray-500 mt-1">{menu.description}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <label className="relative inline-flex items-center cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={hasReadAccess}
                                                                    onChange={() => handlePermissionChange(menuId, 'read')}
                                                                    className="sr-only peer"
                                                                />
                                                                <div className={`w-11 h-6 rounded-full peer ${hasReadAccess
                                                                    ? 'bg-primary-600'
                                                                    : 'bg-gray-200'
                                                                    }`}></div>
                                                                <div className={`absolute left-0.5 top-0.5 bg-white border rounded-full h-5 w-5 transition-transform ${hasReadAccess ? 'transform translate-x-5' : ''
                                                                    }`}></div>
                                                            </label>
                                                        </div>

                                                        {/* Permission Toggles */}
                                                        {hasReadAccess && (
                                                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    {[
                                                                        { type: 'create', label: 'Create', color: 'emerald' },
                                                                        { type: 'edit', label: 'Edit', color: 'blue' },
                                                                        { type: 'delete', label: 'Delete', color: 'red' }
                                                                    ].map(({ type, label, color }) => (
                                                                        <label
                                                                            key={type}
                                                                            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${menuPerms[type]
                                                                                ? `bg-${color}-50 border-${color}-200`
                                                                                : 'bg-gray-50 border-gray-200'
                                                                                }`}
                                                                        >
                                                                            <span className={`text-sm font-medium ${menuPerms[type]
                                                                                ? `text-${color}-700`
                                                                                : 'text-gray-700'
                                                                                }`}>
                                                                                {label}
                                                                            </span>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={menuPerms[type] || false}
                                                                                onChange={() => handlePermissionChange(menuId, type)}
                                                                                className={`h-4 w-4 rounded border-gray-300 ${menuPerms[type]
                                                                                    ? `text-${color}-600 focus:ring-${color}-500`
                                                                                    : 'text-gray-400'
                                                                                    }`}
                                                                            />
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        }) : (
                                            <div className="col-span-2 text-center py-8 text-gray-500">
                                                No menus available
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex items-center justify-between pt-8 border-t border-gray-200">
                                    <div className="text-sm text-gray-500">
                                        {editingRole ? (
                                            <p>Last updated: {editingRole.updatedAt ? new Date(editingRole.updatedAt).toLocaleDateString() : 'N/A'}</p>
                                        ) : (
                                            <p>All fields marked with * are required</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowModal(false);
                                                setEditingRole(null);
                                            }}
                                            className="px-6 py-3 text-gray-700 bg-white border border-gray-200 hover:border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {submitting ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    {editingRole ? 'Update Role' : 'Create Role'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Roles;