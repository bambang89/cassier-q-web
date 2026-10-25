'use client';

import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';
import { SearchIcon } from '@/components/ui/icons/ActionIcons';

/**
 * Daftar di kiri (330px) + detail di kanan — padanan TabletSplitView mobile
 * (tablet-transactions.html). Hanya untuk layar lebar.
 */
export function SplitView({
  children,
  detail,
  detailKey,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  listHeader,
  listFooter,
}: {
  children: ReactNode;
  detail: ReactNode;
  detailKey?: string | null;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  searchPlaceholder?: string;
  listHeader?: ReactNode;
  listFooter?: ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex w-[330px] shrink-0 flex-col border-r border-gray-150 bg-white xl:w-[360px]">
        {onSearchChange ? (
          <div className="border-b border-gray-150 p-3.5">
            <label className="flex h-[46px] items-center gap-2 rounded-md border border-gray-200 bg-white px-3 focus-within:border-primary-600 focus-within:ring-3 focus-within:ring-primary-100">
              <SearchIcon size={15} className="text-gray-400" />
              <input
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-[13.5px] text-gray-900 outline-none placeholder:text-gray-400"
              />
            </label>
          </div>
        ) : null}
        {listHeader}
        <div className="scroll-thin min-h-0 flex-1 overflow-y-auto">{children}</div>
        {listFooter}
      </div>
      <div className="scroll-thin min-w-0 flex-1 overflow-y-auto bg-gray-25">
        <div key={detailKey ?? 'empty'} className="animate-slide-in">
          {detail}
        </div>
      </div>
    </div>
  );
}

export function SplitItem({
  active,
  onClick,
  title,
  amount,
  meta,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title?: string;
  amount?: string;
  meta?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'block w-full cursor-pointer border-b border-gray-100 px-4 py-[13px] text-left transition-colors',
        active ? 'border-l-[3px] border-l-primary-600 bg-primary-50 pl-[13px]' : 'hover:bg-gray-50',
      )}
    >
      {children ?? (
        <>
          <span className="flex items-center justify-between gap-2">
            <span className={cn('truncate text-[13px] font-bold', active ? 'text-primary-600' : 'text-gray-900')}>{title}</span>
            {amount ? <span className="shrink-0 text-[13px] font-bold text-gray-900">{amount}</span> : null}
          </span>
          {meta ? <span className="mt-1 block text-[11.5px] text-gray-500">{meta}</span> : null}
        </>
      )}
    </button>
  );
}

/** Kotak info label/nilai di panel detail. */
export function InfoCell({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[11.5px] font-medium tracking-wide text-gray-500 uppercase">{label}</p>
      <p className="mt-0.5 truncate text-[13.5px] font-semibold text-gray-900">{value}</p>
    </div>
  );
}
