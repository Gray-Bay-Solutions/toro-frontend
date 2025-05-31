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
  id: string;
  address: string;
  addressFull: string;
  averageRating: number;
  businessHours: string[];
  categories: string[];
  createdAt: string;
  imageUrl: string;
  isClosed: boolean;
  is_sponsored: boolean;
  is_verified: boolean;
  location: {
    latitude: number;
    longitude: number;
  };
  name: string;
  phone: string;
  price_level: number;
  searchKeywords: string[];
  state: string;
  status: string;
  totalRatings: number;
  updatedAt: string;
  website: string;
  yelpId: string;
  zip: string;
}

// Optional: You might want this type for the operating hours
export interface OperatingHoursPeriod {
  open: {
    day: number;
    time: string;
  };
  close: {
    day: number;
    time: string;
  };
}

export interface Dish {
  id?: string;
  name: string;
  description: string;
  price: number;
  section: string;
  restaurant: string;
  image_url: string;
  average_rating?: number;
  review_count?: number;
  searchKeywords?: string[];
  created_at: string;
  updated_at: string;
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

export interface User {
  uid: string;
  created_time: Date;
  display_name: string;
  email: string;
  location_enabled: boolean;
  phone_number: string;
  photo_url: string;
}

export interface Review {
  id: string;
  author_name: string;
  comment: string;
  dish: {
    id: string,
    name: string,
    restaurant: {
      id: string,
      name: string
    }
  };
  profile_photo_url: string;
  rating: number;
  source: string;
  timestamp: {
    _seconds: number;
    _nanoseconds: number;
  };
  type?: string;
}