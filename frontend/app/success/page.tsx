"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, Package, Truck, Home, Loader2 } from "lucide-react";
import { ordersApi } from "@/lib/api/orders";

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
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // ✅ FIX: Check both "order" and "orderId" parameters for backwards compatibility
        const orderId = searchParams.get("order") || searchParams.get("orderId");
        if (orderId) {
          const order = await ordersApi.getById(orderId);
          setOrderNumber(order.orderNumber);
          setCustomerEmail(order.customerEmail || (order as any).customer?.email);
        }
      } catch (error) {
        console.error("Failed to fetch order:", error);
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
          <Link href="/">
            <Button variant="cta" size="lg" className="rounded-md">
              Terug naar Home
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="brand" size="lg" className="rounded-md">
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
