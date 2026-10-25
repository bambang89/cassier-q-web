import type { MenuKey } from '@/types/navigation';
import { useAppSelector } from '@/hooks/store';

/** Hak akses menu user yang sedang login (null dari server = semua boleh). */
export function useMenuAccess() {
  const allowed = useAppSelector((state) => state.access.allowedMenus);
  const user = useAppSelector((state) => state.auth.user);
  const isSuperadmin = !!user?.superadmin;
  const isManager = isSuperadmin || !!user?.roles.some((r) => r.roleCode === 'KEPALA_TOKO');
  const can = (key: MenuKey) => key === 'dashboard' || allowed === null || allowed.includes(key);
  return { can, isManager, isSuperadmin };
}
