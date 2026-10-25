'use client';

import { Alert } from '@/lib/alert';
import { TEMPLATES } from '@/features/storefront/templates';
import type { StorefrontTemplate } from '@/features/storefront/types';

export function TemplatesPanel({ onApply }: { onApply: (template: StorefrontTemplate) => void }) {
  return (
    <div>
      <p className="mb-3 text-[12.5px] text-ink-3">Mulai cepat dari desain jadi sesuai jenis usaha. Desain sekarang akan diganti (bisa di-Undo).</p>
      <div className="space-y-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() =>
              Alert.alert(`Pakai template ${t.label}?`, 'Susunan blok dan tema sekarang akan diganti. Alamat toko dan status terbit tidak berubah.', [
                { text: 'Batal', style: 'cancel' },
                { text: 'Pakai', onPress: () => onApply(t) },
              ])
            }
            className="group flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-xl border border-line bg-white p-2.5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-card"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg text-2xl transition duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]" style={{ background: `color-mix(in srgb, ${t.color} 16%, white)` }}>
              {t.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-ink">{t.label}</span>
              <span className="line-clamp-2 block text-[12px] leading-snug text-ink-3">{t.description}</span>
            </span>
            <span className="size-3 shrink-0 rounded-full" style={{ background: t.color }} />
          </button>
        ))}
      </div>
    </div>
  );
}
