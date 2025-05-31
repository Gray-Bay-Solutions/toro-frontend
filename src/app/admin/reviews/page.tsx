"use client"

import { useState, useEffect } from 'react';
import DataTable from '@/components/data-table';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Star, Store, Users, Calendar, User } from "lucide-react";
import { reviewsApi } from '@/services';
import { Review } from '@/types/admin';
import type { Row } from '@tanstack/react-table';
import Image from 'next/image';
const columns = [
  {
    header: "Dish",
    accessorKey: "dish",
    icon: Store,
    render: (dish: any) => (
      <div className="flex flex-col">
        <span className="font-medium">{dish.name}</span>
        <span className="text-xs text-muted-foreground">{dish.restaurant.name}</span>
      </div>
    )
  },
  {
    header: "Rating",
    accessorKey: "rating",
    icon: Star,
    render: (value: number) => (
      <div className="flex items-center">
        <span className={`px-2 py-1 rounded-full text-xs ${
          value >= 7 ? 'bg-green-100 text-green-800' :
          value >= 5 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value?.toFixed(1) || '0'}
        </span>
      </div>
    )
  },
  {
    header: "Comment",
    accessorKey: "comment",
    icon: MessageCircle,
    render: (value: string) => (
      <div className="max-w-md truncate">{value || 'No comment'}</div>
    )
  },
  {
    header: "Author",
    accessorKey: "author_name",
    icon: Users,
    cell: ({ row }: { row: Row<Review> }) => (
      <div className="flex items-center gap-2">
        {row.original.profile_photo_url && (
          <Image 
            src={row.original.profile_photo_url} 
            alt={row.original.author_name}
            className="w-6 h-6 rounded-full"
            width={24}
            height={24}
          />
        )}
        <span>{row.original.author_name || 'Anonymous'}</span>
      </div>
    )
  },
  {
    header: "Source",
    accessorKey: "source",
    render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'toro' ? 'bg-purple-100 text-purple-800' :
        'bg-green-100 text-green-800'
      }`}>
        {(value || 'UNKNOWN').toUpperCase()}
      </span>
    )
  },
  {
    header: "Date",
    accessorKey: "timestamp",
    icon: Calendar,
    render: (value: { _seconds: number; _nanoseconds: number }) => {
      try {
        const date = new Date(value._seconds * 1000);
        return date.toLocaleDateString();
      } catch {
        return 'Invalid date';
      }
    }
  }
];

const ReviewsPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await reviewsApi.getAll();
        setReviews(response.data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleDelete = async (data: { id?: string }) => {
    try {
      if (!data.id) return;
      await reviewsApi.delete(data.id);
      setReviews(reviews.filter(r => r.id !== data.id));
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  // Calculate stats with safe checks
  const averageRating = reviews.length 
    ? reviews.reduce((acc, curr) => acc + (curr?.rating || 0), 0) / reviews.length 
    : 0;
  const totalReviews = reviews.length;
  const appReviews = reviews.filter(r => r?.source === 'app').length;
  const verifiedReviews = reviews.length;  // Fix this with real logic

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Reviews</h1>
        <p className="text-muted-foreground mt-1">Manage customer reviews and ratings</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : totalReviews}
            </div>
            <p className="text-xs text-muted-foreground">All reviews</p>
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
            <CardTitle className="text-sm font-medium">App Reviews</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : appReviews}
            </div>
            <p className="text-xs text-muted-foreground">From mobile app</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Verified Reviews</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : verifiedReviews}
            </div>
            <p className="text-xs text-muted-foreground">Verified customers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={reviews}
            onAdd={() => {}}
            onUpdate={() => {}}
            onDelete={handleDelete}
            loading={loading}
            pageSize={25}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsPage;