'use client';

import type { MouseEvent } from 'react';

import type { StorefrontBlock } from '@/types/storefront';
import { cn } from '@/utils/cn';
import { ClockIcon, PinIcon } from '@/components/ui/icons/DataIcons';
import { useNow } from '@/features/storefront/hooks/useNow';
import { Heading, SfButton, Placeholder, EmbedShield } from '@/features/storefront/components/renderer/primitives';
import { useCardClass } from '@/features/storefront/hooks/useCardClass';
import { DAY_NAMES, MAP_HEIGHT } from '@/features/storefront/constants';
import { itemsOf, str, socialHref, prop } from '@/features/storefront/utils';
import { useSf } from '@/features/storefront/hooks/useSf';
import { SOCIAL_PLATFORMS } from '@/features/storefront/blockDefs/shared';

export function CountdownBlock({ block }: { block: StorefrontBlock }) {
  const now = useNow(1000);
  const card = useCardClass();
  const endsAt = prop<string>(block, 'endsAt');
  const target = endsAt ? new Date(endsAt).getTime() : NaN;
  const left = Number.isFinite(target) ? Math.max(0, target - now) : null;
  const units =
    left == null
      ? null
      : [
          { label: 'Hari', value: Math.floor(left / 86_400_000) },
          { label: 'Jam', value: Math.floor(left / 3_600_000) % 24 },
          { label: 'Menit', value: Math.floor(left / 60_000) % 60 },
          { label: 'Detik', value: Math.floor(left / 1000) % 60 },
        ];
  const button = prop<string>(block, 'buttonText');
  return (
    <div className={cn(card, 'p-6 text-center @3xl:p-10')}>
      <Heading>{left === 0 ? prop<string>(block, 'expiredText') : prop<string>(block, 'title')}</Heading>
      {prop<string>(block, 'subtitle') ? <p className="mt-1 text-sm text-[var(--sf-muted)]">{prop<string>(block, 'subtitle')}</p> : null}
      {units == null ? (
        <p className="mt-4 text-sm text-[var(--sf-muted)]">Atur tanggal berakhir di panel pengaturan.</p>
      ) : left! > 0 ? (
        <div className="mt-5 flex justify-center gap-2 @3xl:gap-4">
          {units.map((u) => (
            <div key={u.label} className="min-w-16 rounded-[var(--sf-radius)] bg-[var(--sf)] px-3 py-3 text-white @3xl:min-w-20">
              <span className="block text-2xl font-extrabold tabular-nums @3xl:text-4xl">{String(u.value).padStart(2, '0')}</span>
              <span className="text-[11px] font-semibold tracking-wide uppercase opacity-80">{u.label}</span>
            </div>
          ))}
        </div>
      ) : null}
      {button && left !== 0 ? <SfButton label={button} link={prop<string>(block, 'link')} className="mt-5" /> : null}
    </div>
  );
}

export function HoursBlock({ block }: { block: StorefrontBlock }) {
  const items = itemsOf(block);
  const card = useCardClass();
  const today = DAY_NAMES[new Date().getDay()];
  const highlight = prop<boolean>(block, 'highlightToday');
  return (
    <div className="mx-auto max-w-xl">
      <Heading className="mb-3">{prop<string>(block, 'title')}</Heading>
      <div className={cn(card, 'divide-y divide-[var(--sf-line)] overflow-hidden text-left')}>
        {items.map((item) => {
          const isToday = highlight && str(item.day).toLowerCase().replace("'", '').startsWith(today);
          const closed = /tutup|libur/i.test(str(item.time));
          return (
            <div key={item.id} className={cn('flex items-center justify-between gap-3 px-4 py-2.5 text-sm', isToday && 'bg-[color-mix(in_srgb,var(--sf)_10%,transparent)] font-bold')}>
              <span>
                {str(item.day)} {isToday ? <span className="ml-1 rounded-full bg-[var(--sf)] px-2 py-0.5 text-[10px] text-white">Hari ini</span> : null}
              </span>
              <span className={cn(closed && 'text-error-600')}>{str(item.time)}</span>
            </div>
          );
        })}
      </div>
      {prop<string>(block, 'note') ? <p className="mt-2 text-[13px] text-[var(--sf-muted)]">{prop<string>(block, 'note')}</p> : null}
    </div>
  );
}

