'use client';

import { ReturnReason, RETURN_REASON_LABELS } from '@/types/return';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

/**
 * RETURN REASON SELECTOR - DRY Component
 * Dynamic dropdown voor return redenen
 * NO HARDCODED VALUES!
 */

interface ReturnReasonSelectorProps {
  value: ReturnReason | '';
  onChange: (reason: ReturnReason) => void;
  error?: string;
  disabled?: boolean;
}

export function ReturnReasonSelector({
  value,
  onChange,
  error,
  disabled = false,
}: ReturnReasonSelectorProps) {
  // DRY: Generate options from enum (dynamic!)
  const reasons = Object.values(ReturnReason);

  return (
    <div className="space-y-2">
      <Label htmlFor="return-reason">
        Reden voor retour <span className="text-red-500">*</span>
      </Label>
      
      <select
        id="return-reason"
        value={value}
        onChange={(e) => onChange(e.target.value as ReturnReason)}
        disabled={disabled}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <option value="">Selecteer een reden...</option>
        {reasons.map((reason) => (
          <option key={reason} value={reason}>
            {RETURN_REASON_LABELS[reason]}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}



