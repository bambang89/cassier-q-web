import type { ReactNode } from 'react';

import type { LineIconProps } from '@/types/ui';

export const DEFAULT_SIZE = 20;

export const DEFAULT_STROKE = 1.7;

export function IconBase({
  size = DEFAULT_SIZE,
  color = 'currentColor',
  strokeWidth = DEFAULT_STROKE,
  className,
  children,
}: LineIconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      color={color}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}
