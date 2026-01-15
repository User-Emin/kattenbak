"use client";

import { useState } from "react";
import { ChevronDown, Check, Truck, Shield, RotateCcw } from "lucide-react";
import { Separator } from "@/components/ui/separator";

/**
 * Product Highlights Accordion - Zedar Style
 * DRY: Uitklapbare lijst met belangrijkste product features
 */
export function ProductHighlights() {
  const [isOpen, setIsOpen] = useState(true); // Start open

  const highlights = [
    {
      icon: Check,
      title: "Op voorraad",
      subtitle: "Direct leverbaar",
      color: "text-green-600",
    },
    {
      icon: Truck,
      title: "Gratis verzending",
      subtitle: "Binnen NL",
      color: "text-brand",
    },
    {
      icon: Shield,
      title: "2 jaar garantie",
      subtitle: "Volledige dekking",
      color: "text-brand",
    },
    {
      icon: RotateCcw,
      title: "14 dagen retour",
      subtitle: "Gratis terugsturen",
      color: "gradient-text", // ✅ GRADIENT: #3C3C3D → #7A7A7D (was text-black)
    },
  ];

  return (
    <div className="border-t border-gray-200">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50/50 transition-colors group"
      >
        <h3 className="text-base font-bold text-gray-900">Product Voordelen</h3>
        <ChevronDown 
          className={`h-5 w-5 text-gray-600 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="pb-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index}>
                <div className="flex items-center gap-3 py-2">
                  <Icon 
                    className="h-5 w-5 flex-shrink-0"
                    style={item.color === 'gradient-text' ? { color: '#3C3C3D' } : undefined}
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-600">{item.subtitle}</p>
                  </div>
                </div>
                {index < highlights.length - 1 && <Separator variant="float" spacing="sm" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


