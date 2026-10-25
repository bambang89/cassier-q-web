import { useEffect } from 'react';

import type { StorefrontTheme } from '@/types/storefront';
import { FONTS } from '@/features/storefront/constants';

/** Muat font Google yang dipilih di tema (sekali per kombinasi). */
export function useStorefrontFonts(theme: Partial<StorefrontTheme> | undefined) {
  const families = [theme?.font, theme?.headingFont]
    .map((key) => (key ? FONTS[key]?.google : undefined))
    .filter((v, i, arr): v is string => !!v && arr.indexOf(v) === i);
  const href = families.length ? `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join('&')}&display=swap` : '';
  useEffect(() => {
    if (!href) return;
    let link = document.getElementById('sf-fonts') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = 'sf-fonts';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = href;
  }, [href]);
}
