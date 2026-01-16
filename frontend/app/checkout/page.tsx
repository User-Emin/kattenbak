"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/utils";
import { SHIPPING_CONFIG } from "@/lib/config";
import { Product } from "@/types/product";
import { CreateOrderData } from "@/types/product";
import { productsApi } from "@/lib/api/products";
import { ordersApi } from "@/lib/api/orders";
import { Loader2, CreditCard, Cookie, AlertCircle } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { getProductImage } from "@/lib/image-config";
import { useCookieConsent } from "@/lib/hooks/use-cookie-consent";
import { PaymentMethodSelector, type PaymentMethodType } from "@/components/payment/payment-method-selector";
import { DESIGN_SYSTEM } from "@/lib/design-system";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { items, customerData, saveCustomerData } = useCart();
  const { hasConsent, acceptAll } = useCookieConsent(); // ✅ Cookie consent check
  
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveData, setSaveData] = useState(true);
  const [showCookieWarning, setShowCookieWarning] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('ideal'); // ✅ Payment method state

  const [formData, setFormData] = useState({
    firstName: customerData?.firstName || "",
    lastName: customerData?.lastName || "",
    email: customerData?.email || "",
    phone: customerData?.phone || "",
    street: customerData?.street || "",
    houseNumber: customerData?.houseNumber || "",
    addition: customerData?.addition || "",
    postalCode: customerData?.postalCode || "",
    city: customerData?.city || "",
    country: customerData?.country || "NL",
  });

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // ✅ FIX: Eerst proberen product uit cart items te halen (beter, geen API call nodig)
        const productId = searchParams.get("product");
        const qty = parseInt(searchParams.get("quantity") || "1", 10);

        // ✅ PREFER CART: Als cart items beschikbaar zijn, gebruik die (sneller, betrouwbaarder)
        if (items && items.length > 0) {
          const cartProduct = items.find(item => item.product.id === productId) || items[0];
          if (cartProduct && cartProduct.product) {
            setProduct(cartProduct.product);
            setQuantity(cartProduct.quantity || qty);
            setIsLoading(false);
            return;
          }
        }

        // ✅ FALLBACK: Als geen cart items, haal via API
        if (!productId) {
          router.push("/");
          return;
        }

        // ✅ RETRY LOGIC: Probeer eerst met ID, dan met slug als fallback
        try {
          const data = await productsApi.getById(productId);
          setProduct(data);
          setQuantity(qty);
        } catch (idError) {
          // ✅ FALLBACK: Als ID niet werkt, probeer als slug (voor oude links)
          try {
            const slugData = await productsApi.getBySlug(productId);
            setProduct(slugData);
            setQuantity(qty);
          } catch (slugError) {
            throw new Error("Product niet gevonden");
          }
        }
      } catch (err: any) {
        console.error('Product load error:', err);
        setError("Product niet gevonden");
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [searchParams, router, items]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Save customer data to localStorage
      if (saveData) {
        saveCustomerData(formData);
      }

      // ✅ DRY: Match backend schema exactly
      const orderData = {
        items: [{ 
          productId: product.id, 
          quantity,
          price: product.price 
        }],
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || undefined,
        },
        shipping: {
          address: `${formData.street} ${formData.houseNumber}${formData.addition ? ' ' + formData.addition : ''}`,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        paymentMethod: paymentMethod, // ✅ DRY: Use selected payment method
      };

      const result = await ordersApi.create(orderData);

      // ✅ DRY: Handle both response formats
      const checkoutUrl = result.paymentUrl || result.payment?.checkoutUrl;
      
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error("Payment URL not available");
      }
    } catch (err: any) {
      // ✅ SECURITY: Generic error message - geen gevoelige data lekken
      const errorMessage = err?.response?.data?.error || err?.message;
      // ✅ SECURITY: Filter gevoelige informatie (API keys, stack traces, etc.)
      const safeMessage = errorMessage && !errorMessage.includes('API') && !errorMessage.includes('key') && !errorMessage.includes('stack')
        ? errorMessage
        : "Er is iets misgegaan bij het plaatsen van je bestelling. Probeer het opnieuw of neem contact met ons op.";
      setError(safeMessage);
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-20 flex justify-center">
        <Loader2 
          className="h-12 w-12 animate-spin"
          style={{
            color: '#3C3C3D', // ✅ GRADIENT START (was text-black)
          }}
        />
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Oeps!</h1>
        <p className="text-gray-600 mb-8">{error}</p>
        <Button onClick={() => router.push("/")}>Terug naar home</Button>
      </div>
    );
  }

  if (!product) return null;

  // DRY: Nederlandse consumentenprijzen zijn INCLUSIEF BTW
  // Product.price = €299,99 INCL. BTW
  // We moeten BTW component berekenen voor transparantie
  const subtotal = product.price * quantity; // Incl. BTW
  const shipping = subtotal >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CONFIG.DEFAULT_COST; // ✅ DRY: Always €0
  
  // BTW berekening: uit INCLUSIEF prijs halen
  const total = subtotal + shipping; // Eindprijs
  const priceExclVAT = total / 1.21; // Prijs excl. BTW
  const tax = total - priceExclVAT; // BTW bedrag

  return (
    <div className="bg-white min-h-screen py-12"> {/* ✅ ECHT WIT: bg-white */}
      <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2 text-gray-900">Afrekenen</h1>
          <p className="text-gray-600 text-base">Vul je gegevens in voor een snelle checkout</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Gegevens Form - Direct op achtergrond */}
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">
                Jouw Gegevens
              </h2>
            
              <Separator variant="float" spacing="sm" />
              
              <div className="space-y-5 my-6">
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Voornaam" 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="Jan"
                    autoComplete="given-name"
                  />
                  <Input 
                    label="Achternaam" 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="Janssen"
                    autoComplete="family-name"
                  />
                </div>

                <Input 
                  label="E-mailadres" 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="jan@voorbeeld.nl"
                  autoComplete="email"
                />
                
                <Input 
                  label="Telefoonnummer" 
                  name="phone" 
                  type="tel" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  placeholder="06 12345678"
                  autoComplete="tel"
                />
              </div>

              <Separator variant="float" spacing="md" />

              <h3 className="font-semibold text-lg mb-5 flex items-center gap-2 text-gray-900">
                <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Verzendadres
              </h3>
              
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Input 
                      label="Straatnaam" 
                      name="street" 
                      value={formData.street} 
                      onChange={handleInputChange} 
                      required 
                      placeholder="Hoofdstraat"
                      autoComplete="address-line1"
                    />
                  </div>
                  <Input 
                    label="Nummer" 
                    name="houseNumber" 
                    value={formData.houseNumber} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="123"
                    autoComplete="address-line2"
                  />
                </div>

                <Input 
                  label="Toevoeging" 
                  name="addition" 
                  value={formData.addition} 
                  onChange={handleInputChange} 
                  placeholder="A, 2hoog (optioneel)"
                  autoComplete="address-line3"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Postcode" 
                    name="postalCode" 
                    value={formData.postalCode} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="1234 AB"
                    autoComplete="postal-code"
                  />
                  <Input 
                    label="Plaats" 
                    name="city" 
                    value={formData.city} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="Amsterdam"
                    autoComplete="address-level2"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded text-red-700 text-sm flex items-start gap-3 mt-6">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-semibold">Fout bij bestellen</p>
                    <p className="mt-1">{error}</p>
                  </div>
                </div>
              )}

              <Separator variant="float" spacing="md" />

              {/* Guest Checkout Info + Consent - SMOOTH */}
              <div className="space-y-3">
                <div className="text-sm text-gray-600 bg-white px-4 py-3 rounded border border-gray-200"> {/* ✅ ECHT WIT: bg-white met border (was bg-gray-50) */}
                  ✓ Geen account nodig - direct afrekenen als gast
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveData}
                    onChange={(e) => setSaveData(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-accent border border-gray-300 rounded focus:ring-2 focus:ring-accent/20 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 leading-relaxed">
                    Gegevens bewaren voor snellere checkout (7 dagen)
                  </span>
                </label>
              </div>
            </div>

            {/* Bestelling Overzicht - Rechterkant, direct op achtergrond */}
            <div className="space-y-6">
              <div className="sticky top-28">
                <h2 className="text-2xl font-semibold mb-6 text-gray-900">Jouw Bestelling</h2>

                <Separator variant="float" spacing="sm" />
                
                <div className="flex gap-4 my-6">
                  <div className="relative w-24 h-24 bg-white rounded overflow-hidden flex-shrink-0 shadow-sm">
                    <ProductImage 
                      src={getProductImage(product.images)} 
                      alt={product.name} 
                      fill 
                      className="object-cover" 
                      enableZoom={true} 
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1 text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">Aantal: {quantity}</p>
                    <p className="font-semibold text-gray-900">{formatPrice(product.price)}</p>
                  </div>
                </div>

                <Separator variant="float" spacing="sm" />

                <div className="space-y-3 my-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotaal</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Verzendkosten</span>
                    <span className="font-semibold">{shipping === 0 ? "Gratis" : formatPrice(shipping)}</span>
                  </div>
                </div>

                <Separator variant="float" spacing="sm" />

                <div className="space-y-2 my-6">
                  <div className="flex justify-between items-center text-xl font-semibold text-gray-900">
                    <span>Totaal</span>
                    <span className="text-2xl text-brand">{formatPrice(total)}</span>
                  </div>
                </div>

                <Separator variant="float" spacing="md" />

                {/* ✅ Payment Method Selector - EERST payment logos, DAN BTW text eronder */}
                <div className="mt-6">
                  <PaymentMethodSelector
                    selectedMethod={paymentMethod}
                    onMethodChange={setPaymentMethod}
                  />
                  <p className="text-sm text-gray-600 text-center mt-4">Incl. 21% BTW ({formatPrice(tax)})</p>
                </div>

                <Separator variant="float" spacing="sm" />

                {/* CTA Button rechts - Prominent ORANJE */}
                <div className="mt-6">
                  <Button 
                    type="submit" 
                    className="w-full text-white font-semibold py-3 px-6 flex items-center justify-center gap-2" 
                    style={{
                      background: `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.primaryStart} 0%, ${DESIGN_SYSTEM.colors.primaryEnd} 100%)`, // ✅ GRADIENT GRIJS: Via DESIGN_SYSTEM (geen hardcode)
                    }}
                    size="lg" 
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Verwerken...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5" />
                        <span>Betalen - {formatPrice(total)}</span>
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Veilig betalen via Mollie
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-brand" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
