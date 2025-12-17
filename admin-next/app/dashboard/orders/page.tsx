'use client';

import { useEffect, useState } from 'react';
import { get } from '@/lib/api/client';
import { ShoppingCart, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await get<Order[]>('/admin/orders');
      setOrders(response);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Fout bij ophalen bestellingen');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bestellingen</h1>
        <p className="text-muted-foreground">Beheer klantbestellingen</p>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Order #</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Klant</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Datum</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Bedrag</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Geen bestellingen gevonden</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-sm">
                      {order.user ? (
                        <div>
                          <div className="font-medium">
                            {order.user.firstName} {order.user.lastName}
                          </div>
                          <div className="text-muted-foreground text-xs">{order.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Gast</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('nl-NL')}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      €{order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <button
                          className="p-2 hover:bg-muted rounded-md transition-colors"
                          title="Bekijken"
                          onClick={() => toast.info('Order details nog niet geïmplementeerd')}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Totaal: {orders.length} bestelling{orders.length !== 1 ? 'en' : ''}
      </div>
    </div>
  );
}

