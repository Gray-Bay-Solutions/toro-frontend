"use client"

import { useState, useEffect } from 'react';
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
    accessorKey: "address.full",
    accessorFn: (row: Restaurant) => row.address,
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
    accessorKey: "businessHours",
    render: (hours: string[]) => {
      const isOpen = isBusinessOpen(hours);
      return (
        <span className={`px-2 py-1 rounded-full text-xs ${
          isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isOpen ? 'Open' : 'Closed'}
        </span>
      );
    }
  },
  {
    header: "Price",
    accessorKey: "price_level",
    render: (value: number) => {
      if (!value) return 'Unspecified';
      return '$'.repeat(value);
    }
  }
];

const initialRestaurants: Restaurant[] = [];

const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [loading, setLoading] = useState(true);

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

  const handleAdd = async (data: any) => {
    try {
      const newRestaurant = {
        ...data,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        last_scraped: new Date(),
        data_source: 'manual' as const,
        google_place_id: null,
        address: {
          full: data.address || '',
          street: null,
          city: '',
          state: '',
          zip: '',
          country: 'US',
          coordinates: {
            latitude: 0,
            longitude: 0
          }
        },
        rating: {
          average: 0,
          total: 0,
          yelp: {
            rating: 0,
            total: 0
          },
          google: null
        },
        images: {
          primary: null,
          gallery: []
        },
        categories: [],
        transactions: [],
        attributes: {},
        operating_hours: {
          periods: [],
          weekday_text: []
        }
      };
      const response = await restaurantsApi.create(newRestaurant);
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
      const response = await restaurantsApi.update(updatedData.id, updatedData);
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
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantsPage;