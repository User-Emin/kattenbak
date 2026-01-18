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
import { BRAND_COLORS_HEX } from "@/lib/color-config";

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

        // ✅ FIX: ALTIJD API gebruiken voor actuele prijs (niet cart localStorage)
        // Cart prijzen kunnen verouderd zijn na admin wijzigingen
        // API geeft altijd de actuele database prijs
        if (!productId) {
          router.push("/");
          return;
        }

        // ✅ RETRY LOGIC: Probeer eerst met ID, dan met slug als fallback
        try {
          const data = await productsApi.getById(productId);
          // ✅ DEBUG: Log product data
          console.log('Checkout loaded product:', {
            id: data.id,
            name: data.name,
            price: data.price,
            priceType: typeof data.price,
          });
          if (!data || !data.id || !data.name) {
            throw new Error("Product data incompleet");
          }
          if (!data.price || data.price <= 0) {
            console.warn('⚠️ Product heeft geen geldige prijs:', data);
            throw new Error("Product prijs niet gevonden");
          }
          setProduct(data);
          setQuantity(qty);
        } catch (idError: any) {
          console.error('Product ID lookup failed:', idError);
          // ✅ FALLBACK: Als ID niet werkt, probeer als slug (voor oude links)
          try {
            const slugData = await productsApi.getBySlug(productId);
            console.log('Checkout loaded product by slug:', {
              id: slugData.id,
              name: slugData.name,
              price: slugData.price,
            });
            if (!slugData || !slugData.id || !slugData.name || !slugData.price || slugData.price <= 0) {
              throw new Error("Product data incompleet");
            }
            setProduct(slugData);
            setQuantity(qty);
          } catch (slugError: any) {
            console.error('Product slug lookup failed:', slugError);
            
            // ✅ FALLBACK: Probeer product uit cart items te halen (laatste redmiddel)
            if (items && items.length > 0) {
              const cartProduct = items.find(item => 
                item.product.id === productId || 
                item.product.slug === productId ||
                item.product.id === "1" // Fallback voor oude numeric IDs
              );
              
              if (cartProduct && cartProduct.product) {
                console.log('Checkout loaded product from cart:', {
                  id: cartProduct.product.id,
                  name: cartProduct.product.name,
                  price: cartProduct.product.price,
                });
                setProduct(cartProduct.product);
                setQuantity(cartProduct.quantity || qty);
                return;
              }
            }
            
            setError("Product niet gevonden. Probeer het opnieuw of ga terug naar de winkelwagen.");
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

      // ✅ FIX: Ensure we use the correct product ID (CUID from cart, not numeric from URL)
      // If product ID is numeric "1", try to find the matching product from cart with CUID
      let productIdToUse = product.id;
      if (product.id === "1" && items && items.length > 0) {
        // Find matching product from cart by name or use first cart item's CUID
        const cartProduct = items.find(item => 
          item.product.name === product.name || 
          item.product.slug === product.slug
        );
        if (cartProduct && cartProduct.product.id && cartProduct.product.id !== "1") {
          productIdToUse = cartProduct.product.id; // ✅ Use CUID from cart
        } else if (items[0] && items[0].product.id && items[0].product.id !== "1") {
          productIdToUse = items[0].product.id; // ✅ Fallback to first cart item's CUID
        }
      }

      // ✅ CRITICAL FIX: Always fetch fresh product data from API to get correct price
      // The product from state might have cached/old price, so fetch it again
      let productPrice = typeof product.price === 'number' 
        ? product.price 
        : parseFloat(String(product.price || '0'));
      
      // ✅ FIX: If price is suspiciously low (like 1.00), fetch fresh from API
      if (productPrice <= 10 && product.id) {
        try {
          const freshProduct = await productsApi.getById(product.id);
          const freshPrice = typeof freshProduct.price === 'number' 
            ? freshProduct.price 
            : parseFloat(String(freshProduct.price || '0'));
          if (freshPrice > 10) {
            productPrice = freshPrice;
            console.log('✅ Fixed price from API:', { oldPrice: product.price, newPrice: productPrice });
          }
        } catch (apiError) {
          console.warn('⚠️ Could not fetch fresh product price:', apiError);
        }
      }
      
      // ✅ DEBUG: Log price calculation
      console.log('Checkout price calculation:', {
        productId: product.id,
        productIdToUse,
        originalPrice: product.price,
        priceType: typeof product.price,
        calculatedPrice: productPrice,
        quantity,
        total: productPrice * quantity,
      });
      
      if (!productPrice || productPrice <= 0 || isNaN(productPrice)) {
        console.error('Invalid product price detected:', {
          product,
          productPrice,
          calculatedPrice: typeof product.price === 'number' ? product.price : parseFloat(String(product.price || '0')),
        });
        setError('Ongeldig productprijs. Controleer je winkelwagen.');
        setIsProcessing(false);
        return;
      }

      const orderData = {
        items: [{ 
          productId: productIdToUse, // ✅ Use CUID instead of numeric ID
          quantity: Number(quantity) || 1, // ✅ FIX: Ensure quantity is number
          price: Number(productPrice) // ✅ FIX: Explicitly use Number() to ensure it's a number
        }],
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || undefined,
        },
        shipping: {
          address: `${formData.street} ${formData.houseNumber}${formData.addition ? ' ' + formData.addition : ''}`, // ✅ Combined for display
          street: formData.street, // ✅ ADD: Separate street for backend parsing
          houseNumber: formData.houseNumber, // ✅ ADD: Separate houseNumber for backend
          addition: formData.addition, // ✅ ADD: Separate addition
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
        <p className="mb-8" style={{ color: DESIGN_SYSTEM.colors.text.primary }}>{error}</p>
        <Button onClick={() => router.push("/")}>Terug naar home</Button>
      </div>
    );
  }

  if (!product) return null;

  // DRY: Nederlandse consumentenprijzen zijn INCLUSIEF BTW
  // Product.price = €299,99 INCL. BTW
  // We moeten BTW component berekenen voor transparantie
  // ✅ FIX: Ensure price is always a number
  const productPrice = typeof product.price === 'number' ? product.price : parseFloat(String(product.price || '0'));
  const subtotal = productPrice * quantity; // Incl. BTW
  const shipping = subtotal >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CONFIG.DEFAULT_COST; // ✅ DRY: Always €0
  
  // BTW berekening: uit INCLUSIEF prijs halen
  const total = subtotal + shipping; // Eindprijs
  const priceExclVAT = total / 1.21; // Prijs excl. BTW
  const tax = total - priceExclVAT; // BTW bedrag

  return (
    <div className="bg-white min-h-screen py-12"> {/* ✅ ECHT WIT: bg-white */}
      <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2" style={{ color: DESIGN_SYSTEM.colors.text.primary }}>Afrekenen</h1>
          <p className="text-base" style={{ color: DESIGN_SYSTEM.colors.text.primary }}>Vul je gegevens in voor een snelle checkout</p>
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
                    <p className="font-semibold text-gray-900">{formatPrice(productPrice)}</p>
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

                {/* CTA Button rechts - Prominent BLAUW */}
                <div className="mt-6">
                  <Button 
                    type="submit" 
                    variant="brand"
                    className="w-full text-white font-semibold py-3 px-6 flex items-center justify-center gap-2" 
                    style={{ backgroundColor: BRAND_COLORS_HEX.primary, border: 'none' }} // ✅ BLAUW: Force blue via inline style (overrides classes)
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
