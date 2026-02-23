/**
 * PRIVACY POLICY PAGE
 * ✅ SEO optimized
 * ✅ Clean layout
 */
export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-semibold mb-8">Privacybeleid</h1>
      
      <div className="prose prose-lg max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Inleiding</h2>
          <p className="text-gray-700 leading-relaxed">
            Bij CatSupply hechten wij grote waarde aan de privacy van onze klanten. 
            Dit privacybeleid beschrijft hoe wij persoonlijke gegevens verzamelen, gebruiken en beschermen.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Gegevens die wij verzamelen</h2>
          <p className="text-gray-700 leading-relaxed">
            Wij verzamelen de volgende gegevens wanneer u een bestelling plaatst:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Naam en contactgegevens (e-mailadres, telefoonnummer)</li>
            <li>Verzendadres</li>
            <li>Betalingsgegevens (verwerkt via Mollie)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Gebruik van gegevens</h2>
          <p className="text-gray-700 leading-relaxed">
            Uw gegevens worden gebruikt voor:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Het verwerken en verzenden van bestellingen</li>
            <li>Communicatie over uw bestelling</li>
            <li>Het verbeteren van onze diensten</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Beveiliging</h2>
          <p className="text-gray-700 leading-relaxed">
            Wij nemen passende technische en organisatorische maatregelen om uw gegevens te beschermen 
            tegen onbevoegde toegang, verlies of vernietiging.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Uw rechten</h2>
          <p className="text-gray-700 leading-relaxed">
            U heeft het recht om:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Inzage te krijgen in uw gegevens</li>
            <li>Uw gegevens te laten corrigeren of verwijderen</li>
            <li>Bezwaar te maken tegen de verwerking van uw gegevens</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Contact</h2>
          <p className="text-gray-700 leading-relaxed">
            Voor vragen over dit privacybeleid kunt u contact opnemen via: <a href="mailto:info@catsupply.nl" className="text-brand hover:text-brand-dark hover:underline">info@catsupply.nl</a>
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