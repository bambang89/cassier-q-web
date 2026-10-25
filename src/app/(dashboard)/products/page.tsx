'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { Product } from '@/types/models';
import type { MenuAction } from '@/types/ui';
import { deleteProduct, fetchProducts, setSearch } from '@/lib/store/slices/productsSlice';
import { fetchCategories } from '@/lib/store/slices/categoriesSlice';
import { Alert } from '@/lib/alert';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { usePermissions } from '@/hooks/usePermissions';
import { useMenuAccess } from '@/hooks/useMenuAccess';
import { LOW_STOCK_THRESHOLD, emojiForProduct, paletteColorFor } from '@/utils/productDisplay';
import { bundleContents, isBundle } from '@/utils/bundles';
import { PageBody, PageHeader } from '@/components/common/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { Badge, EmptyState } from '@/components/ui/Display';
import { ActionMenu } from '@/components/ui/ActionMenu';
import { LoadingBlock } from '@/components/ui/Spinner';
import { BarcodeScanner } from '@/components/common/BarcodeScanner';
import { BoxIcon } from '@/components/ui/icons/NavIcons';
import { SearchIcon, BarcodeIcon, PlusIcon, CloseIcon } from '@/components/ui/icons/ActionIcons';
import { AlertTriangleIcon } from '@/components/ui/icons/DataIcons';
import { CategoryChips, ProductGridCard } from '@/features/products/components/ProductGridCard';
import { RestockForm } from '@/features/products/components/RestockForm';
import { stockVariant } from '@/features/products/utils';

const SEARCH_DEBOUNCE_MS = 350;

