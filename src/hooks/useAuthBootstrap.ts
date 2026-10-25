import { useEffect } from 'react';

import { sessionExpired, bootstrapAuth } from '@/lib/store/slices/authSlice';
import { store } from '@/lib/store';
import { setSessionExpiredHandler } from '@/lib/apiClient';
import { useAppSelector, useAppDispatch } from '@/hooks/store';

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
