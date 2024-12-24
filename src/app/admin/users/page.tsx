"use client"

import { useState, useEffect } from 'react';
import DataTable from '@/components/data-table';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, Phone, MapPin, Calendar, CheckCircle } from "lucide-react";
import { usersApi } from '@/services';

interface User {
  uid: string;
  created_time: Date;
  display_name: string;
  email: string;
  location_enabled: boolean;
  phone_number: string;
  photo_url: string;
}

const columns = [
  {
    header: "Name",
    accessorKey: "display_name",
    icon: Users,
    render: (value: string) => value || 'Anonymous User'
  },
  {
    header: "Email",
    accessorKey: "email",
    icon: Mail,
    render: (value: string) => value || 'No email'
  },
  {
    header: "Phone",
    accessorKey: "phone_number",
    icon: Phone,
    render: (value: string) => value || 'No phone'
  },
  {
    header: "Location",
    accessorKey: "location_enabled",
    icon: MapPin,
    render: (value: boolean) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {value ? 'Enabled' : 'Disabled'}
      </span>
    )
  },
  {
    header: "Joined",
    accessorKey: "created_time",
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

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await usersApi.getAll();
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (data: { uid?: string }) => {
    try {
      if (!data.uid) return;
      await usersApi.delete(data.uid);
      setUsers(users.filter(u => u.uid !== data.uid));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Calculate stats
  const totalUsers = users.length;
  const locationEnabled = users.filter(u => u.location_enabled).length;
  const verifiedEmails = users.filter(u => u.email).length;
  const verifiedPhones = users.filter(u => u.phone_number).length;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground mt-1">Manage user accounts and settings</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Location Enabled</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : locationEnabled}
            </div>
            <p className="text-xs text-muted-foreground">Using location services</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Verified Emails</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : verifiedEmails}
            </div>
            <p className="text-xs text-muted-foreground">With email addresses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Verified Phones</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : verifiedPhones}
            </div>
            <p className="text-xs text-muted-foreground">With phone numbers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Users</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={users}
            onAdd={() => {}}  // Users can't be added from admin
            onUpdate={() => {}}  // Users can't be edited from admin
            onDelete={handleDelete}
            loading={loading}
            pageSize={25}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPage;