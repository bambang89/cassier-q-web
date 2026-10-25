'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import type { Fulfillment, PublicStorefront } from '@/types/storefront';
import { fetchPublicStorefront, placePublicOrder } from '@/services/storefrontApi';
import { apiErrorMessage } from '@/utils/apiErrors';
import { cn } from '@/utils/cn';
import { formatRupiah } from '@/utils/format';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FormControl, Input, Select, TextArea } from '@/components/ui/Field';
import { LoadingBlock } from '@/components/ui/Spinner';
import { CartIcon } from '@/components/ui/icons/NavIcons';
import { ChevronRightIcon } from '@/components/ui/icons/ActionIcons';
import { StorefrontRenderer } from '@/features/storefront/components/StorefrontRenderer';
import { StoreUnavailable } from '@/features/storefront/components/StoreUnavailable';
import { useCart } from '@/features/storefront/hooks/useCart';
import { themeStyle, resolveTheme, resolvePage, resolveTable } from '@/features/storefront/utils';
import { StoreHeader, StoreFooter, FloatingWhatsapp } from '@/features/storefront/components/renderer/StoreChrome';
import { StorefrontProvider } from '@/features/storefront/components/StorefrontProvider';

const FULFILLMENTS: { value: Fulfillment; label: string; hint: string }[] = [
  { value: 'PICKUP', label: 'Ambil di toko', hint: 'Datang & ambil sendiri' },
  { value: 'DELIVERY', label: 'Diantar', hint: 'Isi alamat pengantaran' },
  { value: 'DINE_IN', label: 'Makan di tempat', hint: 'Isi nomor meja' },
];

/**
 * Toko online untuk pembeli: /toko/<slug>, atau /toko/<slug>/<kode-meja> bila pembeli
 * memindai link meja (pesanan otomatis "Makan di tempat" di meja itu).
 * Pesanan masuk ke menu Pesanan di kasir.
 */
