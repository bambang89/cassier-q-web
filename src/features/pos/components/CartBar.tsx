'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/utils/cn';
import { formatRupiah } from '@/utils/format';
import { CartIcon } from '@/components/ui/icons/NavIcons';
import { ChevronRightIcon } from '@/components/ui/icons/ActionIcons';

/** Ringkasan keranjang melayang di atas tab bar (HP); "berdenyut" tiap item bertambah. */
export function CartBar({ count, total, onClick }: { count: number; total: number; onClick: () => void }) {
  const previous = useRef(count);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (count > previous.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 220);
      previous.current = count;
      return () => clearTimeout(t);
    }
    previous.current = count;
  }, [count]);

  return (
    <div className="fixed inset-x-3 bottom-[88px] z-30 animate-sheet-up tab:hidden">
      <button
        type="button"
        onClick={onClick}
        className="flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-navy-900 p-2.5 pr-3 text-left shadow-float active:scale-[0.98]"
      >
        <span
          className={cn(
            'relative flex size-11 items-center justify-center rounded-xl bg-primary-600 text-white transition-transform',
            bump && 'scale-[1.18]',
          )}
        >
          <CartIcon size={18} />
          <span className="absolute -top-1.5 -right-1.5 flex min-w-5 items-center justify-center rounded-full border-2 border-navy-900 bg-warning-500 px-1 text-[11px] font-bold text-white">
            {count}
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[12px] text-white/65">{`${count} item · Total`}</span>
          <span className="block truncate text-lg font-bold text-white">{formatRupiah(total, true)}</span>
        </span>
        <span className="flex items-center gap-1 rounded-xl bg-primary-600 px-3.5 py-2.5 text-sm font-bold text-white">
          Bayar <ChevronRightIcon size={16} strokeWidth={2.2} />
        </span>
      </button>
    </div>
  );
}
