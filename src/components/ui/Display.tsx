import type { ComponentType, ReactNode } from 'react';

import { cn } from '@/lib/cn';
import type { LineIconProps } from '@/components/icons/LineIcons';
import { TrendDownIcon, TrendUpIcon } from '@/components/icons/LineIcons';
import { Button } from './Button';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'info';

const BADGE: Record<BadgeVariant, string> = {
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-success-100 text-success-700',
  warning: 'bg-warning-100 text-warning-700',
  error: 'bg-error-100 text-error-700',
  neutral: 'bg-gray-100 text-gray-700',
  info: 'bg-info-100 text-info-700',
};

export function Badge({ children, variant = 'neutral', className }: { children: ReactNode; variant?: BadgeVariant; className?: string }) {
  return (
    <span className={cn('inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-bold', BADGE[variant], className)}>
      {children}
    </span>
  );
}

export function Card({
  children,
  className,
  onClick,
  padding = 'p-4',
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: string;
}) {
  const base = cn('rounded-xl border border-line bg-white shadow-card', padding, className);
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(base, 'block w-full cursor-pointer text-left transition hover:border-primary-200 active:scale-[0.985]')}
      >
        {children}
      </button>
    );
  }
  return <div className={base}>{children}</div>;
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  iconClass,
  delta,
  className,
}: {
  label: string;
  value: string;
  icon: ComponentType<LineIconProps>;
  /** Kelas warna chip ikon, mis. "bg-primary-50 text-primary-600". */
  iconClass: string;
  delta?: number | null;
  className?: string;
}) {
  return (
    <Card className={cn('min-w-0 flex-1', className)}>
      <div className="flex items-start justify-between gap-1">
        <p className="truncate text-[13px] font-medium text-ink-2">{label}</p>
        <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-md', iconClass)}>
          <Icon size={15} />
        </span>
      </div>
      <p className="mt-2 truncate text-[22px] leading-tight font-bold text-ink">{value}</p>
      {delta !== undefined && delta !== null ? (
        <p className={cn('mt-1 flex items-center gap-0.5 text-[13px] font-semibold', delta >= 0 ? 'text-success-600' : 'text-error-600')}>
          {delta >= 0 ? <TrendUpIcon size={11} /> : <TrendDownIcon size={11} />}
          {`${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`}
        </p>
      ) : null}
    </Card>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  children,
}: {
  icon: ComponentType<LineIconProps>;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-6 pt-10 text-center">
      <span className="mb-4 flex size-16 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
        <Icon size={26} />
      </span>
      <h3 className="mb-1 text-xl font-bold text-ink">{title}</h3>
      {description ? <p className="max-w-[280px] text-ink-2">{description}</p> : null}
      {actionLabel && onAction ? (
        <Button variant="outline" onClick={onAction} className="mt-5">
          {actionLabel}
        </Button>
      ) : null}
      {children}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-0 border-t border-line', className)} />;
}

/** Tab bergaris bawah seperti TabView di aplikasi mobile. */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: { key: T; title: string }[];
  value: T;
  onChange: (key: T) => void;
  className?: string;
}) {
  return (
    <div role="tablist" className={cn('no-scrollbar flex overflow-x-auto border-b border-line', className)}>
      {tabs.map((tab) => {
        const active = tab.key === value;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={cn(
              'flex min-w-24 flex-1 cursor-pointer flex-col items-center gap-1.5 px-3 pt-2.5 text-[15px] whitespace-nowrap',
              active ? 'font-semibold text-primary-600' : 'text-ink-2 hover:text-ink',
            )}
          >
            {tab.title}
            <span className={cn('h-0.5 w-3/5 rounded-full', active ? 'bg-primary-600' : 'bg-transparent')} />
          </button>
        );
      })}
    </div>
  );
}

/** Chip filter (kategori, status) — pil bulat yang bisa dipilih. */
export function Chip({
  active,
  onClick,
  children,
  className,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-[13px] font-semibold whitespace-nowrap transition',
        active
          ? 'border-primary-600 bg-primary-600 text-white shadow-sm'
          : 'border-gray-200 bg-white text-gray-600 hover:border-primary-200',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2.5 flex items-center justify-between gap-2">
      <h3 className="text-[15px] font-bold text-ink">{children}</h3>
      {action}
    </div>
  );
}
