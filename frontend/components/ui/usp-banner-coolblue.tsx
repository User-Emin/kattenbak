/**
 * COOLBLUE-STYLE USP BANNER
 * Compact, horizontal, under navbar
 */

'use client';

import { Truck, RotateCcw, Shield, Clock } from 'lucide-react';

export function UspBannerCoolblue() {
  return (
    <div className="bg-gray-50 border-y border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="flex items-center justify-center gap-8 text-xs">
          <div className="flex items-center gap-1.5">
            <Truck className="h-4 w-4 text-brand" />
            <span className="font-medium">Gratis verzending vanaf €50</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-brand" />
            <span className="font-medium">Morgen in huis</span>
          </div>
          <div className="flex items-center gap-1.5">
            <RotateCcw className="h-4 w-4 text-brand" />
            <span className="font-medium">14 dagen bedenktijd</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-brand" />
            <span className="font-medium">2 jaar garantie</span>
          </div>
        </div>
      </div>
    </div>
  );
}
