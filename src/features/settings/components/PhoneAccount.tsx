'use client';

import { useRouter } from 'next/navigation';

import { APP_VERSION } from '@/config/site';
import { useAppSelector } from '@/hooks/store';
import { useMenuAccess } from '@/hooks/useMenuAccess';
import { PageBody } from '@/components/common/PageHeader';
import { BoxIcon, LogoutIcon, GlobeIcon } from '@/components/ui/icons/NavIcons';
import { DiscountIcon, WalletIcon } from '@/components/ui/icons/DataIcons';
import { LockIcon } from '@/components/ui/icons/ActionIcons';
import { LinkRow, LinkList } from '@/features/settings/components/SettingsDetail';
import { SessionCard } from '@/features/account/components/SessionCard';
import { AccountHero } from '@/features/account/components/AccountHero';
import type { SettingsHandlers } from '@/features/settings/types';

/** Layar Akun versi HP (padanan ProfileScreen mobile). */
export function PhoneAccount({ onCloseSession, onChangePassword, onLogoutAll }: SettingsHandlers) {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const session = useAppSelector((state) => state.cashierSession.current);
  const { isManager } = useMenuAccess();
  const isKepalaToko = !!user?.roles.some((r) => r.roleCode === 'KEPALA_TOKO');
  const sectionTitle = 'mb-2 ml-1 text-[11.5px] font-bold tracking-[0.08em] text-ink-3';

  return (
    <PageBody className="space-y-5">
      <AccountHero />
      <div>
        <p className={sectionTitle}>SESI KASIR</p>
        <SessionCard session={session} onClose={onCloseSession} />
      </div>
      {isManager ? (
        <div>
          <p className={sectionTitle}>PENGATURAN TOKO</p>
          <LinkList>
            <LinkRow icon={WalletIcon} tint="bg-primary-50 text-primary-600" label="Pembayaran & PPN" hint="Metode bayar, default & pajak" onClick={() => router.push('/settings/checkout')} />
            <LinkRow icon={DiscountIcon} tint="bg-success-50 text-success-600" label="Kode Promo" hint="Buat & kelola kode diskon" onClick={() => router.push('/promo-codes')} />
            <LinkRow icon={GlobeIcon} tint="bg-info-50 text-info-700" label="Toko Online" hint="Halaman toko & pesanan online" onClick={() => router.push('/storefront')} />
            <LinkRow icon={BoxIcon} tint="bg-warning-50 text-warning-600" label="Paket Bundling" hint="Gabung produk, harga khusus" onClick={() => router.push('/bundles')} />
            {isKepalaToko ? <LinkRow icon={LockIcon} tint="bg-info-50 text-info-700" label="Hak Akses Menu" hint="Menu & aksi untuk Produk, Gudang, Kasir" onClick={() => router.push('/menu-access')} /> : null}
          </LinkList>
        </div>
      ) : null}
      <div>
        <p className={sectionTitle}>KEAMANAN</p>
        <LinkList>
          <LinkRow icon={LockIcon} tint="bg-warning-50 text-warning-600" label="Ganti Kata Sandi" hint="Perbarui kata sandi akun ini" onClick={onChangePassword} />
          <LinkRow icon={LogoutIcon} tint="bg-error-50 text-error-600" label="Keluar dari Semua Perangkat" hint="Cabut semua sesi login akun ini" danger onClick={onLogoutAll} />
        </LinkList>
      </div>
      <p className="text-center text-[12.5px] text-ink-3">cassier-Q Web v{APP_VERSION}</p>
    </PageBody>
  );
}
