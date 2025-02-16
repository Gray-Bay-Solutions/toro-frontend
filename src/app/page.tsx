"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Star, MapPin, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LandingPage() {
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const logoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const handleLogoHover = () => {
    logoTimeoutRef.current = setTimeout(() => {
      setIsAdminModalOpen(true);
    }, 2500);
  };

  const handleLogoHoverEnd = () => {
    if (logoTimeoutRef.current) {
      clearTimeout(logoTimeoutRef.current);
    }
  };

  const handleAdminLogin = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error('Invalid password');
      }

      router.push('/admin');
    } catch (error) {
      toast.error('Invalid admin credentials');
    } finally {
      setIsLoading(false);
      setPassword("");
      setIsAdminModalOpen(false);
    }
  };

  const handleStoreClick = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setIsComingSoonOpen(true);
  };

  return (
    <div className="min-h-screen bg-custom-yellow text-custom-brown">
      {/* Hero Section - Full Height */}
      <section className="h-screen relative flex flex-col">
        {/* Logo Text */}
        <div className="absolute top-8 left-8">
          <h1 className="text-2xl font-bold text-custom-brown">TORO</h1>
        </div>

        {/* Centered Logo */}
        <div className="flex-1 flex items-center justify-center">
          <div
            className="relative"
            onMouseEnter={handleLogoHover}
            onMouseLeave={handleLogoHoverEnd}
          >
            <div className="w-[min(80vw,24rem)] h-[min(80vw,24rem)] relative cursor-pointer">
              <Image
                src="/logo.png"
                alt="ToroEats Logo"
                fill
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center animate-bounce">
          <ChevronDown className="h-8 w-8 text-custom-brown opacity-50" />
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <Search className="h-12 w-12 text-custom-brown mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-custom-brown">
                Discover Local Gems
              </h3>
              <p className="text-custom-brown/80">
                Find hidden culinary treasures in your neighborhood, from
                authentic street food to fine dining.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <Star className="h-12 w-12 text-custom-brown mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-custom-brown">
                Trusted Reviews
              </h3>
              <p className="text-custom-brown/80">
                Read honest reviews from real food enthusiasts to find the
                perfect dining spot.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <MapPin className="h-12 w-12 text-custom-brown mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-custom-brown">
                Easy Navigation
              </h3>
              <p className="text-custom-brown/80">
                Find restaurants near you with detailed directions and essential
                information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* App Store Link */}
      <section className="py-16 bg-custom-yellow">
        <div className="container mx-auto px-4 text-center">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-custom-brown">
              Get the Toro App
            </h3>
            <div className="flex justify-center space-x-4">
              <a
                href="#"
                className="h-14 hover:opacity-80 transition-opacity"
                onClick={handleStoreClick}
              >
                <Image
                  src="/app-store-badge.png"
                  alt="Download on the App Store"
                  width={156}
                  height={56}
                  className="h-14 w-auto"
                />
              </a>
              <a
                href="#"
                className="h-14 hover:opacity-80 transition-opacity"
                onClick={handleStoreClick}
              >
                <Image
                  src="/play-store-badge.png"
                  alt="Get it on Google Play"
                  width={156}
                  height={56}
                  className="h-14 w-auto"
                />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-custom-brown/20 py-12 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="h-8 w-32 relative">
              <Image
                src="/logo.png"
                alt="ToroEats Logo"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
            <div className="flex space-x-6 text-sm mt-4 md:mt-0">
              <a
                href="#"
                className="text-custom-brown/70 hover:text-custom-brown"
              >
                About
              </a>
              <a
                href="#"
                className="text-custom-brown/70 hover:text-custom-brown"
              >
                Contact
              </a>
              <a
                href="#"
                className="text-custom-brown/70 hover:text-custom-brown"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-custom-brown/70 hover:text-custom-brown"
              >
                Terms
              </a>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-custom-brown/60">
            © {new Date().getFullYear()} Toro Technologies LLC. All rights
            reserved.
          </div>
        </div>
      </footer>

      {/* Admin Login Modal */}
      <Dialog open={isAdminModalOpen} onOpenChange={setIsAdminModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-custom-brown">
              Admin Access
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdminLogin} className="space-y-4 py-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Loading..." : "Access Admin Panel"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Coming Soon Dialog */}
      <Dialog open={isComingSoonOpen} onOpenChange={setIsComingSoonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Coming Soon!</DialogTitle>
          </DialogHeader>
          <p className="text-center text-lg text-custom-brown/80">
            The Toro app will be available in the App Store soon. We&apos;re working hard to bring you the best experience possible!
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