export default function ProductsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, search, page, totalPages, status, error } = useAppSelector((state) => state.products);
  const categories = useAppSelector((state) => state.categories.items);
  const [searchDraft, setSearchDraft] = useState(search);
  const { canCreateProduct, canUpdateProduct, canDeleteProduct, canRestock } = usePermissions();
  const { isManager } = useMenuAccess();
  const [restockTarget, setRestockTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [scannerVisible, setScannerVisible] = useState(false);

  const allPagesLoaded = totalPages === 0 || page + 1 >= totalPages;
  const lowStockCount = useMemo(() => items.filter((p) => p.stockQuantity <= LOW_STOCK_THRESHOLD).length, [items]);
  const gridProducts = useMemo(
    () => (selectedCategoryId ? items.filter((p) => p.categoryId === selectedCategoryId) : items),
    [items, selectedCategoryId],
  );

  useEffect(() => {
    dispatch(fetchProducts({ search }));
  }, [dispatch, search]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Cari otomatis saat berhenti mengetik.
  useEffect(() => {
    const term = searchDraft.trim();
    if (term === search) return;
    const timer = setTimeout(() => dispatch(setSearch(term)), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [dispatch, searchDraft, search]);

  /** Paket membuka form paket (Kepala Toko); produk lain membuka form produk. */
  const openProductFor = (item: Product) => {
    if (isBundle(item)) return isManager ? () => router.push(`/bundles/${item.id}`) : undefined;
    return canUpdateProduct ? () => router.push(`/products/${item.id}`) : undefined;
  };

  const actionsFor = (item: Product): MenuAction[] => [
    ...(canRestock && !isBundle(item) ? [{ label: 'Tambah stok', onSelect: () => setRestockTarget(item) }] : []),
    ...((isBundle(item) ? isManager : canDeleteProduct)
      ? [{ label: 'Nonaktifkan', onSelect: () => setDeleteTarget(item), destructive: true }]
      : []),
  ];

  const onDelete = async (product: Product) => {
    try {
      await dispatch(deleteProduct(product.id)).unwrap();
      setDeleteTarget(null);
    } catch {
      Alert.alert('Gagal', 'Produk tidak bisa dinonaktifkan, coba lagi.');
    }
  };

  const onLoadMore = () => {
    if (status === 'loading' || allPagesLoaded) return;
    dispatch(fetchProducts({ search, page: page + 1 }));
  };

  const empty =
    status === 'loading' ? (
      <LoadingBlock label="Memuat produk..." />
    ) : status === 'failed' ? (
      <EmptyState
        icon={AlertTriangleIcon}
        title="Produk gagal dimuat"
        description={error ?? 'Terjadi kesalahan saat mengambil data produk. Coba lagi.'}
        actionLabel="Coba Lagi"
        onAction={() => dispatch(fetchProducts({ search }))}
      />
    ) : search || selectedCategoryId ? (
      <EmptyState
        icon={SearchIcon}
        title="Produk tidak ditemukan"
        description={search ? `Tidak ada produk yang cocok dengan "${search}". Coba kata kunci lain.` : 'Coba kategori lain.'}
      />
    ) : (
      <EmptyState
        icon={BoxIcon}
        title="Belum Ada Produk"
        description="Yuk tambahkan produk pertamamu supaya bisa langsung mulai jualan di kasir."
        actionLabel={canCreateProduct ? '+ Tambah Produk' : undefined}
        onAction={canCreateProduct ? () => router.push('/products/new') : undefined}
      />
    );

  return (
    <>
      <PageHeader
        title="Produk"
        subtitle={`${items.length} produk${allPagesLoaded ? '' : '+'}`}
        right={
          canCreateProduct ? (
            <Button size="sm" leftIcon={<PlusIcon size={14} />} onClick={() => router.push('/products/new')} className="hidden tab:inline-flex">
              Tambah Produk
            </Button>
          ) : undefined
        }
      />

      <PageBody className="space-y-4">
        {lowStockCount > 0 ? (
          <div className="flex animate-fade-in items-center gap-3 rounded-xl border border-warning-200 bg-gradient-to-r from-warning-50 to-white p-3.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning-100 text-warning-600">
              <AlertTriangleIcon size={18} />
            </span>
            <p className="text-sm font-semibold text-warning-700">
              {lowStockCount} produk{allPagesLoaded ? '' : ' (dari yang termuat)'} stoknya di bawah minimum ({LOW_STOCK_THRESHOLD}). Yuk restock
              sebelum kehabisan.
            </p>
          </div>
        ) : null}

        <Input
          placeholder="Cari nama, SKU, atau barcode..."
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && dispatch(setSearch(searchDraft.trim()))}
          leftElement={<SearchIcon size={16} className="text-ink-3" />}
          rightElement={
            <span className="flex items-center gap-2">
              {searchDraft ? (
                <button
                  type="button"
                  aria-label="Hapus pencarian"
                  className="cursor-pointer p-1 text-ink-3"
                  onClick={() => {
                    setSearchDraft('');
                    dispatch(setSearch(''));
                  }}
                >
                  <CloseIcon size={16} />
                </button>
              ) : null}
              <button type="button" aria-label="Cari lewat scan barcode" className="cursor-pointer p-1 text-ink-2" onClick={() => setScannerVisible(true)}>
                <BarcodeIcon size={18} />
              </button>
            </span>
          }
        />

        <CategoryChips categories={categories} selectedId={selectedCategoryId} onSelect={setSelectedCategoryId} />

        {gridProducts.length === 0 ? (
          empty
        ) : (
          <>
            {/* Layar lebar: grid kartu katalog */}
            <div className="hidden grid-cols-3 gap-4 tab:grid xl:grid-cols-4 2xl:grid-cols-5">
              {gridProducts.map((item, index) => (
                <div key={item.id} className="group relative">
                  <ProductGridCard item={item} index={index} variant="catalog" onClick={openProductFor(item)} />
                  <ActionMenu actions={actionsFor(item)} className="absolute top-2 right-2 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100" />
                </div>
              ))}
            </div>
            {/* HP: daftar baris */}
            <div className="space-y-2.5 tab:hidden">
              {gridProducts.map((item) => {
                const open = openProductFor(item);
                return (
                  <div
                    key={item.id}
                    onClick={open}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-white p-3 active:scale-[0.99]"
                  >
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <span
                        className="flex size-12 shrink-0 items-center justify-center rounded-lg text-xl"
                        style={{ backgroundColor: paletteColorFor(item.id) }}
                      >
                        {isBundle(item) ? '🎁' : emojiForProduct(item)}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink">{item.productName}</p>
                      <p className="truncate text-[13px] text-ink-2">
                        {isBundle(item) ? `Paket · ${bundleContents(item)}` : `${item.sku} · ${item.categoryName}`}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-bold text-primary-600">Rp {item.sellingPrice.toLocaleString('id-ID')}</span>
                      <Badge variant={stockVariant(item)}>{`${item.stockQuantity} ${item.baseUnitName}`}</Badge>
                    </div>
                    <ActionMenu actions={actionsFor(item)} />
                  </div>
                );
              })}
            </div>
            {!allPagesLoaded ? (
              <div className="flex justify-center">
                <Button variant="secondary" size="sm" loading={status === 'loading'} onClick={onLoadMore}>
                  Muat lebih banyak
                </Button>
              </div>
            ) : null}
          </>
        )}
      </PageBody>

      {canCreateProduct ? (
        <button
          type="button"
          aria-label="Tambah produk"
          onClick={() => router.push('/products/new')}
          className="fixed right-5 bottom-[96px] z-30 flex size-14 cursor-pointer items-center justify-center rounded-2xl bg-primary-600 text-white shadow-float active:scale-90 tab:hidden"
        >
          <PlusIcon size={24} />
        </button>
      ) : null}

      <Modal isOpen={!!restockTarget} onClose={() => setRestockTarget(null)}>
        {restockTarget ? (
          <RestockForm product={restockTarget} onDone={() => setRestockTarget(null)} onCancel={() => setRestockTarget(null)} />
        ) : null}
      </Modal>

      <AlertDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Nonaktifkan produk?"
        description={`"${deleteTarget?.productName}" tidak akan muncul lagi di daftar produk/kasir.`}
        confirmText="Nonaktifkan"
        isDanger
        onConfirm={() => deleteTarget && onDelete(deleteTarget)}
      />

      <BarcodeScanner
        isOpen={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onFound={(product) => {
          const term = product.barcode ?? product.sku;
          setSearchDraft(term);
          dispatch(setSearch(term));
        }}
        onNotFound={(barcode) => {
          setSearchDraft(barcode);
          dispatch(setSearch(barcode));
        }}
      />
    </>
  );
}
