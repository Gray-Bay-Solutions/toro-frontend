export interface City {
  id?: string;
  name: string;
  state: string;
  state_code: string;
  location: {
    latitude: number;
    longitude: number;
  };
  restaurants: string[]; // List of restaurant references
  status?: "Active" | "Pending" | "Scraping";
  totalRestaurants?: number;
  lastScraped?: Date | null;
}
export interface BusinessHoursData {
  day: string;
  open: string;
  close: string;
}

export interface Restaurant {
  id?: string;
  address: string;
  averageRating: number;
  createdAt: Date;
  location: {
    latitude: number;
    longitude: number;
  };
  name: string;
  phone: string;
  website: string;
  yelpId: string;
  imageUrl: string;
  totalRatings: number;
  businessHours: BusinessHoursData[];
  isClosed: boolean;
  price: string;
  categories: string[];
  is_verified: boolean;
}

export interface Dish {
  id?: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  restaurant: string; // restaurant reference
  city: string; // city reference
  image_url: string;
  review_count: number;
  average_rating: number;
}

export interface DashboardStats {
  totalCities: number;
  totalRestaurants: number;
  totalUsers: number;
  totalReviews: number;
  activeCities: number;
  averageRating: number;
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: Date;
  userId?: string;
}
