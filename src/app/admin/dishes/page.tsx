"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTable from '@/components/data-table';
import { Utensils, Star, DollarSign, MessageCircle, Calendar, Store, Image } from "lucide-react";
import { dishesApi, reviewsApi, restaurantsApi } from '@/services';
import type { Dish, Review, Restaurant } from "@/types/admin";
import type { Row } from '@tanstack/react-table';

// Consistent number formatter
const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Helper to safely convert any date format to string
const formatDate = (date: any): string => {
  try {
    // Handle Firestore Timestamp
    if (date && typeof date === 'object' && '_seconds' in date) {
      return new Date(date._seconds * 1000)
        .toISOString()
        .split('T')[0];
    }
    
    // Handle string or Date object
    if (date) {
      return new Date(date)
        .toISOString()
        .split('T')[0];
    }
    
    return '';
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

// Helper function to extract ID from Firestore document reference
const getDocumentId = (docRef: any): string => {
  if (!docRef) return '';
  
  // If it's already a string (just an ID)
  if (typeof docRef === 'string') {
    return docRef.includes('/') ? docRef.split('/').pop()! : docRef;
  }
  
  // If it's a Firestore DocumentReference object
  if (docRef && typeof docRef === 'object') {
    // Try to get ID from the reference
    if (docRef.id) return docRef.id;
    
    // Try to get from _path property
    if (docRef._path && docRef._path.segments) {
      return docRef._path.segments[docRef._path.segments.length - 1];
    }
    
    // Try to extract from path string
    if (docRef.path) {
      return docRef.path.split('/').pop()!;
    }
  }
  
  return String(docRef);
};

export default function DishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [reviews, setReviews] = useState<Record<string, Review[]>>({});
  const [loading, setLoading] = useState(true);

  // Form fields for adding/editing dishes
  const formFields = [
    { key: 'name', label: 'Dish Name', type: 'text' as const, required: true },
    { key: 'description', label: 'Description', type: 'textarea' as const, required: true },
    { key: 'price', label: 'Price ($)', type: 'number' as const, required: true },
    { 
      key: 'section', 
      label: 'Section/Category', 
      type: 'select' as const, 
      options: ['Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Side', 'Special', 'Starter', 'Entree', 'Salad', 'Soup'],
      required: true
    },
    { 
      key: 'restaurant', 
      label: 'Restaurant', 
      type: 'select' as const, 
      options: restaurants.map(r => `${r.name} (${r.id})`),
      required: true
    },
    { key: 'image_url', label: 'Image URL', type: 'url' as const },
    { 
      key: 'searchKeywords', 
      label: 'Search Keywords (comma-separated)', 
      type: 'textarea' as const,
      placeholder: 'spicy, vegetarian, gluten-free, popular'
    }
  ];

  const columns = [
    {
      header: "Name",
      accessorKey: "name",
      icon: Utensils,
      render: (name: string) => (
        <div className="font-medium">{name}</div>
      )
    },
    {
      header: "Restaurant",
      accessorKey: "restaurant",
      icon: Store,
      render: (restaurantRef: any) => {
        if (!restaurantRef) return 'No restaurant';
        
        // Extract restaurant ID from Firestore document reference
        const restaurantId = getDocumentId(restaurantRef);
          
        const restaurant = restaurants.find(r => r.id === restaurantId);
        return (
          <div className="flex items-center space-x-2">
            <Store className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{restaurant?.name || restaurantId}</span>
          </div>
        );
      }
    },
    {
      header: "Section",
      accessorKey: "section",
      render: (section: string) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
          {section}
        </span>
      )
    },
    {
      header: "Price",
      accessorKey: "price",
      icon: DollarSign,
      isNumber: true,
      render: (price: number) => {
        if (price === null || price === undefined || isNaN(price)) {
          return <span className="text-gray-400">No price</span>;
        }
        return (
          <span className="font-semibold text-green-600">
            ${price.toFixed(2)}
          </span>
        );
      }
    },
    {
      header: "Image",
      accessorKey: "image_url",
      icon: Image,
      render: (imageUrl: string) => {
        if (!imageUrl) return <span className="text-gray-400">No image</span>;
        return (
          <a 
            href={imageUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            Click here
          </a>
        );
      }
    },
    {
      header: "Keywords",
      accessorKey: "searchKeywords",
      render: (keywords: string) => {
        if (!keywords) return <span className="text-gray-400">No keywords</span>;
        
        // Convert comma-separated string back to array
        const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k);
        if (keywordArray.length === 0) return <span className="text-gray-400">No keywords</span>;
        
        return (
          <div className="flex flex-wrap gap-1">
            {keywordArray.slice(0, 2).map((keyword, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                {keyword}
              </span>
            ))}
            {keywordArray.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{keywordArray.length - 2} more
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: "Rating",
      accessorKey: "rating",
      icon: Star,
      cell: ({ row }: { row: Row<Dish> }) => {
        const dishId = row.original.id;
        if (!dishId) return <span className="text-gray-400">No ratings</span>;
        const dishReviews = reviews[dishId] || [];
        if (dishReviews.length === 0) return <span className="text-gray-400">No ratings</span>;
        const avgRating = dishReviews.reduce((acc: number, review: Review) => acc + review.rating, 0) / dishReviews.length;
        return (
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="font-medium">{avgRating.toFixed(1)}</span>
          </div>
        );
      }
    },
    {
      header: "Reviews",
      accessorKey: "reviewCount",
      icon: MessageCircle,
      cell: ({ row }: { row: Row<Dish> }) => {
        const dishId = row.original.id;
        if (!dishId) return '0';
        const dishReviews = reviews[dishId] || [];
        return (
          <span className="font-medium">
            {formatNumber(dishReviews.length)}
          </span>
        );
      }
    },
    {
      header: "Created",
      accessorKey: "created_at",
      icon: Calendar,
      render: (created_at: string) => (
        <span className="text-sm text-gray-600">
          {formatDate(created_at)}
        </span>
      )
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dishesResponse, reviewsResponse, restaurantsResponse] = await Promise.all([
          dishesApi.getAll(),
          reviewsApi.getAll(),
          restaurantsApi.getAll()
        ]);
  
        // Set restaurants first for form population
        setRestaurants(restaurantsResponse.data);

        // Pre-format dates before setting state
        const formattedDishes = dishesResponse.data.map(dish => ({
          ...dish,
          created_at: formatDate(dish.created_at),
          updated_at: formatDate(dish.updated_at)
        }));
        
        setDishes(formattedDishes);
        
        // Rest of the review mapping logic remains the same
        const reviewsMap: Record<string, Review[]> = {};
        reviewsResponse.data.forEach(review => {
          const dishId = String(review.dish).split('/').pop()!;
          if (!reviewsMap[dishId]) {
            reviewsMap[dishId] = [];
          }
          reviewsMap[dishId].push(review);
        });
        
        formattedDishes.forEach(dish => {
          if (!reviewsMap[dish.id!]) {
            reviewsMap[dish.id!] = [];
          }
        });
  
        setReviews(reviewsMap);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  
  const handleAdd = async (data: Partial<Dish>) => {
    try {
      setLoading(true);
      
      // Process restaurant selection (extract ID from "Name (ID)" format or Firestore reference)
      let restaurantId = '';
      if (data.restaurant && typeof data.restaurant === 'string' && data.restaurant.includes('(') && data.restaurant.includes(')')) {
        // Extract from "Name (ID)" format from form
        restaurantId = data.restaurant.split('(')[1].split(')')[0];
      } else {
        // Handle Firestore reference or plain ID
        restaurantId = getDocumentId(data.restaurant);
      }

      // Process search keywords if provided from form data
      const formData = data as any; // Cast to any to access form-specific fields
      const searchKeywords = formData.searchKeywords 
        ? (formData.searchKeywords as string).split(',').map((k: string) => k.trim()).filter((k: string) => k)
        : [];

      const now = new Date().toISOString();
      const dishData: Partial<Dish> = {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        section: data.section,
        restaurant: restaurantId,
        image_url: data.image_url || '',
        searchKeywords: searchKeywords.length > 0 ? searchKeywords : undefined,
        created_at: now,
        updated_at: now
      };
      
      const response = await dishesApi.create(dishData);
      
      // Format dates before adding to state
      const formattedDish = {
        ...response.data,
        created_at: formatDate(response.data.created_at),
        updated_at: formatDate(response.data.updated_at)
      };
      
      setDishes(prev => [...prev, formattedDish]);
      setReviews(prev => ({ ...prev, [formattedDish.id!]: [] }));
    } catch (error) {
      console.error('Error adding dish:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updatedData: Dish) => {
    try {
      setLoading(true);
      
      // Process restaurant selection (extract ID from "Name (ID)" format or Firestore reference)
      let restaurantId = '';
      if (updatedData.restaurant && typeof updatedData.restaurant === 'string' && updatedData.restaurant.includes('(') && updatedData.restaurant.includes(')')) {
        // Extract from "Name (ID)" format from form
        restaurantId = updatedData.restaurant.split('(')[1].split(')')[0];
      } else {
        // Handle Firestore reference or plain ID
        restaurantId = getDocumentId(updatedData.restaurant);
      }

      // Process search keywords if provided from form data
      const formData = updatedData as any; // Cast to any to access form-specific fields
      const searchKeywords = formData.searchKeywords 
        ? (formData.searchKeywords as string).split(',').map((k: string) => k.trim()).filter((k: string) => k)
        : [];

      const dishData: Partial<Dish> = {
        ...updatedData,
        restaurant: restaurantId,
        price: Number(updatedData.price),
        searchKeywords: searchKeywords.length > 0 ? searchKeywords : undefined,
        updated_at: new Date().toISOString()
      };
      
      const response = await dishesApi.update(updatedData.id!, dishData);
      
      // Format dates before updating state
      const formattedDish = {
        ...response.data,
        created_at: formatDate(response.data.created_at),
        updated_at: formatDate(response.data.updated_at)
      };
      
      setDishes(prev => prev.map(dish => 
        dish.id === updatedData.id ? formattedDish : dish
      ));
    } catch (error) {
      console.error('Error updating dish:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (data: Dish) => {
    try {
      setLoading(true);
      await dishesApi.delete(data.id!);
      setDishes(prev => prev.filter(dish => dish.id !== data.id));
      setReviews(prev => {
        const newReviews = { ...prev };
        delete newReviews[data.id!];
        return newReviews;
      });
    } catch (error) {
      console.error('Error deleting dish:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats based on all reviews
  const getDishStats = () => {
    const allReviews = Object.values(reviews).flat();
    
    const averageRating = allReviews.length 
      ? allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length 
      : 0;

    const totalReviews = allReviews.length;

    const averagePrice = dishes.length
      ? dishes.reduce((acc, curr) => acc + curr.price, 0) / dishes.length
      : 0;

    return { averageRating, totalReviews, averagePrice };
  };

  const { averageRating, totalReviews, averagePrice } = getDishStats();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Dishes</h1>
        <p className="text-muted-foreground mt-1">Manage menu items and dishes</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Dishes</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(dishes.length)}</div>
            <p className="text-xs text-muted-foreground">Listed dishes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Out of 10.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalReviews)}</div>
            <p className="text-xs text-muted-foreground">Across all dishes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averagePrice.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per dish</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Dishes</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={dishes.map(dish => {
              // Convert restaurant ID back to "Name (ID)" format for form display
              const restaurantId = getDocumentId(dish.restaurant);
              const restaurant = restaurants.find(r => r.id === restaurantId);
              
              return {
                ...dish,
                restaurant: restaurant ? `${restaurant.name} (${restaurant.id})` : restaurantId,
                searchKeywords: dish.searchKeywords?.join(', ') || ''
              };
            })}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            loading={loading}
            formFields={formFields}
          />
        </CardContent>
      </Card>
    </div>
  );
}