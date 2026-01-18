export default function CookiePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Cookiebeleid</h1>
      
      <div className="prose prose-lg max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Wat zijn cookies?</h2>
          <p>
            Cookies zijn kleine tekstbestanden die op uw computer, tablet of smartphone worden opgeslagen 
            wanneer u onze website bezoekt. Deze cookies helpen ons om de website beter te laten functioneren 
            en uw gebruikerservaring te verbeteren.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Welke cookies gebruiken wij?</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">Noodzakelijke cookies</h3>
              <p>
                Deze cookies zijn essentieel voor het functioneren van de website. Ze zorgen ervoor dat 
                de website correct werkt en dat u kunt navigeren. Zonder deze cookies kunnen bepaalde 
                functies niet worden gebruikt.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Functionele cookies</h3>
              <p>
                Deze cookies maken het mogelijk om functionaliteiten te bieden zoals hCaptcha voor 
                spam-preventie. Deze cookies worden alleen gebruikt met uw toestemming.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Analytische en marketing cookies</h3>
              <p>
                Deze cookies worden alleen gebruikt met uw expliciete toestemming. Ze helpen ons 
                om te begrijpen hoe bezoekers onze website gebruiken en om onze marketing te verbeteren.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Uw rechten</h2>
          <p>
            U heeft het recht om cookies te accepteren of te weigeren. U kunt uw cookie-instellingen 
            op elk moment wijzigen via de cookie-instellingen op onze website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Meer informatie</h2>
          <p>
            Voor meer informatie over ons privacybeleid, zie onze{" "}
            <a href="/privacy-policy" className="text-brand hover:underline">
              privacyverklaring
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
