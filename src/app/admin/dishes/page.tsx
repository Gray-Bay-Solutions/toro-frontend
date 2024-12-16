"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTable from '@/components/data-table';
import { Utensils, Star, DollarSign, MessageCircle } from "lucide-react";
import { dishesApi } from '@/services/dishes';
import type { Dish } from "@/types/admin";

export default function DishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
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
      header: "Price",
      accessorKey: "price",
      icon: DollarSign,
      isNumber: true,
      render: (value: string) => `$${parseFloat(value).toFixed(2)}`
    },
    {
      header: "Rating",
      accessorKey: "rating",
      icon: Star,
      isNumber: true,
      render: (value: number) => value.toFixed(1)
    },
    {
      header: "Reviews",
      accessorKey: "review_count",
      icon: MessageCircle,
      isNumber: true
    }
  ];

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const response = await dishesApi.getAll();
        setDishes(response.data);
      } catch (error) {
        console.error('Error fetching dishes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, []);

  const handleAdd = async (data: Partial<Dish>) => {
    try {
      setLoading(true);
      const response = await dishesApi.create(data);
      setDishes(prev => [...prev, response.data]);
    } catch (error) {
      console.error('Error adding dish:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updatedData: Dish) => {
    try {
      setLoading(true);
      const response = await dishesApi.update(updatedData.id!, updatedData);
      setDishes(prev => prev.map(dish => 
        dish.id === updatedData.id ? response.data : dish
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
    } catch (error) {
      console.error('Error deleting dish:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const averageRating = dishes.length 
    ? dishes.reduce((acc, curr) => acc + curr.rating, 0) / dishes.length 
    : 0;
  const totalReviews = dishes.reduce((acc, curr) => acc + curr.review_count, 0);
  const averagePrice = dishes.length
    ? dishes.reduce((acc, curr) => acc + curr.price, 0) / dishes.length
    : 0;

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
            <div className="text-2xl font-bold">{dishes.length}</div>
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
            <p className="text-xs text-muted-foreground">Out of 5.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviews.toLocaleString()}</div>
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