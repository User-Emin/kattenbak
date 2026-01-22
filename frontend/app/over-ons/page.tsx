import { DESIGN_SYSTEM } from '@/lib/design-system';

export default function OverOnsPage() {
  return (
    <div className="min-h-screen bg-white py-20">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header - Centraal */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-light mb-6 text-gray-900">Over Ons</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Innovatie in huisdierverzorging
          </p>
        </div>

        {/* Content - Centraal, direct op achtergrond */}
        <div className="max-w-3xl mx-auto">
          {/* Missie */}
          <div className="text-center mb-16">
            <svg className="w-12 h-12 text-brand mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h2 className="text-3xl font-light mb-4 text-gray-900">Onze Missie</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Wij geloven dat huisdierverzorging eenvoudig, hygiënisch en modern moet zijn. 
              Daarom ontwikkelen we innovatieve oplossingen die het leven van huisdiereneigenaren 
              makkelijker maken.
            </p>
          </div>


          {/* Waarom Wij */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light mb-4 text-gray-900">Waarom Wij?</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              We combineren technologie met diervriendelijkheid. Onze producten zijn ontworpen 
              met aandacht voor detail en getest door experts.
            </p>
          </div>

          {/* CTA - Direct op achtergrond */}
          <div className="text-center">
            <h3 className="text-2xl font-medium mb-4 text-gray-900">Vragen?</h3>
            <p className="text-gray-600 mb-6">
              Neem contact met ons op voor meer informatie
            </p>
            <a 
              href="/contact"
              className={`inline-block bg-accent hover:bg-accent-dark text-gray-900 font-semibold py-4 px-10 ${DESIGN_SYSTEM.button.borderRadius} transition-all duration-300 hover:scale-105 active:scale-95`}
            >
              Contact Opnemen
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
