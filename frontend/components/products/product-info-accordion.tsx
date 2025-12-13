"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface ProductInfoAccordionProps {
  title: string;
  content: string;
}

/**
 * Product Info Accordion - Zedar Style
 * DRY: Klikbare info sectie zoals Zedar.eu
 */
export function ProductInfoAccordion({ title, content }: ProductInfoAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto border-t border-gray-200">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-6 text-left hover:bg-gray-50/50 transition-colors group"
      >
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
        <ChevronDown 
          className={`h-6 w-6 text-gray-600 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="pb-8 animate-in slide-in-from-top-2 duration-300">
          <p className="text-gray-700 leading-relaxed text-base max-w-3xl">
            {content}
          </p>
        </div>
      )}
    </div>
  );
}
