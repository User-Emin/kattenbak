/**
 * COMPACT USP BANNER - Direct onder navbar
 * 3 USPs met dikgedrukte keywords zoals in product detail
 */

'use client';

import { Truck, RotateCcw, Shield } from 'lucide-react';

export function UspBannerCoolblue() {
  return (
    <div className="bg-[#f5f5f5] border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-6 md:gap-10 text-sm flex-wrap">
          {/* USP 1: Gratis verzending */}
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-[#0071ce] flex-shrink-0" />
            <span className="text-gray-800">
              <strong className="font-bold">Gratis verzending</strong> vanaf €50
            </span>
          </div>
          
          {/* USP 2: 14 dagen bedenktijd */}
          <div className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-[#0071ce] flex-shrink-0" />
            <span className="text-gray-800">
              <strong className="font-bold">14 dagen</strong> bedenktijd
            </span>
          </div>
          
          {/* USP 3: 1 jaar garantie */}
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#0071ce] flex-shrink-0" />
            <span className="text-gray-800">
              <strong className="font-bold">1 jaar</strong> garantie
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
