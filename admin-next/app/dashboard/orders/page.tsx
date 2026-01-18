/**
 * ORDERS PAGE - View & Manage Orders
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { getOrders } from '@/lib/api/orders';
import { Order } from '@/types/common';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

// DRY: Status badge variants
const STATUS_VARIANTS: Record<Order['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  processing: 'default',
  shipped: 'default',
  delivered: 'outline',
  cancelled: 'destructive',
};

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'In afwachting',
  processing: 'Verwerken',
  shipped: 'Verzonden',
  delivered: 'Afgeleverd',
  cancelled: 'Geannuleerd',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const response = await getOrders();
      
      // ✅ FIX: Check response structure
      if (response && response.data) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
    } catch (error: any) {
      // ✅ FIX: Comprehensive error logging (NO empty {})
      const errorDetails = {
        message: error.message || 'Unknown error',
        status: error.status || error.response?.status || 0,
        url: error.url || error.config?.url || '/orders',
        data: error.details || error.response?.data || error,
      };
      
      console.error('Load orders error:', errorDetails);
      
      // ✅ FIX: User-friendly error messages based on status
      let errorMessage = 'Fout bij laden van bestellingen';
      
      if (errorDetails.status === 0) {
        errorMessage = 'Kan geen verbinding maken met de server. Is de backend actief?';
      } else if (errorDetails.status === 401) {
        errorMessage = 'Niet geautoriseerd. Log opnieuw in.';
      } else if (errorDetails.status === 404) {
        errorMessage = 'Orders endpoint niet gevonden. Check backend configuratie.';
      } else if (errorDetails.status >= 500) {
        errorMessage = 'Server fout. Probeer het later opnieuw.';
      } else if (errorDetails.message) {
        errorMessage = errorDetails.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bestellingen</h1>
        <p className="text-muted-foreground">
          Bekijk en beheer klantbestellingen
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alle Bestellingen</CardTitle>
          <CardDescription>
            {orders.length} {orders.length === 1 ? 'bestelling' : 'bestellingen'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Geen bestellingen gevonden
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bestelnummer</TableHead>
                  <TableHead>Klant</TableHead>
                  <TableHead>Totaal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead className="text-right">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName || 'Onbekend'}</p>
                        <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      € {order.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANTS[order.status]}>
                        {STATUS_LABELS[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), 'dd MMM yyyy', { locale: nl })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/dashboard/orders/${order.id}`}>
                        <Button variant="outline" size="sm">
                          Bekijk Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

