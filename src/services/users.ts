import api from './api';
import { User } from '@/types/admin';

export const usersApi = {
  getAll: () => api.get<User[]>('/users'),
  
  getById: (uid: string) => api.get<User>(`/users/${uid}`),
  
  delete: (uid: string) => api.delete(`/users/${uid}`),
  
  updateStatus: (uid: string, status: string) => 
    api.put<User>(`/users/${uid}/status`, { status }),
    
  getStats: () => api.get('/users/stats')
};