/**
 * ALGEMENE VOORWAARDEN PAGE
 * ✅ SEO optimized
 * ✅ Clean layout
 */
export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-semibold mb-8">Algemene voorwaarden</h1>

      <div className="prose prose-lg max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Toepasselijkheid</h2>
          <p className="text-gray-700 leading-relaxed">
            Deze algemene voorwaarden zijn van toepassing op alle overeenkomsten en bestellingen bij CatSupply.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Bestellen en betalen</h2>
          <p className="text-gray-700 leading-relaxed">
            Door een bestelling te plaatsen gaat u akkoord met deze voorwaarden. Betaling verloopt veilig via Mollie
            (bijvoorbeeld iDEAL, creditcard, Bancontact of PayPal).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Levering en werkdagen</h2>
          <p className="text-gray-700 leading-relaxed">
            Wij streven ernaar bestellingen binnen 1-2 werkdagen te verzenden. Verzending en klantenservice vinden
            plaats op werkdagen (maandag t/m vrijdag). Levertijden zijn indicatief.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Garantie</h2>
          <p className="text-gray-700 leading-relaxed">
            Op alle producten van CatSupply geldt een garantietermijn van <strong>1 jaar</strong> vanaf levering.
            Deze garantie dekt fabricagefouten en defecten die niet het gevolg zijn van normaal gebruik of slijtage.
            Neem bij garantie contact op via info@catsupply.nl.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Retourneren</h2>
          <p className="text-gray-700 leading-relaxed">
            U heeft 30 dagen bedenktijd. Het product dient onbeschadigd en in originele verpakking te zijn.
            Retourkosten zijn voor rekening van de klant, tenzij het product defect is.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Aansprakelijkheid</h2>
          <p className="text-gray-700 leading-relaxed">
            CatSupply is niet aansprakelijk voor indirecte schade. Onze aansprakelijkheid is beperkt tot de waarde
            van het bestelde product.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Contact</h2>
          <p className="text-gray-700 leading-relaxed">
            Voor vragen over deze voorwaarden kunt u contact opnemen via:{' '}
            <a href="mailto:info@catsupply.nl" className="text-brand hover:text-brand-dark hover:underline">
              info@catsupply.nl
            </a>
          </p>
        </section>

        <section className="mt-8 pt-8 border-t">
          <p className="text-sm text-gray-500">Laatst bijgewerkt: 20-2-2026</p>
        </section>
      </div>
    </div>
  );
}