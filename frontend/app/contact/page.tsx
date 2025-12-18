export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white py-20">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header - Centraal */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-light mb-6 text-gray-900">Contact</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Heb je vragen? We helpen je graag verder!
          </p>
        </div>

        {/* Contact Info - Direct op achtergrond */}
        <div className="grid md:grid-cols-3 gap-12 mb-20 text-center">
          <div>
            <svg className="w-8 h-8 text-brand mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Email</h3>
            <a href="mailto:info@catsupply.nl" className="text-accent hover:text-accentDark transition-colors">
              info@catsupply.nl
            </a>
          </div>

          <div>
            <svg className="w-8 h-8 text-brand mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Telefoon</h3>
            <a href="tel:+31201234567" className="text-brand hover:text-brand-dark transition-colors">
              +31 (0)20 123 4567
            </a>
          </div>

          <div>
            <svg className="w-8 h-8 text-brand mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Openingstijden</h3>
            <p className="text-gray-600">
              Ma-Vr: 9:00 - 17:00
            </p>
          </div>
        </div>

        {/* Contact Form - Direct op achtergrond */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-medium mb-8 text-center text-gray-900">Stuur ons een bericht</h2>
          
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Naam</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
                placeholder="Jouw naam"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
                placeholder="jouw@email.nl"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Bericht</label>
              <textarea 
                rows={6}
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all resize-none"
                placeholder="Jouw bericht..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent-dark text-gray-900 font-semibold py-4 px-8 rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Verstuur Bericht
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
