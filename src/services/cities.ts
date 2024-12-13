import api from './api';
import { City } from '@/types/admin';

export const citiesApi = {
  getAll: () => api.get<City[]>('/cities'),
  create: (data: Partial<City>) => api.post<City>('/cities', data),
  update: (id: string, data: Partial<City>) => api.put<City>(`/cities/${id}`, data),
  delete: (id: string) => api.delete(`/cities/${id}`),
  startScraping: (cityId: string) => api.post('/scraping/start', { cityId }),
  stopScraping: (cityId: string) => api.post('/scraping/stop', { cityId })
};