"use client";

import { useState } from "react";
import { ChevronDown, Sparkles, Shield, Smartphone, Package, VolumeX, Layers } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ProductSpecsAccordionProps {
  specs: {
    spec1: { label: string; value: string };
    spec2: { label: string; value: string };
    spec3: { label: string; value: string };
    spec4: { label: string; value: string };
    spec5: { label: string; value: string };
    spec6: { label: string; value: string };
  };
}

const ICON_MAP = {
  0: Sparkles,
  1: Shield,
  2: Smartphone,
  3: Package,
  4: VolumeX,
  5: Layers,
} as const;

/**
 * Product Specs Accordion - Zedar Style
 * DRY: Klikbare sectie zoals veelgestelde vragen
 */
export function ProductSpecsAccordion({ specs }: ProductSpecsAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const allSpecs = [
    { ...specs.spec1, color: 'text-brand' },
    { ...specs.spec2, color: 'text-brand' },
    { ...specs.spec3, color: 'text-brand' },
    { ...specs.spec4, color: 'text-black' }, // ✅ ZWART ipv ORANJE
    { ...specs.spec5, color: 'text-black' }, // ✅ ZWART ipv ORANJE
    { ...specs.spec6, color: 'text-black' }, // ✅ ZWART ipv ORANJE
  ];

  return (
    <div className="max-w-5xl mx-auto border-t border-gray-200">
      {/* Accordion Header - Zedar Style */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-6 text-left hover:bg-gray-50/50 transition-colors group"
      >
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Specificaties</h2>
        <ChevronDown 
          className={`h-6 w-6 text-gray-600 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="pb-8 animate-in slide-in-from-top-2 duration-300">
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-1">
            {allSpecs.map((spec, index) => {
              const IconComponent = ICON_MAP[index as keyof typeof ICON_MAP];
              return (
                <div key={index} className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconComponent className={`h-5 w-5 ${spec.color} flex-shrink-0`} />
                      <span className="text-sm font-semibold text-gray-900">{spec.label}</span>
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{spec.value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

