"use client";

import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { X, Send, MessageCircle, ArrowRight, CheckCircle, AlertCircle, Cookie } from "lucide-react";
import { apiFetch, API_CONFIG } from "@/lib/config";
import { COMPONENT_COLORS } from "@/lib/theme-colors";
import { useHCaptcha } from "@/lib/hooks/use-hcaptcha";
import { useCookieConsent } from "@/lib/hooks/use-cookie-consent";

interface ChatPopupProps {
  onClose: () => void;
}

type FeedbackType = "success" | "error" | "cookies" | null;

/**
 * Chat Popup - GDPR-Compliant met hCaptcha
 * DRY & Secure - Maximaal maintainable
 */
export function ChatPopup({ onClose }: ChatPopupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: FeedbackType; message: string } | null>(null);
  
  // ✅ DRY: Centralized hooks
  const { getToken, canLoad } = useHCaptcha();
  const { acceptAll, hasConsent } = useCookieConsent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    
    // ✅ Validation
    if (!email || !message) {
      setFeedback({ type: "error", message: "Vul alle verplichte velden in" });
      return;
    }

    // ✅ SECURITY: Check functional cookies (GDPR-compliant)
    if (!hasConsent('functional')) {
      setFeedback({ 
        type: "cookies", 
        message: "Accepteer functionele cookies voor spam-preventie (hCaptcha)" 
      });
      return;
    }

    setIsSending(true);

    try {
      // ✅ Get hCaptcha token (spam prevention)
      const captchaToken = await getToken();
      
      if (!captchaToken) {
        setFeedback({ type: "error", message: "Verificatie mislukt. Probeer opnieuw." });
        setIsSending(false);
        return;
      }

      // ✅ Send to backend
      const response = await apiFetch<{ success: boolean; message?: string }>(
        API_CONFIG.ENDPOINTS.CONTACT, 
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            message: orderNumber ? `[Order: ${orderNumber}] ${message}` : message,
            orderNumber: orderNumber || undefined,
            captchaToken,
          }),
        }
      );

      if (response.success) {
        setFeedback({ type: "success", message: "Bericht verzonden! We nemen spoedig contact op." });
        setEmail("");
        setMessage("");
        setOrderNumber("");
        setTimeout(() => onClose(), 2500);
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      setFeedback({ type: "error", message: "Kon bericht niet verzenden. Probeer het opnieuw." });
      console.error("❌ Chat error:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-sm">
        {!isExpanded ? (
          // Compact balkje vorm
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${COMPONENT_COLORS.chat.icon} rounded-full flex items-center justify-center`}>
                  <MessageCircle className={`h-5 w-5 ${COMPONENT_COLORS.chat.iconText}`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Hulp nodig?</p>
                  <p className="text-sm text-gray-600">Chat met ons</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-900 transition-colors p-1 hover:bg-gray-100 rounded-full"
                aria-label="Sluiten"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Button 
              size="sm" 
              variant="cta" 
              fullWidth 
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={() => setIsExpanded(true)}
            >
              Start Chat
            </Button>
          </div>
        ) : (
          // Expanded form
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${COMPONENT_COLORS.chat.icon} rounded-full flex items-center justify-center`}>
                  <MessageCircle className={`h-5 w-5 ${COMPONENT_COLORS.chat.iconText}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Chat met ons</h3>
                  <p className="text-xs text-gray-600">We helpen je graag</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-900 transition-colors p-1 hover:bg-gray-100 rounded-full"
                aria-label="Sluiten"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <Input
              name="email"
              label="Email *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jouw@email.nl"
              required
              autoFocus
            />

            <Input
              name="orderNumber"
              label="Ordernummer (optioneel)"
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="ORD-12345"
            />

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Bericht *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Typ hier je vraag..."
                required
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all resize-none text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Bij vragen over je order, vermeld het ordernummer
              </p>
            </div>

            {/* ✅ hCaptcha Disclosure (GDPR-compliant) */}
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              Beschermd door{" "}
              <a 
                href="https://www.hcaptcha.com/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                hCaptcha
              </a>
              {" "}· Vereist functionele cookies
            </p>

            {/* ✅ Cookie Warning (Prominent & Actionable) */}
            {feedback?.type === "cookies" && (
              <div className="bg-orange-50 border-2 border-orange-500 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Cookie className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      Functionele cookies vereist
                    </p>
                    <p className="text-xs text-gray-700 mb-3">
                      Voor spam-preventie (hCaptcha) hebben we functionele cookies nodig.
                    </p>
                    <Button
                      size="sm"
                      variant="cta"
                      onClick={() => {
                        acceptAll();
                        setFeedback(null);
                      }}
                      leftIcon={<Cookie className="h-3 w-3" />}
                    >
                      Accepteer cookies
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ✅ Success/Error Feedback */}
            {feedback && feedback.type !== "cookies" && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                feedback.type === "success" 
                  ? "bg-green-50 text-green-800" 
                  : "bg-red-50 text-red-800"
              }`}>
                {feedback.type === "success" ? (
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                )}
                <p className="text-sm">{feedback.message}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => setIsExpanded(false)}
                disabled={isSending}
              >
                Terug
              </Button>
              <Button
                type="submit"
                variant="cta"
                fullWidth
                loading={isSending}
                leftIcon={<Send className="h-4 w-4" />}
              >
                Versturen
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

