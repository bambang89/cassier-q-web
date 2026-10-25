'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import * as promoApi from '@/api/promoCodesApi';
import { apiErrorMessage } from '@/api/errors';
import type { PromoCode, PromoCodePayload, PromoDiscountType } from '@/types/models';
import { Alert } from '@/lib/alert';
import { cn } from '@/lib/cn';
import { PageBody, PageHeader } from '@/components/layout/PageHeader';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import { FormControl, Input, Switch } from '@/components/ui/Field';
import { TrendingIcon } from '@/components/icons/LineIcons';
import { generatePromoCode, promoSummary, rupiah } from './promoUtils';

const END_PRESETS: { label: string; days: number | null }[] = [
  { label: 'Tanpa batas', days: null },
  { label: '7 hari', days: 7 },
  { label: '14 hari', days: 14 },
  { label: '30 hari', days: 30 },
];

/** ISO → "yyyy-mm-dd" (tanggal lokal) untuk <input type="date">. */
const toInputDate = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
/** "yyyy-mm-dd" → ISO akhir hari itu (waktu perangkat). */
const fromInputDate = (value: string): string | null => {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d, 23, 59, 59).toISOString();
};
const daysFromNow = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toInputDate(d.toISOString());
};

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <p className="mb-2 ml-1 text-[11.5px] font-bold tracking-[0.08em] text-ink-3">{title.toUpperCase()}</p>
      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">{children}</div>
    </section>
  );
}

