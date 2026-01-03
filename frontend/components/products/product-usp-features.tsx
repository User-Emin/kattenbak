"use client";

import { Package, Volume2 } from "lucide-react";

/**
 * Product USP Features Component
 * DRY: Shared between homepage and product detail page
 * Shows the two main product benefits with consistent styling
 */
export function ProductUspFeatures() {
  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      {/* Feature 1: 10.5L Capaciteit */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <Package className="h-12 w-12 text-[#f76402] flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-normal text-gray-900 mb-2">
              <strong className="text-[#f76402] font-normal">10.5L</strong> Capaciteit
            </h3>
            <p className="text-gray-700 leading-relaxed font-light">
              De <strong className="font-normal">grootste afvalbak</strong> in zijn klasse. Minder vaak legen betekent meer vrijheid voor jou.
            </p>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Bij 1 kat: ~1x per week legen</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Bij meerdere katten: 2-3x per week</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>30% minder onderhoud vs concurrentie (7-9L)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Feature 2: Ultra-Quiet Motor */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <Volume2 className="h-12 w-12 text-[#f76402] flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-normal text-gray-900 mb-2">
              <strong className="text-[#f76402] font-normal">Ultra-Quiet</strong> Motor
            </h3>
            <p className="text-gray-700 leading-relaxed font-light">
              Werkt onder <strong className="font-normal">40 decibel</strong>. Zo stil dat je het nauwelijks hoort, maar het doet zijn werk perfect.
            </p>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Stiller dan een gesprek (60dB)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Geen stress voor gevoelige katten</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Ook 's nachts onhoorbaar</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

