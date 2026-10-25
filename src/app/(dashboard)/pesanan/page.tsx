'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { CustomerOrder, CustomerOrderStatus } from '@/types/storefront';
import { changeOrderStatus, fetchCustomerOrders } from '@/services/customerOrdersApi';
import { Alert } from '@/lib/alert';
import { useIsWide } from '@/hooks/useMedia';
import { usePermissions } from '@/hooks/usePermissions';
import { apiErrorMessage } from '@/utils/apiErrors';
import { cn } from '@/utils/cn';
import { PageBody, PageHeader } from '@/components/common/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/Display';
import { LoadingBlock } from '@/components/ui/Spinner';
import { ClipboardIcon } from '@/components/ui/icons/NavIcons';
import { ding } from '@/features/customer-orders/utils';
import { usePayOrder } from '@/features/customer-orders/hooks/usePayOrder';
import { OrderCard } from '@/features/customer-orders/components/OrderCard';
import { OrderDetail } from '@/features/customer-orders/components/OrderDetail';

const POLL_MS = 15000;

const COLUMNS: { key: string; title: string; statuses: CustomerOrderStatus[]; accent: string }[] = [
  { key: 'new', title: 'Baru Masuk', statuses: ['NEW'], accent: 'bg-error-500' },
  { key: 'progress', title: 'Diproses', statuses: ['ACCEPTED', 'IN_PROGRESS'], accent: 'bg-warning-500' },
  { key: 'ready', title: 'Siap Diambil / Diantar', statuses: ['READY'], accent: 'bg-success-500' },
];

/** Menu Pesanan: antrian pesanan masuk dari toko online. */
export default function PesananPage() {
  const isWide = useIsWide();
  const { can } = usePermissions();
  const canProcess = can('pesanan.process');
  const [tab, setTab] = useState<'active' | 'done'>('active');
  const [orders, setOrders] = useState<CustomerOrder[] | null>(null);
  const [selected, setSelected] = useState<CustomerOrder | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [phoneColumn, setPhoneColumn] = useState('new');
  const knownNew = useRef<Set<string> | null>(null);
  const { pay, loadingId } = usePayOrder();

  const load = useCallback(async () => {
    try {
      const page = await fetchCustomerOrders(tab === 'active' ? 'ACTIVE' : 'DONE', 0, 100);
      setOrders(page.content);
      if (tab === 'active') {
        const ids = new Set(page.content.filter((o) => o.status === 'NEW').map((o) => o.id));
        if (knownNew.current && [...ids].some((id) => !knownNew.current!.has(id))) ding();
        knownNew.current = ids;
      }
    } catch (error) {
      setOrders((prev) => prev ?? []);
      console.warn(apiErrorMessage(error, 'Pesanan gagal dimuat'));
    }
  }, [tab]);

  useEffect(() => {
    setOrders(null);
    load();
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  const act = async (order: CustomerOrder, status: CustomerOrderStatus) => {
    setBusyId(order.id);
    try {
      const updated = await changeOrderStatus(order.id, status);
      setOrders((prev) => (prev ?? []).map((o) => (o.id === updated.id ? updated : o)).filter((o) => tab === 'done' || !['COMPLETED', 'CANCELLED'].includes(o.status)));
      setSelected((s) => (s?.id === updated.id ? updated : s));
    } catch (error) {
      Alert.alert('Gagal', apiErrorMessage(error, 'Status pesanan tidak bisa diubah.'));
    } finally {
      setBusyId(null);
    }
  };

  const cancel = (order: CustomerOrder) =>
    Alert.alert('Batalkan pesanan?', `${order.orderNumber} atas nama ${order.customerName} akan dibatalkan.`, [
      { text: 'Tidak', style: 'cancel' },
      { text: 'Batalkan', style: 'destructive', onPress: () => act(order, 'CANCELLED') },
    ]);

  const newCount = (orders ?? []).filter((o) => o.status === 'NEW').length;

  const card = (order: CustomerOrder) => (
    <OrderCard
      key={order.id}
      order={order}
      canProcess={canProcess}
      busy={busyId === order.id}
      paying={loadingId === order.id}
      onOpen={() => setSelected(order)}
      onAdvance={(status) => act(order, status)}
      onPay={() => pay(order)}
    />
  );

  return (
    <>
      <PageHeader
        title="Pesanan"
        subtitle={tab === 'active' ? `${(orders ?? []).length} pesanan aktif${newCount ? ` · ${newCount} baru` : ''}` : 'Riwayat pesanan'}
        right={
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1">
            {(['active', 'done'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn('cursor-pointer rounded-md px-3 py-1.5 text-[13px] font-semibold', tab === t ? 'bg-white text-primary-700 shadow-sm' : 'text-ink-2')}
              >
                {t === 'active' ? 'Aktif' : 'Riwayat'}
              </button>
            ))}
          </div>
        }
      />
      <PageBody className="bg-canvas">
        {orders === null ? (
          <LoadingBlock label="Memuat pesanan…" />
        ) : tab === 'done' ? (
          orders.length === 0 ? (
            <EmptyState icon={ClipboardIcon} title="Belum ada riwayat" description="Pesanan yang selesai atau dibatalkan tampil di sini." />
          ) : (
            <div className="mx-auto grid max-w-[1100px] gap-3 md:grid-cols-2 xl:grid-cols-3">{orders.map(card)}</div>
          )
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ClipboardIcon}
            title="Belum ada pesanan masuk"
            description="Pesanan dari toko online akan muncul di sini secara otomatis. Atur toko online di menu Toko Online."
          />
        ) : isWide ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {COLUMNS.map((col) => {
              const list = orders.filter((o) => col.statuses.includes(o.status));
              return (
                <div key={col.key} className="flex min-h-[300px] flex-col rounded-2xl bg-gray-100/80 p-3">
                  <div className="mb-3 flex items-center gap-2 px-1">
                    <span className={cn('size-2.5 rounded-full', col.accent)} />
                    <p className="font-bold text-ink">{col.title}</p>
                    <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[12px] font-bold text-ink-2">{list.length}</span>
                  </div>
                  <div className="space-y-3">{list.map(card)}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <div className="no-scrollbar -mx-5 mb-3 flex gap-2 overflow-x-auto px-5">
              {COLUMNS.map((col) => {
                const count = orders.filter((o) => col.statuses.includes(o.status)).length;
                return (
                  <button
                    key={col.key}
                    type="button"
                    onClick={() => setPhoneColumn(col.key)}
                    className={cn(
                      'flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold',
                      phoneColumn === col.key ? 'border-navy-900 bg-navy-900 text-white' : 'border-line bg-white text-ink-2',
                    )}
                  >
                    {col.title} <span className="opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>
            <div className="space-y-3">{orders.filter((o) => COLUMNS.find((c) => c.key === phoneColumn)!.statuses.includes(o.status)).map(card)}</div>
          </>
        )}
      </PageBody>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.orderNumber} size="md">
        {selected ? (
          <OrderDetail
            order={selected}
            canProcess={canProcess}
            busy={busyId === selected.id}
            paying={loadingId === selected.id}
            onAdvance={(status) => act(selected, status)}
            onCancel={() => cancel(selected)}
            onPay={() => pay(selected)}
          />
        ) : null}
      </Modal>
    </>
  );
}

