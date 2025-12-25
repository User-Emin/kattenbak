"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, Package, Truck, Home, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { ordersApi } from "@/lib/api/orders";

/**
 * ORDER SUCCESS PAGE - /orders/[orderId]
 * DRY: Reuses success page logic with orderId from URL params
 * Mollie redirects here after payment completion
 */

// DRY: Herbruikbare Step component
interface StepProps {
  icon: React.ReactNode;
  text: string;
}

const Step = ({ icon, text }: StepProps) => (
  <div className="flex gap-3 items-start">
    <div className="text-brand flex-shrink-0">{icon}</div>
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

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (!orderId) {
          setError("Geen bestelnummer gevonden");
          setIsLoading(false);
          return;
        }

        const order = await ordersApi.getById(orderId);
        
        setOrderNumber(order.orderNumber);
        setCustomerEmail(order.customerEmail || (order as any).customer?.email);
        setPaymentStatus((order as any).status || 'PENDING');
      } catch (error: any) {
        console.error("Failed to fetch order:", error);
        setError(error.message || "Kon bestelling niet laden");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-brand mx-auto mb-4" />
          <p className="text-gray-600">Bestelling ophalen...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !orderNumber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-lg shadow-sm">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold mb-3 text-gray-900">
            Bestelling niet gevonden
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "We konden je bestelling niet vinden. Controleer je bevestigingsmail of neem contact op met onze klantenservice."}
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/">
              <Button variant="brand" size="lg">
                Terug naar Home
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">
                Contact
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto" />
        </div>

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
          {paymentStatus === 'PAID' && (
            <div className="mt-3 flex items-center justify-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-semibold">Betaling geslaagd</span>
            </div>
          )}
        </div>

        <Separator className="my-8" />

        {/* Next Steps */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-900">
            Wat gebeurt er nu?
          </h2>
          
          <div className="space-y-4 max-w-lg mx-auto">
            {NEXT_STEPS.map((step, index) => (
              <Step key={index} icon={step.icon} text={step.text} />
            ))}
          </div>
        </div>

        <Separator className="my-8" />

        {/* CTA Buttons */}
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

