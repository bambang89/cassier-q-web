'use client';

import type { CartItem } from '@/types/models';
import { formatRupiah } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import { SummaryRow } from '@/components/ui/SummaryRow';
import { CartIcon } from '@/components/ui/icons/NavIcons';
import { ClockIcon, DiscountIcon, NoteIcon } from '@/components/ui/icons/DataIcons';
import { TrashIcon } from '@/components/ui/icons/ActionIcons';
import { CartItemRow } from '@/features/pos/components/CartItemRow';

/** Panel "Pesanan Saat Ini" di kanan layar Kasir (layar lebar) — tablet-pos.html. */
export function OrderPanel({
  cashierName,
  cartItems,
  cartCount,
  subtotal,
  discountAmount,
  taxAmount,
  taxRatePercent,
  grandTotal,
  canCheckout,
  onCheckout,
  onClearCart,
  onOpenDiscount,
  onHold,
  onAddNote,
}: {
  cashierName: string;
  cartItems: CartItem[];
  cartCount: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  taxRatePercent: number;
  grandTotal: number;
  canCheckout: boolean;
  onCheckout: () => void;
  onClearCart: () => void;
  /** Tidak diisi bila user tidak boleh memberi diskon manual. */
  onOpenDiscount?: () => void;
  onHold: () => void;
  onAddNote: () => void;
}) {
  const action =
    'flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-white py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.97]';
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-gray-150 px-5 py-4">
        <div className="min-w-0">
          <p className="text-[15px] font-bold text-gray-900">Pesanan Saat Ini</p>
          <p className="truncate text-[12px] text-gray-500">
            {cartCount} item · Kasir: {cashierName}
          </p>
        </div>
        {cartCount > 0 ? (
          <button
            type="button"
            onClick={onClearCart}
            aria-label="Hapus keranjang"
            className="flex size-[34px] cursor-pointer items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            <TrashIcon size={15} />
          </button>
        ) : null}
      </div>

      {cartItems.length > 0 ? (
        <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-5">
          {cartItems.map((item) => (
            <CartItemRow key={`${item.product.id}-${item.unitId}`} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <CartIcon size={22} />
          </span>
          <p className="text-sm text-ink-3">Belum ada item, klik produk untuk menambahkan.</p>
        </div>
      )}

      <div className="border-t border-dashed border-gray-200 px-5 pt-3 pb-4">
        <SummaryRow className="py-1 text-[13.5px]" label="Subtotal" value={formatRupiah(subtotal, true)} />
        {discountAmount > 0 ? <SummaryRow className="py-1 text-[13.5px]" label="Diskon" value={`− ${formatRupiah(discountAmount, true)}`} valueClass="text-success-600" /> : null}
        {taxAmount > 0 ? <SummaryRow className="py-1 text-[13.5px]" label={`Pajak (${taxRatePercent}%)`} value={formatRupiah(taxAmount, true)} /> : null}
        <div className="mt-2 flex items-center justify-between border-t border-gray-150 pt-3">
          <span className="text-[15px] font-bold text-gray-900">Total</span>
          <span className="text-[22px] font-extrabold text-gray-900">{formatRupiah(grandTotal, true)}</span>
        </div>

        <div className="mt-3 flex gap-2">
          <button type="button" className={action} onClick={onHold}>
            <ClockIcon size={14} /> Tahan
          </button>
          {onOpenDiscount ? (
            <button type="button" className={action} onClick={onOpenDiscount}>
              <DiscountIcon size={14} /> Diskon
            </button>
          ) : null}
          <button type="button" className={action} onClick={onAddNote}>
            <NoteIcon size={14} /> Catatan
          </button>
        </div>

        <Button fullWidth size="lg" disabled={!canCheckout} onClick={onCheckout} className="mt-3 text-base">
          {`Bayar Sekarang · ${formatRupiah(grandTotal, true)}`}
        </Button>
        <p className="mt-2 text-center text-[11.5px] text-gray-400">F2 cari produk · F9 bayar</p>
      </div>
    </div>
  );
}

