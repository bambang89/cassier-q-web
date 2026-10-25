'use client';

import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { EyeIcon, PencilIcon } from '@/components/ui/icons/ActionIcons';
import type { StorefrontEditor } from '@/features/storefront/types';
import { EDITOR_DEVICES } from '@/features/storefront/constants';
import { BuilderCanvas } from '@/features/storefront/components/BuilderCanvas';
import { StorefrontProvider } from '@/features/storefront/components/StorefrontProvider';
import { StorefrontRenderer } from '@/features/storefront/components/StorefrontRenderer';
import { FloatingWhatsapp, StoreFooter, StoreHeader } from '@/features/storefront/components/renderer/StoreChrome';
import { EditorBlockToolbar } from '@/features/storefront/components/editor/EditorBlockToolbar';

/** Bilah perangkat + pratinjau. */
function DeviceBar({ editor }: { editor: StorefrontEditor }) {
  const { device, setDevice, previewMode, setPreviewMode, setSelectedId, setPreviewCart } = editor;
  return (
    <div className="relative z-30 flex items-center justify-center gap-2 px-4 pt-4 pb-3" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-0.5 rounded-full border border-white/60 bg-white/80 p-1 shadow-sm backdrop-blur">
        {EDITOR_DEVICES.map((d) => (
          <button
            key={d.key}
            type="button"
            onClick={() => setDevice(d.key)}
            className={cn('flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition duration-200', device === d.key ? 'bg-navy-900 text-white shadow' : 'text-ink-2 hover:bg-white')}
          >
            <span>{d.icon}</span>
            <span className="hidden sm:inline">{d.label}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          setPreviewMode((v) => !v);
          setSelectedId(null);
          setPreviewCart({});
        }}
        className={cn(
          'flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-2 text-[12.5px] font-semibold shadow-sm backdrop-blur transition duration-200',
          previewMode ? 'border-primary-600 bg-primary-600 text-white' : 'border-white/60 bg-white/80 text-ink-2 hover:bg-white',
        )}
      >
        {previewMode ? <PencilIcon size={14} /> : <EyeIcon size={14} />}
        {previewMode ? 'Kembali edit' : 'Pratinjau'}
      </button>
    </div>
  );
}

/** Peringatan bila toko belum pernah disimpan / masih draf. */
function PublishBanner({ editor }: { editor: StorefrontEditor }) {
  const { savedSnapshot, doc, saving, dirty, save } = editor;
  return (
    <div className="mx-auto mb-4 flex max-w-3xl animate-fade-in flex-wrap items-center gap-3 rounded-2xl border border-warning-200 bg-warning-50 px-4 py-3 shadow-sm">
      <span className="text-2xl">🚧</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-warning-700">{!savedSnapshot ? 'Toko online belum pernah disimpan' : 'Toko online masih Draf'}</p>
        <p className="text-[12.5px] text-warning-700/90">
          Pembeli yang membuka <span className="font-mono font-semibold">/toko/{doc.slug}</span> masih melihat &quot;Toko tidak ditemukan&quot;.
        </p>
      </div>
      <Button size="sm" variant="success" loading={saving} onClick={() => save({ published: true })}>
        {dirty || !savedSnapshot ? 'Simpan & Terbitkan' : 'Terbitkan sekarang'}
      </Button>
    </div>
  );
}

/** Bingkai perangkat (HP/Tablet/Desktop) berisi kanvas editor atau pratinjau interaktif. */
function DeviceFrame({ editor }: { editor: StorefrontEditor }) {
  const { device, host, doc, previewMode, preview, previewCart, setPreviewCart } = editor;
  const deviceWidth = EDITOR_DEVICES.find((d) => d.key === device)!.width;
  return (
    <div
      className={cn(
        'relative mx-auto overflow-hidden bg-white shadow-[0_30px_80px_-20px_rgb(11_31_51/0.35)] transition-[max-width,border-radius] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]',
        device === 'mobile' ? 'rounded-[2.6rem] border-[10px] border-navy-900' : device === 'tablet' ? 'rounded-[1.8rem] border-[12px] border-navy-900' : 'rounded-xl border border-white',
      )}
      style={{ maxWidth: deviceWidth + (device === 'desktop' ? 0 : device === 'mobile' ? 20 : 24) }}
    >
      {device === 'desktop' ? (
        <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-100 px-3 py-2">
          <span className="flex gap-1.5">
            <span className="size-3 rounded-full bg-[#FF5F57]" />
            <span className="size-3 rounded-full bg-[#FEBC2E]" />
            <span className="size-3 rounded-full bg-[#28C840]" />
          </span>
          <span className="mx-auto max-w-sm flex-1 truncate rounded-md bg-white px-3 py-1 text-center text-[12px] text-ink-3">
            🔒 {host}/toko/{doc.slug}
          </span>
        </div>
      ) : device === 'mobile' ? (
        <div className="relative flex h-8 items-center justify-between bg-white px-6 text-[11px] font-bold text-ink">
          <span>9:41</span>
          <span className="absolute top-1.5 left-1/2 h-5 w-24 -translate-x-1/2 rounded-full bg-navy-900" />
          <span className="tracking-tight">▂▄▆ ᯤ ▮</span>
        </div>
      ) : null}
      <div key={previewMode ? 'preview' : 'edit'} className={cn('animate-fade-in', !previewMode && 'select-none')}>
        {previewMode ? (
          <StorefrontProvider data={preview} cart={previewCart} onAdd={(p) => setPreviewCart((c) => ({ ...c, [p.id]: (c[p.id] ?? 0) + 1 }))}>
            <div data-sf-root className="relative min-h-[640px]">
              <StoreHeader cartCount={Object.values(previewCart).reduce((a, b) => a + b, 0)} />
              <StorefrontRenderer data={preview} />
              <StoreFooter />
              <FloatingWhatsapp contained />
            </div>
          </StorefrontProvider>
        ) : (
          <BuilderCanvas
            data={preview}
            blocks={doc.blocks}
            selectedId={editor.selectedId}
            onSelect={editor.select}
            pageSelection={editor.pageSelection}
            onSelectPage={editor.selectPage}
            dropIndex={editor.dnd.dragType ? editor.dnd.dropIndex : null}
            dragging={!!editor.dnd.dragType}
            justAdded={editor.justAdded}
            onInsertAt={editor.setInsertAt}
            toolbar={(block, index) => <EditorBlockToolbar editor={editor} block={block} index={index} />}
          />
        )}
      </div>
    </div>
  );
}

/** Area tengah editor: bilah perangkat, banner terbit, bingkai, dan petunjuk. */
export function EditorCanvas({ editor }: { editor: StorefrontEditor }) {
  const { previewMode, savedSnapshot, savedPublished } = editor;
  return (
    <div
      className="scroll-thin relative min-w-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_20%_0%,#EEF2FF_0,transparent_45%),radial-gradient(circle_at_90%_20%,#E0F2FE_0,transparent_40%),#E9EDF3] pb-24 lg:pb-8"
      onClick={editor.clearSelection}
    >
      <DeviceBar editor={editor} />
      <div className="px-3 sm:px-6" onClick={(e) => e.stopPropagation()}>
        {!previewMode && (!savedSnapshot || !savedPublished) ? <PublishBanner editor={editor} /> : null}
        <DeviceFrame editor={editor} />
        <p className="mt-4 text-center text-[12px] text-ink-3">
          {previewMode
            ? 'Mode pratinjau: coba klik produk & tombol seperti pembeli. Tekan Esc untuk kembali.'
            : 'Klik blok untuk mengatur · seret ⠿ untuk memindah · Ctrl+Z urungkan · Ctrl+S simpan · Del hapus'}
        </p>
      </div>
    </div>
  );
}
