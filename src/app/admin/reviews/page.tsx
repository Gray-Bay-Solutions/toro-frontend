"use client"

import { useState, useEffect } from 'react';
import DataTable from '@/components/data-table';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Star, Store, Users, Calendar } from "lucide-react";
import { reviewsApi } from '@/services';
import { Review } from '@/types/admin';

const columns = [
  {
    header: "Restaurant",
    accessorKey: "restaurant_name",
    icon: Store,
    render: (value: string) => value || 'Unknown Restaurant'
  },
  {
    header: "Rating",
    accessorKey: "rating",
    icon: Star,
    render: (value: number) => (
      <div className="flex items-center">
        <span className={`px-2 py-1 rounded-full text-xs
          ${value >= 4 ? 'bg-green-100 text-green-800' : 
            value >= 3 ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'}`}>
          {value?.toFixed(1) || '0.0'}
        </span>
      </div>
    )
  },
  {
    header: "Review",
    accessorKey: "comment",
    icon: MessageCircle,
    render: (value: string) => (
      <div className="max-w-md truncate">{value || 'No comment'}</div>
    )
  },
  {
    header: "Reviewer",
    accessorKey: "author",
    icon: Users,
    render: (value: any) => (
      <div className="flex items-center gap-2">
        <span>{value?.name || 'Anonymous'}</span>
        {value?.is_verified && (
          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
            Verified
          </span>
        )}
      </div>
    )
  },
  {
    header: "Source",
    accessorKey: "source",
    render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'google' ? 'bg-green-100 text-green-800' : 
        'bg-purple-100 text-purple-800'
      }`}>
        {(value || 'UNKNOWN').toUpperCase()}
      </span>
    )
  },
  {
    header: "Date",
    accessorKey: "timestamp",
    icon: Calendar,
    render: (value: Date) => {
      try {
        return new Date(value).toLocaleDateString();
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
  const verifiedReviews = reviews.filter(r => r?.author?.is_verified).length;

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