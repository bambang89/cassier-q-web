'use client';

import { useEffect } from 'react';

import { setSessionExpiredHandler } from '@/api/client';
import { store } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { bootstrapAuth, sessionExpired } from '@/store/slices/authSlice';

/** Memulai pengecekan sesi sekali (padanan useEffect di RootNavigator mobile). */
export function useAuthBootstrap() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.auth.status);

  useEffect(() => {
    if (store.getState().auth.status === 'idle') dispatch(bootstrapAuth());
    setSessionExpiredHandler(() => dispatch(sessionExpired()));
    return () => setSessionExpiredHandler(null);
  }, [dispatch]);

  return status;
}

export function FullScreenLoader() {
  return (
    <div className="flex h-dvh items-center justify-center bg-white">
      <span className="size-9 animate-spin rounded-full border-[3px] border-primary-600 border-t-transparent" />
    </div>
  );
}
