import axiosInstance from './axios';

export const roleAPI = {
    getRoles: async () => {
        const response = await axiosInstance.get('/roles');
        // Transform the response to match the expected format
        return response.data.map(role => ({
            id: role.id,
            roleName: role.roleName,
            description: role.description,
            isActive: role.isActive,
            createdAt: role.createdAt,
            Menus: role.Menus.map(menu => ({
                id: menu.id,
                name: menu.name,
                path: menu.path,
                icon: menu.icon,
                Permission: menu.Permission
            }))
        }));
    },

    getRole: async (id) => {
        const response = await axiosInstance.get(`/roles/${id}`);
        const role = response.data;
        return {
            id: role.id,
            roleName: role.roleName,
            description: role.description,
            isActive: role.isActive,
            Menus: role.Menus.map(menu => ({
                id: menu.id,
                name: menu.name,
                path: menu.path,
                icon: menu.icon,
                Permission: menu.Permission
            }))
        };
    },

    createRole: async (roleData) => {
        // Transform the data to match the API expected format
        const payload = {
            roleName: roleData.roleName,
            description: roleData.description,
            isActive: roleData.isActive !== false,
            permissions: roleData.permissions.map(p => ({
                menuId: p.menu,
                read: p.read || false,
                create: p.create || false,
                edit: p.edit || false,
                delete: p.delete || false
            }))
        };
        const response = await axiosInstance.post('/roles', payload);
        return response.data;
    },

    updateRole: async (id, roleData) => {
        // Transform the data to match the API expected format
        const payload = {
            roleName: roleData.roleName,
            description: roleData.description,
            isActive: roleData.isActive !== false,
            permissions: roleData.permissions.map(p => ({
                menuId: p.menu,
                read: p.read || false,
                create: p.create || false,
                edit: p.edit || false,
                delete: p.delete || false
            }))
        };
        const response = await axiosInstance.put(`/roles/${id}`, payload);
        return response.data;
    },

    deleteRole: async (id) => {
        const response = await axiosInstance.delete(`/roles/${id}`);
        return response.data;
    }
};