export function InfoBlock({ block }: { block: StorefrontBlock }) {
  const { data, editor } = useSf();
  const card = useCardClass();
  const wa = prop<string>(block, 'whatsapp').replace(/\D/g, '').replace(/^0/, '62');
  const maps = prop<string>(block, 'mapsUrl');
  const address = [data.store.address, data.store.city].filter(Boolean).join(', ');
  const stop = (e: MouseEvent) => editor && e.preventDefault();
  return (
    <div className={cn(card, 'space-y-3 p-5 text-left')}>
      <Heading>{prop<string>(block, 'title')}</Heading>
      {prop<boolean>(block, 'showAddress') && address ? (
        <p className="flex items-start gap-2 text-sm text-[var(--sf-muted)]">
          <PinIcon size={16} className="mt-0.5 shrink-0 text-[var(--sf)]" /> {address}
        </p>
      ) : null}
      {prop<string>(block, 'hours') ? (
        <p className="flex items-center gap-2 text-sm text-[var(--sf-muted)]">
          <ClockIcon size={16} className="shrink-0 text-[var(--sf)]" /> {prop<string>(block, 'hours')}
        </p>
      ) : null}
      {prop<boolean>(block, 'showPhone') && data.store.phone ? <p className="text-sm text-[var(--sf-muted)]">☎️ {data.store.phone}</p> : null}
      <div className="flex flex-wrap gap-2 pt-1">
        {wa ? (
          <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" onClick={stop} className="rounded-[var(--sf-btn-radius)] bg-[#25D366] px-4 py-2 text-sm font-bold text-white">
            Chat WhatsApp
          </a>
        ) : null}
        {maps ? (
          <a href={maps} target="_blank" rel="noreferrer" onClick={stop} className="rounded-[var(--sf-btn-radius)] border border-[var(--sf-line)] px-4 py-2 text-sm font-bold">
            Buka Peta
          </a>
        ) : null}
      </div>
    </div>
  );
}

export function MapBlock({ block }: { block: StorefrontBlock }) {
  const { data } = useSf();
  const query = prop<string>(block, 'query') || [data.store.name, data.store.address, data.store.city].filter(Boolean).join(', ');
  return (
    <div>
      <Heading className="mb-3">{prop<string>(block, 'title')}</Heading>
      {query ? (
        <div className="relative overflow-hidden rounded-[var(--sf-radius)] border border-[var(--sf-line)]" style={{ height: MAP_HEIGHT[prop<string>(block, 'height')] ?? 320 }}>
          <iframe title="Peta lokasi" src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`} loading="lazy" className="absolute inset-0 size-full border-0" />
          <EmbedShield />
        </div>
      ) : (
        <Placeholder label="Isi alamat toko di Profil Toko, atau ketik alamat di panel pengaturan" />
      )}
    </div>
  );
}

export function SocialBlock({ block, align }: { block: StorefrontBlock; align: string }) {
  const { editor } = useSf();
  const items = itemsOf(block);
  const icons = prop<string>(block, 'display') === 'icons';
  return (
    <div>
      <Heading className="mb-3">{prop<string>(block, 'title')}</Heading>
      <div className={cn('flex flex-wrap gap-2', align === 'center' && 'justify-center', align === 'right' && 'justify-end')}>
        {items.map((item) => {
          const platform = SOCIAL_PLATFORMS.find((p) => p.value === item.platform) ?? SOCIAL_PLATFORMS[SOCIAL_PLATFORMS.length - 1];
          const href = socialHref(platform.value, str(item.url));
          return (
            <a
              key={item.id}
              href={href ?? '#'}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => (editor || !href) && e.preventDefault()}
              title={platform.label}
              className={cn(
                'inline-flex items-center gap-2 font-semibold text-white shadow-sm transition hover:brightness-110',
                icons ? 'size-11 justify-center rounded-full text-lg' : 'rounded-[var(--sf-btn-radius)] px-4 py-2 text-sm',
                !href && 'opacity-50',
              )}
              style={{ backgroundColor: platform.color }}
            >
              <span>{platform.emoji}</span>
              {icons ? null : platform.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}

export function DividerBlock({ block, align }: { block: StorefrontBlock; align: string }) {
  const width = prop<string>(block, 'width');
  return (
    <hr
      className={cn('border-0 border-t border-[var(--sf-line)]', width === 'short' && 'w-24', width === 'half' && 'w-1/2', align === 'center' && 'mx-auto', align === 'right' && 'ml-auto')}
      style={{ borderTopStyle: (prop<string>(block, 'lineStyle') || 'solid') as never, borderTopWidth: Number(prop<number>(block, 'thickness')) || 1 }}
    />
  );
}