/** Buat atau ubah kode promo (pemilik toko). */
export function PromoCodeForm({ editing }: { editing?: PromoCode }) {
  const router = useRouter();
  const [code, setCode] = useState(editing?.code ?? '');
  const [name, setName] = useState(editing?.name ?? '');
  const [discountType, setDiscountType] = useState<PromoDiscountType>(editing?.discountType ?? 'PERCENT');
  const [discountValue, setDiscountValue] = useState(editing ? String(editing.discountValue) : '');
  const [maxDiscount, setMaxDiscount] = useState(editing?.maxDiscountAmount ? String(editing.maxDiscountAmount) : '');
  const [minPurchase, setMinPurchase] = useState(editing?.minPurchaseAmount ? String(editing.minPurchaseAmount) : '');
  const [usageLimit, setUsageLimit] = useState(editing?.usageLimit ? String(editing.usageLimit) : '');
  const [endDate, setEndDate] = useState(toInputDate(editing?.endsAt ?? null));
  const [active, setActive] = useState(editing?.active ?? true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const value = Number(discountValue || 0);
  const canSubmit = code.trim().length >= 3 && name.trim().length > 0 && value > 0;
  const back = () => router.push('/settings');

  const buildPayload = (): PromoCodePayload | null => {
    if (discountType === 'PERCENT' && value > 100) {
      Alert.alert('Diskon tidak valid', 'Diskon persen maksimal 100%.');
      return null;
    }
    return {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      discountType,
      discountValue: value,
      maxDiscountAmount: discountType === 'PERCENT' && maxDiscount ? Number(maxDiscount) : null,
      minPurchaseAmount: minPurchase ? Number(minPurchase) : null,
      startsAt: editing?.startsAt ?? null,
      endsAt: fromInputDate(endDate),
      usageLimit: usageLimit ? Number(usageLimit) : null,
      active,
    };
  };

  const onSave = async () => {
    const payload = buildPayload();
    if (!payload) return;
    setSaving(true);
    try {
      if (editing) await promoApi.updatePromoCode(editing.id, payload);
      else await promoApi.createPromoCode(payload);
      router.push('/promo-codes');
    } catch (error) {
      Alert.alert('Gagal', apiErrorMessage(error, 'Kode promo tidak bisa disimpan.'));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!editing) return;
    try {
      await promoApi.deletePromoCode(editing.id);
      setConfirmDelete(false);
      router.push('/promo-codes');
    } catch (error) {
      Alert.alert('Gagal', apiErrorMessage(error, 'Kode promo tidak bisa dihapus.'));
    }
  };

  const preview = canSubmit
    ? promoSummary({
        id: '',
        code,
        name,
        discountType,
        discountValue: value,
        maxDiscountAmount: discountType === 'PERCENT' && maxDiscount ? Number(maxDiscount) : null,
        minPurchaseAmount: minPurchase ? Number(minPurchase) : null,
        startsAt: null,
        endsAt: null,
        usageLimit: null,
        usedCount: 0,
        active,
      })
    : null;
  const valueLabel = value > 0 ? (discountType === 'PERCENT' ? `${value}%` : rupiah(value)) : discountType === 'PERCENT' ? '0%' : 'Rp0';

  return (
    <>
      <PageHeader title={editing ? 'Ubah Kode Promo' : 'Kode Promo Baru'} backHref="/promo-codes" />
      <PageBody>
        <div className="mx-auto grid max-w-[1040px] gap-5 lg:grid-cols-[1fr_360px]">
          <div className="order-2 space-y-5 lg:order-1">
            <SectionCard title="Identitas promo">
              <FormControl label="Nama promo" isRequired>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mis. Promo Akhir Pekan" maxLength={120} />
              </FormControl>
              <FormControl label="Kode promo" isRequired helperText="3–30 huruf/angka tanpa spasi. Tekan Buat Otomatis untuk kode acak." className="mb-0">
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^A-Za-z0-9_-]/g, '').toUpperCase())}
                  maxLength={30}
                  placeholder="HEMAT10"
                  className="tracking-wider"
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setCode(generatePromoCode(name, discountType, value))}
                      className="flex cursor-pointer items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1.5 text-[12px] font-bold text-primary-600 hover:bg-primary-100"
                    >
                      <TrendingIcon size={13} /> Buat Otomatis
                    </button>
                  }
                />
              </FormControl>
            </SectionCard>

            <SectionCard title="Nilai diskon">
              <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1">
                {(['PERCENT', 'AMOUNT'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDiscountType(type)}
                    className={cn('cursor-pointer rounded-md py-2 text-sm font-semibold transition', discountType === type ? 'bg-white text-primary-700 shadow-sm' : 'text-ink-2')}
                  >
                    {type === 'PERCENT' ? 'Persen (%)' : 'Nominal (Rp)'}
                  </button>
                ))}
              </div>
              <div className="grid gap-x-3 sm:grid-cols-2">
                <FormControl label={discountType === 'PERCENT' ? 'Diskon (%)' : 'Potongan (Rp)'} isRequired className="mb-0">
                  <Input value={discountValue} onChange={(e) => setDiscountValue(e.target.value.replace(/[^0-9.]/g, ''))} inputMode="decimal" placeholder={discountType === 'PERCENT' ? '10' : '20000'} />
                </FormControl>
                {discountType === 'PERCENT' ? (
                  <FormControl label="Maks. potongan (Rp)" className="mb-0">
                    <Input value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="Opsional" />
                  </FormControl>
                ) : null}
              </div>
            </SectionCard>

            <SectionCard title="Ketentuan pemakaian">
              <div className="grid gap-x-3 sm:grid-cols-2">
                <FormControl label="Min. belanja (Rp)" className="mb-0">
                  <Input value={minPurchase} onChange={(e) => setMinPurchase(e.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="Opsional" />
                </FormControl>
                <FormControl label="Kuota pemakaian" className="mb-0">
                  <Input value={usageLimit} onChange={(e) => setUsageLimit(e.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="Tanpa batas" />
                </FormControl>
              </div>
              {editing ? (
                <p className="mt-3 text-[12.5px] text-ink-3">
                  Sudah dipakai {editing.usedCount} kali{editing.usageLimit ? ` dari ${editing.usageLimit}` : ''}.
                </p>
              ) : null}
            </SectionCard>

            <SectionCard title="Masa berlaku">
              <FormControl label="Berlaku sampai" helperText="Kosongkan bila tanpa batas waktu.">
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={toInputDate(new Date().toISOString())} />
              </FormControl>
              <div className="mb-4 flex flex-wrap gap-2">
                {END_PRESETS.map((preset) => {
                  const selected = preset.days === null ? !endDate : endDate === daysFromNow(preset.days);
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setEndDate(preset.days === null ? '' : daysFromNow(preset.days))}
                      className={cn(
                        'cursor-pointer rounded-full border px-3 py-1.5 text-[12.5px] font-semibold',
                        selected ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-line text-ink-2 hover:border-primary-200',
                      )}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                <div className="flex-1">
                  <p className="font-semibold text-ink">Aktifkan promo</p>
                  <p className="text-[12.5px] text-ink-3">Kasir hanya bisa memakai kode yang aktif</p>
                </div>
                <Switch value={active} onChange={setActive} label="Aktifkan promo" />
              </div>
            </SectionCard>

            {editing ? (
              <Button variant="dangerOutline" onClick={() => setConfirmDelete(true)}>
                Hapus Kode Promo
              </Button>
            ) : null}
          </div>

          <aside className="order-1 space-y-4 lg:sticky lg:top-0 lg:order-2 lg:self-start">
            {/* Pratinjau tiket */}
            <div className="flex overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#0B1F33_0%,#123E7A_100%)] shadow-lg">
              <div className="min-w-0 flex-1 p-5">
                <p className="truncate text-[11.5px] font-semibold tracking-[0.1em] text-white/60 uppercase">{name.trim() || 'NAMA PROMO'}</p>
                <p className="text-[32px] leading-10 font-extrabold text-white">{valueLabel}</p>
                <p className="line-clamp-2 text-[12.5px] text-white/75">{preview ?? 'Isi detail promo di bawah'}</p>
              </div>
              <div className="relative w-[18px] shrink-0">
                <span className="absolute -top-[9px] left-0 size-[18px] rounded-full bg-canvas" />
                <span className="absolute inset-y-3 left-1/2 border-l-[1.5px] border-dashed border-white/30" />
                <span className="absolute -bottom-[9px] left-0 size-[18px] rounded-full bg-canvas" />
              </div>
              <div className="flex w-[120px] shrink-0 flex-col justify-center gap-1 p-3">
                <p className="text-[11.5px] tracking-[0.1em] text-white/60">KODE</p>
                <p className="truncate text-base font-extrabold tracking-wider text-white">{code.trim().toUpperCase() || '——'}</p>
                <span className={cn('w-fit rounded-full px-2 py-0.5 text-[12px] font-semibold text-white', active ? 'bg-success-500/25' : 'bg-white/12')}>
                  {active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            </div>
            <div className="hidden gap-2 lg:flex">
              <Button variant="ghost" onClick={back} className="flex-1">
                Batal
              </Button>
              <Button onClick={onSave} loading={saving} disabled={!canSubmit || saving} className="flex-[2]">
                {editing ? 'Simpan Perubahan' : 'Buat Kode Promo'}
              </Button>
            </div>
          </aside>

          <div className="order-3 lg:hidden">
            <Button fullWidth onClick={onSave} loading={saving} disabled={!canSubmit || saving}>
              {editing ? 'Simpan Perubahan' : 'Buat Kode Promo'}
            </Button>
          </div>
        </div>
      </PageBody>

      <AlertDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Hapus kode promo?"
        description={`"${editing?.code}" tidak bisa dipakai lagi. Bila sudah pernah dipakai, kode hanya dinonaktifkan agar riwayat transaksi tetap utuh.`}
        confirmText="Hapus"
        isDanger
        onConfirm={onDelete}
      />
    </>
  );
}
