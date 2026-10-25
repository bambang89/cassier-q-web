'use client';

import { useEffect, useState } from 'react';

import type { PaymentMethod } from '@/types/models';
import { Alert } from '@/lib/alert';
import { fetchCheckoutSettings, saveCheckoutSettings } from '@/lib/store/slices/checkoutSettingsSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { useMenuAccess } from '@/hooks/useMenuAccess';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Field';
import { LoadingBlock } from '@/components/ui/Spinner';
import { ReceiptIcon } from '@/components/ui/icons/NavIcons';
import { CheckIcon } from '@/components/ui/icons/ActionIcons';
import { PAYMENT_METHOD_ICONS } from '@/features/pos/components/CheckoutForm';

const sectionLabel = 'mb-2 mt-2 text-[11.5px] font-bold tracking-[0.08em] text-ink-3';

/** Metode pembayaran yang diterima, metode default, dan PPN. Hanya pemilik yang bisa mengubah. */
export function CheckoutSettingsForm() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.checkoutSettings.settings);
  const { isManager } = useMenuAccess();
  const [enabled, setEnabled] = useState<PaymentMethod[]>([]);
  const [defaultMethod, setDefaultMethod] = useState<PaymentMethod>('CASH');
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchCheckoutSettings());
  }, [dispatch]);

  useEffect(() => {
    if (!settings) return;
    setEnabled(settings.paymentMethods.filter((m) => m.enabled).map((m) => m.code));
    setDefaultMethod(settings.defaultPaymentMethod);
    setTaxEnabled(settings.taxEnabled);
  }, [settings]);

  if (!settings) return <LoadingBlock label="Memuat pengaturan..." />;

  const dirty =
    defaultMethod !== settings.defaultPaymentMethod ||
    taxEnabled !== settings.taxEnabled ||
    settings.paymentMethods.some((m) => m.enabled !== enabled.includes(m.code));

  const toggleMethod = (code: PaymentMethod, on: boolean) => {
    if (!on && code === defaultMethod) {
      Alert.alert('Metode default', 'Pilih metode default lain dulu sebelum menonaktifkan metode ini.');
      return;
    }
    setEnabled((prev) => (on ? [...prev, code] : prev.filter((c) => c !== code)));
  };

  const onSave = async () => {
    setSaving(true);
    try {
      await dispatch(saveCheckoutSettings({ enabledPaymentMethods: enabled, defaultPaymentMethod: defaultMethod, taxEnabled })).unwrap();
      Alert.alert('Tersimpan', 'Pengaturan pembayaran & PPN diperbarui.');
    } catch (error) {
      Alert.alert('Gagal', typeof error === 'string' ? error : 'Pengaturan tidak bisa disimpan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[640px]">
      {!isManager ? (
        <p className="mb-4 rounded-lg bg-warning-50 p-3 text-sm text-ink-2">Pengaturan ini hanya bisa diubah oleh pemilik / Kepala Toko.</p>
      ) : null}
      <p className={sectionLabel}>METODE PEMBAYARAN</p>
      <div className="overflow-hidden rounded-xl border border-line bg-white">
        {settings.paymentMethods.map((method) => {
          const Icon = PAYMENT_METHOD_ICONS[method.code];
          const on = enabled.includes(method.code);
          const isDefault = defaultMethod === method.code;
          return (
            <div key={method.code} className="flex items-center gap-3 border-b border-line p-3.5 last:border-0">
              <span className={cn('flex size-10 items-center justify-center rounded-md', on ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-400')}>
                <Icon size={18} />
              </span>
              <div className="flex flex-1 flex-col items-start gap-1">
                <p className="font-semibold text-ink">{method.label}</p>
                {on ? (
                  <button
                    type="button"
                    disabled={!isManager || isDefault}
                    onClick={() => setDefaultMethod(method.code)}
                    className={cn(
                      'flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] font-semibold',
                      isDefault ? 'border-primary-600 bg-primary-600 text-white' : 'cursor-pointer border-primary-200 text-primary-600 hover:bg-primary-50',
                    )}
                  >
                    {isDefault ? <CheckIcon size={11} /> : null}
                    {isDefault ? 'Default' : 'Jadikan default'}
                  </button>
                ) : (
                  <p className="text-[12.5px] text-ink-3">Tidak ditampilkan di kasir</p>
                )}
              </div>
              <Switch value={on} onChange={(v) => toggleMethod(method.code, v)} disabled={!isManager} label={method.label} />
            </div>
          );
        })}
      </div>
      <p className="mt-2 mb-5 text-[12.5px] text-ink-3">Metode default otomatis terpilih saat kasir membuka pembayaran.</p>

      <p className={sectionLabel}>PAJAK</p>
      <div className="flex items-center gap-3 rounded-xl border border-line bg-white p-3.5">
        <span className={cn('flex size-10 items-center justify-center rounded-md', taxEnabled ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-400')}>
          <ReceiptIcon size={18} />
        </span>
        <div className="flex-1">
          <p className="font-semibold text-ink">PPN {settings.taxRatePercent}%</p>
          <p className="text-[12.5px] text-ink-3">
            {taxEnabled ? `Setiap transaksi ditambah PPN ${settings.taxRatePercent}% dari total setelah diskon` : 'Transaksi tidak dikenakan PPN'}
          </p>
        </div>
        <Switch value={taxEnabled} onChange={setTaxEnabled} disabled={!isManager} label="PPN" />
      </div>

      {isManager ? (
        <Button onClick={onSave} loading={saving} disabled={!dirty || saving} className="mt-6">
          Simpan Pengaturan
        </Button>
      ) : null}
    </div>
  );
}
