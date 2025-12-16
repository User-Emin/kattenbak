import Link from "next/link";

/**
 * Footer Component - Responsive & DRY
 * MAXIMAAL DYNAMISCH: Geen hardcoded breakpoints, maintainable
 */
export function Footer() {
  return (
    <footer className="bg-black text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Footer Grid - DRY: 2 cols mobiel (centraal) → 4 cols desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 justify-items-center lg:justify-items-start">
          {/* Column 1: About */}
          <div className="text-center sm:text-left">
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Over Ons</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Ons Verhaal
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Shop */}
          <div className="text-center sm:text-left">
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Winkel</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Producten
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition-colors">
                  Winkelwagen
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-white transition-colors">
                  Afrekenen
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Service */}
          <div className="text-center sm:text-left">
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Service</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/retourneren" className="hover:text-white transition-colors">
                  Retourneren
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="hover:text-white transition-colors">
                  Cookiebeleid
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="text-center sm:text-left">
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Contact</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>info@kattenbak.nl</li>
              <li>+31 20 123 4567</li>
              <li className="pt-2 sm:pt-3">
                <div className="text-gray-400 text-xs">
                  Ma-Vr: 9:00 - 17:00
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar - Responsive */}
        <div className="pt-6 sm:pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm">
            <p className="text-center sm:text-left">
              © {new Date().getFullYear()} Kattenbak. Alle rechten voorbehouden.
            </p>
            <div className="flex gap-4 sm:gap-6">
              <Link href="/algemene-voorwaarden" className="hover:text-white transition-colors">
                Algemene Voorwaarden
              </Link>
              <Link href="/privacy-policy" className="hover:text-white transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
