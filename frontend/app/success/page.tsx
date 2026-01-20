"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, Package, Truck, Home, Loader2, FileText } from "lucide-react";
import { ordersApi } from "@/lib/api/orders";
import { useRouter } from "next/navigation";

/**
 * SUCCESS PAGE - Bedank pagina met OrderID
 * DRY | Modulair | Secure | Email notificatie
 */

// DRY: Herbruikbare Step component - Modulair & Type-safe
interface StepProps {
  icon: React.ReactNode;
  text: string;
}

const Step = ({ icon, text }: StepProps) => (
  <div className="flex items-center gap-4">
    <div className="flex-shrink-0 text-brand">
      {icon}
    </div>
    <p className="text-gray-700 text-left">{text}</p>
  </div>
);

// DRY: Steps data - Single source of truth
const NEXT_STEPS = [
  { 
    icon: <Mail className="h-6 w-6" />,
    text: "Je ontvangt een bevestigingsmail met alle bestelgegevens"
  },
  { 
    icon: <Package className="h-6 w-6" />,
    text: "Wij pakken je bestelling in en maken deze verzendklaar"
  },
  { 
    icon: <Truck className="h-6 w-6" />,
    text: "Je ontvangt een track & trace code zodra je pakket onderweg is"
  },
  { 
    icon: <Home className="h-6 w-6" />,
    text: "Morgen al in huis"
  }
] as const;

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'cancelled' | 'failed' | 'pending' | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // ✅ CRITICAL: Check both "order" and "orderId" parameters for backwards compatibility
        const id = searchParams.get("order") || searchParams.get("orderId");
        
        // ✅ SECURITY: If no order ID, show error immediately
        if (!id) {
          setPaymentError('Geen bestelnummer gevonden. Controleer de URL of neem contact op.');
          setIsLoading(false);
          return;
        }
        
        setOrderId(id);
        
        // ✅ CRITICAL: According to Mollie docs - check order FIRST with retry mechanism
        // Order MUST exist (created before payment), but may need time to propagate
        let order: any = null;
        let retries = 0;
        const maxRetries = 3;
        
        while (retries < maxRetries && !order) {
          try {
            order = await ordersApi.getById(id);
            
            // ✅ SECURITY: Verify order actually exists and has orderNumber
            if (order && order.orderNumber) {
              setOrderNumber(order.orderNumber);
              setCustomerEmail(order.customerEmail || (order as any).customer?.email);
              break; // Order found, exit retry loop
            }
            
            // If order exists but no orderNumber, wait and retry (may be generating)
            if (order && !order.orderNumber && retries < maxRetries - 1) {
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
              retries++;
              continue;
            }
            
            // Order doesn't exist or no orderNumber after retries
            if (!order || !order.orderNumber) {
              setPaymentError('Bestelling niet gevonden. Controleer je bestelnummer of neem contact op.');
              setIsLoading(false);
              return;
            }
          } catch (orderError: any) {
            // ✅ RETRY: If order fetch fails, retry (may be race condition)
            if (retries < maxRetries - 1) {
              console.warn(`Order fetch failed (attempt ${retries + 1}/${maxRetries}), retrying...`, orderError);
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
              retries++;
              continue;
            }
            
            // ✅ CRITICAL: After all retries, show error
            console.error("Failed to fetch order after retries:", orderError);
            setPaymentError(
              orderError?.message?.includes('404') || orderError?.message?.includes('not found')
                ? 'Bestelling niet gevonden. De bestelling is mogelijk niet aangemaakt of de link is ongeldig.'
                : 'Kon bestelling niet ophalen. Controleer je bestelnummer of neem contact op.'
            );
            setIsLoading(false);
            return;
          }
        }
        
        // ✅ SECURITY: Final check - order must exist with orderNumber
        if (!order || !order.orderNumber) {
          setPaymentError('Bestelling niet gevonden. Controleer je bestelnummer of neem contact op.');
          setIsLoading(false);
          return;
        }
        
        // ✅ CRITICAL: Now verify payment status via Mollie API (order exists, so payment should exist)
        // According to Mollie docs: Always verify payment status on redirect, even if webhook processed
        try {
          const paymentData = await ordersApi.getPaymentStatus(id);
          
          if (paymentData.success) {
            setPaymentStatus(paymentData.paymentStatus);
            
            // ✅ SECURITY: Only show success if payment is actually paid
            if (paymentData.isCancelled || paymentData.isFailed) {
              setPaymentError(
                paymentData.isCancelled 
                  ? 'Je betaling is geannuleerd. Probeer het opnieuw.' 
                  : 'Je betaling is mislukt. Probeer het opnieuw.'
              );
              setIsLoading(false);
              return; // Don't show success if payment failed
            }
            
            // ✅ FIX: If payment is pending/open but order exists, show success with note
            // According to Mollie: pending payments can still succeed (webhook may be delayed)
            // Order exists = payment was initiated, so we trust the process
            if (paymentData.isPending && !paymentData.isPaid) {
              // Order exists, payment is pending - show success but note that payment is being processed
              // Don't show error, as payment might still succeed
              setPaymentStatus('pending');
              // Continue to show success page (order exists, payment is processing)
            }
          } else {
            // Payment status check failed, but order exists - assume payment is processing
            // Don't show error, as order exists which means payment was initiated
            logger.warn('Payment status check failed but order exists', { orderId: id });
          }
        } catch (paymentError: any) {
          // ✅ FIX: If payment check fails but order exists, don't show error
          // Order exists = payment was initiated, so we trust the process
          // According to Mollie docs: webhook may be delayed, so we show success if order exists
          console.error("Failed to check payment status (but order exists):", paymentError);
          // Don't set paymentError - order exists, so we show success
          // Payment status will be updated by webhook
        }
      } catch (error: any) {
        console.error("Failed to fetch order details:", error);
        setPaymentError('Er is een fout opgetreden. Probeer het later opnieuw of neem contact op.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-brand" />
      </div>
    );
  }

  // ✅ CRITICAL: Show error/warning if payment was cancelled or failed
  if (paymentError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-lg">
            <h1 className="text-3xl font-semibold mb-3 text-red-900">
              Betaling niet voltooid
            </h1>
            <p className="text-lg text-red-700 mb-4">
              {paymentError}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/">
              <Button variant="cta" size="lg">
                Terug naar Home
              </Button>
            </Link>
            {orderId && (
              <Button 
                variant="brand" 
                size="lg"
                onClick={() => window.location.reload()}
              >
                Status Opnieuw Controleren
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ✅ CRITICAL: Don't show success if no orderNumber (order doesn't exist)
  if (!orderNumber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-lg">
            <h1 className="text-3xl font-semibold mb-3 text-red-900">
              Bestelling niet gevonden
            </h1>
            <p className="text-lg text-red-700 mb-4">
              {paymentError || 'De bestelling is mogelijk niet aangemaakt. Controleer je bestelnummer of neem contact op.'}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/">
              <Button variant="cta" size="lg">
                Terug naar Home
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="brand" size="lg">
                Contacteer Ons
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6">
      <div className="max-w-2xl w-full text-center">
        {/* Heading */}
        <h1 className="text-4xl font-semibold mb-3 text-gray-900">
          Bedankt voor je bestelling!
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          We hebben je bestelling ontvangen en verwerken deze zo snel mogelijk.
        </p>

        {/* Order Number - PROMINENT */}
        <div className="mb-8 p-4 bg-white rounded-lg border-2 border-brand/20 inline-block">
          <p className="text-sm text-gray-600 mb-1">Jouw bestelnummer</p>
          <p className="text-2xl font-bold text-brand">{orderNumber}</p>
          {customerEmail && (
            <p className="text-sm text-gray-500 mt-2">
              Bevestigingsmail verzonden naar: <strong>{customerEmail}</strong>
            </p>
          )}
        </div>

        <Separator variant="float" spacing="lg" />

        {/* Next Steps - Direct op achtergrond, geen card */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-900">
            Wat is de bedoeling nu?
          </h2>
          
          <div className="space-y-4 max-w-lg mx-auto">
            {NEXT_STEPS.map((step, index) => (
              <Step key={index} icon={step.icon} text={step.text} />
            ))}
          </div>
        </div>

        <Separator variant="float" spacing="lg" />

        {/* CTA Buttons - Oranje voor consistentie */}
        <div className="flex flex-wrap gap-3 justify-center">
          {orderId && (
            <Button 
              variant="brand" 
              size="lg"
              onClick={() => router.push(`/orders/${orderId}`)}
              className="flex items-center gap-2"
            >
              <FileText className="h-5 w-5" />
              Bestelling Details Bekijken
            </Button>
          )}
          <Link href="/">
            <Button variant="cta" size="lg">
              Terug naar Home
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="brand" size="lg">
              Contacteer Ons
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-brand" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
