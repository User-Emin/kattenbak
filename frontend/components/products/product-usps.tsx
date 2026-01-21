"use client";

import Image from "next/image";
import { Shield, Truck, Star, Check, Zap, Sparkles, Package } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

interface ProductUsp {
  icon: string;
  color: string;
  title: string;
  description: string;
  image: string;
}

interface ProductUspsProps {
  usps: [ProductUsp, ProductUsp]; // DRY: Exact 2 USPs
}

// DRY: Icon mapping (alle mogelijke icons met fallback)
const ICON_MAP = {
  shield: Shield,
  truck: Truck,
  star: Star,
  check: Check,
  zap: Zap,
  sparkles: Sparkles,
  package: Package,
} as const;

// DRY: Color mapping - ✅ GRADIENT: #3C3C3D → #7A7A7D (was text-black)
const COLOR_MAP = {
  accent: 'gradient-text', // ✅ GRADIENT (was text-black)
  blue: 'text-[#3071aa]',
  brand: 'text-brand',
} as const;

// ✅ GRADIENT: Utility voor gradient text
const gradientTextStyle = {
  background: 'linear-gradient(135deg, #3C3C3D 0%, #7A7A7D 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
} as const;

/**
 * Product USPs Component - 2 belangrijkste features
 * DRY: Dynamisch via site settings, zigzag layout
 * SECURE: Met fallbacks voor undefined icons
 */
export function ProductUsps({ usps }: ProductUspsProps) {
  return (
    <div className="max-w-5xl mx-auto mb-16 relative">
      <div className="mb-12" style={{ backgroundColor: '#000000', padding: '1.5rem 2rem', borderRadius: '0.5rem' }}>
        <SectionHeading className="mb-0" style={{ color: '#ffffff' }}>
          Waarom deze kattenbak?
        </SectionHeading>
      </div>
      
      <div className="space-y-12">
        {usps.map((usp, index) => {
          // DRY: Get icon component met fallback naar Star
          const IconComponent = ICON_MAP[usp.icon as keyof typeof ICON_MAP] || Star;
          const colorClass = COLOR_MAP[usp.color as keyof typeof COLOR_MAP] || 'text-brand';
          const isEven = index % 2 === 0;

          return (
            <div key={index} className="relative">
              {/* USP Content - Zigzag pattern */}
              <div className={`grid md:grid-cols-2 gap-8 items-center ${
                isEven ? '' : 'md:flex-row-reverse'
              }`}>
                {/* Text content - CENTRAAL OP MOBIEL */}
                <div className={`space-y-4 ${isEven ? 'md:order-1' : 'md:order-2'} text-center md:text-left`}>
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                    {/* Icon direct op achtergrond (geen cirkel/veld) */}
                    <IconComponent className={`h-12 w-12 flex-shrink-0 ${colorClass}`} />
                    
                    <div className="flex-1">
                      <h3 
                        className="text-xl font-normal mb-2"
                        style={usp.color === 'accent' ? gradientTextStyle : undefined}
                      >
                        {usp.title}
                      </h3>
                      <p className="text-gray-700 text-base leading-relaxed font-light">{usp.description}</p>
                    </div>
                  </div>
                </div>

                {/* Image (zonder schaduw) - ✅ SECURITY: Only render if image exists */}
                {usp.image && usp.image.trim() !== '' && (
                  <div className={`${isEven ? 'md:order-2' : 'md:order-1'}`}>
                    <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden">
                      <Image
                        src={usp.image}
                        alt={usp.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Connecting line (alleen tussen USPs) */}
              {index < usps.length - 1 && (
                <div className="hidden md:block absolute left-1/2 -translate-x-1/2 h-12 w-px bg-gray-200 mt-8" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}



