'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

import type { PublicStorefront, PublicProduct } from '@/types/storefront';
import { themeStyle, resolveTheme, resolvePage } from '@/features/storefront/utils';
import { useStorefrontFonts } from '@/features/storefront/hooks/useStorefrontFonts';
import type { StorefrontContextValue } from '@/features/storefront/types';
import { StorefrontContext } from '@/features/storefront/context';

export function StorefrontProvider({
  data,
  cart = {},
  onAdd,
  editor = false,
  children,
}: {
  data: PublicStorefront;
  cart?: Record<string, number>;
  onAdd?: (product: PublicProduct) => void;
  editor?: boolean;
  children: ReactNode;
}) {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const theme = resolveTheme(data.layout);
  const page = resolvePage(data.layout);
  useStorefrontFonts(theme);
  const value: StorefrontContextValue = {
    data,
    theme,
    page,
    cart,
    onAdd: page.orderingEnabled ? (onAdd ?? (editor ? () => undefined : undefined)) : undefined,
    categoryId,
    onCategory: setCategoryId,
    editor,
    whatsapp: page.floatingWhatsapp || data.store.phone,
  };
  return (
    <StorefrontContext.Provider value={value}>
      <div style={themeStyle(data.themeColor, theme)} className="@container min-h-full bg-[var(--sf-bg)]">
        {children}
      </div>
    </StorefrontContext.Provider>
  );
}
