import api from './axios';

export const activitiesAPI = {
  getRecentActivities: async () => {
    const response = await api.get('/activities/recent');
    return response.data;
  },
  
  // Add more activity-related API calls as needed
  logActivity: async (activityData) => {
    const response = await api.post('/activities', activityData);
    return response.data;
  }
};
