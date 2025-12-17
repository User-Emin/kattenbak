import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verzending & Levering | Kattenbak",
  description: "Informatie over verzending, levertijden en verzendkosten",
};

export default function VerzendingPage() {
  return (
    <div className="container-custom py-16">
      <h1 className="text-4xl font-bold mb-8">Verzending & Levering</h1>
      
      <div className="prose max-w-none">
        <h2>Levertijden</h2>
        <p>
          Wij streven ernaar om uw bestelling zo snel mogelijk te leveren. 
          Bestellingen geplaatst voor 15:00 uur worden dezelfde dag nog verzonden.
        </p>

        <h2>Verzendkosten</h2>
        <ul>
          <li><strong>Gratis verzending</strong> bij bestellingen boven €50</li>
          <li>€5,95 verzendkosten voor bestellingen onder €50</li>
        </ul>

        <h2>Tracking</h2>
        <p>
          Zodra uw bestelling is verzonden, ontvangt u een e-mail met een track & trace code. 
          Hiermee kunt u uw pakket volgen.
        </p>

        <h2>Levering</h2>
        <p>
          Wij verzenden via MyParcel. Uw pakket wordt thuisbezorgd of 
          kan worden opgehaald bij een PostNL punt bij u in de buurt.
        </p>
      </div>
    </div>
  );
}

