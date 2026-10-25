'use client';

import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';
import { SearchIcon } from '@/components/ui/icons/ActionIcons';

/** Chip filter dengan jumlah opsional (aktif = navy, seperti di mobile). */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold whitespace-nowrap transition',
              active ? 'border-navy-900 bg-navy-900 text-white' : 'border-line bg-white text-ink-2 hover:border-gray-300',
            )}
          >
            {option.label}
            {option.count !== undefined ? <span className={active ? 'text-white/60' : 'text-ink-3'}> · {option.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

export function StatTile({ label, value, tone }: { label: string; value: string; tone?: 'error' | 'warning' | 'success' }) {
  const color =
    tone === 'error' ? 'text-error-600' : tone === 'warning' ? 'text-warning-700' : tone === 'success' ? 'text-success-700' : 'text-ink';
  return (
    <div className="min-w-0 flex-1 rounded-xl border border-line bg-white p-3.5 shadow-card">
      <p className="truncate text-[12.5px] text-ink-3">{label}</p>
      <p className={cn('mt-0.5 truncate text-lg font-bold', color)}>{value}</p>
    </div>
  );
}

export function HeroCard({ title, value, children }: { title: string; value: string; children?: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-[linear-gradient(135deg,#0B1F33_0%,#122A44_60%,#1A3654_100%)] p-5">
      <div className="absolute -top-14 -right-10 size-44 rounded-full bg-white/[0.05]" />
      <p className="relative text-[11.5px] font-semibold tracking-[0.1em] text-white/60">{title}</p>
      <p className="relative text-[26px] leading-8 font-extrabold text-white">{value}</p>
      <div className="relative">{children}</div>
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="flex h-11 items-center gap-2 rounded-lg border border-line bg-white px-3 focus-within:border-primary-600 focus-within:ring-3 focus-within:ring-primary-100">
      <SearchIcon size={16} className="text-ink-3" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-gray-400"
      />
    </label>
  );
}

/** Kontainer tabel elegan untuk layar lebar. */
export function DataTable({ head, children }: { head: ReactNode; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
      <table className="w-full text-[13.5px]">
        <thead className="bg-gray-50 text-left text-[11.5px] font-semibold tracking-wide text-gray-500 uppercase">{head}</thead>
        <tbody className="[&>tr]:border-t [&>tr]:border-gray-100 [&>tr:hover]:bg-gray-25">{children}</tbody>
      </table>
    </div>
  );
}
