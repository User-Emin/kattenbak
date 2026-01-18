'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ReturnReasonSelector } from '@/components/returns/return-reason-selector';
import { ReturnItemSelector } from '@/components/returns/return-item-selector';
import { ArrowLeft, CheckCircle, AlertCircle, Package } from 'lucide-react';
import {
  checkReturnEligibility,
  createReturnRequest,
} from '@/lib/api/returns';
import { ordersApi } from '@/lib/api/orders';
import type { ReturnReason, ReturnItem, CreateReturnRequest } from '@/types/return';
import {
  GRADIENTS,
  TEXT_COLORS,
  BRAND_COLORS,
  SEMANTIC_COLORS,
  BORDER_RADIUS,
  BACKGROUND_OPACITY,
  COMPONENT_COLORS,
} from '@/lib/theme-colors';

/**
 * RETURN REQUEST PAGE - ABSOLUUT DRY, SECURE & MAINTAINABLE
 * 
 * DRY Principles:
 * - Dynamische kleuren via theme-colors.ts (NO HARDCODE!)
 * - Auto-select items als 1 product
 * - Centralized validation
 * - Secure data handling
 * - Serieuze, clean look zonder onnodige icons
 */

interface Props {
  params: Promise<{
    orderId: string;
  }>;
}

export default function ReturnRequestPage({ params }: Props) {
  const router = useRouter();
  const [orderId, setOrderId] = useState<string>('');

  // Next.js 15: Unwrap params Promise (DRY: Single effect)
  useEffect(() => {
    params.then((p) => setOrderId(p.orderId || ''));
  }, [params]);

  // State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [eligibilityMessage, setEligibilityMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [returnData, setReturnData] = useState<any>(null);

  // Form state (DRY: One state object)
  const [formData, setFormData] = useState({
    reason: '' as ReturnReason | '',
    reasonDetails: '',
    items: [] as ReturnItem[],
    customerNotes: '',
  });

  // ✅ FIX: Fetch real order data from API
  const [orderData, setOrderData] = useState<any>(null);
  const [orderLoading, setOrderLoading] = useState(true);

  // Fetch order data on mount
  useEffect(() => {
    if (orderId) {
      fetchOrderData();
    }
  }, [orderId]);

  async function fetchOrderData() {
    if (!orderId) return;
    
    setOrderLoading(true);
    try {
      // ✅ FIX: Try by orderNumber first (ORD1768729461323), then by ID
      let order: any;
      try {
        order = await ordersApi.getByOrderNumber(orderId);
      } catch {
        // If orderNumber lookup fails, try by ID
        try {
          order = await ordersApi.getById(orderId);
        } catch {
          throw new Error('Order niet gevonden');
        }
      }

      // Transform order data to match expected format
      setOrderData({
        orderNumber: order.orderNumber,
        customerName: order.shippingAddress 
          ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
          : order.customerEmail,
        customerEmail: order.customerEmail,
        shippingAddress: order.shippingAddress || {},
        items: order.items?.map((item: any) => ({
          productId: item.productId,
          productName: item.productName,
          productImage: item.product?.images?.[0] || '/images/placeholder.jpg',
          quantity: item.quantity,
          price: item.price || 0,
        })) || [],
      });

      // Check eligibility after order is loaded
      checkEligibility();
    } catch (err: any) {
      setError(err.message || 'Kon order niet ophalen');
      setLoading(false);
    } finally {
      setOrderLoading(false);
    }
  }

  // Check eligibility on mount (DRY: Only when orderId available)
  useEffect(() => {
    if (orderId && orderData) {
      checkEligibility();
    }
  }, [orderId, orderData]);

  async function checkEligibility() {
    if (!orderId) return;
    
    setLoading(true);
    const result = await checkReturnEligibility(orderId);

    if (result.success && result.data) {
      setEligible(result.data.eligible);
      setEligibilityMessage(result.data.reason || '');
      
      // DRY: Auto-select items if only 1 product
      if (orderData.items.length === 1) {
        setFormData((prev) => ({
          ...prev,
          items: orderData.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
          })),
        }));
      }
    } else {
      setError(result.error || 'Kon eligibility niet checken');
    }

    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    // Validation (DRY: Check all required fields)
    if (!formData.reason) {
      setError('Selecteer een reden voor de retour');
      setSubmitting(false);
      return;
    }

    if (formData.items.length === 0) {
      setError('Selecteer minimaal 1 product');
      setSubmitting(false);
      return;
    }

    // Build request (DRY: Type-safe)
    const request: CreateReturnRequest = {
      orderId,
      orderNumber: orderData.orderNumber,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      shippingAddress: orderData.shippingAddress,
      reason: formData.reason as ReturnReason,
      reasonDetails: formData.reasonDetails || undefined,
      items: formData.items,
      customerNotes: formData.customerNotes || undefined,
      sendEmail: true,
    };

    const result = await createReturnRequest(request);

    if (result.success && result.data) {
      setReturnData(result.data);
      setSuccess(true);
    } else {
      setError(result.error || 'Er ging iets mis');
    }

    setSubmitting(false);
  }

  // Loading state (DRY: GRADIENTS)
  if (loading || orderLoading || !orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/5">
        <div className="text-center">
          <div className={`animate-spin ${BORDER_RADIUS.full} h-16 w-16 border-4 border-t-transparent ${BRAND_COLORS.secondary[600]} mx-auto mb-6`} />
          <p className="text-muted-foreground text-lg">
            {orderLoading ? 'Order ophalen...' : 'Retour controleren...'}
          </p>
        </div>
      </div>
    );
  }

  // Not eligible (DRY: Clean, no icon)
  if (!eligible) {
    return (
      <div className={`min-h-screen ${GRADIENTS.subtle} py-16`}>
        <div className="container-custom max-w-2xl">
          <div className={`bg-white ${BORDER_RADIUS['2xl']} p-10 text-center`}>
            <h1 className={`text-4xl font-bold mb-4 ${TEXT_COLORS.gray[900]}`}>
              Retour niet mogelijk
            </h1>
            <p className="text-muted-foreground text-lg mb-8">{eligibilityMessage}</p>
            <Button onClick={() => router.back()} variant="outline" size="lg">
              Terug
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success state (DRY: Clean, professional, NO background icons)
  if (success && returnData) {
    return (
      <div className={`min-h-screen ${GRADIENTS.subtle} py-16`}>
        <div className="container-custom max-w-3xl relative z-10">
          <div className={`bg-white ${BORDER_RADIUS['2xl']} p-10`}>
            <div className="text-center mb-10">
              <h1 className={`text-5xl font-bold mb-4 ${GRADIENTS.textGradient}`}>
                Retour aangevraagd!
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                Je retourlabel is per email verstuurd naar <span className="font-semibold">{orderData.customerEmail}</span>
              </p>
            </div>

            <Separator className="my-8" />

            {/* Tracking Info (DRY: Clean layout) */}
            <div className="space-y-6 mb-8">
              <div className={`${BORDER_RADIUS.xl} ${BRAND_COLORS.secondary[50]} border-2 ${BRAND_COLORS.secondary[200]} p-6`}>
                <Label className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
                  Tracking Code
                </Label>
                <p className={`font-mono text-2xl font-bold ${TEXT_COLORS.blue[700]}`}>
                  {returnData.trackingCode}
                </p>
              </div>

              {returnData.trackingUrl && (
                <a
                  href={returnData.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block ${BORDER_RADIUS.xl} border-2 border-gray-200 p-6 hover:bg-gray-50 transition-colors`}
                >
                  <Label className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
                    Track & Trace
                  </Label>
                  <p className={`${TEXT_COLORS.blue[600]} hover:underline text-sm break-all`}>
                    {returnData.trackingUrl}
                  </p>
                </a>
              )}

              {returnData.labelUrl && (
                <Button
                  onClick={() => window.open(returnData.labelUrl, '_blank')}
                  size="lg"
                  className={`w-full ${COMPONENT_COLORS.button.primary}`}
                >
                  Download Retourlabel
                </Button>
              )}
            </div>

            <Separator className="my-8" />

            {/* Next Steps (DRY: SEMANTIC_COLORS, clean numbers) */}
            <div className={`${BORDER_RADIUS.xl} ${SEMANTIC_COLORS.info.bg} border-2 ${SEMANTIC_COLORS.info.border} p-6 mb-8`}>
              <h3 className="font-bold text-lg mb-4">Volgende stappen:</h3>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className={`inline-flex items-center justify-center w-7 h-7 ${BORDER_RADIUS.full} ${SEMANTIC_COLORS.info.text} bg-white font-bold shrink-0`}>1</span>
                  <span className="pt-1">Print het retourlabel uit de email</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className={`inline-flex items-center justify-center w-7 h-7 ${BORDER_RADIUS.full} ${SEMANTIC_COLORS.info.text} bg-white font-bold shrink-0`}>2</span>
                  <span className="pt-1">Plak het label op het pakket</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className={`inline-flex items-center justify-center w-7 h-7 ${BORDER_RADIUS.full} ${SEMANTIC_COLORS.info.text} bg-white font-bold shrink-0`}>3</span>
                  <span className="pt-1">Breng het pakket naar een PostNL punt</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className={`inline-flex items-center justify-center w-7 h-7 ${BORDER_RADIUS.full} ${SEMANTIC_COLORS.info.text} bg-white font-bold shrink-0`}>4</span>
                  <span className="pt-1">Wij verwerken je retour binnen 5 werkdagen</span>
                </li>
              </ol>
            </div>

            {/* Actions (DRY: Button layout) */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => router.push('/')} 
                size="lg"
                className="flex-1"
              >
                Terug naar Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main form (DRY: Clean, professional, NO background icons)
  return (
    <div className={`min-h-screen ${GRADIENTS.subtle} py-12`}>
      <div className="container-custom max-w-3xl relative z-10">
        {/* Header - Clean, no icons */}
        <div className="mb-8">
          <Button onClick={() => router.back()} variant="ghost" className="mb-6">
            Terug
          </Button>
          <h1 className={`text-5xl font-bold mb-3 ${GRADIENTS.textGradient}`}>
            Retour aanvragen
          </h1>
          <p className="text-muted-foreground text-lg">
            Bestelling: <span className="font-semibold">{orderData.orderNumber}</span>
          </p>
        </div>

        {/* Form Card */}
        <div className={`bg-white ${BORDER_RADIUS['2xl']} p-8`}>
          {/* Error Message */}
          {error && (
            <div className={`mb-8 ${BORDER_RADIUS.xl} ${SEMANTIC_COLORS.error.bg} border-2 ${SEMANTIC_COLORS.error.border} p-5`}>
              <p className={`text-sm font-semibold ${SEMANTIC_COLORS.error.text}`}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Reason Selection - PROMINENT (DRY: Large, clear) */}
            <div>
              <Label className="text-xl font-bold mb-4 block">
                Wat is de reden voor de retour? *
              </Label>
              <ReturnReasonSelector
                value={formData.reason}
                onChange={(reason) => setFormData({ ...formData, reason })}
                error={error && !formData.reason ? 'Selecteer een reden' : undefined}
                disabled={submitting}
              />
            </div>

            {/* Reason Details (DRY: Only show if reason selected) */}
            {formData.reason && (
              <div>
                <Label htmlFor="reasonDetails" className="text-base font-semibold mb-3 block">
                  Toelichting (optioneel)
                </Label>
                <textarea
                  id="reasonDetails"
                  value={formData.reasonDetails}
                  onChange={(e) => setFormData({ ...formData, reasonDetails: e.target.value })}
                  disabled={submitting}
                  maxLength={1000}
                  rows={4}
                  className={`w-full px-5 py-4 border-2 ${BORDER_RADIUS.xl} focus:border-gray-600 transition-colors text-base`}
                  placeholder="Geef meer details over je retour..."
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {formData.reasonDetails.length} / 1000 karakters
                </p>
              </div>
            )}

            <Separator />

            {/* Item Selector (DRY: Conditional display, clean) */}
            {orderData.items.length > 1 ? (
              <div>
                <Label className="text-xl font-bold mb-4 block">
                  Welke producten wil je retourneren? *
                </Label>
                <ReturnItemSelector
                  orderItems={orderData.items}
                  selectedItems={formData.items}
                  onChange={(items) => setFormData({ ...formData, items })}
                  disabled={submitting}
                  error={error && formData.items.length === 0 ? 'Selecteer minimaal 1 product' : undefined}
                />
              </div>
            ) : (
              <div className={`${BORDER_RADIUS.xl} ${BRAND_COLORS.secondary[50]} border-2 ${BRAND_COLORS.secondary[200]} p-6`}>
                <div>
                  <p className="font-semibold text-lg mb-1">{orderData.items[0].productName}</p>
                  <p className="text-sm text-muted-foreground mb-3">Aantal: {orderData.items[0].quantity}</p>
                  <p className={`text-xs ${SEMANTIC_COLORS.success.text} font-medium`}>
                    ✓ Dit product wordt automatisch geretourneerd
                  </p>
                </div>
              </div>
            )}

            <Separator />

            {/* Customer Notes (DRY: Optional) */}
            <div>
              <Label htmlFor="customerNotes" className="text-base font-semibold mb-3 block">
                Aanvullende opmerkingen (optioneel)
              </Label>
              <textarea
                id="customerNotes"
                value={formData.customerNotes}
                onChange={(e) => setFormData({ ...formData, customerNotes: e.target.value })}
                disabled={submitting}
                maxLength={500}
                rows={3}
                className={`w-full px-5 py-4 border-2 ${BORDER_RADIUS.xl} focus:border-${BRAND_COLORS.primary[500]} transition-colors text-base`}
                placeholder="Eventuele aanvullende informatie..."
              />
              <p className="text-xs text-muted-foreground mt-2">
                {formData.customerNotes.length} / 500 karakters
              </p>
            </div>

            {/* Submit Actions (DRY: Prominent button) */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="button"
                onClick={() => router.back()}
                variant="outline"
                disabled={submitting}
                size="lg"
                className="flex-1"
              >
                Annuleren
              </Button>
              <Button
                type="submit"
                disabled={submitting || !formData.reason}
                size="lg"
                className={`flex-1 ${COMPONENT_COLORS.button.primary}`}
              >
                {submitting ? (
                  <>
                    <div className={`animate-spin ${BORDER_RADIUS.full} h-5 w-5 border-2 border-white border-t-transparent mr-2`} />
                    Bezig...
                  </>
                ) : (
                  'Retour aanvragen'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}



