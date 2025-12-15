"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, Settings, LogOut, Users, TrendingUp } from "lucide-react";
import { apiFetch, API_CONFIG } from "@/lib/config";

/**
 * Admin Dashboard - DRY & Protected
 * Overzicht van producten, orders, etc.
 */
export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');

    if (!token || !userData) {
      router.push('/admin');
      return;
    }

    setUser(JSON.parse(userData));
    
    // Fetch stats
    fetchStats(token);
  }, [router]);

  const fetchStats = async (token: string) => {
    try {
      // Fetch products count
      const products = await apiFetch<any[]>(API_CONFIG.ENDPOINTS.PRODUCTS, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch orders count (indien beschikbaar)
      const orders = await apiFetch<any[]>(`${API_CONFIG.ENDPOINTS.ADMIN}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => []);

      setStats({
        products: Array.isArray(products) ? products.length : 0,
        orders: Array.isArray(orders) ? orders.length : 0,
        revenue: 0, // TODO: Calculate from orders
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welkom terug, {user?.firstName || 'Admin'}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              leftIcon={<LogOut className="h-4 w-4" />}
            >
              Uitloggen
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Producten</p>
                <p className="text-3xl font-bold text-gray-900">{stats.products}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Orders</p>
                <p className="text-3xl font-bold text-gray-900">{stats.orders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Omzet</p>
                <p className="text-3xl font-bold text-gray-900">€{stats.revenue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Snelle acties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              leftIcon={<Package className="h-5 w-5" />}
            >
              <div className="text-left">
                <p className="font-semibold">Producten</p>
                <p className="text-xs text-gray-500">Beheer producten</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              leftIcon={<ShoppingCart className="h-5 w-5" />}
            >
              <div className="text-left">
                <p className="font-semibold">Orders</p>
                <p className="text-xs text-gray-500">Bekijk bestellingen</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              leftIcon={<Users className="h-5 w-5" />}
            >
              <div className="text-left">
                <p className="font-semibold">Klanten</p>
                <p className="text-xs text-gray-500">Klantenlijst</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              leftIcon={<Settings className="h-5 w-5" />}
            >
              <div className="text-left">
                <p className="font-semibold">Instellingen</p>
                <p className="text-xs text-gray-500">Site configuratie</p>
              </div>
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Backend status:</strong> Draait op {API_CONFIG.BASE_URL}
          </p>
        </div>
      </main>
    </div>
  );
}
