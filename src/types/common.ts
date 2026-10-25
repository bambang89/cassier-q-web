/** Status permintaan async di slice Redux. */
export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface Permissions {
  /** True when the user may perform an action, e.g. can('products.create'). */
  can: (action: string) => boolean;
  canCreateProduct: boolean;
  canUpdateProduct: boolean;
  canDeleteProduct: boolean;
  /** Any product change (kept for screens that only need a yes/no). */
  canManageProducts: boolean;
  canRestock: boolean;
}
