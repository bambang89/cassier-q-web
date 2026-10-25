import { cn } from '@/utils/cn';
import { useSf } from '@/features/storefront/hooks/useSf';

export function useCardClass(): string {
  const { theme } = useSf();
  return cn(
    'rounded-[var(--sf-radius)] bg-[var(--sf-surface)]',
    theme.cardStyle === 'shadow' && 'shadow-[0_1px_2px_rgb(0_0_0/0.05),0_8px_24px_rgb(0_0_0/0.05)]',
    theme.cardStyle === 'border' && 'border border-[var(--sf-line)]',
  );
}
