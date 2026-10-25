import type { ButtonHTMLAttributes } from 'react';

import type { ButtonVariant, ButtonSize, ButtonProps } from '@/types/ui';
import { cn } from '@/utils/cn';
import { Spinner } from '@/components/ui/Spinner';

const VARIANTS: Record<ButtonVariant, string> = {
  solid: 'bg-primary-600 text-white shadow-sm hover:bg-primary-700',
  outline: 'border-[1.5px] border-primary-600 text-primary-600 hover:bg-primary-50',
  ghost: 'text-primary-600 hover:bg-primary-50',
  danger: 'bg-error-600 text-white shadow-sm hover:bg-error-700',
  dangerOutline: 'border-[1.5px] border-error-600 text-error-600 hover:bg-error-50',
  success: 'bg-success-600 text-white shadow-sm hover:bg-success-700',
  secondary: 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
};

// Tinggi minimum sama dengan app mobile (40/48/56) — target klik lega.
const SIZES: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-3 text-sm',
  md: 'min-h-12 px-5 text-base',
  lg: 'min-h-14 px-6 text-lg',
};

export function Button({
  variant = 'solid',
  size = 'md',
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  fullWidth,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg font-semibold transition-[transform,background-color] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-55 disabled:active:scale-100',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Spinner size={18} />
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
}

/** Tombol ikon persegi kecil (notifikasi, tutup, edit). */
export function IconButton({
  className,
  children,
  label,
  type = 'button',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 active:scale-95 disabled:opacity-50',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
