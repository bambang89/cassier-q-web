import type { Permissions } from '@/types/common';
import { useAppSelector } from '@/hooks/store';

// Action permissions per menu, set by Kepala Toko in "Hak Akses Menu" (sub menu per role).
// The API enforces the same rules (@actionAccess); this hook only hides buttons the
// API would reject. Kepala Toko / Superadmin get every action (allowedActions = null).

/** Action permissions of the logged-in user in the active store. */
export function usePermissions(): Permissions {
  const allowed = useAppSelector((state) => state.access.allowedActions);
  const can = (action: string) => allowed === null || allowed.includes(action);
  const canCreateProduct = can('products.create');
  const canUpdateProduct = can('products.update');
  const canDeleteProduct = can('products.delete');
  return {
    can,
    canCreateProduct,
    canUpdateProduct,
    canDeleteProduct,
    canManageProducts: canCreateProduct || canUpdateProduct || canDeleteProduct,
    canRestock: can('inventory.restock'),
  };
}
