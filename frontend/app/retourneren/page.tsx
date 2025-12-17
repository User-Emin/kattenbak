import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Retourneren | Kattenbak",
  description: "Informatie over ons retourbeleid en hoe u een product kunt retourneren",
};

export default function RetournerenPage() {
  return (
    <div className="container-custom py-16">
      <h1 className="text-4xl font-bold mb-8">Retourneren</h1>
      
      <div className="prose max-w-none">
        <h2>30 Dagen Bedenktijd</h2>
        <p>
          Niet tevreden met uw aankoop? Geen probleem! U heeft 30 dagen bedenktijd 
          om uw product kosteloos te retourneren.
        </p>

        <h2>Voorwaarden</h2>
        <ul>
          <li>Het product is in originele staat en verpakking</li>
          <li>Alle accessoires en documentatie zijn meegeleverd</li>
          <li>Het product is niet beschadigd of gebruikt op een manier die waardevermindering veroorzaakt</li>
        </ul>

        <h2>Hoe retourneren?</h2>
        <ol>
          <li>Neem contact met ons op via de contactpagina of stuur een email naar <a href="mailto:info@catsupply.nl">info@catsupply.nl</a></li>
          <li>Vermeld uw ordernummer en reden van retour</li>
          <li>U ontvangt van ons een retourlabel via email</li>
          <li>Verpak het product goed en plak het retourlabel op het pakket</li>
          <li>Breng het pakket naar een PostNL punt</li>
        </ol>

        <h2>Terugbetaling</h2>
        <p>
          Zodra wij uw retour hebben ontvangen en goedgekeurd, ontvangt u binnen 
          14 dagen uw geld terug op dezelfde manier als u heeft betaald.
        </p>

        <h2>Kosten</h2>
        <p>
          Retourneren is altijd gratis. Wij verstrekken een gratis retourlabel.
        </p>

        <h2>Vragen?</h2>
        <p>
          Heeft u vragen over retourneren? Neem dan contact met ons op via de 
          contactpagina of chat met onze AI assistent.
        </p>
      </div>

      <div className="mt-12 bg-brand/5 rounded-lg p-8 max-w-3xl">
        <h2 className="text-2xl font-bold mb-4">Direct contact opnemen?</h2>
        <a 
          href="/contact" 
          className="inline-block bg-brand text-white px-6 py-3 rounded-lg hover:bg-brand-dark transition-colors"
        >
          Naar contactpagina
        </a>
      </div>
    </div>
  );
}

