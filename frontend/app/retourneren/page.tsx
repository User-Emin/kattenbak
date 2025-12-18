"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Package, CheckCircle, XCircle } from "lucide-react";

export default function RetournerenPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [reasonDetails, setReasonDetails] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);

  const handleCheckEligibility = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    setEligibilityResult(null);
    setSelectedItems([]);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/returns/check/${orderNumber}`);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server gaf een ongeldige response. Probeer het later opnieuw.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bestelling niet gevonden');
      }

      setEligibilityResult(data.data);
    } catch (error: any) {
      console.error('Check eligibility error:', error);
      setEligibilityResult({
        eligible: false,
        reason: error.message || 'Fout bij controleren bestelling',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedItems.length === 0) {
      alert('Selecteer minimaal 1 product om te retourneren');
      return;
    }

    if (!reason) {
      alert('Selecteer een reden voor retournering');
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const returnItems = eligibilityResult.order.items
        .filter((item: any) => selectedItems.includes(item.id))
        .map((item: any) => ({
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          productImage: item.productImage,
          quantity: item.quantity,
          price: item.price,
        }));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/returns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: eligibilityResult.order.id,
          orderNumber: eligibilityResult.order.orderNumber,
          customerName: customerEmail.split('@')[0], // Simple fallback
          customerEmail,
          reason,
          reasonDetails,
          items: returnItems,
          customerNotes,
          sendEmail: true,
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server gaf een ongeldige response. Probeer het later opnieuw.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fout bij aanmaken retour');
      }

      setSubmitResult(data.data);
    } catch (error: any) {
      console.error('Submit return error:', error);
      alert(error.message || 'Fout bij aanmaken retour');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Retourneren</h1>
          <p className="text-lg text-gray-600">
            30 dagen bedenktijd • Gratis retourneren • Geld terug garantie
          </p>
        </div>

        {/* Success Message */}
        {submitResult && (
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-green-900 mb-2">
                  ✅ Retour aangevraagd!
                </h3>
                <p className="text-green-800 mb-4">
                  Je retourlabel is aangemaakt en verstuurd naar <strong>{customerEmail}</strong>
                </p>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-2"><strong>Retour ID:</strong></p>
                  <p className="font-mono text-lg">{submitResult.return.returnId}</p>
                  
                  {submitResult.return.trackingCode && (
                    <>
                      <p className="text-sm text-gray-600 mt-4 mb-2"><strong>Track & Trace:</strong></p>
                      <p className="font-mono text-lg">{submitResult.return.trackingCode}</p>
                    </>
                  )}
                </div>
                <p className="text-sm text-green-800">
                  Check je email voor het retourlabel en instructies. Geen email ontvangen? Check je spam folder.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Check Eligibility */}
        {!submitResult && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">1. Controleer je bestelling</h2>
            
            <form onSubmit={handleCheckEligibility} className="space-y-4">
              <Input
                label="Ordernummer"
                name="orderNumber"
                placeholder="Bijv: ORD1734527648123"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                required
              />
              
              <Input
                label="Email adres"
                name="customerEmail"
                type="email"
                placeholder="je@email.nl"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isChecking}
              >
                {isChecking ? 'Controleren...' : 'Controleer bestelling'}
              </Button>
            </form>

            {/* Eligibility Result */}
            {eligibilityResult && (
              <div className="mt-6">
                {eligibilityResult.eligible ? (
                  <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">
                        ✓ Deze bestelling komt in aanmerking voor retournering
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        Retourperiode loopt tot: {new Date(eligibilityResult.returnDeadline).toLocaleDateString('nl-NL')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900">
                        Deze bestelling komt niet in aanmerking voor retournering
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        {eligibilityResult.reason}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Items & Reason */}
        {eligibilityResult?.eligible && !submitResult && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">2. Selecteer producten</h2>
            
            <form onSubmit={handleSubmitReturn} className="space-y-6">
              {/* Product Selection */}
              <div className="space-y-3">
                {eligibilityResult.order.items.map((item: any) => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition ${
                      selectedItems.includes(item.id)
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleItemToggle(item.id)}
                      className="w-5 h-5"
                    />
                    {item.productImage && (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{item.productName}</p>
                      <p className="text-sm text-gray-600">
                        Aantal: {item.quantity} • €{item.price.toFixed(2)}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Reason Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Reden voor retour <span className="text-red-500">*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black"
                >
                  <option value="">Selecteer een reden</option>
                  <option value="DEFECTIVE">Product is defect</option>
                  <option value="WRONG_ITEM">Verkeerd artikel ontvangen</option>
                  <option value="NOT_AS_DESCRIBED">Niet zoals beschreven</option>
                  <option value="CHANGED_MIND">Van gedachten veranderd</option>
                  <option value="DAMAGED_SHIPPING">Beschadigd tijdens verzending</option>
                  <option value="OTHER">Anders</option>
                </select>
              </div>

              {/* Reason Details */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Toelichting (optioneel)
                </label>
                <textarea
                  value={reasonDetails}
                  onChange={(e) => setReasonDetails(e.target.value)}
                  rows={3}
                  placeholder="Vertel ons meer over de reden..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              {/* Customer Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Aanvullende opmerkingen (optioneel)
                </label>
                <textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  rows={3}
                  placeholder="Heeft u nog aanvullende opmerkingen?"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isSubmitting}
                className="text-white"
              >
                {isSubmitting ? 'Aanmaken...' : 'Retour aanvragen'}
              </Button>
            </form>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-xl font-bold mb-4">Retourbeleid</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">📦 30 Dagen Bedenktijd</h4>
              <p className="text-gray-600">
                Niet tevreden? Je hebt 30 dagen bedenktijd om je product kosteloos te retourneren.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">✓ Voorwaarden</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Product in originele staat en verpakking</li>
                <li>Alle accessoires en documentatie meegeleverd</li>
                <li>Niet beschadigd of gebruikt</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">💶 Terugbetaling</h4>
              <p className="text-gray-600">
                Binnen 14 dagen na goedkeuring krijg je je geld terug op dezelfde manier als je hebt betaald.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">📧 Vragen?</h4>
              <p className="text-gray-600">
                Neem contact op via <a href="mailto:info@catsupply.nl" className="text-black underline">info@catsupply.nl</a> of gebruik onze chat assistent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