export function PublicStorePage({ tableCode }: { tableCode?: string }) {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [data, setData] = useState<PublicStorefront | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cart = useCart(slug);
  const [cartOpen, setCartOpen] = useState(false);
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [fulfillment, setFulfillment] = useState<Fulfillment>('PICKUP');
  const [address, setAddress] = useState('');
  const [table, setTable] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    setError(null);
    fetchPublicStorefront(slug)
      .then((sf) => {
        setData(sf);
        const page = resolvePage(sf.layout);
        document.title = page.seoTitle || sf.store.name;
        const description = page.seoDescription || `Pesan online di ${sf.store.name}`;
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', 'description');
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', description);
        const seat = tableCode ? resolveTable(tableCode, page.tables) : null;
        if (seat) {
          // Dari link meja: langsung makan di tempat, nomor meja terisi.
          setFulfillment('DINE_IN');
          setTable(seat);
        } else if (!page.fulfillments.includes('PICKUP')) {
          // Cara pengambilan default = yang pertama diizinkan pemilik toko.
          setFulfillment(page.fulfillments[0] ?? 'PICKUP');
        }
      })
      .catch((e) => setError(apiErrorMessage(e, 'Toko tidak ditemukan.')));
  }, [slug, tableCode, reload]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const order = await placePublicOrder(slug, {
        customerName: name.trim(),
        customerPhone: phone.trim() || undefined,
        fulfillment,
        deliveryAddress: fulfillment === 'DELIVERY' ? address.trim() : undefined,
        tableLabel: fulfillment === 'DINE_IN' ? table.trim() : undefined,
        notes: notes.trim() || undefined,
        items: cart.lines.map((l) => ({ productId: l.product.id, quantity: l.quantity, notes: l.notes?.trim() || undefined })),
      });
      cart.clear();
      router.push(`/toko/${slug}/pesanan/${order.id}${tableCode ? `?meja=${encodeURIComponent(tableCode)}` : ''}`);
    } catch (err) {
      setSubmitError(apiErrorMessage(err, 'Pesanan gagal dikirim, coba lagi.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (error) return <StoreUnavailable slug={slug} onPublished={() => setReload((n) => n + 1)} />;
  if (!data) return <LoadingBlock label="Membuka toko…" />;

  const page = resolvePage(data.layout);
  const theme = resolveTheme(data.layout);
  const seat = tableCode ? resolveTable(tableCode, page.tables) : null;

  if (tableCode && !seat) {
    return (
      <div style={themeStyle(data.themeColor, theme)} className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-[var(--sf-bg)] p-6 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-[var(--sf-surface)] text-3xl shadow-card">🍽️</span>
        <h1 className="sf-heading text-xl font-bold">Meja tidak ditemukan</h1>
        <p className="max-w-sm text-[var(--sf-muted)]">Link meja ini sudah tidak berlaku. Silakan tanya petugas, atau pesan lewat halaman utama toko.</p>
        <Link href={`/toko/${slug}`} className="mt-2 rounded-[var(--sf-btn-radius)] bg-[var(--sf)] px-5 py-2.5 font-bold text-white">
          Buka {data.store.name}
        </Link>
      </div>
    );
  }

  const fulfillments = FULFILLMENTS.filter((f) => page.fulfillments.includes(f.value));
  const belowMinimum = page.minOrder > 0 && cart.total < page.minOrder;
  const canSubmit =
    name.trim().length > 0 &&
    cart.count > 0 &&
    !belowMinimum &&
    (fulfillment !== 'DELIVERY' || address.trim().length > 0) &&
    (fulfillment !== 'DINE_IN' || table.trim().length > 0);
  const openCart = () => {
    setStep('cart');
    setCartOpen(true);
  };
  const showCartBar = page.orderingEnabled && cart.count > 0;

  return (
    <StorefrontProvider data={data} cart={cart.byId} onAdd={cart.add}>
      <div data-sf-root className="min-h-dvh">
        <StoreHeader cartCount={cart.count} onCart={openCart} />
        {seat ? (
          <div className="mx-auto max-w-6xl px-4 pt-3">
            <div className="flex animate-fade-in items-center gap-3 rounded-[var(--sf-radius)] bg-[color-mix(in_srgb,var(--sf)_12%,var(--sf-surface))] px-4 py-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--sf)] text-lg text-white">🍽️</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] text-[var(--sf-muted)]">Anda memesan dari</span>
                <span className="sf-heading block truncate text-lg font-bold">{seat}</span>
              </span>
              <span className="rounded-full bg-[var(--sf-surface)] px-3 py-1 text-[12px] font-semibold text-[var(--sf-muted)]">Makan di tempat</span>
            </div>
          </div>
        ) : null}
        {!page.orderingEnabled && page.closedMessage ? (
          <div className="mx-auto max-w-6xl px-4 pt-3">
            <p className="animate-fade-in rounded-[var(--sf-radius)] border border-[var(--sf-line)] bg-[var(--sf-surface)] px-4 py-3 text-center text-sm text-[var(--sf-muted)]">{page.closedMessage}</p>
          </div>
        ) : null}
        <main className="pt-2">
          <StorefrontRenderer data={data} />
        </main>
        <StoreFooter />
        <FloatingWhatsapp raised={showCartBar} />
      </div>

      {showCartBar ? (
        <div className="fixed inset-x-0 bottom-0 z-30 p-4">
          <button
            type="button"
            onClick={openCart}
            className="mx-auto flex w-full max-w-lg animate-sheet-up cursor-pointer items-center gap-3 rounded-[calc(var(--sf-radius)+4px)] bg-[var(--sf)] p-3 pl-4 text-left text-white shadow-[0_18px_40px_-12px_rgb(0_0_0/0.45)] transition hover:-translate-y-0.5 active:scale-[0.99]"
          >
            <span key={cart.count} className="flex size-10 animate-pop-in items-center justify-center rounded-full bg-white/20">
              <CartIcon size={20} />
            </span>
            <span className="flex-1">
              <span className="block text-[12px] text-white/80">{cart.count} item{belowMinimum ? ` · min. ${formatRupiah(page.minOrder)}` : ''}</span>
              <span className="block text-lg font-bold">{formatRupiah(cart.total)}</span>
            </span>
            <span className="flex items-center gap-1 rounded-[var(--sf-btn-radius)] bg-white/20 px-3 py-2 text-sm font-bold">
              Pesan <ChevronRightIcon size={16} />
            </span>
          </button>
        </div>
      ) : null}

      <Modal isOpen={cartOpen} onClose={() => setCartOpen(false)} title={step === 'cart' ? 'Keranjang' : 'Data Pemesan'} size="md">
        <div style={{ ...themeStyle(data.themeColor, theme), color: undefined, fontFamily: undefined }}>
          {step === 'cart' ? (
            cart.lines.length === 0 ? (
              <p className="py-10 text-center text-ink-3">Keranjang masih kosong.</p>
            ) : (
              <>
                <div className="divide-y divide-gray-100">
                  {cart.lines.map((line) => (
                    <div key={line.product.id} className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-ink">{line.product.name}</p>
                          <p className="text-sm text-ink-3">{formatRupiah(line.product.price)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => cart.setQuantity(line.product.id, line.quantity - 1)} className="size-8 cursor-pointer rounded-full border border-gray-200 font-bold">
                            −
                          </button>
                          <span className="min-w-7 text-center font-bold">{line.quantity}</span>
                          <button type="button" onClick={() => cart.setQuantity(line.product.id, line.quantity + 1)} className="size-8 cursor-pointer rounded-full border border-gray-200 font-bold">
                            +
                          </button>
                        </div>
                      </div>
                      <input
                        value={line.notes ?? ''}
                        onChange={(e) => cart.setNotes(line.product.id, e.target.value)}
                        placeholder="Catatan (mis. tidak pedas)"
                        maxLength={255}
                        className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-[var(--sf)]"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-ink-2">Total</span>
                  <span className="text-xl font-extrabold text-ink">{formatRupiah(cart.total)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('checkout')}
                  className="mt-4 w-full cursor-pointer rounded-xl bg-[var(--sf)] py-3 font-bold text-white"
                >
                  Lanjut Isi Data
                </button>
              </>
            )
          ) : (
            <form onSubmit={submit}>
              <FormControl label="Nama" isRequired>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Anda" maxLength={120} autoFocus />
              </FormControl>
              <FormControl label="No. WhatsApp" helperText="Supaya toko bisa menghubungi Anda">
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" type="tel" maxLength={30} />
              </FormControl>
              {seat ? (
                <div className="mb-4 flex items-center gap-3 rounded-xl border-[1.5px] border-[var(--sf)] bg-[color-mix(in_srgb,var(--sf)_8%,white)] p-3">
                  <span className="text-xl">🍽️</span>
                  <span className="flex-1">
                    <span className="block text-sm font-bold text-ink">Makan di tempat · {seat}</span>
                    <span className="block text-[12px] text-ink-3">Pesanan diantar ke meja Anda</span>
                  </span>
                </div>
              ) : (
                <>
                  <p className="mb-1 text-base font-semibold text-ink">Cara pengambilan</p>
                  <div className={cn('mb-4 grid gap-2', fulfillments.length === 1 ? 'grid-cols-1' : fulfillments.length === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
                    {fulfillments.map((f) => (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => setFulfillment(f.value)}
                        className={cn(
                          'cursor-pointer rounded-xl border-[1.5px] p-2.5 text-left transition',
                          fulfillment === f.value ? 'border-[var(--sf)] bg-[color-mix(in_srgb,var(--sf)_8%,white)]' : 'border-gray-200',
                        )}
                      >
                        <span className="block text-sm font-bold text-ink">{f.label}</span>
                        <span className="block text-[11.5px] text-ink-3">{f.value === 'DINE_IN' && page.tables.length ? 'Pilih nomor meja' : f.hint}</span>
                      </button>
                    ))}
                  </div>
                  {fulfillment === 'DELIVERY' ? (
                    <FormControl label="Alamat pengantaran" isRequired>
                      <TextArea value={address} onChange={(e) => setAddress(e.target.value)} maxLength={500} placeholder="Jalan, nomor rumah, patokan" />
                    </FormControl>
                  ) : null}
                  {fulfillment === 'DINE_IN' ? (
                    <FormControl label="Nomor meja" isRequired>
                      {page.tables.length ? (
                        <Select value={table || null} onChange={setTable} placeholder="Pilih meja…" options={page.tables.map((t) => ({ value: t.label, label: t.label }))} />
                      ) : (
                        <Input value={table} onChange={(e) => setTable(e.target.value)} maxLength={40} placeholder="mis. 5" />
                      )}
                    </FormControl>
                  ) : null}
                </>
              )}
              <FormControl label="Catatan untuk toko">
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} placeholder="Opsional" />
              </FormControl>
              <div className="mb-4 flex items-center justify-between rounded-xl bg-gray-50 p-3">
                <span className="text-sm text-ink-2">{cart.count} item</span>
                <span className="text-lg font-extrabold">{formatRupiah(cart.total)}</span>
              </div>
              {submitError ? <p className="mb-3 rounded-lg bg-error-50 p-3 text-sm text-error-600">{submitError}</p> : null}
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep('cart')}>
                  Kembali
                </Button>
                <button
                  type="submit"
                  disabled={!canSubmit || submitting}
                  className="flex-1 cursor-pointer rounded-xl bg-[var(--sf)] py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? 'Mengirim…' : `Kirim Pesanan · ${formatRupiah(cart.total)}`}
                </button>
              </div>
              {belowMinimum ? <p className="mt-3 rounded-lg bg-warning-50 p-2.5 text-center text-[12.5px] text-warning-700">Minimal belanja {formatRupiah(page.minOrder)} — tambah {formatRupiah(page.minOrder - cart.total)} lagi.</p> : null}
              {page.checkoutNote ? <p className="mt-3 text-center text-[12px] text-ink-3">{page.checkoutNote}</p> : null}
            </form>
          )}
        </div>
      </Modal>
    </StorefrontProvider>
  );
}
