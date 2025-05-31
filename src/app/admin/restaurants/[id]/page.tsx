"use client"

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Plus, Utensils, DollarSign } from "lucide-react";
import { restaurantsApi, dishesApi } from '@/services';
import { Restaurant } from '@/types/admin';
import DataTable from '@/components/data-table';

interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  imageUrl?: string;
  restaurantId: string;
}

const dishColumns = [
  {
    header: "Name",
    accessorKey: "name",
    icon: Utensils
  },
  {
    header: "Description",
    accessorKey: "description",
    render: (description: string) => (
      <span className="max-w-xs truncate" title={description}>
        {description}
      </span>
    )
  },
  {
    header: "Price",
    accessorKey: "price",
    icon: DollarSign,
    render: (price: number) => `$${price.toFixed(2)}`
  },
  {
    header: "Category",
    accessorKey: "category"
  },
  {
    header: "Available",
    accessorKey: "isAvailable",
    render: (isAvailable: boolean) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isAvailable ? 'Available' : 'Unavailable'}
      </span>
    )
  }
];

const dishFormFields = [
  { key: 'name', label: 'Dish Name', type: 'text' as const, required: true },
  { key: 'description', label: 'Description', type: 'textarea' as const, required: true },
  { key: 'price', label: 'Price', type: 'number' as const, required: true },
  { 
    key: 'category', 
    label: 'Category', 
    type: 'select' as const, 
    options: ['Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Side'],
    required: true
  },
  { key: 'imageUrl', label: 'Image URL', type: 'url' as const },
  { key: 'isAvailable', label: 'Available', type: 'checkbox' as const }
];

const RestaurantDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const restaurantId = params.id as string;
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch restaurant and dishes data
        const [restaurantResponse, dishesResponse] = await Promise.all([
          restaurantsApi.getAll(),
          dishesApi.getByRestaurant(restaurantId)
        ]);
        
        const foundRestaurant = restaurantResponse.data.find((r: Restaurant) => r.id === restaurantId);
        setRestaurant(foundRestaurant || null);
        
        // Transform API dishes to match local interface
        const transformedDishes: Dish[] = dishesResponse.data.map((dish: any) => ({
          id: dish.id || `dish_${Date.now()}_${Math.random()}`,
          name: dish.name,
          description: dish.description,
          price: dish.price,
          category: dish.section || 'Main Course', // Map section to category
          isAvailable: true, // Default to available since API doesn't have this field
          imageUrl: dish.image_url,
          restaurantId: restaurantId
        }));
        
        setDishes(transformedDishes);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      fetchData();
    }
  }, [restaurantId]);

  const handleSaveRestaurant = async () => {
    if (!restaurant) return;
    
    setSaving(true);
    try {
      await restaurantsApi.update(restaurant.id, restaurant);
      // Show success message
    } catch (error) {
      console.error('Error saving restaurant:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddDish = async (dishData: any) => {
    try {
      const newDish: Dish = {
        ...dishData,
        id: `dish_${Date.now()}`,
        restaurantId,
        price: Number(dishData.price),
        isAvailable: Boolean(dishData.isAvailable)
      };
      setDishes([...dishes, newDish]);
      // In real app, make API call to save dish
    } catch (error) {
      console.error('Error adding dish:', error);
    }
  };

  const handleUpdateDish = async (dishData: any) => {
    try {
      const updatedDish = {
        ...dishData,
        price: Number(dishData.price),
        isAvailable: Boolean(dishData.isAvailable)
      };
      setDishes(dishes.map(dish => dish.id === dishData.id ? updatedDish : dish));
      // In real app, make API call to update dish
    } catch (error) {
      console.error('Error updating dish:', error);
    }
  };

  const handleDeleteDish = async (dishData: { id: string }) => {
    try {
      setDishes(dishes.filter(dish => dish.id !== dishData.id));
      // In real app, make API call to delete dish
    } catch (error) {
      console.error('Error deleting dish:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Restaurant not found</h1>
          <p className="text-gray-600 mt-2">The restaurant you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{restaurant.name}</h1>
        </div>
        <Button onClick={handleSaveRestaurant} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Restaurant Details</TabsTrigger>
          <TabsTrigger value="menu">Menu Items</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Restaurant Name *</Label>
                  <Input
                    id="name"
                    value={restaurant.name || ''}
                    onChange={(e) => setRestaurant({...restaurant, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={restaurant.phone || ''}
                    onChange={(e) => setRestaurant({...restaurant, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={restaurant.website || ''}
                    onChange={(e) => setRestaurant({...restaurant, website: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={restaurant.status || ''} 
                    onValueChange={(value) => setRestaurant({...restaurant, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Input
                    id="address"
                    value={restaurant.addressFull || ''}
                    onChange={(e) => setRestaurant({...restaurant, addressFull: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="categories">Categories</Label>
                  <Textarea
                    id="categories"
                    value={restaurant.categories?.join(', ') || ''}
                    onChange={(e) => setRestaurant({
                      ...restaurant, 
                      categories: e.target.value.split(',').map(c => c.trim())
                    })}
                    placeholder="Italian, Pizza, Fine Dining"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verified"
                    checked={restaurant.is_verified}
                    onCheckedChange={(checked) => setRestaurant({...restaurant, is_verified: Boolean(checked)})}
                  />
                  <Label htmlFor="verified">Verified</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sponsored"
                    checked={restaurant.is_sponsored}
                    onCheckedChange={(checked) => setRestaurant({...restaurant, is_sponsored: Boolean(checked)})}
                  />
                  <Label htmlFor="sponsored">Sponsored</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu">
          <Card>
            <CardHeader>
              <CardTitle>Menu Management</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={dishColumns}
                data={dishes}
                onAdd={handleAddDish}
                onUpdate={handleUpdateDish}
                onDelete={handleDeleteDish}
                formFields={dishFormFields}
                loading={false}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RestaurantDetailPage; 