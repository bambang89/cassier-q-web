'use client';

import type { CashierSession } from '@/types/models';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';

/** "2 jam 15 mnt" sejak waktu tertentu. */
function durationSince(iso: string): string {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours} jam ${minutes % 60} mnt` : `${minutes} mnt`;
}

export function SessionCard({ session, onClose }: { session: CashierSession | null; onClose: () => void }) {
  return (
    <div className="space-y-3 rounded-xl border border-line bg-white p-4">
      <div className="flex items-center justify-between">
        <span className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-semibold', session ? 'bg-success-50 text-success-700' : 'bg-gray-100 text-gray-600')}>
          <span className={cn('size-[7px] rounded-full', session ? 'bg-success-500' : 'bg-gray-400')} />
          {session ? 'Sedang dibuka' : 'Belum dibuka'}
        </span>
        <span className="text-[12.5px] text-ink-3">Tutup otomatis 23.00</span>
      </div>
      {session ? (
        <>
          <div className="grid grid-cols-3 divide-x divide-line rounded-lg bg-gray-50 py-3 text-center">
            <div>
              <p className="text-[12.5px] text-ink-3">Dibuka</p>
              <p className="font-bold text-ink">{new Date(session.openedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div>
              <p className="text-[12.5px] text-ink-3">Durasi</p>
              <p className="font-bold text-ink">{durationSince(session.openedAt)}</p>
            </div>
            <div>
              <p className="text-[12.5px] text-ink-3">Modal awal</p>
              <p className="font-bold text-ink">Rp{session.openingCash.toLocaleString('id-ID')}</p>
            </div>
          </div>
          <Button variant="outline" fullWidth onClick={onClose}>
            Tutup Sesi & Hitung Kas
          </Button>
        </>
      ) : (
        <p className="text-sm leading-5 text-ink-2">Buka sesi dari layar Kasir untuk mulai mencatat penjualan hari ini.</p>
      )}
    </div>
  );
}
