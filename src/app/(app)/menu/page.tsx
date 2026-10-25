'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { Alert } from '@/lib/alert';
import { MENU_CATALOG, initialsOf, useMenuAccess } from '@/navigation/menu';
import type { MenuKey } from '@/navigation/menu';
import { PageBody, PageHeader } from '@/components/layout/PageHeader';
import { AlertDialog } from '@/components/ui/AlertDialog';
import type { LineIconProps } from '@/components/icons/LineIcons';
import { ChevronRightIcon, GlobeIcon, HelpIcon, LogoutIcon, SettingsIcon, StoreIcon } from '@/components/icons/LineIcons';

type Item = { key: string; label: string; hint: string; icon: React.ComponentType<LineIconProps>; tint: string; onClick: () => void };

const SECTION_KEYS: { title: string; keys: MenuKey[] }[] = [
  { title: 'Operasional', keys: ['pesanan', 'inventory', 'customers', 'expenses'] },
  { title: 'Bisnis', keys: ['reports', 'suppliers', 'purchase_orders', 'categories', 'units', 'employees', 'outlet', 'integrations'] },
];

/** Menu sekunder di HP — pintu ke semua layar di luar bottom tab bar. */
export default function MenuPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const activeStore = useAppSelector((state) => state.access.activeStore);
  const { can, isSuperadmin, isManager } = useMenuAccess();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const role = user?.roles?.[0];
  const roleLabel = user?.superadmin ? 'Pemilik Aplikasi' : (role?.roleName ?? '-');
  const storeLabel = isSuperadmin ? (activeStore?.name ?? 'Belum memilih toko') : (role?.storeName ?? '-');
  const fromCatalog = (key: MenuKey): Item => {
    const entry = MENU_CATALOG[key];
    return { key, label: entry.label, hint: entry.hint, icon: entry.icon, tint: entry.tint, onClick: () => router.push(entry.href) };
  };

  const sections = [
    ...SECTION_KEYS.map((section) => ({ title: section.title, items: section.keys.filter(can).map(fromCatalog) })),
    {
      title: 'Akun & Perangkat',
      items: [
        ...(isManager
          ? [{ key: 'storefront', label: 'Toko Online', hint: 'Atur halaman toko untuk pembeli', icon: GlobeIcon, tint: 'bg-info-50 text-info-700', onClick: () => router.push('/storefront') }]
          : []),
        { key: 'settings', label: 'Pengaturan', hint: 'Akun, toko, hak akses & keamanan', icon: SettingsIcon, tint: 'bg-gray-100 text-gray-700', onClick: () => router.push('/settings') },
        ...(can('printer') ? [fromCatalog('printer')] : []),
        {
          key: 'help',
          label: 'Bantuan',
          hint: 'Hubungi dukungan cassier-Q',
          icon: HelpIcon,
          tint: 'bg-gray-100 text-gray-700',
          onClick: () => Alert.alert('Bantuan', 'Hubungi admin toko atau dukungan cassier-Q untuk bantuan.'),
        },
      ],
    },
  ].filter((section) => section.items.length > 0);

  const onLogout = async () => {
    setLoggingOut(true);
    try {
      await dispatch(logout());
    } finally {
      setLoggingOut(false);
      setConfirmLogout(false);
    }
  };

  let itemIndex = 0;

  return (
    <>
      <PageHeader title="Menu" subtitle={`${user?.name ?? '-'} · ${roleLabel}`} />
      <PageBody className="space-y-5">
        <div className="relative flex animate-[pop-in_0.35s_ease-out_both] items-center gap-3 overflow-hidden rounded-2xl bg-navy-900 p-5">
          <div className="absolute -top-14 -right-10 size-40 rounded-full bg-primary-600 opacity-30" />
          <span className="relative flex size-[52px] items-center justify-center overflow-hidden rounded-full border-2 border-white/20 bg-primary-600 text-[17px] font-bold text-white">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              initialsOf(user?.name)
            )}
          </span>
          <div className="relative min-w-0 flex-1">
            <p className="truncate text-xl font-bold text-white">{user?.name ?? '-'}</p>
            <p className="truncate text-[13px] text-white/70">{`${roleLabel} · ${storeLabel}`}</p>
          </div>
        </div>
        {isSuperadmin ? (
          <button
            type="button"
            onClick={() => router.push('/stores')}
            className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-primary-100 bg-primary-50 px-4 py-3 text-left"
          >
            <StoreIcon size={16} className="text-primary-600" />
            <span className="flex-1 text-sm font-semibold text-primary-700">Ganti toko yang dibantu</span>
            <ChevronRightIcon size={16} className="text-primary-600" />
          </button>
        ) : null}

        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 ml-1 text-[11.5px] font-bold tracking-[0.08em] text-ink-3">{section.title.toUpperCase()}</p>
            <div className="overflow-hidden rounded-xl border border-line bg-white">
              {section.items.map((item) => {
                const Icon = item.icon;
                const delay = itemIndex++ * 30;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={item.onClick}
                    style={{ animationDelay: `${delay}ms` }}
                    className="flex w-full animate-fade-in cursor-pointer items-center gap-3 border-b border-gray-100 px-4 py-3 text-left last:border-0 active:bg-gray-50"
                  >
                    <span className={`flex size-[38px] items-center justify-center rounded-lg ${item.tint}`}>
                      <Icon size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-ink">{item.label}</span>
                      <span className="block truncate text-[12.5px] text-ink-3">{item.hint}</span>
                    </span>
                    <ChevronRightIcon size={18} className="text-gray-400" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setConfirmLogout(true)}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-error-100 bg-white py-3.5 font-semibold text-error-600"
        >
          <LogoutIcon size={18} /> Keluar
        </button>
      </PageBody>

      <AlertDialog
        isOpen={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        title="Keluar dari akun?"
        description="Anda perlu masuk lagi untuk memakai aplikasi di perangkat ini."
        confirmText="Keluar"
        cancelText="Batal"
        isDanger
        isConfirmLoading={loggingOut}
        onConfirm={onLogout}
      />
    </>
  );
}
