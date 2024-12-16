"use client"
import React, {ReactNode} from 'react';
import { 
  Home,
  LogOut,
  MapPin,
  Utensils,
  Store,
  Star,
  Users
} from 'lucide-react';
import { cn } from "@/lib/utils";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface AdminLayoutProps {
  children: ReactNode;
}

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  
  const routes = [
    { name: 'Dashboard', icon: Home, path: '/admin' },
    { name: 'Cities', icon: MapPin, path: '/admin/cities' },
    { name: 'Dishes', icon: Utensils, path: '/admin/dishes' },
    { name: 'Restaurants', icon: Store, path: '/admin/restaurants' },
    { name: 'Reviews', icon: Star, path: '/admin/reviews' },
    { name: 'Users', icon: Users, path: '/admin/users' },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="h-full w-56 flex flex-col fixed left-0 top-0 border-r bg-background">
      <div className="p-6">
        <h1 className="text-lg font-semibold">Toro Admin</h1>
      </div>
      <div className="flex flex-col space-y-1 p-4">
        {routes.map((route) => (
          <Link
            key={route.path}
            href={route.path}
            className={cn(
              "flex items-center gap-x-2 text-sm px-3 py-2 rounded-md transition-colors",
              pathname === route.path 
                ? "bg-secondary" 
                : "hover:bg-secondary/50"
            )}
          >
            <route.icon size={20} />
            {route.name}
          </Link>
        ))}
      </div>
      <div className="p-4 border-t">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-x-2 text-sm px-3 py-2 rounded-md hover:bg-secondary/50 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="pl-56 h-full">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;