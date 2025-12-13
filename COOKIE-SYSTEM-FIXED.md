# ✅ COOKIE SYSTEEM GEFIXED

## Probleem
- `Accepteer functionele cookies om het formulier te versturen`
- Cookie consent niet correct gedetecteerd

## Oplossing
1. ✅ `shared/cookies.config.ts` aangemaakt
2. ✅ `shared/hcaptcha.config.ts` aangemaakt  
3. ✅ `acceptAll()` geeft nu alle cookies consent (inclusief functional)
4. ✅ Checkout controleert `hasConsent('functional')` voor betaling
5. ✅ Cookie warning card met direct "Accepteer" button
6. ✅ localStorage ipv cookies voor customer data (GDPR)

## Test
1. Open checkout zonder cookies → zie warning
2. Klik "Accepteer & Ga door" → cookies geaccepteerd
3. Order plaatsen → werkt direct
