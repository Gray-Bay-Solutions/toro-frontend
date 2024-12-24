import api from './api';
import { Review } from '@/types/admin';

export const reviewsApi = {
  // Get all reviews
  getAll: () => api.get<Review[]>('/reviews'),
  
  // Get reviews for a specific restaurant
  getByRestaurant: (restaurantId: string) => api.get<Review[]>(`/reviews/restaurant/${restaurantId}`),
  
  // Get reviews for a specific dish
  getByDish: (dishId: string) => api.get<Review[]>(`/reviews/dish/${dishId}`),
  
  // Get reviews by a specific user
  getByUser: (userId: string) => api.get<Review[]>(`/reviews/user/${userId}`),
  
  // Delete a review
  delete: (id: string) => api.delete(`/reviews/${id}`),
  
  // Report a review as inappropriate
  report: (id: string, reason: string) => 
    api.post(`/reviews/${id}/report`, { reason }),
  
  // Mark a review as verified (for app reviews)
  verify: (id: string) => 
    api.put<Review>(`/reviews/${id}/verify`, { 
      'author.is_verified': true 
    }),
  
  // For filtering statistics
  getStats: () => api.get<{
    totalReviews: number;
    averageRating: number;
    ratingDistribution: { [key: number]: number };
    sourceDistribution: { [key: string]: number };
    verifiedCount: number;
  }>('/reviews/stats')
};