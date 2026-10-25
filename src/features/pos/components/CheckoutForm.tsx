'use client';

import { useEffect, useRef, useState } from 'react';

import { PAYMENT_METHODS } from '@/types/models';
import type { CartItem, Order, PaymentMethod, PromoQuote } from '@/types/models';
import * as promoCodesApi from '@/services/promoCodesApi';
import { createOrder } from '@/lib/store/slices/ordersSlice';
import { fetchCustomers } from '@/lib/store/slices/customersSlice';
import { fetchCurrentSession } from '@/lib/store/slices/cashierSessionSlice';
import { Alert } from '@/lib/alert';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { usePermissions } from '@/hooks/usePermissions';
import { apiErrorMessage, newIdempotencyKey } from '@/utils/apiErrors';
import { cn } from '@/utils/cn';
import { formatRupiah } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Field';
import { PeopleIcon } from '@/components/ui/icons/NavIcons';
import { BarcodeIcon, ReceiveIcon, CheckIcon, PrintIcon } from '@/components/ui/icons/ActionIcons';
import { DiscountIcon, WalletIcon, CreditCardIcon } from '@/components/ui/icons/DataIcons';
import { NO_CUSTOMER, PPN_RATE, cashSuggestions } from '@/features/pos/utils';
import { CartItemRow } from '@/features/pos/components/CartItemRow';

const PAYMENT_METHOD_ICONS: Record<PaymentMethod, typeof CreditCardIcon> = {
  CASH: WalletIcon,
  QRIS: BarcodeIcon,
  DEBIT: CreditCardIcon,
  CREDIT_CARD: CreditCardIcon,
  TRANSFER: ReceiveIcon,
};

export { PAYMENT_METHOD_ICONS };

/**
 * Form pembayaran — padanan CheckoutForm mobile. Layar lebar: modal di samping
 * panel pesanan; HP: halaman penuh (/checkout).
 */
