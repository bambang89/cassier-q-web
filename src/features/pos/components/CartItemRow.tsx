'use client';

import type { CartItem } from '@/types/models';
import { decrementItem, incrementItem } from '@/lib/store/slices/cartSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { baseTotals, linePricing, nextStep } from '@/utils/priceTiers';
import { emojiForProduct, paletteColorFor } from '@/utils/productDisplay';
import { formatRupiah } from '@/utils/format';

export function QtyStepper({ item }: { item: CartItem }) {
  const dispatch = useAppDispatch();
  const btn =
    'flex size-8 cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-white text-base font-bold text-ink hover:bg-gray-50 active:scale-90';
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button type="button" className={btn} onClick={() => dispatch(decrementItem(item.product.id))} aria-label="Kurangi jumlah">
        −
      </button>
      <span className="min-w-7 text-center text-[15px] font-bold">{item.quantity}</span>
      <button type="button" className={btn} onClick={() => dispatch(incrementItem(item.product.id))} aria-label="Tambah jumlah">
        +
      </button>
    </div>
  );
}

export function CartItemRow({ item }: { item: CartItem }) {
  const cartItems = useAppSelector((state) => state.cart.items);
  const pricing = linePricing(item, baseTotals(cartItems));
  const next = nextStep(item.product, pricing.productTotalBase);
  return (
    <div className="flex items-center gap-2.5 border-b border-gray-100 py-2.5 last:border-b-0">
      <span
        className="flex size-11 shrink-0 items-center justify-center rounded-lg text-lg"
        style={{ backgroundColor: paletteColorFor(item.product.id) }}
      >
        {emojiForProduct(item.product)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold text-ink">{item.product.productName}</p>
        <p className="flex flex-wrap items-center gap-1 text-[12.5px]">
          {pricing.wholesale ? <span className="text-ink-3 line-through">{formatRupiah(pricing.normalUnitPrice, true)}</span> : null}
          <span className={pricing.wholesale ? 'font-semibold text-success-600' : 'text-ink-3'}>
            {formatRupiah(pricing.unitPrice, true)}
            {item.unitConversionToBase !== 1 || item.unitName !== item.product.baseUnitName ? ` / ${item.unitName}` : ''}
            {pricing.wholesale ? ' · Grosir' : ''}
          </span>
        </p>
        {next ? (
          <p className="truncate text-[12px] text-primary-600">
            +{Math.ceil(next.minQuantity - pricing.productTotalBase)} {item.product.baseUnitName} lagi →{' '}
            {formatRupiah(next.unitPrice, true)}/{item.product.baseUnitName}
          </p>
        ) : null}
      </div>
      <QtyStepper item={item} />
    </div>
  );
}
