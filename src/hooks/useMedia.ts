'use client';

import { useSyncExternalStore } from 'react';

/** Sama dengan breakpoint "tab" (740px) — padanan isTabletLandscape di mobile. */
const WIDE_QUERY = '(min-width: 740px)';

function subscribe(callback: () => void) {
  const mql = window.matchMedia(WIDE_QUERY);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

/** true di layar lebar (sidebar + panel), false di HP. */
export function useIsWide(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(WIDE_QUERY).matches,
    () => true,
  );
}
