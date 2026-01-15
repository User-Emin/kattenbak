import Link from "next/link";
import { DESIGN_SYSTEM } from "@/lib/design-system";

/**
 * 🎨 FOOTER - MINIMALISTISCH & PROFESSIONEEL
 * 
 * ✅ Zwart background (consistent met brand)
 * ✅ DRY: Alle styling via DESIGN_SYSTEM
 * ✅ Clean typography
 * ✅ Responsive grid
 */
export function Footer() {
  return (
    <footer 
      style={{ 
        background: typeof DESIGN_SYSTEM.colors.primary === 'string' && DESIGN_SYSTEM.colors.primary.includes('gradient')
          ? DESIGN_SYSTEM.colors.primary
          : `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.primaryStart || '#3C3C3D'} 0%, ${DESIGN_SYSTEM.colors.primaryEnd || '#7A7A7D'} 100%)`, // ✅ GRADIENT
        color: DESIGN_SYSTEM.colors.text.inverse, // ✅ WIT: Alle tekst wit voor duidelijkheid (was gray[400])
      }}
    >
      <div 
        className="mx-auto"
        style={{
          maxWidth: DESIGN_SYSTEM.layout.maxWidth['2xl'],
          padding: `${DESIGN_SYSTEM.spacing[16]} ${DESIGN_SYSTEM.spacing.containerPadding}`,
        }}
      >
        {/* Logo */}
        <div className="flex justify-center lg:justify-start mb-12">
          <div 
            style={{
              fontSize: DESIGN_SYSTEM.typography.fontSize['3xl'],
              fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
              color: DESIGN_SYSTEM.colors.text.inverse,
            }}
          >
            CatSupply
          </div>
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Column 1: Over Ons */}
          <div>
            <h3 
              className="mb-4"
              style={{
                fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
                color: DESIGN_SYSTEM.colors.text.inverse,
              }}
            >
              Over Ons
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/over-ons" 
                  className="transition-opacity hover:opacity-80"
                  style={{
                    fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                    fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
                    color: DESIGN_SYSTEM.colors.text.inverse, // ✅ WIT: Alle tekst wit
                  }}
                >
                  Ons Verhaal
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="transition-opacity hover:opacity-80"
                  style={{
                    fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                    fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
                    color: DESIGN_SYSTEM.colors.text.inverse, // ✅ WIT: Alle tekst wit
                  }}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Producten */}
          <div>
            <h3 
              className="mb-4"
              style={{
                fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
                color: DESIGN_SYSTEM.colors.text.inverse,
              }}
            >
              Producten
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/producten" 
                  className="transition-opacity hover:opacity-80"
                  style={{
                    fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                    fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
                    color: DESIGN_SYSTEM.colors.text.inverse, // ✅ WIT: Alle tekst wit
                  }}
                >
                  Alle Producten
                </Link>
              </li>
              <li>
                <Link 
                  href="/cart" 
                  className="transition-opacity hover:opacity-80"
                  style={{
                    fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                    fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
                    color: DESIGN_SYSTEM.colors.text.inverse, // ✅ WIT: Alle tekst wit
                  }}
                >
                  Winkelwagen
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Service */}
          <div>
            <h3 
              className="mb-4"
              style={{
                fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
                color: DESIGN_SYSTEM.colors.text.inverse,
              }}
            >
              Service
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/retourneren" 
                  className="transition-opacity hover:opacity-80"
                  style={{
                    fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                    fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
                    color: DESIGN_SYSTEM.colors.text.inverse, // ✅ WIT: Alle tekst wit
                  }}
                >
                  Retourneren
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy-policy" 
                  className="transition-opacity hover:opacity-80"
                  style={{
                    fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                    fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
                    color: DESIGN_SYSTEM.colors.text.inverse, // ✅ WIT: Alle tekst wit
                  }}
                >
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 
              className="mb-4"
              style={{
                fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
                color: DESIGN_SYSTEM.colors.text.inverse,
              }}
            >
              Contact
            </h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href={`mailto:${DESIGN_SYSTEM.contact.email}`}
                  className="transition-opacity hover:opacity-80"
                  style={{
                    fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                    fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
                    color: DESIGN_SYSTEM.colors.text.inverse, // ✅ WIT: Alle tekst wit
                  }}
                >
                  {DESIGN_SYSTEM.contact.email}
                </a>
              </li>
              <li>
                <a 
                  href={`tel:${DESIGN_SYSTEM.contact.phone}`}
                  className="transition-opacity hover:opacity-80"
                  style={{
                    fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                    fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
                    color: DESIGN_SYSTEM.colors.text.inverse, // ✅ WIT: Alle tekst wit
                  }}
                >
                  {DESIGN_SYSTEM.contact.phoneDisplay}
                </a>
              </li>
              <li 
                className="pt-2"
                style={{
                  fontSize: DESIGN_SYSTEM.typography.fontSize.xs,
                  color: DESIGN_SYSTEM.colors.gray[500],
                }}
              >
                Ma-Vr: 9:00 - 17:00
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div 
          className="pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4"
          style={{
            borderColor: DESIGN_SYSTEM.colors.gray[800],
          }}
        >
          <p 
            style={{
              fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
              fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
              color: DESIGN_SYSTEM.colors.text.inverse, // ✅ WIT: Alle tekst wit
            }}
          >
            © {new Date().getFullYear()} CatSupply. Alle rechten voorbehouden.
          </p>
          <div className="flex gap-6">
            <Link 
              href="/algemene-voorwaarden" 
                  className="transition-opacity hover:opacity-80"
                  style={{
                    fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                    fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
                    color: DESIGN_SYSTEM.colors.text.inverse, // ✅ WIT: Alle tekst wit
                  }}
            >
              Voorwaarden
            </Link>
            <Link 
              href="/privacy-policy" 
                  className="transition-opacity hover:opacity-80"
                  style={{
                    fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                    fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
                    color: DESIGN_SYSTEM.colors.text.inverse, // ✅ WIT: Alle tekst wit
                  }}
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
