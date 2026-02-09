import axiosInstance from './axios';

export const menuAPI = {
    getMenus: async () => {
        const response = await axiosInstance.get('/menus');
        // Transform the response to match the expected format
        return response.data.map(menu => ({
            id: menu.id,
            name: menu.name,
            path: menu.path,
            icon: menu.icon,
            order: menu.order,
            isActive: menu.isActive,
            createdAt: menu.createdAt,
            updatedAt: menu.updatedAt,
            Permission: menu.Permission || {
                read: false,
                create: false,
                edit: false,
                delete: false
            }
        }));
    },

    getMenu: async (id) => {
        const response = await axiosInstance.get(`/menus/${id}`);
        const menu = response.data;
        return {
            id: menu.id,
            name: menu.name,
            path: menu.path,
            icon: menu.icon,
            order: menu.order,
            isActive: menu.isActive,
            createdAt: menu.createdAt,
            updatedAt: menu.updatedAt,
            Permission: menu.Permission || {
                read: false,
                create: false,
                edit: false,
                delete: false
            }
        };
    },

    createMenu: async (menuData) => {
        // Transform the data to match the API expected format
        const payload = {
            name: menuData.name,
            path: menuData.path,
            icon: menuData.icon,
            order: menuData.order,
            isActive: menuData.isActive !== false,
            permissions: {
                read: menuData.Permission?.read || false,
                create: menuData.Permission?.create || false,
                edit: menuData.Permission?.edit || false,
                delete: menuData.Permission?.delete || false
            }
        };
        const response = await axiosInstance.post('/menus', payload);
        return response.data;
    },

    updateMenu: async (id, menuData) => {
        // Transform the data to match the API expected format
        const payload = {
            name: menuData.name,
            path: menuData.path,
            icon: menuData.icon,
            order: menuData.order,
            isActive: menuData.isActive !== false,
            permissions: {
                read: menuData.Permission?.read || false,
                create: menuData.Permission?.create || false,
                edit: menuData.Permission?.edit || false,
                delete: menuData.Permission?.delete || false
            }
        };
        const response = await axiosInstance.put(`/menus/${id}`, payload);
        return response.data;
    },

    deleteMenu: async (id) => {
        const response = await axiosInstance.delete(`/menus/${id}`);
        return response.data;
    }
};