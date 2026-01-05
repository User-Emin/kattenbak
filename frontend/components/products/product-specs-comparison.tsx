"use client";

import { useState } from "react";
import { 
  ChevronDown, Check, X, 
  Sparkles, ShieldCheck, Smartphone, VolumeX, Package, 
  Filter, Shield, Layers, CheckCircle, Maximize, Settings 
} from "lucide-react";
import { PRODUCT_CONTENT } from "@/lib/content.config";

/**
 * Product Specifications Comparison - DRY via content.config
 * ALLE 12 SPECS uit screenshot met passende icons
 * "Meer specificaties" knop onder eerste 4 specs
 * ACCORDION: 1 open = rest sluit automatisch
 */

export function ProductSpecsComparison() {
  // ✅ DRY: Track single open spec + show all toggle
  const [openSpec, setOpenSpec] = useState<number | null>(null);
  const [showAllSpecs, setShowAllSpecs] = useState(false);

  const toggleSpec = (index: number) => {
    // ✅ ACCORDION: Als je dezelfde klikt = sluit, anders open nieuwe en sluit rest
    setOpenSpec(openSpec === index ? null : index);
  };

  // ✅ DRY: Icon mapping - ALLE icons uit screenshot
  const iconMap: Record<string, any> = {
    sparkles: Sparkles,
    smartphone: Smartphone,
    package: Package,
    volumeX: VolumeX,
    shieldCheck: ShieldCheck,
    filter: Filter,
    shield: Shield,
    layers: Layers,
    checkCircle: CheckCircle,
    maximize: Maximize,
    settings: Settings,
  };

  const renderValue = (value: string | boolean | undefined) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <X className="h-4 w-4 text-gray-300" />
      );
    }
    if (typeof value === 'string') {
      return <span className="text-xs font-bold text-gray-900">{value}</span>;
    }
    return null;
  };

  return (
    <div className="space-y-2">
      {/* ✅ Eerste 4 specs (altijd zichtbaar) */}
      {PRODUCT_CONTENT.specs.slice(0, PRODUCT_CONTENT.initialVisibleSpecs).map((spec, index) => {
        const Icon = iconMap[spec.icon || 'sparkles'];
        const isOpen = openSpec === index;
        
        return (
          <div 
            key={index} 
            className="border-b border-gray-200 last:border-b-0"
          >
            {/* Accordion Header - RUSTIG & ZAKELIJK */}
            <button
              onClick={() => toggleSpec(index)}
              className="w-full flex items-center justify-between py-3 px-3 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2.5 flex-1">
                <Icon className="h-4 w-4 text-accent flex-shrink-0" />
                <span className="font-normal text-sm text-gray-800">{spec.title}</span>
              </div>
              
              <ChevronDown 
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Accordion Content - RUSTIG */}
            {isOpen && (
              <div className="px-3 pb-3 bg-white animate-in slide-in-from-top-2 duration-200">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {spec.description}
                </p>
                
                {/* Comparison - alleen als value bestaat */}
                {'value' in spec && spec.value && (
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <div className="flex items-center gap-1">
                      {/* ✅ DRY: Labels from config */}
                      <span className="font-semibold text-gray-900">{PRODUCT_CONTENT.labels.ourProduct}:</span>
                      {renderValue(spec.value)}
                    </div>
                    {'competitors' in spec && spec.competitors && spec.competitors.map((comp, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="text-gray-500">{i === 0 ? PRODUCT_CONTENT.labels.versus : '/'}</span>
                        {renderValue(comp)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      
      {/* ✅ "Meer specificaties" - GEWOON TEKST, GEEN BUTTON */}
      {!showAllSpecs && (
        <div className="flex justify-center mt-3">
          <button
            onClick={() => setShowAllSpecs(true)}
            className="flex items-center gap-1.5 text-brand hover:text-brand-dark transition-colors font-semibold text-sm py-1"
          >
            <span>{PRODUCT_CONTENT.labels.showAllSpecs}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      
      {/* ✅ Extra specs (alleen zichtbaar na "Meer" klik) */}
      {showAllSpecs && PRODUCT_CONTENT.specs.slice(PRODUCT_CONTENT.initialVisibleSpecs).map((spec, index) => {
        const actualIndex = index + PRODUCT_CONTENT.initialVisibleSpecs;
        const Icon = iconMap[spec.icon || 'sparkles'];
        const isOpen = openSpec === actualIndex;
        
        return (
          <div 
            key={actualIndex} 
            className="border-b border-gray-200 last:border-b-0 animate-in slide-in-from-top-2 duration-200"
          >
            <button
              onClick={() => toggleSpec(actualIndex)}
              className="w-full flex items-center justify-between py-3 px-3 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2.5 flex-1">
                <Icon className="h-4 w-4 text-accent flex-shrink-0" />
                <span className="font-normal text-sm text-gray-800">{spec.title}</span>
              </div>
              
              <ChevronDown 
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isOpen && (
              <div className="px-3 pb-3 bg-white animate-in slide-in-from-top-2 duration-200">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {spec.description}
                </p>
                
                {'value' in spec && spec.value && (
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-gray-900">{PRODUCT_CONTENT.labels.ourProduct}:</span>
                      {renderValue(spec.value)}
                    </div>
                    {'competitors' in spec && spec.competitors && spec.competitors.map((comp, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="text-gray-500">{i === 0 ? PRODUCT_CONTENT.labels.versus : '/'}</span>
                        {renderValue(comp)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      
      {/* ✅ "Minder specificaties" - GEWOON TEKST, GEEN BUTTON */}
      {showAllSpecs && (
        <div className="flex justify-center mt-3">
          <button
            onClick={() => setShowAllSpecs(false)}
            className="flex items-center gap-1.5 text-brand hover:text-brand-dark transition-colors font-semibold text-sm py-1"
          >
            <span>{PRODUCT_CONTENT.labels.hideSpecs}</span>
            <ChevronDown className="h-3.5 w-3.5 rotate-180" />
          </button>
        </div>
      )}
    </div>
  );
}


