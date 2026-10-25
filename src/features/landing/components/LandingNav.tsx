'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { LANDING } from '@/config/site';
import { loadTokens } from '@/services/tokenStorage';
import { cn } from '@/utils/cn';
import { MenuIcon } from '@/components/ui/icons/NavIcons';
import { CloseIcon } from '@/components/ui/icons/ActionIcons';
import { NAV_LINKS } from '@/features/landing/content';
import { TrackedLink } from '@/features/landing/components/ui';

export function LandingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    loadTokens().then((t) => setSignedIn(Boolean(t?.refreshToken))).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-colors',
        scrolled || open ? 'border-gray-200/80 bg-white/90 backdrop-blur-md' : 'border-transparent bg-white/0',
      )}
    >
      <nav aria-label="Navigasi utama" className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center rounded-lg focus-visible:outline-2 focus-visible:outline-electric-500">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/branding/cassier-q-logo-horizontal-onwhite.svg" alt="cassier-Q" width={106} height={44} className="h-11 w-auto" />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium text-ink-2 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-electric-500">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {signedIn ? (
            <TrackedLink href={LANDING.routes.dashboard} variant="primary">
              Buka Dashboard
            </TrackedLink>
          ) : (
            <>
              <TrackedLink href={LANDING.routes.login} variant="ghost">
                Masuk
              </TrackedLink>
              <TrackedLink href={LANDING.routes.register} variant="primary" event="registration_start" eventProps={{ placement: 'nav' }}>
                Mulai Sekarang
              </TrackedLink>
            </>
          )}
        </div>

        <button
          type="button"
          className="ml-auto inline-flex size-10 items-center justify-center rounded-lg text-ink hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-electric-500 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <CloseIcon size={22} strokeWidth={1.8} /> : <MenuIcon size={22} />}
        </button>
      </nav>

      <div id="mobile-menu" hidden={!open} className="border-t border-gray-200 bg-white px-4 pb-6 pt-2 lg:hidden">
        <ul className="flex flex-col">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-2 py-3 text-base font-medium text-ink hover:bg-gray-50">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-4 grid gap-2">
          {signedIn ? (
            <TrackedLink href={LANDING.routes.dashboard} variant="primary" size="lg">
              Buka Dashboard
            </TrackedLink>
          ) : (
            <>
              <TrackedLink href={LANDING.routes.register} variant="primary" size="lg" event="registration_start" eventProps={{ placement: 'nav_mobile' }}>
                Mulai Sekarang
              </TrackedLink>
              <TrackedLink href={LANDING.routes.login} variant="secondary" size="lg">
                Masuk
              </TrackedLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
