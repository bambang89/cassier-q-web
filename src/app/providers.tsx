'use client';

import { Provider } from 'react-redux';

import { store } from '@/store';
import { AlertHost } from '@/components/ui/AlertHost';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
      <AlertHost />
    </Provider>
  );
}
