'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { Order, Product, ProductUnit } from '@/types/models';
import * as productsApi from '@/services/productsApi';
import { addItem, clearCart, selectCartCount, selectCartTotal } from '@/lib/store/slices/cartSlice';
import { fetchProducts } from '@/lib/store/slices/productsSlice';
import { fetchProductUnits } from '@/lib/store/slices/productUnitsSlice';
import { fetchCategories } from '@/lib/store/slices/categoriesSlice';
import { fetchCustomers } from '@/lib/store/slices/customersSlice';
import { fetchStoreProfile } from '@/lib/store/slices/storeProfileSlice';
import { fetchCurrentSession } from '@/lib/store/slices/cashierSessionSlice';
import { fetchCheckoutSettings } from '@/lib/store/slices/checkoutSettingsSlice';
import { Alert } from '@/lib/alert';
import type { AddItemPayload } from '@/lib/store/types';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { usePermissions } from '@/hooks/usePermissions';
import { useIsWide } from '@/hooks/useMedia';
import { resolveSaleUnitChoices } from '@/utils/productUnits';
import { formatRupiah } from '@/utils/format';
import { PageHeader } from '@/components/common/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/Display';
import { LoadingBlock } from '@/components/ui/Spinner';
import { BarcodeScanner } from '@/components/common/BarcodeScanner';
import { ClipboardIcon, BoxIcon } from '@/components/ui/icons/NavIcons';
import { SearchIcon, BarcodeIcon, CloseIcon, UnlockIcon } from '@/components/ui/icons/ActionIcons';
import { useSettleCustomerOrder } from '@/features/customer-orders/hooks/useSettleCustomerOrder';
import { PPN_RATE, sessionTimeLabel } from '@/features/pos/utils';
import { CategoryChips, ProductGridCard } from '@/features/products/components/ProductGridCard';
import { OrderPanel } from '@/features/pos/components/OrderPanel';
import { CartBar } from '@/features/pos/components/CartBar';
import { CheckoutForm } from '@/features/pos/components/CheckoutForm';
import { DiscountForm, OpenSessionForm } from '@/features/pos/components/SessionForms';

const SEARCH_DEBOUNCE_MS = 350;
/** Jam (waktu toko) backend menutup otomatis sesi kasir yang masih terbuka. */
const SESSION_AUTO_CLOSE_HOUR = 23;

