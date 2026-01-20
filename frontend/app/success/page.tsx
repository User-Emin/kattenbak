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
        // ✅ FIX: Check both "order" and "orderId" parameters for backwards compatibility
        const id = searchParams.get("order") || searchParams.get("orderId");
        if (id) {
          setOrderId(id);
          
          // ✅ CRITICAL: Check payment status FIRST via Mollie API before showing success
          // This prevents showing success page for cancelled/failed payments
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
                return; // Don't fetch order details if payment failed
              }
              
              // If payment is pending, show a waiting message
              if (paymentData.isPending && !paymentData.isPaid) {
                setPaymentError('Je betaling wordt nog verwerkt. Je ontvangt een bevestiging zodra de betaling is voltooid.');
                setIsLoading(false);
                return;
              }
            }
          } catch (paymentError: any) {
            console.error("Failed to check payment status:", paymentError);
            // Continue to fetch order details anyway (fallback)
          }
          
          // Fetch order details only if payment is paid or we couldn't verify
          const order = await ordersApi.getById(id);
          setOrderNumber(order.orderNumber);
          setCustomerEmail(order.customerEmail || (order as any).customer?.email);
        }
      } catch (error) {
        console.error("Failed to fetch order:", error);
        setPaymentError('Kon bestelling niet ophalen. Controleer je bestelnummer of neem contact op.');
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
        {orderNumber && (
          <div className="mb-8 p-4 bg-white rounded-lg border-2 border-brand/20 inline-block">
            <p className="text-sm text-gray-600 mb-1">Jouw bestelnummer</p>
            <p className="text-2xl font-bold text-brand">{orderNumber}</p>
            {customerEmail && (
              <p className="text-sm text-gray-500 mt-2">
                Bevestigingsmail verzonden naar: <strong>{customerEmail}</strong>
              </p>
            )}
          </div>
        )}

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
