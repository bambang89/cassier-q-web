'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { Alert } from '@/lib/alert';
import { useAppSelector } from '@/store/hooks';
import { BellIcon, ChevronDownIcon, ChevronLeftIcon, StoreIcon } from '@/components/icons/LineIcons';
import { PHONE_TAB_HREFS, initialsOf } from '@/navigation/menu';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Tombol aksi di kanan (mis. "Tambah Produk"). */
  right?: ReactNode;
  /**
   * Tujuan tombol kembali. Default: layar di luar tab bar HP kembali ke /menu
   * (di HP saja); layar detail sebaiknya mengisi ini (mis. "/orders").
   */
  backHref?: string;
  /** Judul/subjudul khusus HP bila berbeda dari layar lebar. */
  phoneTitle?: string;
  phoneSubtitle?: string;
}

/**
 * Satu header untuk dua kerangka, seperti aplikasi mobile:
 * - layar lebar: TabletTopBar (judul, chip outlet, notifikasi, avatar);
 * - HP: Header (tombol kembali ke Menu bila perlu, judul, notifikasi, avatar).
 */
export function PageHeader({ title, subtitle, right, backHref, phoneTitle, phoneSubtitle }: PageHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);
  const activeStoreName = useAppSelector((state) => state.access.activeStore?.name);
  const isSuperadmin = !!user?.superadmin;
  const storeName = isSuperadmin ? (activeStoreName ?? 'Pilih toko') : (user?.roles?.[0]?.storeName ?? 'Outlet');
  const isPhoneTab = PHONE_TAB_HREFS.includes(pathname);
  const phoneBack = backHref ?? (isPhoneTab ? undefined : '/menu');
  const initials = initialsOf(user?.name);

  const onStoreChip = () =>
    isSuperadmin ? router.push('/stores') : Alert.alert('Outlet', 'Akun ini terhubung ke satu outlet.');
  const onBell = () => Alert.alert('Notifikasi', 'Belum ada notifikasi baru.');

  return (
    <>
      {/* Layar lebar */}
      <header className="hidden h-16 shrink-0 items-center justify-between gap-4 border-b border-gray-150 bg-white px-6 tab:flex">
        <div className="flex min-w-0 items-center gap-3">
          {backHref ? (
            <Link
              href={backHref}
              aria-label="Kembali"
              className="flex size-9 items-center justify-center rounded-md border border-line bg-gray-50 text-gray-700 hover:bg-gray-100"
            >
              <ChevronLeftIcon size={18} />
            </Link>
          ) : null}
          <div className="min-w-0">
            <h1 className="truncate text-lg leading-tight font-bold text-gray-900">{title}</h1>
            {subtitle ? <p className="mt-px truncate text-[11.5px] text-gray-500">{subtitle}</p> : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          {right}
          <button
            type="button"
            onClick={onStoreChip}
            className="flex cursor-pointer items-center gap-[7px] rounded-md border border-gray-200 bg-gray-50 px-3 py-[7px] text-[12.5px] font-semibold text-gray-700 hover:bg-gray-100"
          >
            <StoreIcon size={14} />
            <span className="max-w-[140px] truncate">{storeName}</span>
            <ChevronDownIcon size={14} />
          </button>
          <button
            type="button"
            onClick={onBell}
            aria-label="Notifikasi"
            className="flex size-9 cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          >
            <BellIcon size={17} />
          </button>
          <Link
            href="/settings"
            aria-label="Pengaturan akun"
            className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-primary-600 text-xs font-bold text-white"
          >
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              initials.charAt(0)
            )}
          </Link>
        </div>
      </header>

      {/* HP */}
      <header className="sticky top-0 z-30 flex shrink-0 items-center gap-3 border-b border-line bg-white px-5 pt-[max(env(safe-area-inset-top),8px)] pb-3 tab:hidden">
        {phoneBack ? (
          <Link
            href={phoneBack}
            aria-label="Kembali"
            className="flex size-9 shrink-0 items-center justify-center rounded-md border border-line bg-gray-50 text-gray-700 active:scale-90"
          >
            <ChevronLeftIcon size={20} />
          </Link>
        ) : null}
        <div className="min-w-0 flex-1 animate-[fade-in_0.32s_ease-out_both]">
          <h1 className="truncate text-xl leading-[26px] font-bold text-ink">{phoneTitle ?? title}</h1>
          {(phoneSubtitle ?? subtitle) ? (
            <p className="mt-px truncate text-[13px] text-ink-3">{phoneSubtitle ?? subtitle}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {right}
          {!phoneBack ? (
            <>
              <button
                type="button"
                onClick={onBell}
                aria-label="Notifikasi"
                className="flex size-[38px] cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 active:scale-90"
              >
                <BellIcon size={17} />
              </button>
              <Link
                href="/menu"
                aria-label="Menu akun"
                className="flex size-[38px] items-center justify-center overflow-hidden rounded-full bg-primary-600 text-[13px] font-bold text-white active:scale-90"
              >
                {user?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt="" className="size-full object-cover" />
                ) : (
                  initials
                )}
              </Link>
            </>
          ) : null}
        </div>
      </header>
    </>
  );
}

/** Area konten yang bisa di-scroll di bawah header. */
export function PageBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`scroll-thin min-h-0 flex-1 overflow-y-auto p-5 tab:p-6 ${className}`}>{children}</div>;
}
