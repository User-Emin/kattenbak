"use client";

import { Truck, Shield, Clock, RefreshCw } from "lucide-react";

export function USPBanner() {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-6 lg:px-10 max-w-7xl">
        <div className="flex items-center justify-start gap-8 py-3 overflow-x-auto">
          {/* Gratis verzending */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Truck className="w-4 h-4 text-brand" />
            <span className="text-xs font-medium text-gray-700">Gratis verzending</span>
          </div>

          {/* 2 jaar garantie */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Shield className="w-4 h-4 text-brand" />
            <span className="text-xs font-medium text-gray-700">2 jaar garantie</span>
          </div>

          {/* Vandaag besteld, morgen in huis */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Clock className="w-4 h-4 text-brand" />
            <span className="text-xs font-medium text-gray-700">Vandaag besteld, morgen in huis</span>
          </div>

          {/* 30 dagen bedenktijd */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <RefreshCw className="w-4 h-4 text-brand" />
            <span className="text-xs font-medium text-gray-700">30 dagen bedenktijd</span>
          </div>
        </div>
      </div>
    </div>
  );
}