export function CheckoutForm({
  total,
  cartItems,
  showItemsList,
  onDone,
  onCancel,
  externalDiscountAmount,
  layout = 'modal',
}: {
  total: number;
  cartItems: CartItem[];
  showItemsList: boolean;
  onDone: (order: Order, withReceipt: boolean) => void;
  onCancel: () => void;
  /** Diskon manual sudah ditentukan lewat modal Diskon di panel pesanan. */
  externalDiscountAmount?: number;
  layout?: 'modal' | 'page';
}) {
  const dispatch = useAppDispatch();
  const isPage = layout === 'page';
  const customers = useAppSelector((state) => state.customers.items);
  const settings = useAppSelector((state) => state.checkoutSettings.settings);
  const { can } = usePermissions();
  const canDiscount = can('pos.discount');
  const canPromo = can('pos.promo');
  const lockDiscount = externalDiscountAmount !== undefined;
  const methods = settings
    ? PAYMENT_METHODS.filter((m) => settings.paymentMethods.some((s) => s.code === m.value && s.enabled))
    : PAYMENT_METHODS.filter((m) => m.value === 'CASH');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(settings?.defaultPaymentMethod ?? 'CASH');
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [discount, setDiscount] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState<PromoQuote | null>(null);
  const [promoChecking, setPromoChecking] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const manualDiscount = lockDiscount ? (externalDiscountAmount ?? 0) : Math.min(total, Math.max(0, Number(discount || 0)));
  const promoDiscount = Math.min(promo?.discountAmount ?? 0, total - manualDiscount);
  const discountAmount = manualDiscount + promoDiscount;
  // PPN mengikuti pengaturan toko, bukan tombol kasir.
  const taxEnabled = settings?.taxEnabled ?? true;
  const taxRate = settings ? settings.taxRatePercent / 100 : PPN_RATE;
  const taxAmount = taxEnabled ? Math.round((total - discountAmount) * taxRate) : 0;
  const payableTotal = total - discountAmount + taxAmount;
  const [paymentAmount, setPaymentAmount] = useState(String(payableTotal));
  const [submitting, setSubmitting] = useState<'receipt' | 'plain' | null>(null);
  // Satu key per checkout: retry setelah timeout mengembalikan transaksi yang sama.
  const idempotencyKey = useRef(newIdempotencyKey());

  useEffect(() => {
    setPaymentAmount(String(payableTotal));
  }, [payableTotal]);

  useEffect(() => {
    if (settings && !methods.some((m) => m.value === paymentMethod)) setPaymentMethod(settings.defaultPaymentMethod);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  // Diskon manual berubah → dasar promo berubah, cek ulang kodenya.
  useEffect(() => {
    if (!promo) return;
    promoCodesApi
      .validatePromoCode(promo.code, total - manualDiscount)
      .then(setPromo)
      .catch((error) => {
        setPromo(null);
        setPromoError(apiErrorMessage(error, 'Kode promo tidak berlaku lagi.'));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, manualDiscount]);

  const applyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoChecking(true);
    setPromoError(null);
    try {
      setPromo(await promoCodesApi.validatePromoCode(code, total - manualDiscount));
      setPromoInput('');
    } catch (error) {
      setPromoError(apiErrorMessage(error, 'Kode promo tidak bisa dipakai.'));
    } finally {
      setPromoChecking(false);
    }
  };

  const selectedCustomer = customers.find((c) => c.id === customerId) ?? null;
  const amountNumber = Number(paymentAmount || 0);
  const change = Math.max(0, amountNumber - payableTotal);
  const remainingAsDebt = selectedCustomer ? Math.max(0, payableTotal - amountNumber) : 0;
  const shortfall = !selectedCustomer ? Math.max(0, payableTotal - amountNumber) : 0;
  const isCash = paymentMethod === 'CASH';
  const quickAmounts = cashSuggestions(payableTotal);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const onSubmit = async (withReceipt: boolean) => {
    const amount = Number(paymentAmount);
    if (Number.isNaN(amount) || amount < 0) {
      Alert.alert('Jumlah tidak valid', 'Isi jumlah pembayaran yang benar.');
      return;
    }
    if (!selectedCustomer && amount < payableTotal) {
      Alert.alert('Jumlah bayar kurang', 'Jumlah pembayaran tidak boleh kurang dari total belanja.');
      return;
    }
    setSubmitting(withReceipt ? 'receipt' : 'plain');
    try {
      const order = await dispatch(
        createOrder({
          items: cartItems,
          payload: {
            paymentMethod,
            paymentAmount: amount,
            // Diskon manual saja — porsi promo dihitung ulang server dari promoCode.
            discountAmount: manualDiscount > 0 ? manualDiscount : undefined,
            taxAmount: taxAmount > 0 ? taxAmount : undefined,
            promoCode: promo?.code,
            customerId: selectedCustomer?.id,
          },
          idempotencyKey: idempotencyKey.current,
        }),
      ).unwrap();
      if (selectedCustomer) dispatch(fetchCustomers());
      onDone(order, withReceipt);
    } catch (error) {
      // Sesi mungkin ditutup otomatis jam 23:00 — segarkan supaya Kasir menampilkan status yang benar.
      dispatch(fetchCurrentSession());
      Alert.alert('Gagal', typeof error === 'string' ? error : 'Transaksi gagal, coba lagi.');
    } finally {
      setSubmitting(null);
    }
  };

  const selectMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method !== 'CASH') setPaymentAmount(String(payableTotal));
  };

  const sectionLabel = 'mb-2 mt-5 text-[11.5px] font-bold tracking-[0.08em] text-ink-3';

  return (
    <div className={cn('flex min-h-0 flex-col', isPage && 'h-full')}>
      {!isPage ? (
        <div className="mb-4 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <CreditCardIcon size={18} />
          </span>
          <div>
            <p className="text-lg font-bold text-ink">Selesaikan Pembayaran</p>
            <p className="text-[13px] text-ink-3">
              {cartItems.length} produk · {itemCount} item
            </p>
          </div>
        </div>
      ) : null}

      <div className={cn('min-h-0 flex-1', isPage && 'scroll-thin overflow-y-auto p-4')}>
        {/* Ringkasan tagihan */}
        <div className="relative overflow-hidden rounded-xl bg-[linear-gradient(135deg,#0B1F33_0%,#123E7A_70%,#1D4ED8_100%)] p-5 text-white">
          <div className="absolute -top-12 -right-10 size-40 rounded-full bg-white/[0.06]" />
          <p className="relative text-[11.5px] font-semibold tracking-[0.1em] text-white/60">TOTAL TAGIHAN</p>
          <p className="relative mt-0.5 text-[30px] leading-[38px] font-extrabold">{formatRupiah(payableTotal, true)}</p>
          <div className="relative my-3 h-px bg-white/12" />
          <BillRow label="Subtotal" value={formatRupiah(total, true)} />
          {manualDiscount > 0 ? <BillRow label="Diskon" value={`−${formatRupiah(manualDiscount, true)}`} accent /> : null}
          {promo ? <BillRow label={`Promo ${promo.code}`} value={`−${formatRupiah(promoDiscount, true)}`} accent /> : null}
          {taxAmount > 0 ? <BillRow label={`PPN ${settings?.taxRatePercent ?? 11}%`} value={formatRupiah(taxAmount, true)} /> : null}
        </div>

        {/* Metode pembayaran */}
        <p className={sectionLabel}>METODE PEMBAYARAN</p>
        <div className="grid grid-cols-3 gap-2">
          {methods.map((method) => {
            const active = paymentMethod === method.value;
            const Icon = PAYMENT_METHOD_ICONS[method.value] ?? CreditCardIcon;
            return (
              <button
                key={method.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => selectMethod(method.value)}
                className={cn(
                  'relative flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border-[1.5px] px-2 py-3 text-[12.5px] font-semibold transition',
                  active ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-line bg-white text-ink-2 hover:border-primary-200',
                )}
              >
                <Icon size={18} className={active ? 'text-primary-600' : 'text-gray-500'} />
                {method.label}
                {active ? (
                  <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-primary-600 text-white">
                    <CheckIcon size={10} />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Uang diterima */}
        <p className={sectionLabel}>{isCash ? 'UANG DITERIMA' : 'JUMLAH DIBAYAR'}</p>
        <label className="flex items-center gap-2 rounded-lg border-2 border-primary-200 bg-white px-4 py-2 focus-within:border-primary-600">
          <span className="text-lg font-bold text-ink-2">Rp</span>
          <input
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value.replace(/[^0-9]/g, ''))}
            onFocus={(e) => e.target.select()}
            inputMode="numeric"
            aria-label="Jumlah dibayar"
            className="min-w-0 flex-1 bg-transparent text-2xl font-bold text-ink outline-none"
          />
        </label>
        {isCash ? (
          <div className="mt-2 flex flex-wrap gap-2">
            <QuickChip active={amountNumber === payableTotal} onClick={() => setPaymentAmount(String(payableTotal))}>
              <span className="text-primary-600">Uang Pas</span>
            </QuickChip>
            {quickAmounts.map((value) => (
              <QuickChip key={value} active={amountNumber === value} onClick={() => setPaymentAmount(String(value))}>
                {formatRupiah(value, true)}
              </QuickChip>
            ))}
            {selectedCustomer ? (
              <QuickChip onClick={() => setPaymentAmount('0')}>
                <span className="text-error-600">Utang Penuh</span>
              </QuickChip>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-[12.5px] text-ink-3">
            Pastikan pembayaran {methods.find((m) => m.value === paymentMethod)?.label} sudah berhasil sebelum menyimpan.
          </p>
        )}

        {canPromo ? (
          <>
            <p className={sectionLabel}>KODE PROMO</p>
            {promo ? (
              <div className="flex items-center gap-3 rounded-lg border border-success-200 bg-success-50 p-3">
                <span className="flex size-8 items-center justify-center rounded-md bg-white text-success-700">
                  <DiscountIcon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold tracking-wider text-success-700">{promo.code}</p>
                  <p className="truncate text-[12.5px] text-ink-2">
                    {promo.description} · hemat {formatRupiah(promoDiscount, true)}
                  </p>
                </div>
                <button type="button" onClick={() => setPromo(null)} className="cursor-pointer text-[12.5px] font-semibold text-error-600">
                  Hapus
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value.replace(/[^A-Za-z0-9_-]/g, '').toUpperCase());
                    setPromoError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      applyPromo();
                    }
                  }}
                  placeholder="Masukkan kode promo"
                  aria-label="Kode promo"
                  className="min-w-0 flex-1 rounded-md border border-line bg-white px-3 text-[15px] tracking-wide outline-none placeholder:tracking-normal placeholder:text-gray-400 focus:border-primary-600"
                />
                <Button size="sm" onClick={applyPromo} loading={promoChecking} disabled={!promoInput.trim() || promoChecking}>
                  Pakai
                </Button>
              </div>
            )}
            {promoError ? <p className="mt-1.5 text-[12.5px] text-error-600">{promoError}</p> : null}
          </>
        ) : null}

        {(!lockDiscount && canDiscount) || customers.length > 0 ? (
          <>
            <p className={sectionLabel}>OPSI TAMBAHAN</p>
            <div className="overflow-hidden rounded-lg border border-line bg-white">
              {!lockDiscount && canDiscount ? (
                <div className="flex items-center gap-3 p-3">
                  <OptionIcon>
                    <DiscountIcon size={15} />
                  </OptionIcon>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">Diskon</p>
                    <p className="text-[12.5px] text-ink-3">Potongan langsung dalam Rupiah</p>
                  </div>
                  <input
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value.replace(/[^0-9]/g, ''))}
                    inputMode="numeric"
                    placeholder="0"
                    aria-label="Diskon"
                    className="w-28 rounded-md border border-line bg-gray-50 px-2.5 py-2 text-right text-[15px] outline-none focus:border-primary-600"
                  />
                </div>
              ) : null}
              {customers.length > 0 ? (
                <div className={cn('space-y-2 p-3', !lockDiscount && canDiscount && 'border-t border-line')}>
                  <div className="flex items-center gap-3">
                    <OptionIcon>
                      <PeopleIcon size={15} />
                    </OptionIcon>
                    <div>
                      <p className="text-sm font-semibold text-ink">Pelanggan</p>
                      <p className="text-[12.5px] text-ink-3">Wajib dipilih bila sebagian dicatat sebagai utang</p>
                    </div>
                  </div>
                  <Select
                    value={customerId ?? NO_CUSTOMER}
                    onChange={(v) => setCustomerId(v === NO_CUSTOMER ? null : v)}
                    options={[
                      { label: 'Tanpa pelanggan (transaksi umum)', value: NO_CUSTOMER },
                      ...customers.map((c) => ({
                        label: c.balance > 0 ? `${c.name} (utang ${formatRupiah(c.balance, true)})` : c.name,
                        value: c.id,
                      })),
                    ]}
                  />
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        {showItemsList ? (
          <div className="mt-5">
            <p className="mb-1 text-sm font-semibold text-ink-2">Item Dipilih ({cartItems.length})</p>
            <div className="rounded-lg border border-line bg-white px-3">
              {cartItems.map((item) => (
                <CartItemRow key={`${item.product.id}-${item.unitId}`} item={item} />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className={cn('pt-4', isPage && 'border-t border-line bg-white px-4 pb-[max(env(safe-area-inset-bottom),12px)]')}>
        {remainingAsDebt > 0 ? (
          <StatusBar className="bg-warning-50 text-warning-700" label={`Sisa jadi utang ${selectedCustomer?.name}`} value={remainingAsDebt} />
        ) : shortfall > 0 ? (
          <StatusBar className="bg-error-50 text-error-600" label="Uang kurang" value={shortfall} />
        ) : (
          <StatusBar className="bg-success-50 text-success-700" label="Kembalian" value={change} />
        )}
        <Button
          fullWidth
          leftIcon={<PrintIcon size={16} />}
          onClick={() => onSubmit(true)}
          loading={submitting === 'receipt'}
          disabled={submitting !== null || shortfall > 0}
        >
          {`Bayar ${formatRupiah(payableTotal, true)} & Struk`}
        </Button>
        <div className="mt-2 flex gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={submitting !== null} className="flex-1">
            Batal
          </Button>
          <Button
            variant="outline"
            onClick={() => onSubmit(false)}
            loading={submitting === 'plain'}
            disabled={submitting !== null || shortfall > 0}
            className="flex-1"
          >
            Tanpa Struk
          </Button>
        </div>
      </div>
    </div>
  );
}

function BillRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="relative flex items-center justify-between py-0.5 text-sm">
      <span className="text-white/65">{label}</span>
      <span className={cn('font-semibold', accent ? 'text-[#7EE2B8]' : 'text-white')}>{value}</span>
    </div>
  );
}

function QuickChip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'cursor-pointer rounded-full border px-3 py-1.5 text-[12.5px] font-semibold text-ink-2 transition',
        active ? 'border-primary-600 bg-primary-50' : 'border-line bg-gray-50 hover:border-primary-200',
      )}
    >
      {children}
    </button>
  );
}

function OptionIcon({ children }: { children: React.ReactNode }) {
  return <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-600">{children}</span>;
}

function StatusBar({ className, label, value }: { className: string; label: string; value: number }) {
  return (
    <div className={cn('mb-3 flex items-center justify-between rounded-lg px-4 py-3', className)}>
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-lg font-bold">{formatRupiah(value, true)}</span>
    </div>
  );
}
