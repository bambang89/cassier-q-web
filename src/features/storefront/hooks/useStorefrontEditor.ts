'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';

import type { BlockType, PublicProduct, PublicStorefront, StorefrontBlock, StorefrontLayout } from '@/types/storefront';
import * as productsApi from '@/services/productsApi';
import { fetchStorefrontSettings, saveStorefront } from '@/services/storefrontApi';
import { Alert } from '@/lib/alert';
import { fetchCategories } from '@/lib/store/slices/categoriesSlice';
import { fetchStoreProfile } from '@/lib/store/slices/storeProfileSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { useMenuAccess } from '@/hooks/useMenuAccess';
import { apiErrorMessage } from '@/utils/apiErrors';
import type { EditorDevice, EditorDoc, EditorPanelKey, PageSelection, StorefrontTemplate } from '@/features/storefront/types';
import { BLOCK_DEFS } from '@/features/storefront/blockDefs';
import { EDITOR_DRAFT_KEY, MAX_BLOCKS } from '@/features/storefront/constants';
import { cloneBlock, createBlock, defaultLayout, ensureItemIds, resolvePage, resolveTheme, snapshotDoc, toPublicProduct } from '@/features/storefront/utils';
import { useEditorDnd } from '@/features/storefront/hooks/useEditorDnd';
import { useEditorDraft } from '@/features/storefront/hooks/useEditorDraft';
import { useEditorShortcuts } from '@/features/storefront/hooks/useEditorShortcuts';
import { useHistory } from '@/features/storefront/hooks/useHistory';

const EMPTY_DOC: EditorDoc = { slug: '', published: false, themeColor: '#2563EB', blocks: [], theme: resolveTheme(null), page: resolvePage(null) };

/** State, pemuatan data, aksi blok, simpan, pintasan & drag-and-drop editor toko online. */
export function useStorefrontEditor() {
  const dispatch = useAppDispatch();
  const { isManager } = useMenuAccess();
  const categories = useAppSelector((state) => state.categories.items);
  const profile = useAppSelector((state) => state.storeProfile.profile);
  const history = useHistory<EditorDoc>(EMPTY_DOC);
  const doc = history.value;
  const [loaded, setLoaded] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState('');
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pageSelection, setPageSelection] = useState<PageSelection>(null);
  const [panel, setPanel] = useState<EditorPanelKey>('blocks');
  const [mobileSheet, setMobileSheet] = useState<EditorPanelKey | 'inspector' | null>(null);
  const [device, setDevice] = useState<EditorDevice>('mobile');
  const [previewMode, setPreviewMode] = useState(false);
  const [previewCart, setPreviewCart] = useState<Record<string, number>>({});
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [insertAt, setInsertAt] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const docRef = useRef(doc);
  useEffect(() => {
    docRef.current = doc;
  }, [doc]);

  // ── Muat data ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isManager) return;
    dispatch(fetchCategories());
    dispatch(fetchStoreProfile());
    fetchStorefrontSettings()
      .then((s) => {
        const layout = s.layout ?? defaultLayout(s.storeName);
        const server: EditorDoc = {
          slug: s.slug,
          published: s.published,
          themeColor: s.themeColor ?? '#2563EB',
          blocks: layout.blocks.filter((b) => BLOCK_DEFS[b.type]).map((b) => ({ ...b, props: ensureItemIds({ ...b.props }) })),
          theme: resolveTheme(layout),
          page: resolvePage(layout),
        };
        history.reset(server);
        setSavedSnapshot(s.saved ? snapshotDoc(server) : '');
        setLoaded(true);
        // Draf lokal yang belum disimpan (mis. tab tertutup tidak sengaja).
        try {
          const raw = localStorage.getItem(EDITOR_DRAFT_KEY);
          const draft = raw ? (JSON.parse(raw) as { at: number; doc: EditorDoc }) : null;
          if (draft?.doc && snapshotDoc(draft.doc) !== snapshotDoc(server)) {
            Alert.alert('Ada draf yang belum disimpan', `Perubahan terakhir pada ${new Date(draft.at).toLocaleString('id-ID')} belum tersimpan. Pulihkan?`, [
              { text: 'Buang', style: 'destructive', onPress: () => localStorage.removeItem(EDITOR_DRAFT_KEY) },
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
      .then((page) => setProducts(page.content.filter((p) => p.status === 'ACTIVE').map(toPublicProduct)))
      .catch(() => setProducts([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isManager]);

  const dirty = loaded && snapshotDoc(doc) !== savedSnapshot;
  /** Status terbit yang benar-benar tersimpan di server (bukan saklar yang belum disimpan). */
  const savedPublished = savedSnapshot ? (JSON.parse(savedSnapshot) as EditorDoc).published : false;
  useEditorDraft(doc, dirty, loaded);

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

  const selectPage = (part: 'header' | 'footer') => {
    setSelectedId(null);
    setPageSelection(part);
    setPanel('page');
    if (window.innerWidth < 1024) setMobileSheet('page');
  };

  const clearSelection = () => {
    setSelectedId(null);
    setPageSelection(null);
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
  const save = async (overrides?: Partial<EditorDoc>) => {
    if (!overrides && !dirty && savedSnapshot) return;
    setSaving(true);
    try {
      const current = { ...docRef.current, ...overrides };
      const layout: StorefrontLayout = { version: 2, blocks: current.blocks, theme: current.theme, page: current.page };
      const saved = await saveStorefront({ slug: current.slug, published: current.published, themeColor: current.themeColor, layout });
      const next = { ...current, slug: saved.slug, published: saved.published, themeColor: saved.themeColor ?? current.themeColor };
      if (snapshotDoc(next) !== snapshotDoc(docRef.current)) history.set(next);
      setSavedSnapshot(snapshotDoc(next));
      try {
        localStorage.removeItem(EDITOR_DRAFT_KEY);
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

  useEditorShortcuts(
    selectedId,
    {
      save: () => save(),
      undo: history.undo,
      redo: history.redo,
      removeBlock,
      duplicateBlock,
      moveBlock,
      clear: () => {
        clearSelection();
        setPreviewMode(false);
      },
    },
    history,
  );
  const dnd = useEditorDnd(docRef, addBlock, setBlocks);

  return {
    isManager,
    loaded,
    profile,
    history,
    doc,
    setDoc,
    products,
    usedCategories,
    preview,
    selected,
    selectedId,
    setSelectedId,
    pageSelection,
    panel,
    setPanel,
    mobileSheet,
    setMobileSheet,
    device,
    setDevice,
    previewMode,
    setPreviewMode,
    previewCart,
    setPreviewCart,
    justAdded,
    insertAt,
    setInsertAt,
    saving,
    dirty,
    savedSnapshot,
    savedPublished,
    host,
    full,
    select,
    selectPage,
    clearSelection,
    addBlock,
    updateBlock,
    removeBlock,
    duplicateBlock,
    moveBlock,
    applyTemplate,
    exportLayout,
    importLayout,
    save,
    dnd,
  };
}
