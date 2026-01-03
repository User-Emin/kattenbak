/**
 * USP BANNER - ONDER NAVBAR
 * Toont: Gratis verzending | 30 dagen bedenktijd | Veilig betalen
 * 
 * Best Practices:
 * - Consistent over alle pagina's
 * - Dunne, strakke fonts (font-light)
 * - Oranje accenten (#f76402)
 * - Mobile responsive (kleinere text op mobile)
 */

export function UspBanner() {
  return (
    <div className="bg-white border-b border-gray-200 py-3">
      <div className="px-6 lg:px-10 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-center md:justify-start gap-6 md:gap-8">
          {/* USP 1: Gratis verzending */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 text-[#f76402]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm text-gray-700 whitespace-nowrap font-light">
              <strong className="font-normal text-gray-900">Gratis</strong> verzending
            </span>
          </div>

          {/* USP 2: 30 dagen bedenktijd */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 text-[#f76402]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-sm text-gray-700 whitespace-nowrap font-light">
              <strong className="font-normal text-gray-900">30 dagen</strong> bedenktijd
            </span>
          </div>

          {/* USP 3: Veilig betalen */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 text-[#f76402]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-sm text-gray-700 whitespace-nowrap font-light">
              <strong className="font-normal text-gray-900">Veilig</strong> betalen
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

