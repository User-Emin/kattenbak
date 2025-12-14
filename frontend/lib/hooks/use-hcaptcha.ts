"use client";

import { useEffect, useState, useRef } from "react";
import { HCAPTCHA_CONFIG } from "../../shared/hcaptcha.config";
import { useCookieConsent } from "./use-cookie-consent";

/**
 * useHCaptcha Hook - GDPR Compliant & Secure
 * DRY: hCaptcha invisible captcha with cookie consent
 * 
 * ✅ SECURITY: Only loads with functional cookie consent
 * ✅ INVISIBLE: No UI needed, programmatic execution
 * ✅ ERROR HANDLING: Comprehensive error capture
 */

interface HCaptchaWindow extends Window {
  hcaptcha?: {
    render: (container: string | HTMLElement, options: any) => string;
    execute: (widgetId?: string, options?: any) => Promise<{ response: string }>;
    reset: (widgetId?: string) => void;
    remove: (widgetId?: string) => void;
  };
}

declare const window: HCaptchaWindow;

export function useHCaptcha() {
  const [isReady, setIsReady] = useState(false);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { hasConsent } = useCookieConsent();

  useEffect(() => {
    // ✅ GDPR: Only load if functional cookies accepted
    const canLoad = hasConsent(HCAPTCHA_CONFIG.PRIVACY.consentCategory as any);
    
    if (!canLoad) {
      console.log('⚠️ hCaptcha not loaded: Cookie consent required');
      return;
    }

    // ✅ SECURITY: Prevent duplicate script loading
    if (document.querySelector('script[src*="hcaptcha.com"]')) {
      console.log('✅ hCaptcha script already loaded');
      initializeWidget();
      return;
    }

    // ✅ Load hCaptcha script
    const script = document.createElement('script');
    script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('✅ hCaptcha script loaded');
      initializeWidget();
    };
    script.onerror = (error) => {
      console.error('❌ hCaptcha script failed to load:', error);
    };
    
    document.head.appendChild(script);

    return () => {
      // ✅ Cleanup: Remove widget (keep container for reuse)
      if (widgetId !== null && window.hcaptcha) {
        try {
          console.log('🧹 Cleaning up hCaptcha widget:', widgetId);
          window.hcaptcha.remove(widgetId);
          setWidgetId(null);
          setIsReady(false);
        } catch (e) {
          console.warn('⚠️ hCaptcha cleanup warning:', e);
        }
      }
    };
  }, [hasConsent]);

  /**
   * ✅ Initialize invisible hCaptcha widget (SINGLETON)
   */
  const initializeWidget = () => {
    if (!window.hcaptcha) {
      console.warn('⚠️ hCaptcha API not available');
      setTimeout(initializeWidget, 100);
      return;
    }

    try {
      // ✅ SECURITY: Check if widget already exists
      if (widgetId !== null) {
        console.log('✅ hCaptcha widget already initialized');
        setIsReady(true);
        return;
      }

      // ✅ Create or reuse container
      if (!containerRef.current) {
        // Check for existing global container first
        let existingContainer = document.getElementById('hcaptcha-container');
        
        if (existingContainer) {
          // ✅ Reuse existing container
          containerRef.current = existingContainer as HTMLDivElement;
          console.log('✅ Reusing existing hCaptcha container');
        } else {
          // ✅ Create new container
          containerRef.current = document.createElement('div');
          containerRef.current.id = 'hcaptcha-container';
          containerRef.current.style.display = 'none';
          document.body.appendChild(containerRef.current);
          console.log('✅ Created new hCaptcha container');
        }
      }

      // ✅ Check if container already has a widget
      if (containerRef.current.hasChildNodes()) {
        console.warn('⚠️ Container already has widget, clearing...');
        containerRef.current.innerHTML = '';
      }

      // ✅ SECURITY: Render invisible widget with sitekey
      const id = window.hcaptcha.render(containerRef.current, {
        sitekey: HCAPTCHA_CONFIG.SITE_KEY,
        size: 'invisible',
        theme: HCAPTCHA_CONFIG.THEME,
      });

      setWidgetId(id);
      setIsReady(true);
      console.log('✅ hCaptcha widget initialized:', { widgetId: id, sitekey: HCAPTCHA_CONFIG.SITE_KEY.substring(0, 10) + '...' });
    } catch (error: any) {
      console.error('❌ hCaptcha initialization error:', {
        message: error?.message,
        error
      });
      
      // ✅ Clear and retry on "Only one captcha" error
      if (error?.message?.includes('Only one captcha')) {
        console.log('🔄 Clearing existing widget and retrying...');
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
        setWidgetId(null);
        setTimeout(initializeWidget, 500);
      }
    }
  };

  /**
   * ✅ SECURITY: Get hCaptcha token (programmatic execution)
   */
  const getToken = async (): Promise<string | null> => {
    // ✅ Validate readiness
    if (!isReady || !window.hcaptcha || widgetId === null) {
      console.warn('⚠️ hCaptcha not ready:', { 
        isReady, 
        hasAPI: !!window.hcaptcha, 
        widgetId 
      });
      return null;
    }

    try {
      console.log('🔄 Executing hCaptcha...');
      
      // ✅ SECURITY: Execute invisible captcha
      const result = await window.hcaptcha.execute(widgetId, { async: true });
      
      // ✅ Extract token from response
      const token = typeof result === 'string' ? result : result?.response;
      
      if (!token) {
        console.error('❌ hCaptcha: No token received');
        return null;
      }

      console.log('✅ hCaptcha token received');
      
      // Reset for next use
      window.hcaptcha.reset(widgetId);
      
      return token;
    } catch (error: any) {
      console.error('❌ hCaptcha execution error:', {
        message: error?.message,
        error: error?.error || error,
        widgetId
      });
      
      // ✅ SECURITY: Handle specific errors
      if (error?.error === 'missing-captcha') {
        console.error('❌ hCaptcha: Widget not properly initialized. Reinitializing...');
        initializeWidget();
      }
      
      return null;
    }
  };

  /**
   * ✅ Check if hCaptcha can be loaded (consent given)
   */
  const canLoad = hasConsent(HCAPTCHA_CONFIG.PRIVACY.consentCategory as any);

  return { 
    isReady, 
    getToken, 
    canLoad,
    widgetId // For debugging
  };
}



