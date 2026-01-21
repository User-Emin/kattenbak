/**
 * ORDER DETAIL PAGE - View complete order information
 * Shows all order details including shipping address, items, payment, etc.
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Package, User, MapPin, CreditCard, Truck } from 'lucide-react';
import { getOrder } from '@/lib/api/orders';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

// DRY: Status badge variants
const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'secondary',
  PROCESSING: 'default',
  SHIPPED: 'default',
  DELIVERED: 'outline',
  CANCELLED: 'destructive',
  PAID: 'outline',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'In afwachting',
  PROCESSING: 'Verwerken',
  SHIPPED: 'Verzonden',
  DELIVERED: 'Afgeleverd',
  CANCELLED: 'Geannuleerd',
  PAID: 'Betaald',
};

interface OrderDetail {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerPhone?: string;
  customerName?: string;
  total: number;
  subtotal: number;
  tax: number;
  shippingCost: number;
  status: string;
  paymentStatus?: string;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    street: string;
    houseNumber: string;
    addition?: string;
    postalCode: string;
    city: string;
    country: string;
    phone?: string;
  };
  billingAddress?: {
    firstName: string;
    lastName: string;
    street: string;
    houseNumber: string;
    addition?: string;
    postalCode: string;
    city: string;
    country: string;
    phone?: string;
  };
  items?: Array<{
    id: string;
    productId: string;
    productName: string;
    productSku?: string;
    quantity: number;
    price: number;
    subtotal: number;
    // ✅ VARIANT SYSTEM: Variant info (database has variant_id, variant_name, variant_color)
    variantId?: string;
    variantName?: string;
    variantSku?: string; // Backward compatibility (maps to variantColor)
    variantColor?: string; // Actual database column
    product?: {
      id: string;
      name: string;
      images?: string[];
    };
  }>;
  payment?: {
    id: string;
    status: string;
    mollieId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      const response = await getOrder(orderId);
      
      if (response && response.data) {
        // ✅ FIX: Extract customerName from shippingAddress if not present
        const orderData = response.data;
        
        // ✅ DEBUG: Log order data to see what we receive
        console.log('Order data received:', {
          id: orderData.id,
          orderNumber: orderData.orderNumber,
          hasShippingAddress: !!orderData.shippingAddress,
          hasBillingAddress: !!orderData.billingAddress,
          hasItems: !!orderData.items,
          itemsCount: orderData.items?.length || 0,
          customerEmail: orderData.customerEmail,
        });
        
        if (!orderData.customerName && orderData.shippingAddress) {
          orderData.customerName = `${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}`;
        }
        
        setOrder(orderData);
      } else {
        console.error('No order data in response:', response);
        toast.error('Bestelling niet gevonden');
        router.push('/dashboard/orders');
      }
    } catch (error: any) {
      console.error('Load order error:', {
        message: error.message,
        status: error.status,
        details: error.details,
        url: error.url,
      });
      toast.error(error.message || 'Fout bij laden van bestelling');
      router.push('/dashboard/orders');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Bestelling niet gevonden</p>
          <Button onClick={() => router.push('/dashboard/orders')} className="mt-4">
            Terug naar bestellingen
          </Button>
        </div>
      </div>
    );
  }

  const fullShippingAddress = order.shippingAddress
    ? `${order.shippingAddress.street} ${order.shippingAddress.houseNumber}${order.shippingAddress.addition ? ` ${order.shippingAddress.addition}` : ''}, ${order.shippingAddress.postalCode} ${order.shippingAddress.city}`
    : 'Geen adres opgegeven';

  const fullBillingAddress = order.billingAddress
    ? `${order.billingAddress.street} ${order.billingAddress.houseNumber}${order.billingAddress.addition ? ` ${order.billingAddress.addition}` : ''}, ${order.billingAddress.postalCode} ${order.billingAddress.city}`
    : 'Geen adres opgegeven';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/dashboard/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bestelling Details</h1>
            <p className="text-muted-foreground">
              Bestelnummer: <span className="font-mono">{order.orderNumber}</span>
            </p>
          </div>
        </div>
        <Badge variant={STATUS_VARIANTS[order.status] || 'default'}>
          {STATUS_LABELS[order.status] || order.status}
        </Badge>
      </div>

      {/* Order Info Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Klant Informatie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Naam</p>
              <p className="font-medium">
                {order.customerName || `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim() || 'Onbekend'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{order.customerEmail}</p>
            </div>
            {order.customerPhone && (
              <div>
                <p className="text-sm text-muted-foreground">Telefoon</p>
                <p className="font-medium">{order.customerPhone}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Datum</p>
              <p className="font-medium">
                {format(new Date(order.createdAt), 'dd MMMM yyyy, HH:mm', { locale: nl })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Betaling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={order.payment?.status === 'PAID' ? 'outline' : 'secondary'}>
                {order.payment?.status === 'PAID' ? 'Betaald' : order.payment?.status || 'In afwachting'}
              </Badge>
            </div>
            {order.payment?.mollieId && (
              <div>
                <p className="text-sm text-muted-foreground">Mollie ID</p>
                <p className="font-mono text-sm">{order.payment.mollieId}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Totaal</p>
              <p className="text-2xl font-bold">€ {order.total.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shipping Address */}
      {order.shippingAddress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Verzendadres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="font-medium">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p className="text-muted-foreground">{fullShippingAddress}</p>
              <p className="text-muted-foreground">{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && (
                <p className="text-muted-foreground mt-2">Tel: {order.shippingAddress.phone}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Address (if different) */}
      {order.billingAddress && JSON.stringify(order.billingAddress) !== JSON.stringify(order.shippingAddress) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Factuuradres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="font-medium">
                {order.billingAddress.firstName} {order.billingAddress.lastName}
              </p>
              <p className="text-muted-foreground">{fullBillingAddress}</p>
              <p className="text-muted-foreground">{order.billingAddress.country}</p>
              {order.billingAddress.phone && (
                <p className="text-muted-foreground mt-2">Tel: {order.billingAddress.phone}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Bestelde Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          {order.items && order.items.length > 0 ? (
            <div className="space-y-4">
              {order.items.map((item) => {
                // ✅ VARIANT SYSTEM: Always use variant image as maatstaf if available, fallback to product image (modulair, geen hardcode)
                const displayImage = (item as any).variantImage || (item as any).displayImage || (item.product?.images?.[0] || null);
                
                return (
                <div key={item.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                  {displayImage && (
                    <img
                      src={displayImage}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    {item.productSku && (
                      <p className="text-sm text-muted-foreground">SKU: {item.productSku}</p>
                    )}
                    {/* ✅ VARIANT SYSTEM: Display variant info if present - DRY: Via constants */}
                    {(item.variantName || item.variantColor) && (
                      <p className="text-sm text-muted-foreground mt-1">
                        🎨 Variant: <span className="font-medium">{item.variantName || item.variantColor || 'Onbekend'}</span>
                        {item.variantColor && item.variantColor !== item.variantName && (
                          <span className="ml-1 text-xs">({item.variantColor})</span>
                        )}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Aantal: {item.quantity}</span>
                      <span>Prijs: € {item.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">€ {item.subtotal.toFixed(2)}</p>
                  </div>
                </div>
                );
              })}
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotaal</span>
                  <span>€ {order.subtotal.toFixed(2)}</span>
                </div>
                {order.shippingCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Verzendkosten</span>
                    <span>€ {order.shippingCost.toFixed(2)}</span>
                  </div>
                )}
                {order.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">BTW</span>
                    <span>€ {order.tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Totaal</span>
                  <span>€ {order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">Geen items gevonden in deze order</p>
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotaal</span>
                  <span>€ {order.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                {order.shippingCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Verzendkosten</span>
                    <span>€ {order.shippingCost.toFixed(2)}</span>
                  </div>
                )}
                {order.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">BTW</span>
                    <span>€ {order.tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Totaal</span>
                  <span>€ {order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}