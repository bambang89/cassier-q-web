'use client';

import { PAPER_WIDTHS } from '@/services/printing/settings';
import type { PaperWidth } from '@/services/printing/types';
import { cn } from '@/utils/cn';

/** Pilihan lebar kertas struk: 58mm (printer kecil) / 80mm (printer POS standar). */
export function PaperWidthPicker({ value, onChange }: { value: PaperWidth; onChange: (width: PaperWidth) => void }) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1">
      {PAPER_WIDTHS.map((width) => (
        <button
          key={width}
          type="button"
          onClick={() => onChange(width)}
          className={cn(
            'cursor-pointer rounded-md py-2 text-sm font-semibold transition',
            value === width ? 'bg-white text-primary-700 shadow-sm' : 'text-ink-2 hover:text-ink',
          )}
        >
          {width} mm
        </button>
      ))}
    </div>
  );
}
