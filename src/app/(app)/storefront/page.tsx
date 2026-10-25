'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DragMoveEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import * as productsApi from '@/api/productsApi';
import { fetchStorefrontSettings, saveStorefront } from '@/api/storefrontApi';
import { apiErrorMessage } from '@/api/errors';
import type {
  BlockType,
  PublicProduct,
  PublicStorefront,
  StorefrontBlock,
  StorefrontLayout,
  StorefrontPageSettings,
  StorefrontTheme,
} from '@/types/storefront';
import { Alert } from '@/lib/alert';
import { cn } from '@/lib/cn';
import { BLOCK_DEFS, MAX_BLOCKS, blockLabel, cloneBlock, createBlock, defaultLayout, ensureItemIds, resolvePage, resolveTheme } from '@/lib/storefront/blocks';
import type { StorefrontTemplate } from '@/lib/storefront/templates';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategories } from '@/store/slices/categoriesSlice';
import { fetchStoreProfile } from '@/store/slices/storeProfileSlice';
import { useMenuAccess } from '@/navigation/menu';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/Display';
import { LoadingBlock } from '@/components/ui/Spinner';
import { CheckIcon, CloseIcon, EyeIcon, LockIcon, PencilIcon } from '@/components/icons/LineIcons';
import { BlockInspector } from '@/features/storefront/BlockInspector';
import {
  BuilderCanvas,
  LAYER_PREFIX,
  LayersPanel,
  PALETTE_PREFIX,
  Palette,
  PaletteDragPreview,
  ToolButton,
  builderCollision,
} from '@/features/storefront/BuilderCanvas';
import type { PageSelection } from '@/features/storefront/BuilderCanvas';
import { PagePanel, TemplatesPanel, ThemePanel } from '@/features/storefront/EditorPanels';
import { FloatingWhatsapp, StoreFooter, StoreHeader, StorefrontProvider, StorefrontRenderer } from '@/features/storefront/StorefrontRenderer';
import { useHistory } from '@/features/storefront/useHistory';

type Device = 'mobile' | 'tablet' | 'desktop';
type PanelKey = 'blocks' | 'layers' | 'templates' | 'theme' | 'page';

/** Seluruh isi editor dalam satu objek — satu riwayat Undo/Redo. */
interface Doc {
  slug: string;
  published: boolean;
  themeColor: string;
  blocks: StorefrontBlock[];
  theme: StorefrontTheme;
  page: StorefrontPageSettings;
}

const DEVICES: { key: Device; label: string; icon: string; width: number }[] = [
  { key: 'mobile', label: 'HP', icon: '📱', width: 390 },
  { key: 'tablet', label: 'Tablet', icon: '📲', width: 768 },
  { key: 'desktop', label: 'Desktop', icon: '🖥', width: 1200 },
];

const PANELS: { key: PanelKey; label: string; icon: string }[] = [
  { key: 'blocks', label: 'Blok', icon: '➕' },
  { key: 'layers', label: 'Lapisan', icon: '🗂' },
  { key: 'templates', label: 'Template', icon: '🧩' },
  { key: 'theme', label: 'Tema', icon: '🎨' },
  { key: 'page', label: 'Halaman', icon: '⚙️' },
];

const DRAFT_KEY = 'cassierq.storefront.draft.v2';

const EMPTY_DOC: Doc = { slug: '', published: false, themeColor: '#2563EB', blocks: [], theme: resolveTheme(null), page: resolvePage(null) };

const snapshot = (doc: Doc) => JSON.stringify(doc);

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
}

