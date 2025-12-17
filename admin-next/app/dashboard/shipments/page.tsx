/**
 * SHIPMENTS PAGE - View Shipments
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
import { get } from '@/lib/api/client';
import { Shipment } from '@/types/common';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

const STATUS_VARIANTS: Record<Shipment['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  shipped: 'default',
  in_transit: 'default',
  delivered: 'outline',
  returned: 'destructive',
};

const STATUS_LABELS: Record<Shipment['status'], string> = {
  pending: 'In afwachting',
  shipped: 'Verzonden',
  in_transit: 'Onderweg',
  delivered: 'Afgeleverd',
  returned: 'Geretourneerd',
};

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    try {
      setIsLoading(true);
      const shipments = await get<Shipment[]>('/admin/shipments');
      setShipments(shipments);
    } catch (error: any) {
      console.error('Load shipments error:', error);
      toast.error('Fout bij laden van verzendingen');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Verzendingen</h1>
        <p className="text-muted-foreground">
          Track & trace overzicht
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alle Verzendingen</CardTitle>
          <CardDescription>
            {shipments.length} {shipments.length === 1 ? 'verzending' : 'verzendingen'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : shipments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Geen verzendingen gevonden
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking Number</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Vervoerder</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verzonden</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-mono text-sm">
                      {shipment.trackingNumber}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {shipment.orderId}
                    </TableCell>
                    <TableCell>
                      {shipment.carrier}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANTS[shipment.status]}>
                        {STATUS_LABELS[shipment.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {shipment.shippedAt ? format(new Date(shipment.shippedAt), 'dd MMM yyyy', { locale: nl }) : '-'}
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

