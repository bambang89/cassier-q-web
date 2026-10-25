'use client';

import { useEffect, useRef, useState } from 'react';

import type { Product } from '@/types/models';
import { fetchProductByBarcode } from '@/services/productsApi';
import { Alert } from '@/lib/alert';
import { detectorCtor } from '@/utils/barcode';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { BarcodeIcon } from '@/components/ui/icons/ActionIcons';

/**
 * Padanan ScannerScreen mobile. Kamera + BarcodeDetector (Chrome/Edge/Android)
 * bila tersedia; selain itu barcode bisa diketik/di-scan dengan scanner USB.
 */
export function BarcodeScanner({
  isOpen,
  onClose,
  onFound,
  onNotFound,
}: {
  isOpen: boolean;
  onClose: () => void;
  onFound: (product: Product) => void;
  onNotFound?: (barcode: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [manual, setManual] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const busy = useRef(false);
  const supported = !!detectorCtor();

  const lookup = async (value: string) => {
    const barcode = value.trim();
    if (!barcode || busy.current) return;
    busy.current = true;
    setLookingUp(true);
    try {
      const product = await fetchProductByBarcode(barcode);
      if (product) {
        onFound(product);
        onClose();
      } else if (onNotFound) {
        onNotFound(barcode);
        onClose();
      } else {
        Alert.alert('Tidak ditemukan', `Produk dengan barcode ${barcode} tidak ada.`);
      }
    } catch {
      Alert.alert('Error', 'Gagal mencari produk.');
    } finally {
      busy.current = false;
      setLookingUp(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const Ctor = detectorCtor();
    if (!Ctor || !navigator.mediaDevices?.getUserMedia) return;
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let stopped = false;
    const detector = new Ctor({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'] });

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((s) => {
        if (stopped) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = s;
        video.play().catch(() => undefined);
        let last = '';
        timer = setInterval(async () => {
          if (busy.current || video.readyState < 2) return;
          try {
            const codes = await detector.detect(video);
            const value = codes[0]?.rawValue;
            if (value && value !== last) {
              last = value;
              lookup(value);
            }
          } catch {
            // frame belum siap — coba lagi di tick berikutnya
          }
        }, 300);
      })
      .catch(() => setCameraError('Aplikasi butuh akses kamera untuk scan barcode.'));

    return () => {
      stopped = true;
      if (timer) clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Scan Barcode" size="md">
      {supported && !cameraError ? (
        <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-black">
          <video ref={videoRef} className="size-full object-cover" muted playsInline />
          <div className="pointer-events-none absolute inset-x-10 top-1/2 h-24 -translate-y-1/2 rounded-lg border-2 border-white/80" />
          {lookingUp ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">Mencari produk…</div>
          ) : null}
        </div>
      ) : (
        <div className="mb-4 flex flex-col items-center gap-2 rounded-xl bg-gray-50 p-5 text-center text-sm text-ink-2">
          <BarcodeIcon size={28} className="text-primary-600" />
          {cameraError ??
            'Browser ini belum mendukung scan lewat kamera. Ketik barcode di bawah, atau pakai scanner barcode USB.'}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          lookup(manual);
        }}
        className="flex gap-2"
      >
        <Input
          autoFocus
          wrapperClassName="flex-1"
          placeholder="Ketik / scan barcode lalu Enter"
          value={manual}
          onChange={(e) => setManual(e.target.value)}
        />
        <Button type="submit" loading={lookingUp} disabled={!manual.trim()}>
          Cari
        </Button>
      </form>
    </Modal>
  );
}