export default function POSPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isWide = useIsWide();
  const user = useAppSelector((state) => state.auth.user);
  const storeProfile = useAppSelector((state) => state.storeProfile.profile);
  const { items, status, search: productsTabSearch } = useAppSelector((state) => state.products);
  const categories = useAppSelector((state) => state.categories.items);
  const cartItems = useAppSelector((state) => state.cart.items);
  const cartCount = useAppSelector(selectCartCount);
  const cartTotal = useAppSelector(selectCartTotal);
  const session = useAppSelector((state) => state.cashierSession.current);
  const sessionStatus = useAppSelector((state) => state.cashierSession.status);
  const productUnitsById = useAppSelector((state) => state.productUnits.byProductId);
  const checkoutSettings = useAppSelector((state) => state.checkoutSettings.settings);
  const { can } = usePermissions();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // Kasir mencari sendiri ke server supaya semua produk toko bisa ketemu
  // (daftar di store hanya halaman pertama).
  const [remoteProducts, setRemoteProducts] = useState<Product[] | null>(null);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [openSessionVisible, setOpenSessionVisible] = useState(false);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [discountVisible, setDiscountVisible] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [unitPicker, setUnitPicker] = useState<{ product: Product; choices: ProductUnit[] } | null>(null);
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
  const [discountValue, setDiscountValue] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const ppnEnabled = checkoutSettings?.taxEnabled ?? true;
  const taxRatePercent = checkoutSettings?.taxRatePercent ?? PPN_RATE * 100;

  // Cek ulang sesi saat tab aktif lagi dan tepat setelah jam tutup otomatis.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') dispatch(fetchCurrentSession());
    };
    document.addEventListener('visibilitychange', onVisible);
    let timer: ReturnType<typeof setTimeout>;
    const scheduleAfterCutoff = () => {
      const cutoff = new Date();
      cutoff.setHours(SESSION_AUTO_CLOSE_HOUR, 0, 30, 0);
      if (cutoff.getTime() <= Date.now()) cutoff.setDate(cutoff.getDate() + 1);
      timer = setTimeout(() => {
        dispatch(fetchCurrentSession());
        scheduleAfterCutoff();
      }, cutoff.getTime() - Date.now());
    };
    scheduleAfterCutoff();
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      clearTimeout(timer);
    };
  }, [dispatch]);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchProducts({}));
    dispatch(fetchCurrentSession());
    dispatch(fetchCheckoutSettings());
    dispatch(fetchCategories());
    dispatch(fetchCustomers());
    dispatch(fetchStoreProfile());
  }, [status, dispatch]);

  const canOpenCheckout = cartCount > 0;

  const openCheckout = () => {
    if (!canOpenCheckout) return;
    if (!session) setOpenSessionVisible(true);
    else if (isWide) setCheckoutVisible(true);
    else router.push('/checkout');
  };

  // Shortcut keyboard kasir: F2 cari, F7 diskon, F9 bayar.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F2') {
        event.preventDefault();
        searchRef.current?.focus();
      } else if (event.key === 'F9') {
        event.preventDefault();
        openCheckout();
      } else if (event.key === 'F7' && can('pos.discount') && isWide) {
        event.preventDefault();
        setDiscountVisible(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const trimmedQuery = searchQuery.trim();
  // null = cukup daftar di store; string = ambil dari server dengan kata kunci ini.
  const remoteTerm = trimmedQuery ? trimmedQuery : productsTabSearch ? '' : null;

  useEffect(() => {
    if (remoteTerm === null) {
      setRemoteProducts(null);
      setRemoteLoading(false);
      return;
    }
    let cancelled = false;
    setRemoteLoading(true);
    const timer = setTimeout(
      () => {
        productsApi
          .fetchProducts({ search: remoteTerm, size: 100 })
          .then((result) => !cancelled && setRemoteProducts(result.content))
          .catch(() => !cancelled && setRemoteProducts(null))
          .finally(() => !cancelled && setRemoteLoading(false));
      },
      remoteTerm ? SEARCH_DEBOUNCE_MS : 0,
    );
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [remoteTerm]);

  const filteredProducts = useMemo(() => {
    const query = trimmedQuery.toLowerCase();
    const source = remoteProducts ?? items;
    return source.filter((p) => {
      const matchesCategory = selectedCategoryId ? p.categoryId === selectedCategoryId : true;
      const matchesQuery =
        !query ||
        remoteProducts !== null ||
        [p.productName, p.sku, p.barcode, p.brand].some((field) => field?.toLowerCase().includes(query));
      return matchesCategory && matchesQuery;
    });
  }, [items, remoteProducts, selectedCategoryId, trimmedQuery]);

  const subtotal = cartTotal;
  const discountAmount =
    discountType === 'percent'
      ? Math.round((subtotal * Math.min(100, Math.max(0, Number(discountValue) || 0))) / 100)
      : Math.min(subtotal, Math.max(0, Number(discountValue) || 0));
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = ppnEnabled ? Math.round((afterDiscount * taxRatePercent) / 100) : 0;
  const grandTotal = afterDiscount + taxAmount;
  const storeName = storeProfile?.storeName ?? user?.roles?.[0]?.storeName ?? '-';
  const sessionLabel = session ? `Sesi dibuka ${sessionTimeLabel(session.openedAt)}` : 'Sesi belum dibuka';

  const addToCartWithUnit = (product: Product, unit: ProductUnit) => {
    const payload: AddItemPayload = {
      product,
      unit: { unitId: unit.unitId, unitName: unit.unitName, conversionToBase: unit.conversionToBase },
    };
    dispatch(addItem(payload));
  };

  const onAddToCart = async (product: Product) => {
    if (!session) {
      Alert.alert('Sesi kasir belum dibuka', 'Buka sesi kasir dulu sebelum mencatat penjualan.');
      return;
    }
    let units = productUnitsById[product.id];
    if (!units) {
      try {
        units = await dispatch(fetchProductUnits(product.id)).unwrap().then((r) => r.items);
      } catch {
        units = [];
      }
    }
    const choices = resolveSaleUnitChoices(units, product);
    if (choices.length === 1) addToCartWithUnit(product, choices[0]);
    else setUnitPicker({ product, choices });
  };

  // Enter di kolom cari / scanner USB: barcode atau SKU yang cocok persis langsung masuk keranjang.
  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = trimmedQuery.toLowerCase();
    if (!query) return;
    const exact = filteredProducts.find((p) => p.barcode?.toLowerCase() === query || p.sku.toLowerCase() === query);
    if (exact) {
      onAddToCart(exact);
      setSearchQuery('');
    }
  };

  const settleCustomerOrder = useSettleCustomerOrder();
  const customerOrder = useAppSelector((state) => state.cart.customerOrder);

  const onCheckoutDone = (order: Order, withReceipt: boolean) => {
    settleCustomerOrder(order);
    setCheckoutVisible(false);
    dispatch(clearCart());
    setDiscountValue('');
    if (withReceipt) router.push(`/orders/${order.id}/receipt`);
  };

  const onClearCart = () => {
    if (cartCount === 0) return;
    Alert.alert('Hapus keranjang?', 'Semua item yang dipilih akan dihapus.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => dispatch(clearCart()) },
    ]);
  };

  return (
    <>
      <PageHeader title="Kasir" subtitle={sessionLabel} phoneSubtitle={`${storeName} · ${sessionLabel}`} />

      <div className="flex min-h-0 flex-1">
        <section className="flex min-w-0 flex-1 flex-col">
          {customerOrder ? (
            <div className="mx-5 mt-4 flex animate-fade-in items-center gap-3 rounded-xl border border-primary-200 bg-gradient-to-r from-primary-50 to-white px-4 py-3 tab:mx-6">
              <ClipboardIcon size={20} className="shrink-0 text-primary-600" />
              <p className="min-w-0 flex-1 text-sm text-ink-2">
                Membayar pesanan <span className="font-bold text-ink">{customerOrder.orderNumber}</span> · {customerOrder.customerName}
                <span className="block text-[12.5px] text-ink-3">Setelah dibayar, pesanan otomatis ditandai selesai.</span>
              </p>
              <Button size="sm" variant="ghost" onClick={() => dispatch(clearCart())}>
                Lepas
              </Button>
            </div>
          ) : null}
          {sessionStatus !== 'loading' && !session ? (
            <div className="mx-5 mt-4 flex animate-fade-in items-start gap-3 rounded-xl border border-warning-200 bg-gradient-to-r from-warning-50 to-white p-4 tab:mx-6">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-warning-100 text-warning-600">
                <UnlockIcon size={18} />
              </span>
              <div className="flex-1">
                <p className="font-bold text-warning-700">Sesi kasir belum dibuka</p>
                <p className="text-sm text-ink-2">
                  Buka sesi dulu dengan mengisi modal awal kas, baru bisa mulai mencatat penjualan hari ini.
                </p>
                <Button size="sm" onClick={() => setOpenSessionVisible(true)} className="mt-2.5">
                  Buka Sesi Sekarang
                </Button>
              </div>
            </div>
          ) : null}

          <div className="space-y-3 px-5 pt-4 pb-3 tab:px-6">
            <form onSubmit={onSearchSubmit} className="flex gap-2">
              <Input
                ref={searchRef}
                wrapperClassName="flex-1"
                placeholder={isWide ? 'Cari produk atau scan barcode (F2)' : 'Cari produk / barcode'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
                leftElement={<SearchIcon size={17} className="text-gray-400" />}
                rightElement={
                  searchQuery ? (
                    <button type="button" onClick={() => setSearchQuery('')} aria-label="Hapus pencarian" className="cursor-pointer p-1 text-ink-3">
                      <CloseIcon size={16} />
                    </button>
                  ) : null
                }
              />
              <button
                type="button"
                onClick={() => setScannerVisible(true)}
                aria-label="Scan barcode"
                className="flex w-[50px] cursor-pointer items-center justify-center rounded-md border-[1.5px] border-gray-300 bg-white text-gray-600 shadow-md hover:border-primary-300 hover:text-primary-600"
              >
                <BarcodeIcon size={19} />
              </button>
            </form>
            <CategoryChips categories={categories} selectedId={selectedCategoryId} onSelect={setSelectedCategoryId} />
          </div>

          <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-5 pb-28 tab:px-6 tab:pb-6">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 tab:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {filteredProducts.map((item, index) => (
                  <ProductGridCard key={item.id} item={item} index={index} onClick={() => onAddToCart(item)} />
                ))}
              </div>
            ) : status === 'loading' || remoteLoading ? (
              <LoadingBlock label="Memuat produk..." />
            ) : trimmedQuery ? (
              <EmptyState
                icon={SearchIcon}
                title="Tidak Ada Produk Cocok"
                description={`Tidak ada produk dengan nama, SKU, barcode, atau merek "${trimmedQuery}".`}
              />
            ) : (
              <EmptyState
                icon={BoxIcon}
                title={selectedCategoryId ? 'Tidak Ada Produk Cocok' : 'Belum Ada Produk'}
                description="Tambahkan produk dulu di menu Produk supaya bisa langsung dijual di sini."
                actionLabel="Buka Menu Produk"
                onAction={() => router.push('/products')}
              />
            )}
          </div>
        </section>

        <aside className="hidden w-[380px] shrink-0 border-l border-gray-150 bg-white tab:block xl:w-[400px]">
          <OrderPanel
            cashierName={user?.name ?? 'Kasir'}
            cartItems={cartItems}
            cartCount={cartCount}
            subtotal={subtotal}
            discountAmount={discountAmount}
            taxAmount={taxAmount}
            taxRatePercent={taxRatePercent}
            grandTotal={grandTotal}
            canCheckout={canOpenCheckout}
            onCheckout={openCheckout}
            onClearCart={onClearCart}
            onOpenDiscount={can('pos.discount') ? () => setDiscountVisible(true) : undefined}
            onHold={() => Alert.alert('Segera hadir', 'Fitur menahan pesanan untuk dilanjutkan nanti belum tersedia.')}
            onAddNote={() => Alert.alert('Segera hadir', 'Fitur catatan pesanan belum tersedia.')}
          />
        </aside>
      </div>

      {!isWide && cartCount > 0 ? <CartBar count={cartCount} total={cartTotal} onClick={openCheckout} /> : null}

      <Modal isOpen={openSessionVisible} onClose={() => setOpenSessionVisible(false)}>
        <OpenSessionForm onDone={() => setOpenSessionVisible(false)} onCancel={() => setOpenSessionVisible(false)} />
      </Modal>

      <Modal isOpen={discountVisible} onClose={() => setDiscountVisible(false)} size="sm">
        <DiscountForm
          discountType={discountType}
          onChangeDiscountType={() => setDiscountType((prev) => (prev === 'percent' ? 'amount' : 'percent'))}
          discountValue={discountValue}
          onChangeDiscountValue={setDiscountValue}
          ppnEnabled={ppnEnabled}
          taxRatePercent={taxRatePercent}
          onDone={() => setDiscountVisible(false)}
        />
      </Modal>

      <Modal isOpen={checkoutVisible} onClose={() => setCheckoutVisible(false)} size="md">
        <CheckoutForm
          total={cartTotal}
          cartItems={cartItems}
          showItemsList={false}
          onDone={onCheckoutDone}
          onCancel={() => setCheckoutVisible(false)}
          externalDiscountAmount={discountAmount}
        />
      </Modal>

      <Modal isOpen={!!unitPicker} onClose={() => setUnitPicker(null)} size="sm">
        {unitPicker ? (
          <div>
            <p className="mb-1 text-lg font-bold text-ink">Jual &ldquo;{unitPicker.product.productName}&rdquo; per apa?</p>
            <p className="mb-4 text-sm text-ink-2">Produk ini bisa dijual dalam beberapa satuan. Pilih salah satu di bawah.</p>
            <div className="space-y-2">
              {unitPicker.choices.map((unit) => (
                <Button
                  key={unit.unitId}
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    addToCartWithUnit(unitPicker.product, unit);
                    setUnitPicker(null);
                  }}
                >
                  {`${unit.unitName} — ${formatRupiah(unitPicker.product.sellingPrice * unit.conversionToBase, true)}`}
                </Button>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>

      <BarcodeScanner isOpen={scannerVisible} onClose={() => setScannerVisible(false)} onFound={onAddToCart} />
    </>
  );
}
