import api from "./api";
import type { Dish } from "@/types/admin";

export const dishesApi = {
  getAll: () => api.get<Dish[]>("/dishes"),
  create: (data: Partial<Dish>) => api.post<Dish>("/dishes", data),
  update: (id: string, data: Partial<Dish>) =>
    api.put<Dish>(`/dishes/${id}`, data),
  delete: (id: string) => api.delete(`/dishes/${id}`),
};
