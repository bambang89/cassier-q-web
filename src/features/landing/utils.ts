import { cn } from '@/utils/cn';
import type { LandingEvent, LandingButtonVariant } from '@/features/landing/types';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(event: LandingEvent, props: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;
  window.dataLayer?.push({ event, ...props });
  window.dispatchEvent(new CustomEvent('cq:track', { detail: { event, ...props } }));
}

export const rp = (n: number) => 'Rp' + n.toLocaleString('id-ID');

export const VARIANTS: Record<LandingButtonVariant, string> = {
  primary: 'bg-electric-600 text-white shadow-[0_8px_20px_-8px_rgb(42_100_232/0.7)] hover:bg-electric-700',
  secondary: 'border border-gray-200 bg-white text-ink hover:border-gray-300 hover:bg-gray-50',
  ghost: 'text-ink-2 hover:bg-gray-100 hover:text-ink',
  onDark: 'bg-white text-night hover:bg-electric-50',
  onDarkGhost: 'border border-white/20 text-white hover:bg-white/10',
};

export const SIZES = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-[15px]',
};

export function buttonClass(variant: LandingButtonVariant = 'primary', size: keyof typeof SIZES = 'md', className?: string) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-500',
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}
