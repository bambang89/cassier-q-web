'use client';

import { useEffect } from 'react';

import type { EditorDoc } from '@/features/storefront/types';
import { EDITOR_DRAFT_KEY } from '@/features/storefront/constants';

/** Simpan draf lokal (debounce 800 ms) + peringatan saat meninggalkan halaman bila ada perubahan. */
export function useEditorDraft(doc: EditorDoc, dirty: boolean, loaded: boolean) {
  useEffect(() => {
    if (!loaded) return;
    const timer = window.setTimeout(() => {
      try {
        if (dirty) localStorage.setItem(EDITOR_DRAFT_KEY, JSON.stringify({ at: Date.now(), doc }));
        else localStorage.removeItem(EDITOR_DRAFT_KEY);
      } catch {
        // abaikan
      }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [doc, dirty, loaded]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
}
