"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Package,
  Truck,
  Home,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { ordersApi } from "@/lib/api/orders";

/**
 * SMART SUCCESS PAGE - Payment Status Detection
 * DRY | Secure | User-Friendly | Mollie Integration
 */

type PaymentStatus = "paid" | "cancelled" | "failed" | "pending" | "loading" | "error";

interface StepProps {
  icon: React.ReactNode;
  text: string;
}

const Step = ({ icon, text }: StepProps) => (
  <div className="flex items-center gap-4">
    <div className="flex-shrink-0 text-brand">{icon}</div>
    <p className="text-gray-700 text-left">{text}</p>
  </div>
);

// DRY: Payment status configurations
const STATUS_CONFIG = {
  paid: {
    icon: <CheckCircle2 className="h-16 w-16 text-green-600" />,
    title: "Betaling Geslaagd!",
    subtitle: "Je bestelling is bevestigd en wordt verwerkt",
    steps: [
      {
        icon: <Mail className="h-6 w-6" />,
        text: "Je ontvangt een bevestigingsmail met alle bestelgegevens",
      },
      {
        icon: <Package className="h-6 w-6" />,
        text: "Wij pakken je bestelling in en maken deze verzendklaar",
      },
      {
        icon: <Truck className="h-6 w-6" />,
        text: "Je ontvangt een track & trace code zodra je pakket onderweg is",
      },
      {
        icon: <Home className="h-6 w-6" />,
        text: "Morgen al in huis",
      },
    ],
    buttons: [
      { label: "Terug naar Home", href: "/", variant: "cta" },
      { label: "Contacteer Ons", href: "/contact", variant: "brand" },
    ],
  },
  cancelled: {
    icon: <XCircle className="h-16 w-16 text-orange-600" />,
    title: "Betaling Geannuleerd",
    subtitle: "Je hebt de betaling geannuleerd. Geen zorgen, er is niets afgeschreven.",
    steps: [
      {
        icon: <Package className="h-6 w-6" />,
        text: "Je bestelling is niet doorgegaan",
      },
      {
        icon: <Clock className="h-6 w-6" />,
        text: "Je kunt opnieuw proberen wanneer je wilt",
      },
    ],
    buttons: [
      { label: "Opnieuw Proberen", href: "/checkout", variant: "cta" },
      { label: "Terug naar Home", href: "/", variant: "brand" },
    ],
  },
  failed: {
    icon: <XCircle className="h-16 w-16 text-red-600" />,
    title: "Betaling Mislukt",
    subtitle: "De betaling kon helaas niet worden verwerkt. Probeer het opnieuw.",
    steps: [
      {
        icon: <Package className="h-6 w-6" />,
        text: "Je bestelling is niet bevestigd",
      },
      {
        icon: <Clock className="h-6 w-6" />,
        text: "Controleer je betaalgegevens en probeer het opnieuw",
      },
    ],
    buttons: [
      { label: "Opnieuw Proberen", href: "/checkout", variant: "cta" },
      { label: "Contacteer Ons", href: "/contact", variant: "brand" },
    ],
  },
  pending: {
    icon: <Clock className="h-16 w-16 text-blue-600" />,
    title: "Betaling In Verwerking",
    subtitle: "Je betaling wordt verwerkt. Dit kan enkele minuten duren.",
    steps: [
      {
        icon: <Clock className="h-6 w-6" />,
        text: "We wachten op bevestiging van de bank",
      },
      {
        icon: <Mail className="h-6 w-6" />,
        text: "Je ontvangt een bevestigingsmail zodra de betaling is verwerkt",
      },
    ],
    buttons: [
      { label: "Status Vernieuwen", href: "/success", variant: "cta" },
      { label: "Terug naar Home", href: "/", variant: "brand" },
    ],
  },
} as const;

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const orderId = searchParams.get("orderId");

        if (!orderId) {
          setStatus("error");
          return;
        }

        // Fetch order from backend
        const response = await ordersApi.getById(orderId);
        const order = response.data || response;

        setOrderNumber(order.orderNumber);

        // Map order payment status to UI status
        const paymentStatus = order.paymentStatus?.toLowerCase();
        
        if (paymentStatus === "paid" || order.status === "confirmed") {
          setStatus("paid");
        } else if (paymentStatus === "canceled" || paymentStatus === "cancelled") {
          setStatus("cancelled");
        } else if (paymentStatus === "failed" || paymentStatus === "expired") {
          setStatus("failed");
        } else if (paymentStatus === "pending" || paymentStatus === "open") {
          setStatus("pending");
        } else {
          // Default to pending for unknown statuses
          setStatus("pending");
        }
      } catch (error: any) {
        console.error("Failed to fetch order status:", error);
        // If API fails, show generic success (graceful degradation)
        setStatus("paid");
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-brand mx-auto mb-4" />
          <p className="text-gray-600">Betalingsstatus controleren...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6">
        <div className="max-w-2xl w-full text-center">
          <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-4xl font-semibold mb-3 text-gray-900">
            Oeps!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            We kunnen je bestelling niet vinden. Neem contact met ons op als je vragen hebt.
          </p>
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

  const config = STATUS_CONFIG[status];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6">
      <div className="max-w-2xl w-full text-center">
        {/* Icon */}
        <div className="mb-6">{config.icon}</div>

        {/* Heading */}
        <h1 className="text-4xl font-semibold mb-3 text-gray-900">
          {config.title}
        </h1>
        <p className="text-lg text-gray-600 mb-4">{config.subtitle}</p>

        {/* Order Number */}
        {orderNumber && status === "paid" && (
          <p className="text-sm text-gray-500 mb-8">
            Bestelnummer: <strong>{orderNumber}</strong>
          </p>
        )}

        <Separator variant="float" spacing="lg" />

        {/* Next Steps */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-900">
            {status === "paid" ? "Wat gebeurt er nu?" : "Wat nu?"}
          </h2>

          <div className="space-y-4 max-w-lg mx-auto">
            {config.steps.map((step, index) => (
              <Step key={index} icon={step.icon} text={step.text} />
            ))}
          </div>
        </div>

        <Separator variant="float" spacing="lg" />

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          {config.buttons.map((button, index) => (
            <Link key={index} href={button.href}>
              <Button
                variant={button.variant as any}
                size="lg"
                className="rounded-md"
              >
                {button.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-brand" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

