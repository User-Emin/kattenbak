'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DESIGN_SYSTEM } from '@/lib/design-system';
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

/**
 * RETOURNEREN PAGE - STRAK & MINIMALISTISCH
 * 
 * ✅ Winkelwagen blauw accent (#129DD8)
 * ✅ GEEN emoji
 * ✅ GEEN shadows
 * ✅ 1 kleur achtergrond (wit)
 * ✅ Dunne, strakke fonts
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DRY: Return Process Steps
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const RETURN_PROCESS = [
  {
    id: 'request',
    icon: Package,
    title: 'Formulier invullen',
    description: 'Vul het retourformulier volledig in met uw gegevens',
  },
  {
    id: 'label',
    icon: Mail,
    title: 'Retourlabel ontvangen',
    description: 'U ontvangt binnen enkele minuten een retourlabel per e-mail',
  },
  {
    id: 'ship',
    icon: TruckIcon,
    title: 'Product verzenden',
    description: 'Print het label, plak op het pakket en breng het naar PostNL',
  },
  {
    id: 'inspect',
    icon: CheckCircle2,
    title: 'Terugbetaling',
    description: 'We verwerken uw terugbetaling binnen 5 werkdagen',
  },
] as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DRY: Return Policy Info
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
  const [formData, setFormData] = useState({
    orderNumber: '',
    email: '',
    reason: '',
    description: '',
    accountNumber: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // TODO: Implement actual submission logic
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    alert('Retour aanvraag succesvol verzonden! U ontvangt een bevestiging per e-mail.');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const isFormValid = formData.orderNumber.trim() && formData.email.trim() && formData.reason && formData.description.trim();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Minimalistisch */}
      <section className="relative py-12 border-b bg-white">
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-light mb-3 text-gray-900">
              Retour Aanvragen
            </h1>
            <p className="text-base font-light text-gray-600 leading-relaxed">
              Niet tevreden? Binnen <span className="font-normal text-gray-900">{RETURN_POLICY.returnPeriod} dagen</span> kunt u uw bestelling{' '}
              <span className="font-normal text-brand">{RETURN_POLICY.shippingCost}</span> retourneren.
            </p>
          </div>
        </div>
      </section>

      {/* Main Retour Form - STRAK & CLEAN */}
      <section className="py-10 bg-white">
        <div className="container-custom max-w-2xl mx-auto">
          <Card className="p-6 md:p-8 border rounded-sm bg-white">
            <h2 className="text-xl font-normal mb-1 text-center text-gray-900">Retourformulier</h2>
            <p className="text-sm font-light text-gray-600 text-center mb-6">Vul alle velden in om uw retour aan te vragen</p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Bestelnummer */}
              <div>
                <Label htmlFor="orderNumber" className="text-sm font-normal mb-1.5 block text-gray-900">
                  Bestelnummer <span className="text-brand">*</span>
                </Label>
                <Input
                  id="orderNumber"
                  name="orderNumber"
                  type="text"
                  placeholder="Bijv. ORD-2024-001"
                  value={formData.orderNumber}
                  onChange={handleInputChange}
                  className="h-11 text-sm font-light rounded-sm border focus:border-brand transition-all"
                  required
                />
                <p className="text-xs font-light text-gray-500 mt-1">Te vinden in uw orderbevestiging email</p>
              </div>

              {/* E-mailadres */}
              <div>
                <Label htmlFor="email" className="text-sm font-normal mb-1.5 block text-gray-900">
                  E-mailadres <span className="text-brand">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="uw@email.nl"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="h-11 text-sm font-light rounded-sm border focus:border-brand transition-all"
                  required
                />
                <p className="text-xs font-light text-gray-500 mt-1">Gebruikt bij uw bestelling</p>
              </div>

              {/* Retour reden */}
              <div>
                <Label htmlFor="reason" className="text-sm font-normal mb-1.5 block text-gray-900">
                  Reden voor retour <span className="text-brand">*</span>
                </Label>
                <select
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="w-full h-11 px-3 text-sm font-light rounded-sm border border-gray-200 focus:border-brand focus:ring-0 transition-all bg-white"
                  required
                >
                  <option value="">Selecteer een reden...</option>
                  {RETURN_POLICY.reasons.map((reason) => (
                    <option key={reason.key} value={reason.key}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Beschrijving/Toelichting */}
              <div>
                <Label htmlFor="description" className="text-sm font-normal mb-1.5 block text-gray-900">
                  Toelichting <span className="text-brand">*</span>
                </Label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Beschrijf waarom u dit product wilt retourneren..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2.5 text-sm font-light rounded-sm border border-gray-200 focus:border-brand focus:ring-0 transition-all resize-none"
                  required
                />
                <p className="text-xs font-light text-gray-500 mt-1">Minimaal 20 karakters</p>
              </div>

              {/* Bankrekeningnummer (optioneel) */}
              <div>
                <Label htmlFor="accountNumber" className="text-sm font-normal mb-1.5 block text-gray-900">
                  IBAN Bankrekeningnummer (optioneel)
                </Label>
                <Input
                  id="accountNumber"
                  name="accountNumber"
                  type="text"
                  placeholder="NL00 BANK 0000 0000 00"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  className="h-11 text-sm font-light rounded-sm border focus:border-brand transition-all"
                />
                <p className="text-xs font-light text-gray-500 mt-1">Voor snellere terugbetaling</p>
              </div>

              {/* Info banner */}
              <div className="bg-gray-50 border border-gray-200 rounded-sm p-4">
                <div className="flex gap-3">
                  <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#129DD8' }} />
                  <div className="text-sm font-light text-gray-700 leading-relaxed">
                    <p className="font-normal text-gray-900 mb-0.5">100% Tevredenheidsgarantie</p>
                    <p>Na goedkeuring ontvangt u binnen {RETURN_POLICY.processingTime} werkdagen uw geld terug.</p>
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                className={`w-full h-12 text-base ${DESIGN_SYSTEM.button.borderRadius} bg-brand hover:bg-brand-dark text-white font-normal transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Aanvraag verzenden...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>Retour Aanvragen</span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </section>

      <Separator variant="float" spacing="md" />

      {/* Return Process - Minimalistisch */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <h2 className="text-2xl font-light text-center mb-2 text-gray-900">
            Hoe werkt het?
          </h2>
          <p className="text-base font-light text-center text-gray-600 mb-10">
            Simpel in 4 stappen naar uw geld terug
          </p>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {RETURN_PROCESS.map((step, index) => {
                const Icon = step.icon;
                
                return (
                  <div key={step.id} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-sm border border-gray-200 bg-white">
                      <Icon className="w-5 h-5 text-brand" strokeWidth={1.5} />
                    </div>
                    
                    <h3 className="text-base font-normal mb-1.5 text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-sm font-light text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Separator variant="float" spacing="md" />

      {/* Retourvoorwaarden - Accordion */}
      <section className="py-12 bg-white">
        <div className="container-custom max-w-3xl mx-auto">
          <h2 className="text-2xl font-light text-center mb-2 text-gray-900">
            Retourvoorwaarden
          </h2>
          <p className="text-base font-light text-center text-gray-600 mb-8">
            Alles wat u moet weten over retourneren
          </p>
          
          {/* Accordion Sections */}
          <div className="space-y-2">
            {/* Section 1: Belangrijkste info */}
            <div className="border border-gray-200 rounded-sm overflow-hidden hover:border-brand transition-colors bg-white">
              <button
                onClick={() => setOpenSection(openSection === 'policy' ? null : 'policy')}
                className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-brand flex-shrink-0" strokeWidth={1.5} />
                  <span className="text-base font-normal text-gray-900">Retourbeleid & Belangrijke Info</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform text-gray-600 ${openSection === 'policy' ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {openSection === 'policy' && (
                <div className="px-5 pb-5 pt-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2.5 p-3 rounded-sm bg-gray-50 border border-gray-200">
                      <Clock className="h-4 w-4 text-brand shrink-0 mt-0.5" strokeWidth={1.5} />
                      <div>
                        <h3 className="font-normal text-sm mb-0.5 text-gray-900">Retourperiode</h3>
                        <p className="text-xs font-light text-gray-600">
                          {RETURN_POLICY.returnPeriod} dagen bedenktijd na ontvangst
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-3 rounded-sm bg-gray-50 border border-gray-200">
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={1.5} style={{ color: '#129DD8' }} />
                      <div>
                        <h3 className="font-normal text-sm mb-0.5 text-gray-900">Terugbetaling</h3>
                        <p className="text-xs font-light text-gray-600">
                          Binnen {RETURN_POLICY.processingTime} werkdagen na goedkeuring
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-3 rounded-sm bg-gray-50 border border-gray-200">
                      <TruckIcon className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={1.5} style={{ color: '#129DD8' }} />
                      <div>
                        <h3 className="font-normal text-sm mb-0.5 text-gray-900">Verzendkosten</h3>
                        <p className="text-xs font-light text-gray-600">
                          Retour verzenden is {RETURN_POLICY.shippingCost}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-3 rounded-sm bg-gray-50 border border-gray-200">
                      <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={1.5} style={{ color: '#129DD8' }} />
                      <div>
                        <h3 className="font-normal text-sm mb-0.5 text-gray-900">Garantie</h3>
                        <p className="text-xs font-light text-gray-600">
                          100% tevredenheidsgarantie
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Voorwaarden */}
            <div className="border border-gray-200 rounded-sm overflow-hidden hover:border-brand transition-colors bg-white">
              <button
                onClick={() => setOpenSection(openSection === 'conditions' ? null : 'conditions')}
                className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} style={{ color: '#129DD8' }} />
                  <span className="text-base font-normal text-gray-900">Voorwaarden voor Retourneren</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform text-gray-600 ${openSection === 'conditions' ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {openSection === 'conditions' && (
                <div className="px-5 pb-5 pt-1">
                  <div className="space-y-2">
                    {RETURN_POLICY.conditions.map((condition, index) => (
                      <div key={index} className="flex items-start gap-2.5 p-3 rounded-sm bg-gray-50 border border-gray-200">
                        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={1.5} style={{ color: '#129DD8' }} />
                        <span className="text-sm font-light text-gray-700 leading-relaxed">{condition}</span>
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
