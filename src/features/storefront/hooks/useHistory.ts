'use client';

import { useCallback, useRef, useState } from 'react';

import type { EditorHistoryState } from '@/features/storefront/types';

const LIMIT = 80;
const COALESCE_MS = 700;

/**
 * State editor dengan Undo/Redo. Perubahan beruntun dengan `key` yang sama
 * (mis. mengetik di satu isian) digabung jadi satu langkah undo.
 */
export function useHistory<T>(initial: T) {
  const [state, setState] = useState<EditorHistoryState<T>>({ past: [], present: initial, future: [] });
  const last = useRef<{ key: string | null; at: number }>({ key: null, at: 0 });

  const set = useCallback((updater: T | ((prev: T) => T), key?: string) => {
    setState((s) => {
      const next = typeof updater === 'function' ? (updater as (prev: T) => T)(s.present) : updater;
      if (Object.is(next, s.present)) return s;
      const now = Date.now();
      const coalesce = !!key && last.current.key === key && now - last.current.at < COALESCE_MS && s.past.length > 0;
      last.current = { key: key ?? null, at: now };
      if (coalesce) return { past: s.past, present: next, future: [] };
      return { past: [...s.past, s.present].slice(-LIMIT), present: next, future: [] };
    });
  }, []);

  /** Ganti isi tanpa riwayat (mis. setelah memuat dari server). */
  const reset = useCallback((value: T) => {
    last.current = { key: null, at: 0 };
    setState({ past: [], present: value, future: [] });
  }, []);

  const undo = useCallback(() => {
    last.current = { key: null, at: 0 };
    setState((s) => (s.past.length ? { past: s.past.slice(0, -1), present: s.past[s.past.length - 1], future: [s.present, ...s.future] } : s));
  }, []);

  const redo = useCallback(() => {
    last.current = { key: null, at: 0 };
    setState((s) => (s.future.length ? { past: [...s.past, s.present], present: s.future[0], future: s.future.slice(1) } : s));
  }, []);

  return { value: state.present, set, reset, undo, redo, canUndo: state.past.length > 0, canRedo: state.future.length > 0 };
}
