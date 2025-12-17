import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Veelgestelde Vragen | Kattenbak",
  description: "Antwoorden op de meest gestelde vragen over onze kattenbak",
};

export default function FAQPage() {
  const faqs = [
    {
      question: "Hoe vaak moet ik de kattenbak schoonmaken?",
      answer: "Onze zelfreinigende kattenbak maakt automatisch schoon na elk gebruik. U hoeft alleen nog het opvangbakje te legen, wat ongeveer 1x per week nodig is voor 1 kat."
    },
    {
      question: "Is de kattenbak geschikt voor meerdere katten?",
      answer: "Ja, onze kattenbak is geschikt voor huishoudens met meerdere katten. Bij 2 katten raden we aan het opvangbakje 2x per week te legen."
    },
    {
      question: "Welke strooisoort moet ik gebruiken?",
      answer: "Onze kattenbak werkt het beste met klonterende kattenbakvulling. Vermijd niet-klonterende of crystal litter."
    },
    {
      question: "Hoeveel lawaai maakt het apparaat?",
      answer: "Het reinigingsproces is zeer stil. De meeste katten wennen hier binnen enkele dagen aan."
    },
    {
      question: "Wat gebeurt er bij een stroomstoring?",
      answer: "De kattenbak heeft een batterij-backup die ervoor zorgt dat instellingen behouden blijven. Na terugkeer van de stroom hervat het apparaat automatisch de normale werking."
    },
    {
      question: "Kan ik de kattenbak bedienen via een app?",
      answer: "Ja, onze kattenbak is voorzien van app-bediening waarmee u instellingen kunt aanpassen, reinigingsschema's kunt instellen en notificaties ontvangt."
    },
    {
      question: "Wat is de garantie?",
      answer: "Wij bieden 2 jaar fabrieksgarantie op alle elektronische onderdelen."
    },
    {
      question: "Kan ik de kattenbak retourneren?",
      answer: "Ja, u heeft 30 dagen bedenktijd. Zie onze retourpagina voor meer informatie."
    }
  ];

  return (
    <div className="container-custom py-16">
      <h1 className="text-4xl font-bold mb-8">Veelgestelde Vragen</h1>
      
      <div className="space-y-6 max-w-3xl">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
            <p className="text-gray-600">{faq.answer}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-brand/5 rounded-lg p-8 max-w-3xl">
        <h2 className="text-2xl font-bold mb-4">Nog vragen?</h2>
        <p className="mb-4">
          Kunt u uw vraag niet vinden? Neem dan contact met ons op via de contactpagina 
          of chat met onze AI assistent rechtsonder op de pagina.
        </p>
        <a 
          href="/contact" 
          className="inline-block bg-brand text-white px-6 py-3 rounded-lg hover:bg-brand-dark transition-colors"
        >
          Contact opnemen
        </a>
      </div>
    </div>
  );
}

