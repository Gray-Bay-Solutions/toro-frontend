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
  // Basic Info
  name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_scraped: Date;

  // External IDs & Sources
  yelp_id: string;
  google_place_id: string | null;
  data_source: 'yelp' | 'google' | 'manual';

  // Contact & Location
  phone: string;
  website: string;
  address: {
    full: string;
    street: string | null;
    city: string;
    state: string;
    zip: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };

  // Business Details
  categories: string[];
  price_level: string | 'unspecified';
  operating_hours: {
    periods: {
      open: {
        day: number;  // 0-6 (Sunday-Saturday)
        time: string; // "1130" format
      };
      close: {
        day: number;
        time: string;
      };
    }[];
    weekday_text: string[];
  };

  // Ratings & Reviews
  rating: {
    average: number;
    total: number;
    yelp: {
      rating: number;
      total: number;
    };
    google: {
      rating: number | null;
      total: number | null;
    } | null;
  };

  // Media
  images: {
    primary: string | null;
    gallery: string[];
  };

  // Additional Features
  transactions: string[];
  attributes: {
    has_takeout?: boolean;
    accepts_reservations?: boolean;
    [key: string]: boolean | undefined;
  };
}

export interface Review {
  id?: string;
  type: 'restaurant' | 'dish';
  source: 'google' | 'app';
  review_type: 'external' | 'internal';
  comment: string;
  rating: number;
  timestamp: Date;
  restaurant_id: string;
  restaurant_name: string;
  author: {
    name: string;
    user_id?: string;
    profile_photo: string | null;
    is_verified: boolean;
  };
  metadata: {
    platform: 'google' | 'ios' | 'android' | 'web';
    relative_time?: string;
    original_timestamp?: string;
    verified_purchase?: boolean;
    edited?: boolean;
  };
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

export interface User {
  uid: string;
  created_time: Date;
  display_name: string;
  email: string;
  location_enabled: boolean;
  phone_number: string;
  photo_url: string;
}