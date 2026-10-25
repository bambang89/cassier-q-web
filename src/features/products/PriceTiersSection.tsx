'use client';

import { Button } from '@/components/ui/Button';
import { PlusIcon, TrashIcon } from '@/components/icons/LineIcons';

/** Baris harga grosir yang sedang diketik. */
export type TierDraft = { minQuantity: string; unitPrice: string };

const rupiah = (value: number) => `Rp${Math.round(value).toLocaleString('id-ID')}`;

/** Editor "Harga Grosir": ≥N satuan → harga per satuan, dengan persen hemat dari harga normal. */
export function PriceTiersSection({
  tiers,
  onChange,
  normalPrice,
  unitName,
  disabled,
}: {
  tiers: TierDraft[];
  onChange: (tiers: TierDraft[]) => void;
  normalPrice: number;
  unitName: string;
  disabled?: boolean;
}) {
  const patch = (index: number, value: Partial<TierDraft>) => onChange(tiers.map((t, i) => (i === index ? { ...t, ...value } : t)));

  const addRow = () => {
    const last = tiers[tiers.length - 1];
    const nextQty = last && Number(last.minQuantity) ? Number(last.minQuantity) * 2 : 10;
    onChange([...tiers, { minQuantity: String(nextQty), unitPrice: '' }]);
  };

  const input =
    'rounded-md border border-line bg-white px-2.5 py-2 text-[15px] text-ink outline-none focus:border-primary-600 disabled:bg-gray-50';

  return (
    <div className="mb-4 rounded-xl border border-line bg-white p-4">
      <p className="font-bold text-ink">Harga Grosir</p>
      <p className="text-[13px] text-ink-3">
        Makin banyak dibeli, makin murah per {unitName}. Dihitung dari total {unitName} produk ini dalam satu transaksi
        (semua satuan dijumlahkan).
      </p>
      <div className="mt-3 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5 text-sm">
        <span className="text-ink-2">1 {unitName} ke atas (harga normal)</span>
        <span className="font-semibold text-ink">{normalPrice > 0 ? `${rupiah(normalPrice)} / ${unitName}` : '—'}</span>
      </div>
      {tiers.map((tier, index) => {
        const price = Number(tier.unitPrice || 0);
        const saving = normalPrice > 0 && price > 0 ? Math.round(((normalPrice - price) / normalPrice) * 100) : 0;
        return (
          <div key={index} className="mt-2 flex items-center gap-2 border-b border-gray-100 py-1.5 text-sm text-ink-2 last:border-0">
            <span>≥</span>
            <input
              value={tier.minQuantity}
              onChange={(e) => patch(index, { minQuantity: e.target.value.replace(/[^0-9.]/g, '') })}
              inputMode="decimal"
              disabled={disabled}
              aria-label={`Minimal jumlah tingkat ${index + 1}`}
              className={`${input} w-20 text-center`}
            />
            <span>{unitName}</span>
            <span className="flex-1" />
            <span>Rp</span>
            <input
              value={tier.unitPrice}
              onChange={(e) => patch(index, { unitPrice: e.target.value.replace(/\D/g, '') })}
              inputMode="numeric"
              placeholder="0"
              disabled={disabled}
              aria-label={`Harga tingkat ${index + 1}`}
              className={`${input} w-32 text-right`}
            />
            {saving > 0 ? <span className="w-11 text-[12.5px] font-semibold text-success-600">-{saving}%</span> : <span className="w-11" />}
            {!disabled ? (
              <button
                type="button"
                onClick={() => onChange(tiers.filter((_, i) => i !== index))}
                aria-label={`Hapus tingkat ${index + 1}`}
                className="flex size-8 cursor-pointer items-center justify-center rounded-md text-error-600 hover:bg-error-50"
              >
                <TrashIcon size={14} />
              </button>
            ) : null}
          </div>
        );
      })}
      {!disabled ? (
        <Button variant="outline" size="sm" leftIcon={<PlusIcon size={14} />} onClick={addRow} className="mt-3">
          Tambah Tingkat Harga
        </Button>
      ) : (
        <p className="mt-3 text-[13px] text-ink-3">Anda tidak punya izin mengubah harga grosir.</p>
      )}
    </div>
  );
}
