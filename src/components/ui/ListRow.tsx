import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

/** Baris kartu sederhana (judul, keterangan, aksi di kanan) untuk daftar master data. */
export function ListRow({
  icon,
  title,
  subtitle,
  right,
  onClick,
  index = 0,
}: {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  onClick?: () => void;
  index?: number;
}) {
  return (
    <div
      onClick={onClick}
      style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
      className={cn(
        'flex animate-fade-in items-center gap-3 rounded-xl border border-line bg-white px-4 py-3.5 transition',
        onClick && 'cursor-pointer hover:border-primary-200 hover:shadow-card active:scale-[0.995]',
      )}
    >
      {icon}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink">{title}</p>
        {subtitle ? <p className="truncate text-[13px] text-ink-2">{subtitle}</p> : null}
      </div>
      {right ? <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>{right}</div> : null}
    </div>
  );
}

/** Ikon bulat berwarna di kiri baris. */
export function RowIcon({ children, className = 'bg-primary-50 text-primary-600' }: { children: ReactNode; className?: string }) {
  return <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', className)}>{children}</span>;
}
