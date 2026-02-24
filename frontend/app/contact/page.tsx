"use client";

import { useState } from "react";
import { FORM_CONFIG } from "@/lib/form-config";
import { API_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";

export default function ContactPage() {
  const [form, setForm] = useState({ naam: '', email: '', bericht: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.bericht) return;
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.naam, email: form.email, message: form.bericht }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setForm({ naam: '', email: '', bericht: '' });
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Er ging iets mis. Probeer het opnieuw.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Kan geen verbinding maken. Controleer je internet en probeer opnieuw.');
    }
  };

  const safeFormConfig = FORM_CONFIG || {
    textarea: {
      field: {
        width: 'w-full',
        padding: 'px-4 py-3',
        backgroundColor: 'bg-white',
        border: 'border-2',
        borderColor: 'border-gray-300',
        borderRadius: 'rounded-xl',
        textColor: 'text-gray-900',
        resize: 'resize-none',
        focus: { outline: 'focus:outline-none', borderColor: 'focus:border-brand', ring: 'focus:ring-4', ringColor: 'focus:ring-brand/10' },
        transition: 'transition-all',
      },
    },
    button: {
      submit: {
        width: 'w-full',
        backgroundColor: 'bg-accent',
        hoverBackgroundColor: 'hover:bg-accent-dark',
        textColor: 'text-gray-900',
        fontWeight: 'font-semibold',
        padding: 'py-4 px-8',
        borderRadius: 'rounded-full',
        transition: 'transition-all duration-300',
        hoverScale: 'hover:scale-105',
        activeScale: 'active:scale-95',
      },
    },
    input: {
      label: { display: 'block', fontSize: 'text-sm', fontWeight: 'font-semibold', textColor: 'text-gray-900', marginBottom: 'mb-2' },
      field: {
        width: 'w-full',
        padding: 'px-4 py-3',
        backgroundColor: 'bg-white',
        border: 'border-2',
        borderColor: 'border-gray-300',
        borderRadius: 'rounded-xl',
        textColor: 'text-gray-900',
        focus: { outline: 'focus:outline-none', borderColor: 'focus:border-brand', ring: 'focus:ring-4', ringColor: 'focus:ring-brand/10' },
        transition: 'transition-all',
      },
    },
  };

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

        {/* Contact Info - Symmetrisch 2-kolom */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-20">
          <div className="flex flex-col items-center text-center bg-gray-50 rounded-2xl px-8 py-10 transition-shadow hover:shadow-sm">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-sm mb-5">
              <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold mb-2 text-gray-900 tracking-wide uppercase text-xs">Email</h3>
            <a href="mailto:info@catsupply.nl" className="text-brand hover:text-brand-dark transition-colors font-medium text-sm">
              info@catsupply.nl
            </a>
          </div>

          <div className="flex flex-col items-center text-center bg-gray-50 rounded-2xl px-8 py-10 transition-shadow hover:shadow-sm">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-sm mb-5">
              <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold mb-2 text-gray-900 tracking-wide uppercase text-xs">Adres</h3>
            <p className="text-gray-600 font-medium text-sm">Wateringweg 1, Haarlem</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-medium mb-8 text-center text-gray-900">Stuur ons een bericht</h2>

          {status === 'success' ? (
            <div className="text-center py-12 px-6 bg-gray-50 rounded-2xl">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-black mx-auto mb-5">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Bericht verzonden!</h3>
              <p className="text-gray-600">We nemen zo snel mogelijk contact met je op via je email.</p>
              <button
                onClick={() => setStatus('idle')}
                className="mt-6 text-sm text-gray-500 hover:text-gray-800 underline underline-offset-2 transition-colors"
              >
                Nieuw bericht sturen
              </button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div>
                <label className={cn(
                  safeFormConfig.input.label.display,
                  safeFormConfig.input.label.fontSize,
                  safeFormConfig.input.label.fontWeight,
                  safeFormConfig.input.label.textColor,
                  safeFormConfig.input.label.marginBottom
                )}>Naam</label>
                <input
                  type="text"
                  name="naam"
                  value={form.naam}
                  onChange={handleChange}
                  className={cn(
                    safeFormConfig.input.field.width,
                    safeFormConfig.input.field.padding,
                    safeFormConfig.input.field.backgroundColor,
                    safeFormConfig.input.field.border,
                    safeFormConfig.input.field.borderColor,
                    safeFormConfig.input.field.borderRadius,
                    safeFormConfig.input.field.textColor,
                    safeFormConfig.input.field.focus.outline,
                    safeFormConfig.input.field.focus.borderColor,
                    safeFormConfig.input.field.focus.ring,
                    safeFormConfig.input.field.focus.ringColor,
                    safeFormConfig.input.field.transition
                  )}
                  placeholder="Jouw naam"
                />
              </div>

              <div>
                <label className={cn(
                  safeFormConfig.input.label.display,
                  safeFormConfig.input.label.fontSize,
                  safeFormConfig.input.label.fontWeight,
                  safeFormConfig.input.label.textColor,
                  safeFormConfig.input.label.marginBottom
                )}>
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className={cn(
                    safeFormConfig.input.field.width,
                    safeFormConfig.input.field.padding,
                    safeFormConfig.input.field.backgroundColor,
                    safeFormConfig.input.field.border,
                    safeFormConfig.input.field.borderColor,
                    safeFormConfig.input.field.borderRadius,
                    safeFormConfig.input.field.textColor,
                    safeFormConfig.input.field.focus.outline,
                    safeFormConfig.input.field.focus.borderColor,
                    safeFormConfig.input.field.focus.ring,
                    safeFormConfig.input.field.focus.ringColor,
                    safeFormConfig.input.field.transition
                  )}
                  placeholder="jouw@email.nl"
                />
              </div>

              <div>
                <label className={cn(
                  safeFormConfig.input.label.display,
                  safeFormConfig.input.label.fontSize,
                  safeFormConfig.input.label.fontWeight,
                  safeFormConfig.input.label.textColor,
                  safeFormConfig.input.label.marginBottom
                )}>
                  Bericht <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={6}
                  name="bericht"
                  value={form.bericht}
                  onChange={handleChange}
                  required
                  className={cn(
                    safeFormConfig.textarea.field.width,
                    safeFormConfig.textarea.field.padding,
                    safeFormConfig.textarea.field.backgroundColor,
                    safeFormConfig.textarea.field.border,
                    safeFormConfig.textarea.field.borderColor,
                    safeFormConfig.textarea.field.borderRadius,
                    safeFormConfig.textarea.field.textColor,
                    safeFormConfig.textarea.field.resize,
                    safeFormConfig.textarea.field.focus.outline,
                    safeFormConfig.textarea.field.focus.borderColor,
                    safeFormConfig.textarea.field.focus.ring,
                    safeFormConfig.textarea.field.focus.ringColor,
                    safeFormConfig.textarea.field.transition
                  )}
                  placeholder="Jouw bericht..."
                />
              </div>

              {status === 'error' && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full bg-black hover:bg-gray-900 disabled:bg-gray-400 text-white font-semibold py-4 px-8 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:scale-100"
              >
                {status === 'sending' ? 'Verzenden...' : 'Verstuur Bericht'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
