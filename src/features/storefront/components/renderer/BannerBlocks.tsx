'use client';

import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';

import type { StorefrontBlock } from '@/types/storefront';
import { cn } from '@/utils/cn';
import { ChevronRightIcon, ChevronLeftIcon } from '@/components/ui/icons/ActionIcons';
import { useSf } from '@/features/storefront/hooks/useSf';
import { HERO_HEIGHT } from '@/features/storefront/constants';
import { SfButton, Placeholder, SfLink } from '@/features/storefront/components/renderer/primitives';
import { itemsOf, str, prop } from '@/features/storefront/utils';

export function HeroBlock({ block, full }: { block: StorefrontBlock; full: boolean }) {
  const { theme } = useSf();
  const imageUrl = prop<string>(block, 'imageUrl');
  const center = prop<string>(block, 'align') === 'center';
  const overlay = Math.min(90, Math.max(0, Number(prop<number>(block, 'overlay')) || 0)) / 100;
  const button = prop<string>(block, 'buttonText');
  const button2 = prop<string>(block, 'button2Text');
  const badge = prop<string>(block, 'badge');
  const titleSize = theme.headingSize === 'lg' ? 'text-4xl @3xl:text-6xl' : theme.headingSize === 'sm' ? 'text-2xl @3xl:text-4xl' : 'text-3xl @3xl:text-5xl';
  return (
    <div
      className={cn(
        'relative flex flex-col justify-end overflow-hidden p-6 text-white @3xl:p-12',
        HERO_HEIGHT[prop<string>(block, 'height')] ?? HERO_HEIGHT.md,
        !full && 'rounded-[calc(var(--sf-radius)*1.5)] shadow-lg',
        center && 'items-center text-center',
      )}
      style={
        imageUrl
          ? { backgroundImage: `linear-gradient(180deg, rgba(11,31,51,${overlay * 0.3}), rgba(11,31,51,${overlay})), url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { background: 'linear-gradient(135deg, #0B1F33 0%, var(--sf) 100%)' }
      }
    >
      {!imageUrl ? (
        <>
          <div className="absolute -top-16 -right-12 size-56 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 left-1/3 size-40 rounded-full bg-white/5" />
        </>
      ) : null}
      {badge ? <span className="relative mb-3 w-fit rounded-full bg-white/20 px-3 py-1 text-[12px] font-bold tracking-wide backdrop-blur">{badge}</span> : null}
      <h1 className={cn('sf-heading relative leading-[1.08] font-extrabold', titleSize)}>{prop<string>(block, 'title')}</h1>
      {prop<string>(block, 'subtitle') ? <p className={cn('relative mt-3 max-w-xl text-white/85 @3xl:text-lg', center && 'mx-auto')}>{prop<string>(block, 'subtitle')}</p> : null}
      {button || button2 ? (
        <div className={cn('relative mt-6 flex flex-wrap gap-2', center && 'justify-center')}>
          {button ? <SfButton label={button} link={prop<string>(block, 'buttonLink')} variant="white" /> : null}
          {button2 ? <SfButton label={button2} link={prop<string>(block, 'button2Link')} variant="glass" /> : null}
        </div>
      ) : null}
    </div>
  );
}

export function SlideshowBlock({ block, full }: { block: StorefrontBlock; full: boolean }) {
  const items = itemsOf(block);
  const [index, setIndex] = useState(0);
  const interval = Number(prop<number>(block, 'interval')) || 0;
  const count = items.length;
  const current = count ? index % count : 0;

  useEffect(() => {
    if (!interval || count < 2) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), interval * 1000);
    return () => window.clearInterval(timer);
  }, [interval, count]);

  if (count === 0) return <Placeholder label="Tambahkan slide di panel pengaturan" className="min-h-40" />;
  const go = (delta: number) => (e: MouseEvent) => {
    e.stopPropagation();
    setIndex((i) => (i + delta + count) % count);
  };

  return (
    <div className={cn('relative overflow-hidden', !full && 'rounded-[calc(var(--sf-radius)*1.5)] shadow-lg')}>
      <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${current * 100}%)` }}>
        {items.map((item) => {
          const image = str(item.imageUrl);
          return (
            <div
              key={item.id}
              className={cn('relative flex w-full shrink-0 flex-col justify-end p-6 text-left text-white @3xl:p-12', HERO_HEIGHT[prop<string>(block, 'height')] ?? HERO_HEIGHT.md)}
              style={
                image
                  ? { backgroundImage: `linear-gradient(180deg, rgba(11,31,51,0.05), rgba(11,31,51,0.7)), url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: 'linear-gradient(120deg, var(--sf) 0%, #0B1F33 100%)' }
              }
            >
              {str(item.title) ? <p className="sf-heading text-2xl font-extrabold @3xl:text-4xl">{str(item.title)}</p> : null}
              {str(item.subtitle) ? <p className="mt-1 max-w-lg text-white/85">{str(item.subtitle)}</p> : null}
              {str(item.buttonText) ? <SfButton label={str(item.buttonText)} link={str(item.link)} variant="white" size="sm" className="mt-4 w-fit" /> : null}
            </div>
          );
        })}
      </div>
      {count > 1 ? (
        <>
          <button type="button" onClick={go(-1)} aria-label="Slide sebelumnya" className="absolute top-1/2 left-3 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 text-[#0F172A] shadow">
            <ChevronLeftIcon size={18} />
          </button>
          <button type="button" onClick={go(1)} aria-label="Slide berikutnya" className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 text-[#0F172A] shadow">
            <ChevronRightIcon size={18} />
          </button>
          {prop<boolean>(block, 'showDots') ? (
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
              {items.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex(i);
                  }}
                  aria-label={`Slide ${i + 1}`}
                  className={cn('h-2 cursor-pointer rounded-full bg-white transition-all', i === current ? 'w-6' : 'w-2 opacity-60')}
                />
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

export function AnnouncementBlock({ block, full }: { block: StorefrontBlock; full: boolean }) {
  const text = `${prop<string>(block, 'icon') ? `${prop<string>(block, 'icon')}  ` : ''}${prop<string>(block, 'text')}`;
  const link = prop<string>(block, 'link');
  const marquee = prop<boolean>(block, 'marquee');
  const body = marquee ? (
    <div className="overflow-hidden whitespace-nowrap">
      <div className="inline-flex animate-marquee gap-16">
        {[0, 1, 2, 3].map((i) => (
          <span key={i}>{text}</span>
        ))}
      </div>
    </div>
  ) : (
    <span>{text}</span>
  );
  const className = cn('block bg-[var(--sf)] px-4 py-3 text-center text-sm font-semibold text-white shadow-sm', !full && 'rounded-[var(--sf-radius)]');
  return link ? (
    <SfLink link={link} className={className}>
      {body}
    </SfLink>
  ) : (
    <div className={className}>{body}</div>
  );
}
