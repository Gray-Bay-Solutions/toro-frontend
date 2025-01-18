"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTable from '@/components/data-table';
import { Utensils, Star, DollarSign, MessageCircle, Calendar } from "lucide-react";
import { dishesApi, reviewsApi } from '@/services';
import type { Dish, Review } from "@/types/admin";
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

export default function DishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [reviews, setReviews] = useState<Record<string, Review[]>>({});
  const [loading, setLoading] = useState(true);

  const columns = [
    {
      header: "Name",
      accessorKey: "name",
      icon: Utensils
    },
    {
      header: "Description",
      accessorKey: "description"
    },
    {
      header: "Section",
      accessorKey: "section"
    },
    {
      header: "Price",
      accessorKey: "price",
      icon: DollarSign,
      isNumber: true,
      cell: ({ row }: { row: Row<Dish> }) => `$${row.original.price.toFixed(2)}`
    },
    {
      header: "Rating",
      accessorKey: "rating",
      icon: Star,
      cell: ({ row }: { row: Row<Dish> }) => {
        const dishId = row.original.id;
        const dishReviews = reviews[dishId] || [];
        if (dishReviews.length === 0) return 'No ratings';
        const avgRating = dishReviews.reduce((acc, review) => acc + review.rating, 0) / dishReviews.length;
        return avgRating.toFixed(1);
      }
    },
    {
      header: "Reviews",
      accessorKey: "reviewCount",
      icon: MessageCircle,
      cell: ({ row }: { row: Row<Dish> }) => {
        const dishId = row.original.id;
        const dishReviews = reviews[dishId] || [];
        return formatNumber(dishReviews.length);
      }
    },
    {
      header: "Created",
      accessorKey: "created_at",
      icon: Calendar,
      cell: ({ row }: { row: Row<Dish> }) => formatDate(row.original.created_at)
    },
    {
      header: "Updated",
      accessorKey: "updated_at",
      icon: Calendar,
      cell: ({ row }: { row: Row<Dish> }) => formatDate(row.original.updated_at)
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dishesResponse, reviewsResponse] = await Promise.all([
          dishesApi.getAll(),
          reviewsApi.getAll()
        ]);
  
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
      const now = new Date().toISOString();
      const response = await dishesApi.create({
        ...data,
        created_at: now,
        updated_at: now
      });
      
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
      const response = await dishesApi.update(updatedData.id!, {
        ...updatedData,
        updated_at: new Date().toISOString()
      });
      
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
            data={dishes}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}