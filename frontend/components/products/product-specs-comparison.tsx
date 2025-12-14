"use client";

import { useState } from "react";
import { ChevronDown, Check, X, Sparkles, ShieldCheck, Smartphone, VolumeX, Package, Layers, Droplets, Wrench, Cat, Box } from "lucide-react";

/**
 * Product Specifications Comparison - BASED ON SCREENSHOT
 * DRY: Uitklapbare vergelijkingstabel met alle specificaties
 * Montserrat font, zwart accent ipv oranje
 */

interface SpecItem {
  title: string;
  icon: typeof Check;
  ours: string | boolean;
  others1?: string | boolean;
  others2?: string | boolean;
  description?: string;
}

export function ProductSpecsComparison() {
  const [openSpecs, setOpenSpecs] = useState<Set<number>>(new Set());

  const toggleSpec = (index: number) => {
    const newOpen = new Set(openSpecs);
    if (newOpen.has(index)) {
      newOpen.delete(index);
    } else {
      newOpen.add(index);
    }
    setOpenSpecs(newOpen);
  };

  // ✅ SELECTIE VAN 5 BELANGRIJKSTE SPECS (geen lege ruimte)
  const specs: SpecItem[] = [
    {
      title: "Zelfreinigende Functie",
      icon: Sparkles,
      ours: true,
      others1: true,
      others2: true,
      description: "Volledig automatische reiniging na elk bezoek. Dubbele veiligheidssensoren zorgen voor maximale veiligheid."
    },
    {
      title: "App Bediening & Monitoring",
      icon: Smartphone,
      ours: true,
      others1: true,
      others2: false,
      description: "Volledige controle via app. Monitor toiletgedrag, gewicht en gezondheid van je kat."
    },
    {
      title: "Afvalbak Capaciteit",
      icon: Package,
      ours: "10.5L",
      others1: "9L",
      others2: "7L",
      description: "De grootste afvalbak in zijn klasse. 10.5L betekent minder vaak legen."
    },
    {
      title: "Ultra-Stil (<40 dB)",
      icon: VolumeX,
      ours: true,
      others1: true,
      others2: false,
      description: "Bijna onhoorbaar tijdens gebruik. Stiller dan een rustig gesprek."
    },
    {
      title: "Dubbele Veiligheidssensoren",
      icon: ShieldCheck,
      ours: true,
      others1: false,
      others2: false,
      description: "Geavanceerde sensoren detecteren je kat en stoppen direct voor maximale veiligheid."
    },
  ];

  const renderCheckmark = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <X className="h-4 w-4 text-gray-300" />
      );
    }
    return <span className="text-xs font-bold text-gray-900">{value}</span>;
  };

  return (
    <div className="space-y-2">
      {specs.map((spec, index) => {
        const Icon = spec.icon;
        const isOpen = openSpecs.has(index);
        
        return (
          <div 
            key={index} 
            className="border-t border-gray-200 first:border-t-0 bg-gray-50"
          >
            {/* Accordion Header - COMPACT ZOALS FAQ */}
            <button
              onClick={() => toggleSpec(index)}
              className="w-full flex items-center justify-between py-3 text-left hover:bg-gray-100/50 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1">
                <Icon className="h-4 w-4 text-brand flex-shrink-0" />
                <span className="font-normal text-sm text-gray-900">{spec.title}</span>
              </div>
              
              {/* Chevron */}
              <ChevronDown 
                className={`h-4 w-4 text-gray-600 transition-transform duration-200 flex-shrink-0 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Accordion Content - OPEN NA KLIK */}
            {isOpen && (
              <div className="px-3 pb-3 bg-gray-50 animate-in slide-in-from-top-2 duration-200">
                <p className="text-xs text-gray-700 leading-relaxed">
                  {spec.description}
                </p>
                
                {/* Comparison - Compact inline */}
                {(spec.others1 !== undefined || spec.others2 !== undefined) && (
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-900">Onze:</span>
                      {renderCheckmark(spec.ours)}
                    </div>
                    {spec.others1 !== undefined && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">vs</span>
                        {renderCheckmark(spec.others1)}
                      </div>
                    )}
                    {spec.others2 !== undefined && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">/</span>
                        {renderCheckmark(spec.others2)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


