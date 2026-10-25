'use client';

import type { Order } from '@/types/models';
import { markOrderPaid } from '@/services/customerOrdersApi';
import { Alert } from '@/lib/alert';
import { useAppSelector } from '@/hooks/store';
import { apiErrorMessage } from '@/utils/apiErrors';

/**
 * Setelah checkout Kasir: kalau keranjang berasal dari menu Pesanan, tandai
 * pesanan itu selesai & tautkan ke transaksinya. Panggil sebelum clearCart().
 */
export function useSettleCustomerOrder() {
  const customerOrder = useAppSelector((state) => state.cart.customerOrder);
  return (order: Order) => {
    if (!customerOrder) return;
    markOrderPaid(customerOrder.id, order.id).catch((error) =>
      Alert.alert(
        'Pesanan belum ditandai lunas',
        `${apiErrorMessage(error, 'Gagal menautkan transaksi.')} Transaksi tetap tersimpan — tandai ${customerOrder.orderNumber} selesai di menu Pesanan.`,
      ),
    );
  };
}
