"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTable from '@/components/data-table';
import { Globe, RefreshCcw, MapPin } from "lucide-react";
import { citiesApi } from '@/services';
import { City } from '@/types/admin';

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    {
      header: "City",
      accessorKey: "name",
      icon: MapPin
    },
    {
      header: "State",
      accessorKey: "state"
    },
    {
      header: "State Code",
      accessorKey: "state_code"
    },
    {
      header: "Total Restaurants",
      accessorKey: "totalRestaurants",
      isNumber: true
    },
    {
      header: "Status",
      accessorKey: "status",
      isStatus: true
    }
  ];

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await citiesApi.getAll();
        setCities(response.data);
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  const handleAdd = async (data: Partial<City>) => {
    try {
      setLoading(true);
      const newCity = {
        ...data,
        location: { latitude: 0, longitude: 0 },
        restaurants: [],
        status: 'Pending',
        totalRestaurants: 0,
        lastScraped: null
      };
      const response = await citiesApi.create(newCity);
      setCities(prev => [...prev, response.data]);
    } catch (error) {
      console.error('Error adding city:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updatedData: City) => {
    try {
      setLoading(true);
      const response = await citiesApi.update(updatedData.id!, updatedData);
      setCities(prev => prev.map(city => 
        city.id === updatedData.id ? response.data : city
      ));
    } catch (error) {
      console.error('Error updating city:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (data: City) => {
    try {
      setLoading(true);
      await citiesApi.delete(data.id!);
      setCities(prev => prev.filter(city => city.id !== data.id));
    } catch (error) {
      console.error('Error deleting city:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartScraping = async (cityId: string) => {
    try {
      await citiesApi.startScraping(cityId);
      // Update city status in the UI
      setCities(prev => prev.map(city => 
        city.id === cityId ? { ...city, status: 'Scraping' } : city
      ));
    } catch (error) {
      console.error('Error starting scraping:', error);
    }
  };

  const handleStopScraping = async (cityId: string) => {
    try {
      await citiesApi.stopScraping(cityId);
      // Update city status in the UI
      setCities(prev => prev.map(city => 
        city.id === cityId ? { ...city, status: 'Active' } : city
      ));
    } catch (error) {
      console.error('Error stopping scraping:', error);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Cities</h1>
        <p className="text-muted-foreground mt-1">Manage cities and their scraping settings</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Cities</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cities.length}</div>
            <p className="text-xs text-muted-foreground">Across multiple states</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Cities</CardTitle>
            <RefreshCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cities.filter(c => c.status === 'Active').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Restaurants</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cities.reduce((acc, city) => acc + (city.restaurants?.length || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across all cities</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Cities</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={cities}
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