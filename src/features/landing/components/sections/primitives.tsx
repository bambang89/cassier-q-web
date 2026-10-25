import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

export function Section({ id, className, children, labelledBy }: { id?: string; className?: string; children: ReactNode; labelledBy?: string }) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn('scroll-mt-16 px-4 py-20 sm:px-6 sm:py-24', className)}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export function Heading({ id, eyebrow, title, lead, center, dark }: { id: string; eyebrow: string; title: ReactNode; lead?: ReactNode; center?: boolean; dark?: boolean }) {
  return (
    <div className={cn('max-w-2xl', center && 'mx-auto text-center')}>
      <p className={cn('text-sm font-bold tracking-wide', dark ? 'text-electric-400' : 'text-electric-700')}>{eyebrow}</p>
      <h2 id={id} className={cn('mt-3 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl', dark ? 'text-white' : 'text-ink')}>
        {title}
      </h2>
      {lead && <p className={cn('mt-4 text-[17px] leading-relaxed text-pretty', dark ? 'text-gray-300' : 'text-ink-2')}>{lead}</p>}
    </div>
  );
}
