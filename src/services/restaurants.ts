import api from './api';
import { Restaurant, BusinessHoursData } from '@/types/admin';

export const restaurantsApi = {
  getAll: () => api.get<Restaurant[]>('/restaurants'),
  
  create: (data: Partial<Restaurant>) => api.post<Restaurant>('/restaurants', data),
  
  update: (id: string, data: Partial<Restaurant>) => api.put<Restaurant>(`/restaurants/${id}`, data),
  
  delete: (id: string) => api.delete(`/restaurants/${id}`),
  
  verify: (id: string) => api.put<Restaurant>(`/restaurants/${id}/verify`, { is_verified: true }),
  
  updateBusinessHours: (id: string, businessHours: BusinessHoursData[]) => 
    api.put<Restaurant>(`/restaurants/${id}/hours`, { businessHours }),
    
  updateLocation: (id: string, lat: number, lng: number) => 
    api.put<Restaurant>(`/restaurants/${id}/location`, { 
      location: { latitude: lat, longitude: lng } 
    })
};