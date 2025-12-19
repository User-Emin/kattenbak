import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

/**
 * Footer Component - met GROTE LOGO voor test
 */
export function Footer() {
  return (
    <footer className="bg-black text-white border-t border-white/10">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info met GROTE WITTE LOGO */}
          <div>
            <div className="mb-6">
              <img 
                src="/logo-catsupply.png" 
                alt="Catsupply Logo Footer" 
                className="h-40 w-auto object-contain mb-4 brightness-0 invert"
                style={{maxHeight: 'none', minHeight: '160px', height: '160px'}}
              />
            </div>
            <h3 className="font-bold text-lg mb-4 text-white">Kattenbak Webshop</h3>
            <p className="text-sm text-white/70">
              Premium kattenbakken en accessoires voor jouw kat. Snelle levering en top kwaliteit gegarandeerd.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Snel naar</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/producten" className="text-white/70 hover:text-white transition-colors">
                  Producten
                </Link>
              </li>
              <li>
                <Link href="/over-ons" className="text-white/70 hover:text-white transition-colors">
                  Over Ons
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/70 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer service */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Klantenservice</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/verzending" className="text-white/70 hover:text-white transition-colors">
                  Verzending
                </Link>
              </li>
              <li>
                <Link href="/retourneren" className="text-white/70 hover:text-white transition-colors">
                  Retourneren
                </Link>
              </li>
              <li>
                <Link href="/veelgestelde-vragen" className="text-white/70 hover:text-white transition-colors">
                  Veelgestelde Vragen
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Volg Ons</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-white/60">
          <p>&copy; {new Date().getFullYear()} Kattenbak Webshop. Alle rechten voorbehouden.</p>
        </div>
      </div>
    </footer>
  );
}