/** Editor toko online (drag & drop) untuk pemilik toko. */
export default function StorefrontBuilderPage() {
  const dispatch = useAppDispatch();
  const { isManager } = useMenuAccess();
  const categories = useAppSelector((state) => state.categories.items);
  const profile = useAppSelector((state) => state.storeProfile.profile);
  const history = useHistory<Doc>(EMPTY_DOC);
  const doc = history.value;
  const [loaded, setLoaded] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState('');
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pageSelection, setPageSelection] = useState<PageSelection>(null);
  const [panel, setPanel] = useState<PanelKey>('blocks');
  const [mobileSheet, setMobileSheet] = useState<PanelKey | 'inspector' | null>(null);
  const [device, setDevice] = useState<Device>('mobile');
  const [previewMode, setPreviewMode] = useState(false);
  const [previewCart, setPreviewCart] = useState<Record<string, number>>({});
  const [dragType, setDragType] = useState<BlockType | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [insertAt, setInsertAt] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const docRef = useRef(doc);
  useEffect(() => {
    docRef.current = doc;
  }, [doc]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // ── Muat data ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isManager) return;
    dispatch(fetchCategories());
    dispatch(fetchStoreProfile());
    fetchStorefrontSettings()
      .then((s) => {
        const layout = s.layout ?? defaultLayout(s.storeName);
        const server: Doc = {
          slug: s.slug,
          published: s.published,
          themeColor: s.themeColor ?? '#2563EB',
          blocks: layout.blocks.filter((b) => BLOCK_DEFS[b.type]).map((b) => ({ ...b, props: ensureItemIds({ ...b.props }) })),
          theme: resolveTheme(layout),
          page: resolvePage(layout),
        };
        history.reset(server);
        setSavedSnapshot(s.saved ? snapshot(server) : '');
        setLoaded(true);
        // Draf lokal yang belum disimpan (mis. tab tertutup tidak sengaja).
        try {
          const raw = localStorage.getItem(DRAFT_KEY);
          const draft = raw ? (JSON.parse(raw) as { at: number; doc: Doc }) : null;
          if (draft?.doc && snapshot(draft.doc) !== snapshot(server)) {
            Alert.alert('Ada draf yang belum disimpan', `Perubahan terakhir pada ${new Date(draft.at).toLocaleString('id-ID')} belum tersimpan. Pulihkan?`, [
              { text: 'Buang', style: 'destructive', onPress: () => localStorage.removeItem(DRAFT_KEY) },
              { text: 'Pulihkan', onPress: () => history.set({ ...server, ...draft.doc }) },
            ]);
          }
        } catch {
          // storage diblokir — abaikan
        }
      })
      .catch((e) => Alert.alert('Gagal', apiErrorMessage(e, 'Pengaturan toko online gagal dimuat.')));
    // Produk untuk pratinjau (tanpa harga modal ditampilkan).
    productsApi
      .fetchProducts({ size: 200 })
      .then((page) =>
        setProducts(
          page.content
            .filter((p) => p.status === 'ACTIVE')
            .map((p) => ({
              id: p.id,
              name: p.productName,
              categoryId: p.categoryId,
              categoryName: p.categoryName,
              description: p.description,
              imageUrl: p.imageUrl,
              unitName: p.baseUnitName,
              price: p.sellingPrice,
              available: p.stockQuantity > 0,
              bundle: p.productType === 'BUNDLE',
            })),
        ),
      )
      .catch(() => setProducts([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isManager]);

  const dirty = loaded && snapshot(doc) !== savedSnapshot;
  /** Status terbit yang benar-benar tersimpan di server (bukan saklar yang belum disimpan). */
  const savedPublished = savedSnapshot ? (JSON.parse(savedSnapshot) as Doc).published : false;

  // Simpan draf lokal + peringatan saat meninggalkan halaman.
  useEffect(() => {
    if (!loaded) return;
    const timer = window.setTimeout(() => {
      try {
        if (dirty) localStorage.setItem(DRAFT_KEY, JSON.stringify({ at: Date.now(), doc }));
        else localStorage.removeItem(DRAFT_KEY);
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

  const usedCategories = useMemo(() => {
    const ids = new Set(products.map((p) => p.categoryId));
    return categories.filter((c) => ids.has(c.id)).map((c) => ({ id: c.id, name: c.categoryName }));
  }, [categories, products]);

  const preview: PublicStorefront = {
    slug: doc.slug,
    themeColor: doc.themeColor,
    layout: { version: 2, blocks: doc.blocks, theme: doc.theme, page: doc.page },
    store: {
      name: profile?.storeName ?? '',
      address: profile?.address ?? null,
      city: profile?.city ?? null,
      phone: profile?.phone ?? null,
      logoUrl: profile?.logoUrl ?? null,
    },
    categories: usedCategories,
    products,
  };

  const selected = doc.blocks.find((b) => b.id === selectedId) ?? null;
  const host = typeof window === 'undefined' ? '' : window.location.host;
  const full = doc.blocks.length >= MAX_BLOCKS;

  // ── Aksi dokumen ─────────────────────────────────────────────────
  const setDoc = history.set;
  const setBlocks = useCallback((fn: (prev: StorefrontBlock[]) => StorefrontBlock[], key?: string) => setDoc((d) => ({ ...d, blocks: fn(d.blocks) }), key), [setDoc]);

  const select = (id: string | null) => {
    setSelectedId(id);
    setPageSelection(null);
    if (id && typeof window !== 'undefined' && window.innerWidth < 1024) setMobileSheet('inspector');
  };

  const addBlock = (type: BlockType, index?: number) => {
    if (docRef.current.blocks.length >= MAX_BLOCKS) return Alert.alert('Batas blok', `Maksimal ${MAX_BLOCKS} blok per halaman.`);
    const block = createBlock(type);
    setBlocks((prev) => {
      // Tanpa posisi: sisipkan di bawah blok terpilih, atau di paling bawah.
      const selectedIndex = prev.findIndex((b) => b.id === selectedId);
      const at = index ?? (selectedIndex >= 0 ? selectedIndex + 1 : prev.length);
      return [...prev.slice(0, at), block, ...prev.slice(at)];
    });
    setJustAdded(block.id);
    window.setTimeout(() => setJustAdded((id) => (id === block.id ? null : id)), 900);
    select(block.id);
  };
  const updateBlock = (id: string, patch: Partial<StorefrontBlock>, key?: string) => setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)), key);
  const removeBlock = (id: string) => {
    const block = docRef.current.blocks.find((b) => b.id === id);
    if (!block || block.locked) return;
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
    setMobileSheet((s) => (s === 'inspector' ? null : s));
  };
  const duplicateBlock = (id: string) => {
    if (docRef.current.blocks.length >= MAX_BLOCKS) return Alert.alert('Batas blok', `Maksimal ${MAX_BLOCKS} blok per halaman.`);
    const source = docRef.current.blocks.find((b) => b.id === id);
    if (!source) return;
    const copy = cloneBlock(source);
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === id);
      return [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)];
    });
    setJustAdded(copy.id);
    select(copy.id);
  };
  const moveBlock = (id: string, delta: number) =>
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === id);
      const target = index + delta;
      return target < 0 || target >= prev.length ? prev : arrayMove(prev, index, target);
    });

  const applyTemplate = (template: StorefrontTemplate) => {
    const layout = template.build(profile?.storeName || 'Toko Kami');
    // Blok Produk Unggulan langsung terisi produk tersedia pertama supaya tidak kosong.
    const firstProduct = products.find((p) => p.available) ?? products[0];
    if (firstProduct) layout.blocks.forEach((b) => b.type === 'featured' && !b.props.productId && (b.props.productId = firstProduct.id));
    setDoc((d) => ({ ...d, themeColor: template.color, blocks: layout.blocks, theme: resolveTheme(layout), page: { ...resolvePage(layout), floatingWhatsapp: d.page.floatingWhatsapp } }));
    setSelectedId(null);
    setMobileSheet(null);
    setPanel('layers');
  };

  const exportLayout = () => {
    const layout: StorefrontLayout & { themeColor: string } = { version: 2, blocks: doc.blocks, theme: doc.theme, page: doc.page, themeColor: doc.themeColor };
    const url = URL.createObjectURL(new Blob([JSON.stringify(layout, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `toko-${doc.slug || 'desain'}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importLayout = (layout: StorefrontLayout & { themeColor?: string }) => {
    setDoc((d) => ({
      ...d,
      themeColor: typeof layout.themeColor === 'string' ? layout.themeColor : d.themeColor,
      blocks: layout.blocks.filter((b) => b && BLOCK_DEFS[b.type]).slice(0, MAX_BLOCKS).map((b) => ({ ...b, props: ensureItemIds({ ...(b.props ?? {}) }) })),
      theme: resolveTheme(layout),
      page: resolvePage(layout),
    }));
    setSelectedId(null);
  };

  /** Simpan ke server; `overrides` dipakai tombol "Terbitkan sekarang" (published: true). */
  const save = async (overrides?: Partial<Doc>) => {
    if (!overrides && !dirty && savedSnapshot) return;
    setSaving(true);
    try {
      const current = { ...docRef.current, ...overrides };
      const layout: StorefrontLayout = { version: 2, blocks: current.blocks, theme: current.theme, page: current.page };
      const saved = await saveStorefront({ slug: current.slug, published: current.published, themeColor: current.themeColor, layout });
      const next = { ...current, slug: saved.slug, published: saved.published, themeColor: saved.themeColor ?? current.themeColor };
      if (snapshot(next) !== snapshot(docRef.current)) history.set(next);
      setSavedSnapshot(snapshot(next));
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        // abaikan
      }
      Alert.alert('Tersimpan', saved.published ? `Toko online sudah tayang di ${host}/toko/${saved.slug}` : 'Perubahan disimpan. Toko belum diterbitkan.');
    } catch (error) {
      Alert.alert('Gagal menyimpan', apiErrorMessage(error, 'Toko online tidak bisa disimpan.'));
    } finally {
      setSaving(false);
    }
  };

  // ── Pintasan keyboard ────────────────────────────────────────────
  const saveRef = useRef(save);
  const actionsRef = useRef({ removeBlock, duplicateBlock, moveBlock });
  useEffect(() => {
    saveRef.current = save;
    actionsRef.current = { removeBlock, duplicateBlock, moveBlock };
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void saveRef.current();
        return;
      }
      if (isTyping(e.target) || document.querySelector('[role="dialog"]')) return;
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) history.redo();
        else history.undo();
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        history.redo();
      } else if (selectedId && mod && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        actionsRef.current.duplicateBlock(selectedId);
      } else if (selectedId && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        actionsRef.current.removeBlock(selectedId);
      } else if (selectedId && e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        actionsRef.current.moveBlock(selectedId, e.key === 'ArrowUp' ? -1 : 1);
      } else if (e.key === 'Escape') {
        setSelectedId(null);
        setPageSelection(null);
        setPreviewMode(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [history, selectedId]);

  // ── Drag & drop ──────────────────────────────────────────────────
  const onDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    setDragType(id.startsWith(PALETTE_PREFIX) ? (id.slice(PALETTE_PREFIX.length) as BlockType) : null);
  };

  const onDragMove = (event: DragMoveEvent) => {
    if (!String(event.active.id).startsWith(PALETTE_PREFIX)) return;
    const over = event.over;
    if (!over) return setDropIndex(null);
    const blocks = docRef.current.blocks;
    if (over.id === 'canvas') return setDropIndex(blocks.length);
    const index = blocks.findIndex((b) => b.id === over.id);
    if (index < 0) return setDropIndex(null);
    const start = event.activatorEvent as PointerEvent;
    const y = (start.clientY ?? NaN) + event.delta.y;
    const after = Number.isFinite(y) ? y > over.rect.top + over.rect.height / 2 : false;
    setDropIndex(index + (after ? 1 : 0));
  };

  const onDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    const index = dropIndex;
    setDragType(null);
    setDropIndex(null);
    if (!overId) return;
    if (activeId.startsWith(PALETTE_PREFIX)) {
      addBlock(activeId.slice(PALETTE_PREFIX.length) as BlockType, index ?? doc.blocks.length);
      return;
    }
    if (activeId.startsWith(LAYER_PREFIX)) {
      const from = activeId.slice(LAYER_PREFIX.length);
      const to = overId.slice(LAYER_PREFIX.length);
      if (from !== to) setBlocks((prev) => arrayMove(prev, prev.findIndex((b) => b.id === from), prev.findIndex((b) => b.id === to)));
      return;
    }
    if (activeId !== overId && overId !== 'canvas') {
      setBlocks((prev) => {
        const target = prev.findIndex((b) => b.id === overId);
        return prev[target]?.locked ? prev : arrayMove(prev, prev.findIndex((b) => b.id === activeId), target);
      });
    }
  };

  // ── Tampilan ─────────────────────────────────────────────────────
  if (!isManager) {
    return (
      <>
        <PageHeader title="Toko Online" />
        <EmptyState icon={LockIcon} title="Khusus pemilik toko" description="Tampilan toko online hanya bisa diatur oleh Kepala Toko." />
      </>
    );
  }
  if (!loaded) {
    return (
      <>
        <PageHeader title="Toko Online" />
        <LoadingBlock label="Memuat editor…" />
      </>
    );
  }

  const toolbar = (block: StorefrontBlock, index: number) => (
    <>
      <ToolButton label="Naik (Alt+↑)" onClick={() => moveBlock(block.id, -1)} disabled={index === 0}>
        ↑
      </ToolButton>
      <ToolButton label="Turun (Alt+↓)" onClick={() => moveBlock(block.id, 1)} disabled={index === doc.blocks.length - 1}>
        ↓
      </ToolButton>
      <ToolButton label={block.hidden ? 'Tampilkan' : 'Sembunyikan'} onClick={() => updateBlock(block.id, { hidden: !block.hidden })}>
        {block.hidden ? '◎' : '◉'}
      </ToolButton>
      <ToolButton label="Duplikat (Ctrl+D)" onClick={() => duplicateBlock(block.id)} disabled={full}>
        ⧉
      </ToolButton>
      <ToolButton label="Hapus (Del)" onClick={() => removeBlock(block.id)} danger disabled={block.locked}>
        ✕
      </ToolButton>
    </>
  );

  const selectPage = (part: 'header' | 'footer') => {
    setSelectedId(null);
    setPageSelection(part);
    setPanel('page');
    if (window.innerWidth < 1024) setMobileSheet('page');
  };

  const panelContent = (key: PanelKey) => {
    switch (key) {
      case 'blocks':
        return (
          <>
            <p className="mb-3 text-[12.5px] text-ink-3">Seret blok ke pratinjau dan lepas di posisi yang diinginkan, atau klik untuk menambah di bawah blok terpilih.</p>
            <Palette onAdd={(type) => addBlock(type)} full={full} />
          </>
        );
      case 'layers':
        return (
          <LayersPanel
            blocks={doc.blocks}
            selectedId={selectedId}
            onSelect={select}
            onToggleHidden={(id) => updateBlock(id, { hidden: !doc.blocks.find((b) => b.id === id)?.hidden })}
            onToggleLocked={(id) => updateBlock(id, { locked: !doc.blocks.find((b) => b.id === id)?.locked })}
            pageSelection={pageSelection}
            onSelectPage={selectPage}
          />
        );
      case 'templates':
        return <TemplatesPanel onApply={applyTemplate} />;
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
            onExport={exportLayout}
            onImport={importLayout}
          />
        );
    }
  };

  const inspector = selected ? (
    <BlockInspector
      key={selected.id}
      block={selected}
      products={products}
      categories={usedCategories}
      onChange={(patch, key) => updateBlock(selected.id, patch, key)}
      onDuplicate={() => duplicateBlock(selected.id)}
      onDelete={() => removeBlock(selected.id)}
    />
  ) : null;

  const deviceWidth = DEVICES.find((d) => d.key === device)!.width;

  return (
    <>
      <PageHeader
        title="Desain Toko Online"
        subtitle={`${savedPublished ? `Tayang · ${host}/toko/${doc.slug}` : 'Draf · belum diterbitkan'}${dirty ? ' · ada perubahan belum disimpan' : ''}`}
        right={
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
        }
      />

      <DndContext sensors={sensors} collisionDetection={builderCollision} onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd} onDragCancel={() => (setDragType(null), setDropIndex(null))}>
        <div className="relative flex min-h-0 flex-1">
          {/* Kiri: rel ikon + panel (layar lebar) */}
          {!previewMode ? (
            <aside className="hidden shrink-0 border-r border-line bg-white lg:flex">
              <nav className="flex w-[68px] flex-col items-center gap-1 border-r border-line bg-gray-25 py-3">
                {PANELS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPanel(p.key)}
                    className={cn(
                      'flex w-14 cursor-pointer flex-col items-center gap-1 rounded-xl py-2 text-[10.5px] font-semibold transition duration-200',
                      panel === p.key ? 'bg-primary-600 text-white shadow-rail' : 'text-ink-2 hover:bg-white hover:shadow-sm',
                    )}
                  >
                    <span className={cn('text-lg transition', panel === p.key && 'scale-110')}>{p.icon}</span>
                    {p.label}
                  </button>
                ))}
              </nav>
              <div className="flex w-[300px] flex-col">
                <div className="flex h-12 items-center border-b border-line px-4">
                  <p className="font-bold text-ink">{PANELS.find((p) => p.key === panel)?.label}</p>
                  {panel === 'layers' ? <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-ink-2">{doc.blocks.length}/{MAX_BLOCKS}</span> : null}
                </div>
                <div key={panel} className="scroll-thin min-h-0 flex-1 animate-fade-in overflow-y-auto p-4">
                  {panelContent(panel)}
                </div>
              </div>
            </aside>
          ) : null}

          {/* Tengah: kanvas */}
          <div
            className="scroll-thin relative min-w-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_20%_0%,#EEF2FF_0,transparent_45%),radial-gradient(circle_at_90%_20%,#E0F2FE_0,transparent_40%),#E9EDF3] pb-24 lg:pb-8"
            onClick={() => {
              setSelectedId(null);
              setPageSelection(null);
            }}
          >
            <div className="relative z-30 flex items-center justify-center gap-2 px-4 pt-4 pb-3" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-0.5 rounded-full border border-white/60 bg-white/80 p-1 shadow-sm backdrop-blur">
                {DEVICES.map((d) => (
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

            <div className="px-3 sm:px-6" onClick={(e) => e.stopPropagation()}>
              {!previewMode && (!savedSnapshot || !savedPublished) ? (
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
              ) : null}
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
                      selectedId={selectedId}
                      onSelect={select}
                      pageSelection={pageSelection}
                      onSelectPage={selectPage}
                      dropIndex={dragType ? dropIndex : null}
                      dragging={!!dragType}
                      justAdded={justAdded}
                      onInsertAt={setInsertAt}
                      toolbar={toolbar}
                    />
                  )}
                </div>
              </div>
              <p className="mt-4 text-center text-[12px] text-ink-3">
                {previewMode
                  ? 'Mode pratinjau: coba klik produk & tombol seperti pembeli. Tekan Esc untuk kembali.'
                  : 'Klik blok untuk mengatur · seret ⠿ untuk memindah · Ctrl+Z urungkan · Ctrl+S simpan · Del hapus'}
              </p>
            </div>
          </div>

          {/* Kanan: pengaturan blok (laci geser, layar lebar) */}
          {selected && !previewMode ? (
            <aside key={selected.id} className="absolute inset-y-0 right-0 z-40 hidden w-[340px] animate-slide-in flex-col border-l border-line bg-white shadow-[-20px_0_40px_-20px_rgb(11_31_51/0.25)] lg:flex xl:static xl:shadow-none">
              <div className="flex h-12 items-center justify-between border-b border-line px-4">
                <p className="font-bold text-ink">Atur Blok</p>
                <button type="button" onClick={() => setSelectedId(null)} aria-label="Tutup" className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-ink-3 hover:bg-gray-100">
                  <CloseIcon size={16} />
                </button>
              </div>
              <div className="scroll-thin min-h-0 flex-1 overflow-y-auto p-4">{inspector}</div>
            </aside>
          ) : null}
        </div>

        {/* HP / layar sedang: bilah alat bawah */}
        {!previewMode ? (
          <div className="fixed inset-x-3 bottom-[88px] z-40 flex items-center justify-around rounded-2xl border border-line bg-white/95 p-1.5 shadow-float backdrop-blur tab:bottom-4 lg:hidden">
            {PANELS.map((p) => (
              <button key={p.key} type="button" onClick={() => setMobileSheet(p.key)} className="flex flex-1 cursor-pointer flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10.5px] font-semibold text-ink-2 active:bg-gray-100">
                <span className="text-lg">{p.icon}</span>
                {p.label}
              </button>
            ))}
            <span className="mx-1 h-8 w-px bg-line" />
            <button type="button" onClick={history.undo} disabled={!history.canUndo} className="flex cursor-pointer flex-col items-center px-2 text-[10.5px] font-semibold text-ink-2 disabled:opacity-30">
              <span className="text-lg">↶</span>Undo
            </button>
          </div>
        ) : null}

        <Modal isOpen={!!mobileSheet && mobileSheet !== 'inspector'} onClose={() => setMobileSheet(null)} title={PANELS.find((p) => p.key === mobileSheet)?.label} size="lg">
          <div className="max-h-[70dvh] overflow-y-auto pb-2">{mobileSheet && mobileSheet !== 'inspector' ? panelContent(mobileSheet) : null}</div>
        </Modal>
        <Modal isOpen={mobileSheet === 'inspector' && !!selected} onClose={() => setMobileSheet(null)} title={selected ? `Atur: ${blockLabel(selected)}` : ''} size="lg">
          <div className="max-h-[70dvh] overflow-y-auto pb-2">{inspector}</div>
        </Modal>

        <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }}>{dragType ? <PaletteDragPreview type={dragType} /> : null}</DragOverlay>
      </DndContext>

      {/* Sisip blok di posisi tertentu (tombol "+ Sisipkan blok") */}
      <Modal isOpen={insertAt !== null} onClose={() => setInsertAt(null)} title="Sisipkan Blok" size="xl">
        <div className="grid max-h-[70dvh] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
          {(Object.keys(BLOCK_DEFS) as BlockType[]).map((type) => (
            <button
              key={type}
              type="button"
              disabled={full}
              onClick={() => {
                addBlock(type, insertAt ?? undefined);
                setInsertAt(null);
              }}
              className="group flex cursor-pointer flex-col items-start gap-2 rounded-xl border border-line p-3 text-left transition duration-200 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-card disabled:opacity-40"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-gray-100 text-xl transition group-hover:scale-110 group-hover:bg-primary-50">{BLOCK_DEFS[type].emoji}</span>
              <span>
                <span className="block text-sm font-semibold text-ink">{BLOCK_DEFS[type].label}</span>
                <span className="line-clamp-2 block text-[12px] text-ink-3">{BLOCK_DEFS[type].description}</span>
              </span>
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}

function HeaderIconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={label} aria-label={label} className="flex h-9 w-9 cursor-pointer items-center justify-center text-lg text-ink-2 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30">
      {children}
    </button>
  );
}
