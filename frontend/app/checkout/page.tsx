"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/types/product";
import { CreateOrderData } from "@/types/product";
import { productsApi } from "@/lib/api/products";
import { ordersApi } from "@/lib/api/orders";
import { Loader2, CreditCard } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { getProductImage } from "@/lib/image-config";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { items, customerData, saveCustomerData } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveData, setSaveData] = useState(true);

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
        const productId = searchParams.get("product");
        const qty = parseInt(searchParams.get("quantity") || "1", 10);

        if (!productId) {
          router.push("/");
          return;
        }

        const data = await productsApi.getById(productId);
        setProduct(data);
        setQuantity(qty);
      } catch (err) {
        setError("Product niet gevonden");
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [searchParams, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Save customer data to cookies if consented
      if (saveData) {
        saveCustomerData(formData, true);
      }

      const orderData: CreateOrderData = {
        items: [{ productId: product.id, quantity }],
        customerEmail: formData.email,
        customerPhone: formData.phone || undefined,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          street: formData.street,
          houseNumber: formData.houseNumber,
          addition: formData.addition || undefined,
          postalCode: formData.postalCode,
          city: formData.city,
          country: formData.country,
          phone: formData.phone || undefined,
        },
      };

      const { order, payment } = await ordersApi.create(orderData);

      if (payment.checkoutUrl) {
        window.location.href = payment.checkoutUrl;
      } else {
        throw new Error("Payment URL not available");
      }
    } catch (err: any) {
      setError(err.message || "Er is iets misgegaan. Probeer het opnieuw.");
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-20 flex justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-black" />
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

  const subtotal = product.price * quantity;
  const shipping = subtotal >= 50 ? 0 : 5.95;
  const tax = (subtotal + shipping) * 0.21;
  const total = subtotal + shipping + tax;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-light mb-3 text-gray-900">Bestelling Afronden</h1>
          <p className="text-gray-600 text-lg">Vul je gegevens in voor een snelle checkout</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Gegevens Form - Direct op achtergrond */}
            <div>
              <h2 className="text-2xl font-medium mb-6 text-gray-900">
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
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3 mt-6">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium">Fout bij bestellen</p>
                    <p className="mt-1">{error}</p>
                  </div>
                </div>
              )}

              <Separator variant="float" spacing="md" />

              {/* Guest Checkout Info + Consent */}
              <div className="space-y-4">
                <div className="p-5 bg-accent/5 border-2 border-accent/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-accent-dark mb-1">Geen account nodig</p>
                      <p className="text-sm text-gray-700">Je kunt direct afrekenen als gast</p>
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={saveData}
                    onChange={(e) => setSaveData(e.target.checked)}
                    className="mt-1 w-5 h-5 text-accent border-2 border-gray-300 rounded focus:ring-2 focus:ring-accent/20 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 leading-relaxed">
                    Bewaar mijn gegevens voor een snellere checkout bij volgende bestellingen (7 dagen)
                  </span>
                </label>
              </div>
            </div>

            {/* Bestelling Overzicht - Rechterkant, direct op achtergrond */}
            <div className="space-y-6">
              <div className="sticky top-28">
                <h2 className="text-2xl font-medium mb-6 text-gray-900">Jouw Bestelling</h2>

                <Separator variant="float" spacing="sm" />
                
                <div className="flex gap-4 my-6">
                  <div className="relative w-24 h-24 bg-white rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                    <ProductImage 
                      src={getProductImage(product.images)} 
                      alt={product.name} 
                      fill 
                      className="object-cover" 
                      enableZoom={true} 
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1 text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">Aantal: {quantity}</p>
                    <p className="font-semibold text-gray-900">{formatPrice(product.price)}</p>
                  </div>
                </div>

                <Separator variant="float" spacing="sm" />

                <div className="space-y-3 my-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotaal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Verzendkosten</span>
                    <span className="font-medium">{shipping === 0 ? "Gratis" : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>BTW (21%)</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>
                </div>

                <Separator variant="float" spacing="sm" />

                <div className="flex justify-between items-center text-xl font-semibold text-gray-900 my-6">
                  <span>Totaal</span>
                  <span className="text-2xl text-brand">{formatPrice(total)}</span>
                </div>

                <Separator variant="float" spacing="md" />

                {/* CTA Button rechts - Prominent */}
                <div className="mt-8">
                  <Button type="submit" variant="primary" size="lg" fullWidth disabled={isProcessing} loading={isProcessing} leftIcon={<CreditCard className="h-5 w-5" />}>
                    Betalen - {formatPrice(total)}
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
