'use client';

import { useEffect, useState } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout, logoutAll } from '@/store/slices/authSlice';
import { fetchCurrentSession } from '@/store/slices/cashierSessionSlice';
import { fetchStoreProfile } from '@/store/slices/storeProfileSlice';
import { useMenuAccess } from '@/navigation/menu';
import { cn } from '@/lib/cn';
import { useIsWide } from '@/lib/useMedia';
import { PageBody, PageHeader } from '@/components/layout/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import type { LineIconProps } from '@/components/icons/LineIcons';
import {
  BellIcon,
  BoxIcon,
  ChevronRightIcon,
  CreditCardIcon,
  DiscountIcon,
  GlobeIcon,
  LockIcon,
  LogoutIcon,
  PersonIcon,
  PrintIcon,
  ReceiptIcon,
  StoreIcon,
  TruckIcon,
  WalletIcon,
} from '@/components/icons/LineIcons';
import { AccountHero } from '@/features/account/AccountHero';
import { SessionCard } from '@/features/account/SessionCard';
import { ChangePasswordForm, CloseSessionForm } from '@/features/account/AccountForms';
import { CheckoutSettingsForm } from '@/features/settings/CheckoutSettingsForm';
import { PromoCodeList } from '@/features/settings/PromoCodeList';
import { BundleList } from '@/features/settings/BundleList';

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? '0.1.0';

// Hanya pengaturan yang tidak punya menu sendiri di sidebar (Outlet, Karyawan, dll. ada di sidebar).
const SECTIONS = [
  { key: 'akun', label: 'Akun', icon: PersonIcon, available: true },
  { key: 'pembayaran', label: 'Pembayaran & PPN', icon: WalletIcon, available: true },
  { key: 'promo', label: 'Kode Promo', icon: DiscountIcon, available: true },
  { key: 'paket', label: 'Paket Bundling', icon: BoxIcon, available: true },
  { key: 'pembelian', label: 'Pembelian', icon: TruckIcon, available: true },
  { key: 'struk', label: 'Struk & Printer', icon: PrintIcon, available: true },
  { key: 'pengguna', label: 'Hak Akses', icon: LockIcon, available: true },
  { key: 'keamanan', label: 'Keamanan', icon: LockIcon, available: true },
  { key: 'notifikasi', label: 'Notifikasi', icon: BellIcon, available: false },
  { key: 'langganan', label: 'Langganan', icon: CreditCardIcon, available: false },
] as const;

type SectionKey = (typeof SECTIONS)[number]['key'];

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const isWide = useIsWide();
  const session = useAppSelector((state) => state.cashierSession.current);
  const [closeSessionVisible, setCloseSessionVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [logoutAllVisible, setLogoutAllVisible] = useState(false);
  const [section, setSection] = useState<SectionKey>('akun');

  useEffect(() => {
    dispatch(fetchCurrentSession());
    dispatch(fetchStoreProfile());
  }, [dispatch]);

  const handlers = {
    onCloseSession: () => setCloseSessionVisible(true),
    onChangePassword: () => setChangePasswordVisible(true),
    onLogout: () => setLogoutVisible(true),
    onLogoutAll: () => setLogoutAllVisible(true),
  };

  return (
    <>
      <PageHeader title="Pengaturan" subtitle="Konfigurasi bisnis dan preferensi akun" phoneTitle="Akun" />

      {isWide ? (
        <div className="flex min-h-0 flex-1">
          <nav className="w-[260px] shrink-0 space-y-0.5 overflow-y-auto border-r border-gray-150 bg-white p-3">
            {SECTIONS.map((item) => {
              const Icon = item.icon;
              const active = section === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSection(item.key)}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13.5px] font-semibold transition',
                    active ? 'bg-primary-50 text-primary-700' : 'text-ink-2 hover:bg-gray-50 hover:text-ink',
                  )}
                >
                  <Icon size={17} className={active ? 'text-primary-600' : 'text-gray-400'} />
                  <span className="flex-1">{item.label}</span>
                  {!item.available ? <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">SOON</span> : null}
                </button>
              );
            })}
          </nav>
          <div className="scroll-thin min-w-0 flex-1 overflow-y-auto bg-gray-25">
            <div key={section} className="animate-slide-in p-6 xl:p-8">
              <SettingsDetail section={section} {...handlers} />
            </div>
          </div>
        </div>
      ) : (
        <PhoneAccount {...handlers} />
      )}

      <Modal isOpen={closeSessionVisible} onClose={() => setCloseSessionVisible(false)}>
        {session ? <CloseSessionForm sessionId={session.id} onDone={() => setCloseSessionVisible(false)} onCancel={() => setCloseSessionVisible(false)} /> : null}
      </Modal>
      <Modal isOpen={changePasswordVisible} onClose={() => setChangePasswordVisible(false)}>
        <ChangePasswordForm onDone={() => setChangePasswordVisible(false)} onCancel={() => setChangePasswordVisible(false)} />
      </Modal>
      <AlertDialog
        isOpen={logoutVisible}
        onClose={() => setLogoutVisible(false)}
        title="Keluar dari akun?"
        description="Anda perlu masuk lagi untuk memakai aplikasi di perangkat ini."
        confirmText="Keluar"
        isDanger
        onConfirm={() => {
          setLogoutVisible(false);
          dispatch(logout());
        }}
      />
      <AlertDialog
        isOpen={logoutAllVisible}
        onClose={() => setLogoutAllVisible(false)}
        title="Keluar dari semua perangkat?"
        description="Semua sesi login akun ini — di perangkat manapun — akan langsung dicabut."
        confirmText="Keluar Semua"
        isDanger
        onConfirm={() => {
          setLogoutAllVisible(false);
          dispatch(logoutAll());
        }}
      />
    </>
  );
}

type Handlers = { onCloseSession: () => void; onChangePassword: () => void; onLogout: () => void; onLogoutAll: () => void };

function DetailHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      {description ? <p className="mt-0.5 text-sm text-ink-2">{description}</p> : null}
    </div>
  );
}

function LinkList({ children }: { children: ReactNode }) {
  return <div className="max-w-[640px] overflow-hidden rounded-xl border border-line bg-white">{children}</div>;
}

function LinkRow({
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

function SettingsDetail({ section, onCloseSession, onChangePassword, onLogout, onLogoutAll }: { section: SectionKey } & Handlers) {
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

/** Layar Akun versi HP (padanan ProfileScreen mobile). */
function PhoneAccount({ onCloseSession, onChangePassword, onLogoutAll }: Handlers) {
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
