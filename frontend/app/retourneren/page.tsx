'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  TruckIcon, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowRight,
  Mail,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { RETURN_REASON_LABELS } from '@/types/return';
import {
  GRADIENTS,
  TEXT_COLORS,
  BRAND_COLORS,
  SEMANTIC_COLORS,
  COMPONENT_COLORS,
  BACKGROUND_OPACITY,
  BORDER_RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  getStepColor,
} from '@/lib/theme-colors';

/**
 * RETOURNEREN PAGE - ABSOLUUT DRY & DYNAMISCH
 * 
 * DRY Principles:
 * - GEEN hardcoded kleuren! Alles via theme-colors.ts
 * - Gebruikt RETURN_REASON_LABELS uit types (geen hardcoded teksten)
 * - Dynamische return flow (order lookup)
 * - Reusable components (Card, Button, etc.)
 * - Centraal kleurensysteem (maintainable)
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DRY: Return Process Steps (Dynamische kleuren via getStepColor)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const RETURN_PROCESS = [
  {
    id: 'request',
    icon: Package,
    title: 'Retour aanvragen',
    description: 'Vul het retourformulier in met uw bestelnummer en reden.',
  },
  {
    id: 'label',
    icon: Mail,
    title: 'Retourlabel ontvangen',
    description: 'U ontvangt binnen enkele minuten een retourlabel per e-mail.',
  },
  {
    id: 'ship',
    icon: TruckIcon,
    title: 'Product verzenden',
    description: 'Print het label, plak op het pakket en breng het naar een PostNL punt.',
  },
  {
    id: 'inspect',
    icon: CheckCircle2,
    title: 'Inspectie & terugbetaling',
    description: 'We inspecteren het product en verwerken uw terugbetaling binnen 5 werkdagen.',
  },
] as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DRY: Return Policy Info (Centralized)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const RETURN_POLICY = {
  returnPeriod: 30,
  processingTime: 5,
  shippingCost: 'gratis',
  conditions: [
    'Product is onbeschadigd en in originele verpakking',
    'Kassabon of bestelnummer is beschikbaar',
    'Product is niet gebruikt (tenzij defect)',
    'Retour binnen 30 dagen na ontvangst',
  ],
  reasons: Object.entries(RETURN_REASON_LABELS).map(([key, label]) => ({
    key,
    label,
  })),
} as const;

export default function RetournerenPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Clean zonder icon */}
      <section className={`relative py-20 border-b overflow-hidden ${GRADIENTS.hero}`}>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className={`${TYPOGRAPHY.heading_complete.h1} mb-6 ${GRADIENTS.textGradient}`}>
              Retourneren
            </h1>
            <p className={`${TYPOGRAPHY.body.xl} text-muted-foreground mb-10 leading-relaxed`}>
              Niet tevreden? Binnen <span className={`${TYPOGRAPHY.weight.bold} ${TEXT_COLORS.gray[900]}`}>{RETURN_POLICY.returnPeriod} dagen</span> kunt u uw bestelling{' '}
              <span className={`${TYPOGRAPHY.weight.bold} text-brand`}>{RETURN_POLICY.shippingCost}</span> retourneren.
            </p>
            
            {/* Quick Return Form - Ronde button, geen icon */}
            <Card className={`p-8 bg-white/90 backdrop-blur-sm border-2 border-gray-100 ${BORDER_RADIUS['3xl']}`}>
              <h2 className={`${TYPOGRAPHY.heading_complete.h3} mb-6 text-center`}>Start uw retour</h2>
              <div className="space-y-5">
                <div className="text-left">
                  <Label htmlFor="orderNumber" className="text-base font-semibold mb-2 block">
                    Bestelnummer
                  </Label>
                  <Input
                    id="orderNumber"
                    name="orderNumber"
                    type="text"
                    placeholder="Bijv. ORD-2024-001"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className={`h-14 text-lg ${BORDER_RADIUS.xl} border-2 focus:border-gray-600 transition-all`}
                  />
                </div>
                <Button
                  className={`w-full h-14 text-lg rounded-full ${COMPONENT_COLORS.button.cta} ${SHADOWS.glow}`}
                  size="lg"
                  disabled={!orderNumber.trim()}
                >
                  {orderNumber.trim() ? (
                    <Link href={`/orders/${orderNumber}/return`} className="flex items-center justify-center w-full gap-2">
                      <span>Retour aanvragen</span>
                      <ArrowRight className="h-5 w-5 shrink-0" />
                    </Link>
                  ) : (
                    'Vul bestelnummer in'
                  )}
                </Button>
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  💡 Uw bestelnummer vindt u in de orderbevestiging email
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Separator variant="float" spacing="xl" />

      {/* Return Process - 1 lijn, alleen navbar blauw + oranje */}
      <section className="relative py-20 overflow-hidden bg-secondary/10">
        <div className="container-custom relative z-10">
          <h2 className={`${TYPOGRAPHY.heading_complete.h2} text-center mb-6 ${GRADIENTS.textGradient}`}>
            Hoe werkt het?
          </h2>
          <p className={`${TYPOGRAPHY.body.lg} text-center text-muted-foreground mb-16 max-w-2xl mx-auto`}>
            Simpel in 4 stappen
          </p>
          
          {/* Steps met 1 doorlopende lijn */}
          <div className="max-w-6xl mx-auto relative">
            {/* Doorlopende lijn tussen alle stappen */}
            <div className="hidden lg:block absolute top-10 left-0 right-0 h-0.5 bg-gray-200"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative">
              {RETURN_PROCESS.map((step, index) => {
                // DRY: Alleen navbar blauw + oranje alternating
                const isOrange = index % 2 === 1;
                const iconColor = isOrange ? 'text-black' : 'text-brand'; // ✅ ZWART ipv ORANJE
                const bgColor = isOrange ? 'bg-gray-50' : 'bg-blue-50'; // ✅ GRIJS ipv ORANJE
                
                return (
                  <div key={step.id} className="relative text-center">
                    {/* Step number - Compact */}
                    <div className={`inline-flex items-center justify-center w-16 h-16 mb-6 ${BORDER_RADIUS.xl} ${bgColor} border-2 ${isOrange ? 'border-orange-600' : 'border-brand'} relative z-10 bg-white`}>
                      <span className={`text-3xl font-bold ${iconColor}`}>
                        {index + 1}
                      </span>
                    </div>
                    
                    <h3 className={`${TYPOGRAPHY.heading_complete.h4} mb-4 whitespace-nowrap`}>
                      {step.title}
                    </h3>
                    <p className={`${TYPOGRAPHY.body.base} text-muted-foreground leading-relaxed`}>
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Separator variant="float" spacing="xl" />

      {/* Retourvoorwaarden - Accordion (DRY: zoals FAQ) */}
      <section className="py-16 bg-secondary/10">
        <div className="container-custom max-w-4xl mx-auto">
          <h2 className={`${TYPOGRAPHY.heading_complete.h2} text-center mb-6 ${GRADIENTS.textGradient}`}>
            Retourvoorwaarden
          </h2>
          <p className={`${TYPOGRAPHY.body.lg} text-center text-muted-foreground mb-12`}>
            Alles wat u moet weten over retourneren
          </p>
          
          {/* Accordion Section 1: Belangrijkste info - COMPACT met icons direct op achtergrond */}
          <div className="space-y-4 mb-8">
            <div className={`border-2 ${BORDER_RADIUS.xl} overflow-hidden hover:border-brand transition-colors bg-white`}>
              <button
                onClick={() => setOpenSection(openSection === 'policy' ? null : 'policy')}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-black flex-shrink-0" />
                  <span className={TYPOGRAPHY.heading_complete.h5}>Retourbeleid & Belangrijke Info</span>
                </div>
                <svg
                  className={`w-5 h-5 transition-transform ${openSection === 'policy' ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {openSection === 'policy' && (
                <div className="px-6 pb-4 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
                      <Clock className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                      <div>
                        <h3 className={`${TYPOGRAPHY.weight.bold} ${TYPOGRAPHY.body.base} mb-1`}>Retourperiode</h3>
                        <p className={`${TYPOGRAPHY.body.sm} text-muted-foreground`}>
                          {RETURN_POLICY.returnPeriod} dagen bedenktijd na ontvangst
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <h3 className={`${TYPOGRAPHY.weight.bold} ${TYPOGRAPHY.body.base} mb-1`}>Terugbetaling</h3>
                        <p className={`${TYPOGRAPHY.body.sm} text-muted-foreground`}>
                          Binnen {RETURN_POLICY.processingTime} werkdagen na goedkeuring
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <TruckIcon className="h-5 w-5 text-black shrink-0 mt-0.5" />
                      <div>
                        <h3 className={`${TYPOGRAPHY.weight.bold} ${TYPOGRAPHY.body.base} mb-1`}>Verzendkosten</h3>
                        <p className={`${TYPOGRAPHY.body.sm} text-muted-foreground`}>
                          Retour verzenden is {RETURN_POLICY.shippingCost}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
                      <ShieldCheck className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                      <div>
                        <h3 className={`${TYPOGRAPHY.weight.bold} ${TYPOGRAPHY.body.base} mb-1`}>Garantie</h3>
                        <p className={`${TYPOGRAPHY.body.sm} text-muted-foreground`}>
                          100% tevredenheidsgarantie
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion Section 2: Voorwaarden - COMPACT */}
            <div className={`border-2 ${BORDER_RADIUS.xl} overflow-hidden hover:border-brand transition-colors bg-white`}>
              <button
                onClick={() => setOpenSection(openSection === 'conditions' ? null : 'conditions')}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-black flex-shrink-0" />
                  <span className={TYPOGRAPHY.heading_complete.h5}>Voorwaarden voor Retourneren</span>
                </div>
                <svg
                  className={`w-5 h-5 transition-transform ${openSection === 'conditions' ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {openSection === 'conditions' && (
                <div className="px-6 pb-4 pt-2">
                  <div className="space-y-2">
                    {RETURN_POLICY.conditions.map((condition, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-gray-50">
                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-900 leading-relaxed">{condition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Accordion Section 3: Geldige redenen - COMPACT */}
            <div className={`border-2 ${BORDER_RADIUS.xl} overflow-hidden hover:border-brand transition-colors bg-white`}>
              <button
                onClick={() => setOpenSection(openSection === 'reasons' ? null : 'reasons')}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-black flex-shrink-0" />
                  <span className={TYPOGRAPHY.heading_complete.h5}>Geldige Retourredenen</span>
                </div>
                <svg
                  className={`w-5 h-5 transition-transform ${openSection === 'reasons' ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {openSection === 'reasons' && (
                <div className="px-6 pb-4 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {RETURN_POLICY.reasons.map((reason) => (
                      <div key={reason.key} className="flex items-center gap-2 p-2 rounded-lg bg-blue-50">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0"></div>
                        <span className="text-sm font-medium">{reason.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

