'use client';

import type { EditorPanelKey, StorefrontEditor } from '@/features/storefront/types';
import { LayersPanel, Palette } from '@/features/storefront/components/BuilderCanvas';
import { ThemePanel } from '@/features/storefront/components/panels/ThemePanel';
import { PagePanel } from '@/features/storefront/components/panels/PagePanel';
import { TemplatesPanel } from '@/features/storefront/components/panels/TemplatesPanel';

/** Isi panel kiri editor (Blok, Lapisan, Template, Tema, Halaman). */
export function EditorPanelContent({ editor, panel }: { editor: StorefrontEditor; panel: EditorPanelKey }) {
  const { doc, setDoc, full, selectedId, pageSelection, host, profile } = editor;
  switch (panel) {
    case 'blocks':
      return (
        <>
          <p className="mb-3 text-[12.5px] text-ink-3">Seret blok ke pratinjau dan lepas di posisi yang diinginkan, atau klik untuk menambah di bawah blok terpilih.</p>
          <Palette onAdd={(type) => editor.addBlock(type)} full={full} />
        </>
      );
    case 'layers':
      return (
        <LayersPanel
          blocks={doc.blocks}
          selectedId={selectedId}
          onSelect={editor.select}
          onToggleHidden={(id) => editor.updateBlock(id, { hidden: !doc.blocks.find((b) => b.id === id)?.hidden })}
          onToggleLocked={(id) => editor.updateBlock(id, { locked: !doc.blocks.find((b) => b.id === id)?.locked })}
          pageSelection={pageSelection}
          onSelectPage={editor.selectPage}
        />
      );
    case 'templates':
      return <TemplatesPanel onApply={editor.applyTemplate} />;
    case 'theme':
      return (
        <ThemePanel
          themeColor={doc.themeColor}
          theme={doc.theme}
          onColor={(c) => setDoc((d) => ({ ...d, themeColor: c }), 'theme:color')}
          onTheme={(patch, key) => setDoc((d) => ({ ...d, theme: { ...d.theme, ...patch } }), key)}
          onStyle={(color, theme) => setDoc((d) => ({ ...d, themeColor: color, theme: { ...d.theme, ...theme } }))}
        />
      );
    case 'page':
      return (
        <PagePanel
          slug={doc.slug}
          host={host}
          published={doc.published}
          page={doc.page}
          storeName={profile?.storeName ?? ''}
          focus={pageSelection}
          onSlug={(slug) => setDoc((d) => ({ ...d, slug }), 'slug')}
          onPublished={(published) => setDoc((d) => ({ ...d, published }))}
          onPage={(patch, key) => setDoc((d) => ({ ...d, page: { ...d.page, ...patch } }), key)}
          onExport={editor.exportLayout}
          onImport={editor.importLayout}
        />
      );
  }
}
