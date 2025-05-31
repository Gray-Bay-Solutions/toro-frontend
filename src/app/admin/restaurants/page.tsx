"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/data-table';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, Star, MapPin, Phone, Globe, MessageCircle, CheckCircle2 } from "lucide-react";
import { restaurantsApi } from '@/services';
import { Restaurant } from '@/types/admin';
import { isBusinessOpen } from '@/lib/utils';

const columns = [
  {
    header: "Name",
    accessorKey: "name",
    icon: Utensils
  },
  {
    header: "Address",
    accessorKey: "address",
    icon: MapPin,
    render: (address: string) => (
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        {address}
      </a>
    )
  },
  {
    header: "Phone",
    accessorKey: "phone",
    icon: Phone
  },
  {
    header: "Website",
    accessorKey: "website", 
    icon: Globe,
    render: (website: string) => {
      if (!website) return '-';
      const displayUrl = website.length > 30 ? website.substring(0, 30) + '...' : website;
      return (
        <a 
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
          title={website}
        >
          {displayUrl}
        </a>
      );
    }
  },
  {
    header: "Rating",
    accessorKey: "averageRating",
    icon: Star,
    isNumber: true
  },
  {
    header: "Reviews",
    accessorKey: "totalRatings",
    isNumber: true
  },
  {
    header: "Status",
    accessorKey: "status",
    isStatus: true
  },
  {
    header: "Price",
    accessorKey: "price_level",
    render: (value: number) => {
      if (!value) return 'Unspecified';
      return '$'.repeat(value);
    }
  },
  {
    header: "Verified",
    accessorKey: "is_verified",
    render: (value: boolean) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {value ? 'Verified' : 'Unverified'}
      </span>
    )
  }
];

const formFields = [
  { key: 'name', label: 'Restaurant Name', type: 'text' as const, required: true },
  { key: 'address', label: 'Street Address', type: 'text' as const, required: true },
  { key: 'addressFull', label: 'Full Address', type: 'text' as const, required: true },
  { key: 'phone', label: 'Phone Number', type: 'text' as const },
  { key: 'website', label: 'Website URL', type: 'url' as const },
  { key: 'yelpId', label: 'Yelp ID', type: 'text' as const },
  { key: 'state', label: 'State', type: 'text' as const, required: true },
  { key: 'zip', label: 'ZIP Code', type: 'text' as const, required: true },
  { 
    key: 'price_level', 
    label: 'Price Level', 
    type: 'select' as const, 
    options: ['1', '2', '3', '4'],
    placeholder: 'Select price level (1-4)'
  },
  { 
    key: 'status', 
    label: 'Status', 
    type: 'select' as const, 
    options: ['active', 'inactive', 'pending', 'closed'],
    required: true
  },
  { key: 'averageRating', label: 'Average Rating', type: 'number' as const },
  { key: 'totalRatings', label: 'Total Ratings', type: 'number' as const },
  { key: 'imageUrl', label: 'Image URL', type: 'url' as const },
  { key: 'is_verified', label: 'Verified', type: 'checkbox' as const },
  { key: 'is_sponsored', label: 'Sponsored', type: 'checkbox' as const },
  { key: 'isClosed', label: 'Currently Closed', type: 'checkbox' as const },
  { 
    key: 'categories', 
    label: 'Categories (comma-separated)', 
    type: 'textarea' as const,
    placeholder: 'e.g., Italian, Pizza, Fine Dining'
  },
  { 
    key: 'businessHours', 
    label: 'Business Hours (one per line)', 
    type: 'textarea' as const,
    placeholder: 'Monday: 9:00 AM - 9:00 PM\nTuesday: 9:00 AM - 9:00 PM\n...'
  },
  { 
    key: 'searchKeywords', 
    label: 'Search Keywords (comma-separated)', 
    type: 'textarea' as const,
    placeholder: 'pizza, italian, delivery, family-friendly'
  }
];

const initialRestaurants: Restaurant[] = [];

const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await restaurantsApi.getAll();
        setRestaurants(response.data);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleRowClick = (restaurant: Restaurant) => {
    router.push(`/admin/restaurants/${restaurant.id}`);
  };

  const handleAdd = async (data: any) => {
    try {
      // Process form data before sending
      const processedData = {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        averageRating: Number(data.averageRating) || 0,
        totalRatings: Number(data.totalRatings) || 0,
        price_level: Number(data.price_level) || 1,
        location: {
          latitude: 0,
          longitude: 0
        },
        // Process comma-separated values into arrays
        categories: data.categories ? data.categories.split(',').map((c: string) => c.trim()) : [],
        businessHours: data.businessHours ? data.businessHours.split('\n').filter((h: string) => h.trim()) : [],
        searchKeywords: data.searchKeywords ? data.searchKeywords.split(',').map((k: string) => k.trim()) : [],
        // Convert checkbox values
        is_verified: Boolean(data.is_verified),
        is_sponsored: Boolean(data.is_sponsored),
        isClosed: Boolean(data.isClosed)
      };

      const response = await restaurantsApi.create(processedData);
      setRestaurants([...restaurants, response.data]);
    } catch (error) {
      console.error('Error adding restaurant:', error);
    }
  };

  const handleUpdate = async (updatedData: Partial<Restaurant>) => {
    try {
      if (!updatedData.id) {
        throw new Error("Error getting restaurant ID");
      }

      // Process form data similar to handleAdd
      const processedData = {
        ...updatedData,
        updatedAt: new Date().toISOString(),
        averageRating: Number(updatedData.averageRating) || 0,
        totalRatings: Number(updatedData.totalRatings) || 0,
        price_level: Number(updatedData.price_level) || 1,
      };

      // Process arrays if they're strings
      if (typeof updatedData.categories === 'string') {
        processedData.categories = (updatedData.categories as string).split(',').map((c: string) => c.trim());
      }
      if (typeof updatedData.businessHours === 'string') {
        processedData.businessHours = (updatedData.businessHours as string).split('\n').filter((h: string) => h.trim());
      }
      if (typeof updatedData.searchKeywords === 'string') {
        processedData.searchKeywords = (updatedData.searchKeywords as string).split(',').map((k: string) => k.trim());
      }

      const response = await restaurantsApi.update(updatedData.id, processedData);
      setRestaurants(restaurants.map(restaurant => 
        restaurant.id === updatedData.id ? response.data : restaurant
      ));
    } catch (error) {
      console.error('Error updating restaurant:', error);
    }
  };

  const handleDelete = async (data: { id: string; }) => {
    try {
      await restaurantsApi.delete(data.id);
      setRestaurants(restaurants.filter(r => r.id !== data.id));
    } catch (error) {
      console.error('Error deleting restaurant:', error);
    }
  };

  // Calculate stats
  const averageRating = restaurants.length 
    ? restaurants.reduce((acc, curr) => acc + (curr.averageRating || 0), 0) / restaurants.length 
    : 0;
  const totalReviews = restaurants.reduce((acc, curr) => acc + (curr.totalRatings || 0), 0);
  const verifiedCount = restaurants.filter(r => r.is_verified).length;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Restaurants</h1>
        <p className="text-muted-foreground mt-1">Manage restaurant listings and details</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Restaurants</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : restaurants.length}
            </div>
            <p className="text-xs text-muted-foreground">Listed restaurants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : averageRating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Out of 5.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : totalReviews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across all restaurants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Verified Listings</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : verifiedCount}
            </div>
            <p className="text-xs text-muted-foreground">Verified restaurants</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Restaurants</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={restaurants}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            loading={loading}
            formFields={formFields}
            onRowClick={handleRowClick}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantsPage;