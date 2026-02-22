"use client";

import { FORM_CONFIG } from "@/lib/form-config";
import { cn } from "@/lib/utils";

export default function ContactPage() {
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold mb-2 text-gray-900 tracking-wide uppercase text-xs">Openingstijden</h3>
            <p className="text-gray-600 font-medium text-sm">Ma–Vr: 9:00 – 17:00</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-medium mb-8 text-center text-gray-900">Stuur ons een bericht</h2>
          
          <form className="space-y-6">
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
              )}>Email</label>
              <input 
                type="email" 
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
              )}>Bericht</label>
              <textarea 
                rows={6}
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

            <button
              type="submit"
              className={cn(
                safeFormConfig.button.submit.width,
                safeFormConfig.button.submit.backgroundColor,
                safeFormConfig.button.submit.hoverBackgroundColor,
                safeFormConfig.button.submit.textColor,
                safeFormConfig.button.submit.fontWeight,
                safeFormConfig.button.submit.padding,
                safeFormConfig.button.submit.borderRadius,
                safeFormConfig.button.submit.transition,
                safeFormConfig.button.submit.hoverScale,
                safeFormConfig.button.submit.activeScale
              )}
            >
              Verstuur Bericht
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
