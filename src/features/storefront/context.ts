'use client';

import { createContext } from 'react';

import type { StorefrontContextValue } from '@/features/storefront/types';

export const StorefrontContext = createContext<StorefrontContextValue | null>(null);
