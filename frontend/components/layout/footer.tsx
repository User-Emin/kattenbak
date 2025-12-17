import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

/**
 * Footer Component - Professional, Clean
 */
export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company info */}
          <div>
            <h3 className="font-bold text-lg mb-4">Kattenbak Webshop</h3>
            <p className="text-sm text-muted-foreground">
              Premium kattenbakken en accessoires voor jouw kat. Snelle levering en top kwaliteit gegarandeerd.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold mb-4">Snel naar</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/producten" className="text-muted-foreground hover:text-foreground transition-colors">
                  Producten
                </Link>
              </li>
              <li>
                <Link href="/over-ons" className="text-muted-foreground hover:text-foreground transition-colors">
                  Over Ons
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer service */}
          <div>
            <h4 className="font-semibold mb-4">Klantenservice</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/verzending" className="text-muted-foreground hover:text-foreground transition-colors">
                  Verzending
                </Link>
              </li>
              <li>
                <Link href="/retourneren" className="text-muted-foreground hover:text-foreground transition-colors">
                  Retourneren
                </Link>
              </li>
              <li>
                <Link href="/veelgestelde-vragen" className="text-muted-foreground hover:text-foreground transition-colors">
                  Veelgestelde Vragen
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4">Volg Ons</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Kattenbak Webshop. Alle rechten voorbehouden.</p>
        </div>
      </div>
    </footer>
  );
}


