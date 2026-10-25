'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { Order } from '@/types/models';
import { clearCart, selectCartTotal } from '@/lib/store/slices/cartSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { PageHeader } from '@/components/common/PageHeader';
import { useSettleCustomerOrder } from '@/features/customer-orders/hooks/useSettleCustomerOrder';
import { CheckoutForm } from '@/features/pos/components/CheckoutForm';

/** Halaman pembayaran penuh untuk HP (layar lebar memakai modal di Kasir). */
export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const cartTotal = useAppSelector(selectCartTotal);
  // Setelah bayar, keranjang dikosongkan — jangan sampai efek di bawah membelokkan ke /pos.
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0 && !finished) router.replace('/pos');
  }, [cartItems.length, finished, router]);

  const settleCustomerOrder = useSettleCustomerOrder();

  const onDone = (order: Order, withReceipt: boolean) => {
    setFinished(true);
    settleCustomerOrder(order);
    if (withReceipt) router.replace(`/orders/${order.id}/receipt`);
    else router.replace('/pos');
    dispatch(clearCart());
  };

  if (cartItems.length === 0 && !finished) return null;

  return (
    <>
      <PageHeader title="Pembayaran" backHref="/pos" />
      <div className="min-h-0 flex-1">
        <CheckoutForm layout="page" total={cartTotal} cartItems={cartItems} showItemsList onDone={onDone} onCancel={() => router.push('/pos')} />
      </div>
    </>
  );
}
