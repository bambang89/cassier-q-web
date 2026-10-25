'use client';

import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Field';
import { CheckIcon } from '@/components/ui/icons/ActionIcons';
import type { StorefrontEditor } from '@/features/storefront/types';

function HeaderIconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={label} aria-label={label} className="flex h-9 w-9 cursor-pointer items-center justify-center text-lg text-ink-2 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30">
      {children}
    </button>
  );
}

/** Undo/redo, saklar terbit, tautan toko, dan tombol Simpan di header editor. */
export function EditorHeaderActions({ editor }: { editor: StorefrontEditor }) {
  const { history, doc, setDoc, savedSnapshot, dirty, saving, save } = editor;
  return (
    <div className="flex items-center gap-1.5">
      <div className="hidden items-center rounded-lg border border-line bg-white sm:flex">
        <HeaderIconButton label="Urungkan (Ctrl+Z)" onClick={history.undo} disabled={!history.canUndo}>
          ↶
        </HeaderIconButton>
        <span className="h-5 w-px bg-line" />
        <HeaderIconButton label="Ulangi (Ctrl+Shift+Z)" onClick={history.redo} disabled={!history.canRedo}>
          ↷
        </HeaderIconButton>
      </div>
      <label className="hidden items-center gap-2 rounded-lg border border-line bg-white px-2.5 py-1.5 md:flex">
        <span className={cn('size-2 rounded-full', doc.published ? 'bg-success-500 shadow-[0_0_0_3px_rgb(16_185_129/0.2)]' : 'bg-gray-300')} />
        <span className="text-[13px] font-semibold text-ink-2">{doc.published ? 'Tayang' : 'Draf'}</span>
        <Switch value={doc.published} onChange={(published) => setDoc((d) => ({ ...d, published }))} label="Terbitkan toko online" />
      </label>
      {savedSnapshot && doc.published ? (
        <a href={`/toko/${doc.slug}`} target="_blank" rel="noreferrer" className="hidden h-10 items-center rounded-md border border-line px-3 text-[13px] font-semibold text-ink-2 hover:bg-gray-50 lg:flex">
          Lihat Toko ↗
        </a>
      ) : null}
      <Button size="sm" onClick={() => save()} loading={saving} disabled={!dirty && savedSnapshot !== ''} leftIcon={!dirty && savedSnapshot ? <CheckIcon size={14} /> : undefined}>
        {dirty || !savedSnapshot ? 'Simpan' : 'Tersimpan'}
      </Button>
    </div>
  );
}
