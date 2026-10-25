'use client';

import type { ComponentType } from 'react';

import type { LineIconProps } from '@/components/icons/LineIcons';
import { PageBody, PageHeader } from './PageHeader';

/** Layar yang di aplikasi mobile juga masih "Segera Hadir". */
export function ComingSoon({
  title,
  subtitle,
  icon: Icon,
  description,
}: {
  title: string;
  subtitle: string;
  icon: ComponentType<LineIconProps>;
  description: string;
}) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <PageBody className="flex items-center justify-center">
        <div className="flex max-w-sm animate-[pop-in_0.4s_ease-out_both] flex-col items-center rounded-2xl border border-line bg-white px-8 py-10 text-center shadow-card">
          <span className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600">
            <Icon size={28} />
          </span>
          <span className="mb-2 rounded-full bg-warning-100 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-warning-700 uppercase">
            Segera Hadir
          </span>
          <h2 className="text-xl font-bold text-ink">{title}</h2>
          <p className="mt-1 text-ink-2">{description}</p>
        </div>
      </PageBody>
    </>
  );
}
