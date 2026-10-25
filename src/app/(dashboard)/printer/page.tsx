'use client';

import { useEffect, useState } from 'react';

import { getPaperWidth, savePaperWidth } from '@/services/printing/settings';
import type { PaperWidth } from '@/services/printing/types';
import { useAppSelector } from '@/hooks/store';
import { PageBody, PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { CheckIcon, PrintIcon } from '@/components/ui/icons/ActionIcons';
import { PaperWidthPicker } from '@/features/orders/components/PaperWidthPicker';

const TIPS = [
  'Jadikan printer struk (thermal/USB/Bluetooth yang sudah terpasang di komputer) sebagai printer default sistem.',
  'Di dialog cetak browser, matikan "Header dan footer" dan atur margin ke "Tidak ada".',
  'Pilih ukuran kertas yang sama dengan printer: 58mm untuk printer kecil, 80mm untuk printer POS standar.',
];

/**
 * Padanan PrinterSettingsScreen mobile. Browser tidak bisa memasangkan printer
 * Bluetooth langsung — struk dicetak lewat dialog cetak sistem.
 */
export default function PrinterSettingsPage() {
  const storeName = useAppSelector((state) => state.storeProfile.profile?.storeName ?? 'cassier-Q');
  const [paperWidth, setPaperWidth] = useState<PaperWidth>(58);

  useEffect(() => {
    getPaperWidth().then(setPaperWidth);
  }, []);

  const onChange = (width: PaperWidth) => {
    setPaperWidth(width);
    savePaperWidth(width);
  };

  const testPrint = () => {
    const style = document.createElement('style');
    style.textContent = `@page { size: ${paperWidth}mm auto; margin: 3mm; }`;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => style.remove(), 500);
  };

  return (
    <>
      <PageHeader title="Printer Struk" subtitle="Ukuran kertas & cara mencetak" backHref="/settings" />
      <PageBody>
        <div className="mx-auto grid max-w-[960px] gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <p className="mb-1 font-bold text-ink">Ukuran kertas</p>
              <p className="mb-3 text-[13px] text-ink-3">Dipakai untuk pratinjau dan cetak struk di halaman Struk.</p>
              <PaperWidthPicker value={paperWidth} onChange={onChange} />
            </section>
            <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <p className="mb-3 font-bold text-ink">Cara mencetak dari browser</p>
              <ul className="space-y-3">
                {TIPS.map((tip, i) => (
                  <li key={i} className="flex gap-3 text-sm text-ink-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[12px] font-bold text-primary-600">{i + 1}</span>
                    {tip}
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-lg bg-gray-50 p-3 text-[12.5px] text-ink-3">
                Pemasangan printer Bluetooth langsung dari aplikasi hanya tersedia di aplikasi cassier-Q untuk HP/tablet.
              </p>
            </section>
          </div>
          <aside className="space-y-3 lg:sticky lg:top-0 lg:self-start">
            <div className="print-area mx-auto bg-white p-4 font-mono text-[12px] leading-5 text-gray-900 shadow-lg" style={{ maxWidth: paperWidth === 58 ? 260 : 340 }}>
              <p className="text-center font-bold">{storeName}</p>
              <p className="text-center">Uji cetak struk</p>
              <p className="my-1 border-t border-dashed border-gray-500" />
              <div className="flex justify-between">
                <span>Kertas</span>
                <span>{paperWidth} mm</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu</span>
                <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="my-1 border-t border-dashed border-gray-500" />
              <p className="flex items-center justify-center gap-1 text-center">
                <CheckIcon size={12} /> Printer siap dipakai
              </p>
            </div>
            <Button fullWidth leftIcon={<PrintIcon size={16} />} onClick={testPrint}>
              Uji Cetak
            </Button>
          </aside>
        </div>
      </PageBody>
    </>
  );
}
