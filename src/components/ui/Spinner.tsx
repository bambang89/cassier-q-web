import { cn } from '@/utils/cn';

export function Spinner({ className, size = 20 }: { className?: string; size?: number }) {
  return (
    <span
      role="status"
      aria-label="Memuat"
      style={{ width: size, height: size }}
      className={cn('inline-block animate-spin rounded-full border-2 border-current border-t-transparent', className)}
    />
  );
}

/** Indikator memuat di tengah area kosong. */
export function LoadingBlock({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-primary-600">
      <Spinner size={28} />
      {label ? <p className="text-sm text-ink-3">{label}</p> : null}
    </div>
  );
}
