import { useContext } from 'react';

import type { StorefrontContextValue } from '@/features/storefront/types';
import { StorefrontContext } from '@/features/storefront/context';

export function useSf(): StorefrontContextValue {
  const value = useContext(StorefrontContext);
  if (!value) throw new Error('Blok toko harus dirender di dalam <StorefrontProvider>');
  return value;
}
