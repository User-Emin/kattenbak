"use client";

import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { X, Send, MessageCircle, CheckCircle, AlertCircle, Cookie } from "lucide-react";
import { apiFetch, API_CONFIG } from "@/lib/config";
import { COMPONENT_COLORS } from "@/lib/theme-colors";
import { useHCaptcha } from "@/lib/hooks/use-hcaptcha";
import { useCookieConsent } from "@/lib/hooks/use-cookie-consent";

type FeedbackType = "success" | "error" | "cookies" | null;

/**
 * Chat Popup - GDPR-Compliant met hCaptcha
 * ALTIJD ZICHTBARE BUTTON + SMOOTH POPUP
 * DRY: Geen props nodig, volledig self-contained
 */
export function ChatPopup() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: FeedbackType; message: string } | null>(null);
  
  const { getToken, isReady } = useHCaptcha();
  const { acceptAll, hasConsent } = useCookieConsent();

  const handleClose = () => {
    setIsExpanded(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    
    if (!email || !message) {
      setFeedback({ type: "error", message: "Vul alle verplichte velden in" });
      return;
    }

    if (!hasConsent('functional')) {
      setFeedback({ 
        type: "cookies", 
        message: "Accepteer functionele cookies voor spam-preventie (hCaptcha)" 
      });
      return;
    }

    if (!isReady) {
      setFeedback({ 
        type: "error", 
        message: "Verificatie wordt geladen... Probeer zo opnieuw." 
      });
      return;
    }

    setIsSending(true);

    try {
      const captchaToken = await getToken();
      
      if (!captchaToken) {
        setFeedback({ 
          type: "error", 
          message: "Verificatie mislukt. Wacht even en probeer opnieuw." 
        });
        setIsSending(false);
        return;
      }

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
        setTimeout(() => handleClose(), 2500);
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      setFeedback({ type: "error", message: "Kon bericht niet verzenden. Probeer het opnieuw." });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50">
      {/* ALTIJD ZICHTBARE BUTTON */}
      <button
        onClick={() => setIsExpanded(true)}
        className={`w-14 h-14 ${COMPONENT_COLORS.chat.icon} rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200`}
        aria-label="Open chat"
      >
        <MessageCircle className={`h-6 w-6 ${COMPONENT_COLORS.chat.iconText}`} />
      </button>

      {/* POPUP MET SMOOTH ANIMATIE */}
      {isExpanded && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200 z-40"
            onClick={handleClose}
          />
          
          <div className="fixed bottom-24 right-6 md:right-8 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 space-y-4 max-w-sm w-[calc(100vw-3rem)] md:w-96">
              <div className="flex items-center justify-between mb-2">
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
                  onClick={handleClose}
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

              <p className="text-xs text-gray-500 text-center leading-relaxed">
                Beschermd door{" "}
                <a 
                  href="https://www.hcaptcha.com/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brand hover:underline"
                >
                  hCaptcha
                </a>
                {" "}· Vereist functionele cookies
              </p>

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
                  onClick={handleClose}
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
          </div>
        </>
      )}
    </div>
  );
}
