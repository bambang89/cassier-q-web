'use client';

import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

import { track, SIZES, buttonClass } from '@/features/landing/utils';
import type { LandingEvent, LandingButtonVariant } from '@/features/landing/types';

/** Link biasa / anchor yang sekaligus mencatat event konversi. */
export function TrackedLink({
  event,
  eventProps,
  variant,
  size,
  className,
  children,
  external,
  ...rest
}: Omit<ComponentProps<typeof Link>, 'className'> & {
  event?: LandingEvent;
  eventProps?: Record<string, unknown>;
  variant?: LandingButtonVariant;
  size?: keyof typeof SIZES;
  className?: string;
  external?: boolean;
  children: ReactNode;
}) {
  const cls = variant ? buttonClass(variant, size, className) : className;
  const onClick = () => event && track(event, eventProps);
  if (external) {
    return (
      <a href={String(rest.href)} target="_blank" rel="noopener noreferrer" className={cls} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link {...rest} className={cls} onClick={onClick}>
      {children}
    </Link>
  );
}
