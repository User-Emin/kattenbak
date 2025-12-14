import axios from 'axios';

/**
 * hCAPTCHA MIDDLEWARE - GDPR Compliant Backend Verificatie
 * DRY: Reusable voor alle forms
 * 
 * ✅ SWITCHED TO hCaptcha (meer privacy-vriendelijk dan Google reCAPTCHA)
 */

const SECRET_KEY = process.env.HCAPTCHA_SECRET_KEY || '0x0000000000000000000000000000000000000000';
const VERIFY_URL = 'https://hcaptcha.com/siteverify';
const MIN_SCORE = 0.5;

interface HCaptchaResponse {
  success: boolean;
  challenge_ts: string;
  hostname: string;
  credit?: boolean;
  'error-codes'?: string[];
  score?: number;
  score_reason?: string[];
}

/**
 * DRY: Verify hCaptcha token (GDPR compliant)
 */
export const verifyCaptcha = async (
  token: string,
  expectedAction?: string
): Promise<{ valid: boolean; score: number; error?: string }> => {
  if (!token) {
    return { valid: false, score: 0, error: 'Token is verplicht' };
  }

  try {
    // hCaptcha uses POST form data (not params)
    const formData = new URLSearchParams();
    formData.append('secret', SECRET_KEY);
    formData.append('response', token);

    const response = await axios.post<HCaptchaResponse>(VERIFY_URL, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 5000,
    });

    const { success, score, 'error-codes': errorCodes } = response.data;

    // Valideer success
    if (!success) {
      console.warn('⚠️ hCaptcha verificatie failed:', errorCodes);
      return { valid: false, score: 0, error: 'Verificatie failed' };
    }

    // hCaptcha score is optional (enterprise feature)
    const finalScore = score || 1.0; // Default to pass if no score

    // Valideer score (alleen als enterprise score beschikbaar)
    if (score && score < MIN_SCORE) {
      console.warn('⚠️ hCaptcha score te laag:', score);
      return { valid: false, score, error: 'Verificatie score te laag' };
    }

    console.log('✅ hCaptcha verified (GDPR compliant):', { score: finalScore });
    return { valid: true, score: finalScore };
  } catch (error) {
    console.error('❌ hCaptcha error:', error);
    return { valid: false, score: 0, error: 'Server fout bij verificatie' };
  }
};



