"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowUpCircle, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCcw,
  Search,
  Database,
  Globe
} from "lucide-react";

export default function Home() {
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [currentCity, setCurrentCity] = useState("San Francisco");

  const cities = [
    { value: "san-francisco", label: "San Francisco" },
    { value: "los-angeles", label: "Los Angeles" },
    { value: "new-york", label: "New York" },
    { value: "chicago", label: "Chicago" },
    { value: "miami", label: "Miami" },
    { value: "seattle", label: "Seattle" },
  ];

  const handleCityChange = (value) => {
    const cityName = cities.find(city => city.value === value)?.label || value;
    setCurrentCity(cityName);
    setIsScrapingActive(false); // Reset scraping state when city changes
  };

  const handleStartScraping = () => {
    setIsScrapingActive(true);
    // Add your scraping logic here
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Restaurants</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">123</div>
            <p className="text-xs text-muted-foreground">+5 from last scrape</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,345</div>
            <p className="text-xs text-muted-foreground">+89 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cities Covered</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">Across 3 countries</p>
          </CardContent>
        </Card>
      </div>

      {/* Scraping Controls */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Scraping Status</CardTitle>
            <CardDescription>Current data collection status and controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className={`h-3 w-3 rounded-full ${isScrapingActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
              <span className="text-sm">
                {isScrapingActive ? 'Scraping in progress' : 'Scraper inactive'}
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select City</label>
                <Select onValueChange={handleCityChange} defaultValue="san-francisco">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Available Cities</SelectLabel>
                      {cities.map((city) => (
                        <SelectItem key={city.value} value={city.value}>
                          {city.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between text-sm">
                <span>Current city:</span>
                <span className="font-medium">{currentCity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Last run:</span>
                <span className="font-medium">2 hours ago</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Success rate:</span>
                <span className="font-medium">98%</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={handleStartScraping}
                disabled={isScrapingActive}
                className="w-full"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                {isScrapingActive ? `Scraping ${currentCity}...` : `Start Scraping ${currentCity}`}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest scraping operations and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { icon: CheckCircle2, color: "text-green-500", text: "Successfully scraped 50 restaurants in San Francisco" },
                { icon: Clock, color: "text-blue-500", text: "Scheduled scraping for Seattle tomorrow" },
                { icon: AlertCircle, color: "text-yellow-500", text: "Rate limit reached for New York City" },
                { icon: Search, color: "text-gray-500", text: "Started indexing new restaurants" }
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-2">
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scraping Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Scraping Queue</CardTitle>
          <CardDescription>Upcoming cities and priorities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 text-sm font-medium">
              <div>City</div>
              <div>Status</div>
              <div>Last Updated</div>
              <div>Priority</div>
            </div>
            {[
              { city: "Los Angeles", status: "Pending", lastUpdated: "3 days ago", priority: "High" },
              { city: "Chicago", status: "Queued", lastUpdated: "1 week ago", priority: "Medium" },
              { city: "Miami", status: "Scheduled", lastUpdated: "5 days ago", priority: "Low" },
            ].map((item, i) => (
              <div key={i} className="grid grid-cols-4 gap-4 text-sm">
                <div>{item.city}</div>
                <div>{item.status}</div>
                <div>{item.lastUpdated}</div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs
                    ${item.priority === 'High' ? 'bg-red-100 text-red-800' : 
                      item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'}`}>
                    {item.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}