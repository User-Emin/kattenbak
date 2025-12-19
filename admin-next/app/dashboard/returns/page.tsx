'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api/admin-client';
import { Package, Eye, Mail } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Return {
  id: string;
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  myparcelId?: number;
  trackingCode?: string;
  reason: string;
  reasonDetails?: string;
  status: string;
  items: any[];
  refundAmount?: number;
  emailSentAt?: string;
  createdAt: string;
}

export default function ReturnsPage() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.get<{success: boolean; data: Return[]}>('/returns');
      setReturns(response.data || []);
    } catch (error: any) {
      console.error('Error fetching returns:', error);
      toast.error('Fout bij ophalen retours');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      REQUESTED: 'bg-yellow-100 text-yellow-800',
      LABEL_CREATED: 'bg-blue-100 text-blue-800',
      LABEL_SENT: 'bg-cyan-100 text-cyan-800',
      IN_TRANSIT: 'bg-purple-100 text-purple-800',
      RECEIVED: 'bg-indigo-100 text-indigo-800',
      INSPECTED: 'bg-pink-100 text-pink-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      REFUND_PENDING: 'bg-orange-100 text-orange-800',
      REFUND_PROCESSED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      DEFECTIVE: 'Defect',
      WRONG_ITEM: 'Verkeerd artikel',
      NOT_AS_DESCRIBED: 'Niet zoals beschreven',
      CHANGED_MIND: 'Van gedachten veranderd',
      DAMAGED_SHIPPING: 'Beschadigd tijdens verzending',
      OTHER: 'Anders',
    };
    return labels[reason] || reason;
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
        <h1 className="text-3xl font-bold tracking-tight">Retours</h1>
        <p className="text-muted-foreground">Beheer retour aanvragen</p>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Retour ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Order</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Klant</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Reden</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Datum</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Bedrag</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Email</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {returns.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Geen retours gevonden</p>
                  </td>
                </tr>
              ) : (
                returns.map((returnRecord) => (
                  <tr key={returnRecord.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono">
                      {returnRecord.id.substring(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">{returnRecord.orderNumber}</div>
                      {returnRecord.trackingCode && (
                        <div className="text-xs text-muted-foreground font-mono">
                          {returnRecord.trackingCode}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">{returnRecord.customerName}</div>
                      <div className="text-xs text-muted-foreground">
                        {returnRecord.customerEmail}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">{getReasonLabel(returnRecord.reason)}</div>
                      {returnRecord.reasonDetails && (
                        <div className="text-xs text-muted-foreground max-w-[200px] truncate">
                          {returnRecord.reasonDetails}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(returnRecord.createdAt).toLocaleDateString('nl-NL')}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {returnRecord.refundAmount 
                        ? `€${returnRecord.refundAmount.toFixed(2)}`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          returnRecord.status
                        )}`}
                      >
                        {returnRecord.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {returnRecord.emailSentAt ? (
                        <div className="flex flex-col items-center">
                          <Mail className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(returnRecord.emailSentAt).toLocaleDateString('nl-NL')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Niet verzonden</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/dashboard/returns/${returnRecord.id}`}
                          className="p-2 hover:bg-muted rounded-md transition-colors"
                          title="Bekijken"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
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
        Totaal: {returns.length} retour{returns.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

