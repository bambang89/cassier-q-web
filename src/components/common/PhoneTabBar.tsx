'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { MenuKey } from '@/types/navigation';
import { PHONE_TABS, PHONE_TAB_HREFS } from '@/config/navigation';
import { useMenuAccess } from '@/hooks/useMenuAccess';
import { cn } from '@/utils/cn';
import { DashboardIcon, CartIcon, ReceiptIcon, BoxIcon } from '@/components/ui/icons/NavIcons';
import { MoreIcon } from '@/components/ui/icons/ActionIcons';

const ICONS = { dashboard: DashboardIcon, orders: ReceiptIcon, pos: CartIcon, products: BoxIcon, menu: MoreIcon };

/**
 * Bottom tab bar HP: Beranda · Transaksi · Kasir (tombol bulat menonjol) ·
 * Produk · Menu. Layar di luar lima tab ini tetap menyorot "Menu".
 */
export function PhoneTabBar() {
  const pathname = usePathname();
  const { can } = useMenuAccess();
  const activeHref = PHONE_TAB_HREFS.find((href) => pathname === href || pathname.startsWith(`${href}/`)) ?? '/menu';
  const tabs = PHONE_TABS.filter((tab) => tab.key === 'menu' || can(tab.key as MenuKey));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-end border-t border-line bg-white px-1 pt-1.5 pb-[max(env(safe-area-inset-bottom),8px)] shadow-[0_-4px_16px_rgb(11_31_51/0.06)] tab:hidden">
      {tabs.map((tab) => {
        const active = activeHref === tab.href;
        const Icon = ICONS[tab.key];
        if (tab.key === 'pos') {
          return (
            <div key={tab.key} className="flex flex-1 justify-center">
              <Link
                href={tab.href}
                aria-label={tab.label}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  '-mt-6 flex size-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-float ring-4 ring-white transition active:scale-90',
                  active && 'bg-primary-700',
                )}
              >
                <CartIcon size={24} strokeWidth={2} />
              </Link>
            </div>
          );
        }
        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex flex-1 flex-col items-center gap-1 pt-1 pb-0.5 text-[11px] transition active:scale-90',
              active ? 'font-bold text-primary-600' : 'font-medium text-gray-400',
            )}
          >
            {active ? <span className="absolute -top-1.5 h-[3px] w-[22px] rounded-full bg-primary-600" /> : null}
            <Icon size={21} strokeWidth={active ? 2 : 1.7} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
