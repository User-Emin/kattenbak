import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, Package, Truck, Home } from "lucide-react";

/**
 * SUCCESS PAGE - Bedank pagina
 * DRY | Modulair | Maintainable | Geen redundantie
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

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6">
      <div className="max-w-2xl w-full text-center">
        {/* Heading - Zonder icon */}
        <h1 className="text-4xl font-light mb-3 text-gray-900">
          Bedankt voor je bestelling!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          We hebben je bestelling ontvangen en verwerken deze zo snel mogelijk.
        </p>

        <Separator variant="float" spacing="lg" />

        {/* Next Steps - Direct op achtergrond, geen card */}
        <div className="mb-8">
          <h2 className="text-xl font-medium mb-6 text-gray-900">
            Wat is de bedoeling nu?
          </h2>
          
          <div className="space-y-4 max-w-lg mx-auto">
            {NEXT_STEPS.map((step, index) => (
              <Step key={index} icon={step.icon} text={step.text} />
            ))}
          </div>
        </div>

        <Separator variant="float" spacing="lg" />

        {/* CTA Buttons - Optimale layout */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/">
            <Button variant="primary" size="lg">
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
