/**
 * STEPS IMAGE MANAGER
 * ✅ 3 gelabelde slots voor "In 3 stappen klaar" (upload / vervang / verwijder / herorden)
 * ✅ DRY: Stap-definities hardcoded hier als admin-side labels (sync met frontend config)
 * ✅ Geen externe drag-lib: HTML5 native drag-and-drop
 * ✅ Security: alleen /uploads/ of https:// URLs doorgegeven
 */

'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { GripVertical, Upload, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadImages } from '@/lib/api/upload';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────────────────

interface StepsImageManagerProps {
  value: string[];
  onChange: (images: string[]) => void;
}

// ─── Stap labels (admin-side, sync met frontend PRODUCT_PAGE_CONFIG.howItWorksSteps.steps) ──

const STEP_LABELS = [
  { number: 1, shortTitle: 'Stap 1', title: 'Stekker in en app instellen' },
  { number: 2, shortTitle: 'Stap 2', title: 'Afvalzak plaatsen' },
  { number: 3, shortTitle: 'Stap 3', title: 'Grit toevoegen en beginnen' },
] as const;

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// ─── Component ───────────────────────────────────────────────────────────────

export function StepsImageManager({ value, onChange }: StepsImageManagerProps) {
  // Altijd exact 3 slots (null = leeg)
  const slots: (string | null)[] = [
    value[0] ?? null,
    value[1] ?? null,
    value[2] ?? null,
  ];

  const [uploading, setUploading] = useState<number | null>(null); // welke slot uploadt
  const [dragSlot, setDragSlot] = useState<number | null>(null);   // bron van drag
  const [dropSlot, setDropSlot] = useState<number | null>(null);   // doel van drag
  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const emitChange = (newSlots: (string | null)[]) => {
    // Trim trailing nulls, stuur als string[]
    const trimmed = [...newSlots];
    while (trimmed.length > 0 && trimmed[trimmed.length - 1] === null) {
      trimmed.pop();
    }
    onChange(trimmed.filter((s): s is string => s !== null));
  };

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) return 'Alleen JPG, PNG, WebP en GIF zijn toegestaan.';
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return `Maximaal ${MAX_FILE_SIZE_MB}MB per afbeelding.`;
    return null;
  };

  // ─── Upload ────────────────────────────────────────────────────────────────

  const handleFileSelect = async (slotIndex: number, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    const err = validateFile(file);
    if (err) { toast.error(err); return; }

    setUploading(slotIndex);
    try {
      const urls = await uploadImages([file]);
      if (urls[0]) {
        const newSlots = [...slots] as (string | null)[];
        newSlots[slotIndex] = urls[0];
        emitChange(newSlots);
        toast.success(`Stap ${slotIndex + 1} afbeelding opgeslagen`);
      }
    } catch {
      toast.error('Upload mislukt. Probeer opnieuw.');
    } finally {
      setUploading(null);
      // Reset input
      const ref = fileInputRefs[slotIndex];
      if (ref.current) ref.current.value = '';
    }
  };

  // ─── Verwijderen ───────────────────────────────────────────────────────────

  const handleRemove = (slotIndex: number) => {
    const newSlots = [...slots] as (string | null)[];
    newSlots[slotIndex] = null;
    emitChange(newSlots);
  };

  // ─── Drag-to-reorder (HTML5 native) ───────────────────────────────────────

  const handleDragStart = (index: number) => setDragSlot(index);
  const handleDragEnd = () => { setDragSlot(null); setDropSlot(null); };
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDropSlot(index);
  };
  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (dragSlot === null || dragSlot === targetIndex) { handleDragEnd(); return; }
    const newSlots = [...slots] as (string | null)[];
    [newSlots[dragSlot], newSlots[targetIndex]] = [newSlots[targetIndex], newSlots[dragSlot]];
    emitChange(newSlots);
    handleDragEnd();
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      {STEP_LABELS.map((step, index) => {
        const image = slots[index];
        const isUploading = uploading === index;
        const isDragging = dragSlot === index;
        const isDropTarget = dropSlot === index && dragSlot !== null && dragSlot !== index;

        return (
          <div
            key={step.number}
            draggable={!!image}
            onDragStart={() => handleDragStart(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            className={cn(
              'flex items-center gap-3 rounded-xl border-2 p-3 transition-all duration-200',
              isDragging && 'opacity-50 scale-[0.98]',
              isDropTarget
                ? 'border-black bg-gray-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300',
            )}
          >
            {/* Drag handle */}
            <div
              className={cn(
                'flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors',
                !image && 'opacity-30 pointer-events-none',
              )}
              title="Sleep om volgorde te wijzigen"
            >
              <GripVertical className="w-5 h-5" />
            </div>

            {/* Stap nummer badge */}
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-black flex items-center justify-center">
              <span className="text-xs font-bold text-white">{step.number}</span>
            </div>

            {/* Afbeelding preview of lege slot */}
            <div className="flex-shrink-0 relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              {image ? (
                <Image
                  src={image}
                  alt={step.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized={image.startsWith('/uploads/') || image.startsWith('http')}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Upload className="w-5 h-5 text-gray-300" />
                </div>
              )}
            </div>

            {/* Stap label */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{step.shortTitle}</p>
              <p className="text-sm font-medium text-gray-800 truncate">{step.title}</p>
              {image && (
                <p className="text-xs text-gray-400 truncate mt-0.5">{image.split('/').pop()}</p>
              )}
            </div>

            {/* Acties */}
            <div className="flex-shrink-0 flex items-center gap-1.5">
              {/* Upload / Vervang knop */}
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRefs[index].current?.click()}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  image
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    : 'bg-black hover:bg-gray-800 text-white',
                )}
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                {image ? 'Vervang' : 'Upload'}
              </button>

              {/* Verwijder knop */}
              {image && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                  title="Verwijder afbeelding"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Verborgen file input */}
            <input
              ref={fileInputRefs[index]}
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              className="hidden"
              onChange={(e) => handleFileSelect(index, e.target.files)}
            />
          </div>
        );
      })}

      <p className="text-xs text-muted-foreground pt-1">
        Sleep de rijen om de volgorde van de stappen te wijzigen. Max {MAX_FILE_SIZE_MB}MB per afbeelding (JPG, PNG, WebP).
      </p>
    </div>
  );
}
