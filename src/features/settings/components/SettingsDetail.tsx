'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode, ComponentType } from 'react';

import type { LineIconProps } from '@/types/ui';
import { useAppSelector } from '@/hooks/store';
import { useMenuAccess } from '@/hooks/useMenuAccess';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { ReceiptIcon, StoreIcon, LogoutIcon } from '@/components/ui/icons/NavIcons';
import { TruckIcon } from '@/components/ui/icons/DataIcons';
import { LockIcon, PrintIcon, ChevronRightIcon } from '@/components/ui/icons/ActionIcons';
import { BundleList } from '@/features/settings/components/BundleList';
import { SessionCard } from '@/features/account/components/SessionCard';
import { AccountHero } from '@/features/account/components/AccountHero';
import type { SettingsSectionKey, SettingsHandlers } from '@/features/settings/types';
import { SECTIONS } from '@/features/settings/constants';
import { CheckoutSettingsForm } from '@/features/settings/components/CheckoutSettingsForm';
import { PromoCodeList } from '@/features/settings/components/PromoCodeList';

export function SettingsDetail({ section, onCloseSession, onChangePassword, onLogout, onLogoutAll }: { section: SettingsSectionKey } & SettingsHandlers) {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const session = useAppSelector((state) => state.cashierSession.current);
  const { can, isSuperadmin } = useMenuAccess();
  const isKepalaToko = !!user?.roles.some((r) => r.roleCode === 'KEPALA_TOKO');
  const meta = SECTIONS.find((s) => s.key === section)!;

  switch (section) {
    case 'akun':
      return (
        <div className="max-w-[640px] space-y-5">
          <DetailHeader title="Akun" description="Profil, foto, dan sesi kasir Anda." />
          <AccountHero />
          <div>
            <p className="mb-2 text-[11.5px] font-bold tracking-[0.08em] text-ink-3">SESI KASIR</p>
            <SessionCard session={session} onClose={onCloseSession} />
          </div>
          <Button variant="dangerOutline" leftIcon={<LogoutIcon size={16} />} onClick={onLogout}>
            Keluar
          </Button>
        </div>
      );
    case 'pembayaran':
      return (
        <>
          <DetailHeader title="Pembayaran & PPN" description="Metode pembayaran yang diterima toko, metode default, dan PPN." />
          <CheckoutSettingsForm />
        </>
      );
    case 'promo':
      return (
        <>
          <DetailHeader title="Kode Promo" description="Buat kode promo yang bisa dimasukkan kasir saat pembayaran." />
          <PromoCodeList />
        </>
      );
    case 'paket':
      return (
        <>
          <DetailHeader title="Paket Bundling" description="Gabungkan beberapa produk jadi satu paket dengan harga khusus. Khusus Kepala Toko." />
          <BundleList />
        </>
      );
    case 'pembelian':
      return (
        <>
          <DetailHeader title="Pembelian" description="Pemasok dan pembelian stok ke supplier." />
          {can('suppliers') || can('purchase_orders') ? (
            <LinkList>
              {can('suppliers') ? <LinkRow icon={TruckIcon} tint="bg-info-50 text-info-700" label="Pemasok" hint="Daftar supplier barang" onClick={() => router.push('/suppliers')} /> : null}
              {can('purchase_orders') ? <LinkRow icon={ReceiptIcon} tint="bg-success-50 text-success-600" label="Purchase Order" hint="Pembelian stok ke supplier" onClick={() => router.push('/purchase-orders')} /> : null}
            </LinkList>
          ) : (
            <p className="text-sm text-ink-3">Menu pembelian tidak tersedia untuk role Anda.</p>
          )}
        </>
      );
    case 'struk':
      return (
        <>
          <DetailHeader title="Struk & Printer" description="Ukuran kertas struk dan cara mencetak dari browser." />
          <LinkList>
            <LinkRow icon={PrintIcon} tint="bg-gray-100 text-gray-700" label="Printer & Ukuran Kertas" hint="58mm / 80mm, uji cetak" onClick={() => router.push('/printer')} />
          </LinkList>
        </>
      );
    case 'pengguna':
      return (
        <>
          <DetailHeader
            title="Hak Akses"
            description={isKepalaToko ? 'Tentukan menu dan aksi yang boleh dipakai tiap role. Akun karyawan dikelola di menu Karyawan.' : 'Hak akses hanya bisa diatur oleh Kepala Toko.'}
          />
          {isKepalaToko || isSuperadmin ? (
            <LinkList>
              {isKepalaToko ? <LinkRow icon={LockIcon} tint="bg-info-50 text-info-700" label="Hak Akses Menu per Role" hint="Menu & aksi untuk Produk, Gudang, Kasir" onClick={() => router.push('/menu-access')} /> : null}
              {isSuperadmin ? <LinkRow icon={StoreIcon} tint="bg-primary-50 text-primary-600" label="Ganti Toko yang Dibantu" hint="Pilih toko lain" onClick={() => router.push('/stores')} /> : null}
            </LinkList>
          ) : null}
        </>
      );
    case 'keamanan':
      return (
        <div className="max-w-[640px] space-y-4">
          <DetailHeader title="Keamanan" description="Kata sandi dan sesi login akun ini." />
          <LinkList>
            <LinkRow icon={LockIcon} tint="bg-warning-50 text-warning-600" label="Ganti Kata Sandi" hint="Perbarui kata sandi akun ini" onClick={onChangePassword} />
            <LinkRow icon={LogoutIcon} tint="bg-error-50 text-error-600" label="Keluar dari Semua Perangkat" hint="Cabut semua sesi login akun ini" danger onClick={onLogoutAll} />
          </LinkList>
        </div>
      );
    default:
      return (
        <>
          <DetailHeader title={meta.label} />
          <div className="flex max-w-[640px] flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <span className="rounded-full bg-warning-100 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-warning-700 uppercase">Segera Hadir</span>
            <p className="text-ink-3">Fitur ini sedang disiapkan.</p>
          </div>
        </>
      );
  }
}

export function DetailHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      {description ? <p className="mt-0.5 text-sm text-ink-2">{description}</p> : null}
    </div>
  );
}

export function LinkList({ children }: { children: ReactNode }) {
  return <div className="max-w-[640px] overflow-hidden rounded-xl border border-line bg-white">{children}</div>;
}

export function LinkRow({
  icon: Icon,
  tint,
  label,
  hint,
  onClick,
  danger,
}: {
  icon: ComponentType<LineIconProps>;
  tint: string;
  label: string;
  hint: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} className="flex w-full cursor-pointer items-center gap-3 border-b border-gray-100 px-4 py-3 text-left last:border-0 hover:bg-gray-25">
      <span className={cn('flex size-[38px] shrink-0 items-center justify-center rounded-lg', tint)}>
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn('block text-sm font-semibold', danger ? 'text-error-600' : 'text-ink')}>{label}</span>
        <span className="block truncate text-[12.5px] text-ink-3">{hint}</span>
      </span>
      <ChevronRightIcon size={18} className="text-gray-400" />
    </button>
  );
}
