/**
 * ALGEMENE VOORWAARDEN PAGE
 * ✅ SEO optimized
 * ✅ Clean layout
 */
export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-semibold mb-8">Algemene Voorwaarden</h1>
      
      <div className="prose prose-lg max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Toepasselijkheid</h2>
          <p className="text-gray-700 leading-relaxed">
            Deze algemene voorwaarden zijn van toepassing op alle overeenkomsten tussen CatSupply en de klant.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Bestellingen</h2>
          <p className="text-gray-700 leading-relaxed">
            Door een bestelling te plaatsen, gaat u akkoord met deze algemene voorwaarden. 
            Wij behouden ons het recht voor om bestellingen te weigeren.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Prijzen en betaling</h2>
          <p className="text-gray-700 leading-relaxed">
            Alle prijzen zijn inclusief BTW. Betaling vindt plaats via Mollie (iDEAL, PayPal, creditcard, Bancontact).
            De betaling dient binnen 14 dagen na bestelling te zijn voldaan.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Levering</h2>
          <p className="text-gray-700 leading-relaxed">
            Wij streven ernaar bestellingen binnen 1-2 werkdagen te verzenden. 
            Levertijden zijn indicatief en vormen geen verplichting.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Garantie</h2>
          <p className="text-gray-700 leading-relaxed">
            Op alle producten van CatSupply geldt een garantietermijn van <strong>1 jaar</strong> vanaf de leveringsdatum. 
            Deze garantie dekt fabricagefouten en defecten die niet het gevolg zijn van normaal gebruik of slijtage. 
            Bij garantiegevallen kunt u contact opnemen met onze klantenservice via info@catsupply.nl voor een snelle oplossing of vervanging.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Retourneren</h2>
          <p className="text-gray-700 leading-relaxed">
            U heeft 30 dagen bedenktijd om een product te retourneren. 
            Het product moet onbeschadigd en in originele verpakking zijn. 
            Retourkosten zijn voor rekening van de klant, tenzij het product defect is.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Aansprakelijkheid</h2>
          <p className="text-gray-700 leading-relaxed">
            CatSupply is niet aansprakelijk voor indirecte schade. 
            Onze aansprakelijkheid is beperkt tot de waarde van het bestelde product.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Toepasselijk recht</h2>
          <p className="text-gray-700 leading-relaxed">
            Op deze voorwaarden is Nederlands recht van toepassing. 
            Geschillen worden voorgelegd aan de bevoegde rechter in Nederland.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Contact</h2>
          <p className="text-gray-700 leading-relaxed">
            Voor vragen over deze voorwaarden kunt u contact opnemen via: <a href="mailto:info@catsupply.nl" className="text-blue-600 hover:underline">info@catsupply.nl</a>
          </p>
        </section>

        <section className="mt-8 pt-8 border-t">
          <p className="text-sm text-gray-500">
            Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL')}
          </p>
        </section>
      </div>
    </div>
  );
}