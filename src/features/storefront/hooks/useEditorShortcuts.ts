'use client';

import { useEffect, useRef } from 'react';

import { isTyping } from '@/utils/dom';
import type { EditorShortcutActions } from '@/features/storefront/types';

/** Pintasan editor: Ctrl+S simpan, Ctrl+Z/Y undo/redo, Ctrl+D duplikat, Del hapus, Alt+↑/↓ pindah, Esc. */
export function useEditorShortcuts(selectedId: string | null, actions: EditorShortcutActions, historyKey: unknown) {
  const actionsRef = useRef(actions);
  useEffect(() => {
    actionsRef.current = actions;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const a = actionsRef.current;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void a.save();
        return;
      }
      if (isTyping(e.target) || document.querySelector('[role="dialog"]')) return;
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) a.redo();
        else a.undo();
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        a.redo();
      } else if (selectedId && mod && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        a.duplicateBlock(selectedId);
      } else if (selectedId && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        a.removeBlock(selectedId);
      } else if (selectedId && e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        a.moveBlock(selectedId, e.key === 'ArrowUp' ? -1 : 1);
      } else if (e.key === 'Escape') {
        a.clear();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [historyKey, selectedId]);
}
