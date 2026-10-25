'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { SIDEBAR_ITEMS } from '@/config/navigation';
import { Alert } from '@/lib/alert';
import { useAppSelector } from '@/hooks/store';
import { useMenuAccess } from '@/hooks/useMenuAccess';
import { cn } from '@/utils/cn';
import { initialsOf } from '@/utils/text';
import { HelpIcon } from '@/components/ui/icons/NavIcons';
import { useNewOrderCount } from '@/features/customer-orders/hooks/useNewOrderCount';

/** Rail navy 82px di kiri — padanan SidebarTabBar (mode tablet) di aplikasi mobile. */
export function Sidebar() {
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);
  const { can, isManager } = useMenuAccess();
  const items = SIDEBAR_ITEMS.filter((item) => (item.managerOnly ? isManager : item.menuKey === null || can(item.menuKey)));
  const newOrders = useNewOrderCount(can('pesanan'));

  return (
    <nav className="hidden w-[82px] shrink-0 flex-col items-center bg-navy-900 py-4 tab:flex">
      <Link href="/dashboard" className="mb-5" aria-label="cassier-Q">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/branding/cassier-q-symbol.svg" alt="" className="size-9" />
      </Link>

      <div className="no-scrollbar flex w-full flex-1 flex-col items-center gap-1 overflow-y-auto px-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex h-[50px] w-[54px] shrink-0 flex-col items-center justify-center gap-[3px] rounded-xl transition-all duration-200 active:scale-[0.92]',
                active ? 'bg-primary-600 text-white shadow-rail' : 'text-rail-muted hover:bg-white/5 hover:text-white',
              )}
            >
              <Icon size={20} strokeWidth={1.7} />
              {item.menuKey === 'pesanan' && newOrders > 0 ? (
                <span className="absolute top-1 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error-500 px-1 text-[9.5px] font-bold text-white">
                  {newOrders > 99 ? '99+' : newOrders}
                </span>
              ) : null}
              <span className={cn('max-w-full truncate text-[8.5px]', active ? 'font-bold' : 'font-semibold')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="flex w-full flex-col items-center">
        <div className="mb-2 h-px w-4/5 bg-white/15" />
        <button
          type="button"
          aria-label="Bantuan"
          onClick={() => Alert.alert('Bantuan', 'Hubungi admin toko atau dukungan cassier-Q untuk bantuan.')}
          className="mb-1 flex size-10 cursor-pointer items-center justify-center rounded-md text-rail-muted hover:text-white"
        >
          <HelpIcon size={19} />
        </button>
        <Link
          href="/settings"
          aria-label="Profil"
          className="mt-1 flex size-9 items-center justify-center overflow-hidden rounded-full bg-primary-600 text-sm font-bold text-white"
        >
          {user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            initialsOf(user?.name).charAt(0) || 'A'
          )}
        </Link>
      </div>
    </nav>
  );
}
