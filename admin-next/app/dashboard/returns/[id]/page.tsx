'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api/admin-client';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Package, User, Clock, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ReturnDetailPage() {
  const params = useParams();
  const router = useRouter();
  const returnId = params.id as string;

  const [returnData, setReturnData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (returnId) {
      fetchReturn();
    }
  }, [returnId]);

  const fetchReturn = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.get<{success: boolean; data: any}>(`/returns/${returnId}`);
      setReturnData(response.data);
      setNewStatus(response.data.status);
      setAdminNotes(response.data.adminNotes || '');
    } catch (error: any) {
      console.error('Error fetching return:', error);
      toast.error('Fout bij ophalen retour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      setIsSaving(true);
      await adminApi.put(`/returns/${returnId}/status`, {
        status: newStatus,
        adminNotes,
      });
      toast.success('Status bijgewerkt');
      fetchReturn();
    } catch (error: any) {
      toast.error('Fout bij bijwerken status');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      await adminApi.post(`/returns/${returnId}/resend-email`, {});
      toast.success('Email opnieuw verzonden');
      fetchReturn();
    } catch (error: any) {
      toast.error('Fout bij verzenden email');
    }
  };

  const handleCreateLabel = async () => {
    try {
      await adminApi.post(`/returns/${returnId}/create-label`, { sendEmail: true });
      toast.success('Label aangemaakt en verzonden');
      fetchReturn();
    } catch (error: any) {
      toast.error('Fout bij aanmaken label');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!returnData) {
    return <div>Retour niet gevonden</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/returns"
            className="p-2 hover:bg-muted rounded-md transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Retour #{returnData.id.substring(0, 8)}...</h1>
            <p className="text-muted-foreground">Order: {returnData.order.orderNumber}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Bestelling
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ordernummer:</span>
                <span className="font-medium">{returnData.order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Besteldatum:</span>
                <span className="font-medium">
                  {new Date(returnData.order.createdAt).toLocaleDateString('nl-NL')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Totaalbedrag:</span>
                <span className="font-medium">€{returnData.order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Klantgegevens
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Naam:</span>
                <span className="font-medium">
                  {returnData.order.shippingAddress.firstName}{' '}
                  {returnData.order.shippingAddress.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{returnData.order.customerEmail}</span>
              </div>
              {returnData.order.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Telefoon:</span>
                  <span className="font-medium">{returnData.order.customerPhone}</span>
                </div>
              )}
              <div className="pt-2 mt-2 border-t">
                <p className="text-sm font-medium mb-1">Verzendadres:</p>
                <p className="text-sm text-muted-foreground">
                  {returnData.order.shippingAddress.street}{' '}
                  {returnData.order.shippingAddress.houseNumber}
                  {returnData.order.shippingAddress.addition}
                  <br />
                  {returnData.order.shippingAddress.postalCode}{' '}
                  {returnData.order.shippingAddress.city}
                  <br />
                  {returnData.order.shippingAddress.country}
                </p>
              </div>
            </div>
          </div>

          {/* Return Items */}
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Te retourneren artikelen</h2>
            <div className="space-y-3">
              {returnData.items.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                  {item.productImage && (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      SKU: {item.productSku} • Aantal: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">€{item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="font-semibold">Terug te betalen:</span>
              <span className="text-xl font-bold">
                €{returnData.refundAmount?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>

          {/* Return Reason */}
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Retour reden</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Reden:</span>
                <p className="font-medium">{returnData.reason}</p>
              </div>
              {returnData.reasonDetails && (
                <div>
                  <span className="text-sm text-muted-foreground">Toelichting:</span>
                  <p className="text-sm">{returnData.reasonDetails}</p>
                </div>
              )}
              {returnData.customerNotes && (
                <div>
                  <span className="text-sm text-muted-foreground">Klant opmerkingen:</span>
                  <p className="text-sm">{returnData.customerNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Actions & Status */}
        <div className="space-y-6">
          {/* Status Management */}
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Status beheer</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="REQUESTED">REQUESTED</option>
                  <option value="LABEL_CREATED">LABEL_CREATED</option>
                  <option value="LABEL_SENT">LABEL_SENT</option>
                  <option value="IN_TRANSIT">IN_TRANSIT</option>
                  <option value="RECEIVED">RECEIVED</option>
                  <option value="INSPECTED">INSPECTED</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="REFUND_PENDING">REFUND_PENDING</option>
                  <option value="REFUND_PROCESSED">REFUND_PROCESSED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Admin notities</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Interne notities..."
                />
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={isSaving}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Opslaan...' : 'Status bijwerken'}
              </button>
            </div>
          </div>

          {/* MyParcel Info */}
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">MyParcel info</h2>
            
            {returnData.myparcelId ? (
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">MyParcel ID:</span>
                  <p className="font-medium">{returnData.myparcelId}</p>
                </div>
                {returnData.trackingCode && (
                  <div>
                    <span className="text-sm text-muted-foreground">Track & Trace:</span>
                    <p className="font-mono text-sm">{returnData.trackingCode}</p>
                  </div>
                )}
                {returnData.trackingUrl && (
                  <a
                    href={returnData.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    Track retour <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Geen label aangemaakt
                </p>
                <button
                  onClick={handleCreateLabel}
                  className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                >
                  Label aanmaken + verzenden
                </button>
              </div>
            )}
          </div>

          {/* Email Actions */}
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email acties
            </h2>
            
            {returnData.emailSentAt ? (
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">Laatst verzonden:</span>
                  <p className="text-sm">
                    {new Date(returnData.emailSentAt).toLocaleString('nl-NL')}
                  </p>
                </div>
                <button
                  onClick={handleResendEmail}
                  className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                >
                  Email opnieuw verzenden
                </button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nog geen email verzonden</p>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Tijdlijn
            </h2>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Aangemaakt:</span>
                <p>{new Date(returnData.createdAt).toLocaleString('nl-NL')}</p>
              </div>
              {returnData.receivedAt && (
                <div>
                  <span className="text-muted-foreground">Ontvangen:</span>
                  <p>{new Date(returnData.receivedAt).toLocaleString('nl-NL')}</p>
                </div>
              )}
              {returnData.refundedAt && (
                <div>
                  <span className="text-muted-foreground">Terugbetaald:</span>
                  <p>{new Date(returnData.refundedAt).toLocaleString('nl-NL')}</p>
                </div>
              )}
              {returnData.closedAt && (
                <div>
                  <span className="text-muted-foreground">Afgesloten:</span>
                  <p>{new Date(returnData.closedAt).toLocaleString('nl-NL')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

