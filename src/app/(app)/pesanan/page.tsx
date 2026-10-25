'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { changeOrderStatus, fetchCustomerOrders } from '@/api/customerOrdersApi';
import { apiErrorMessage } from '@/api/errors';
import type { CustomerOrder, CustomerOrderStatus } from '@/types/storefront';
import { Alert } from '@/lib/alert';
import { cn } from '@/lib/cn';
import { useIsWide } from '@/lib/useMedia';
import { usePermissions } from '@/hooks/usePermissions';
import { PageBody, PageHeader } from '@/components/layout/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge, EmptyState } from '@/components/ui/Display';
import { LoadingBlock } from '@/components/ui/Spinner';
import { ClipboardIcon, ClockIcon, PeopleIcon, PinIcon } from '@/components/icons/LineIcons';
import { FULFILLMENT_LABEL, STATUS_META, itemSummary, nextAction, rupiah, timeAgo } from '@/features/customer-orders/orderMeta';
import { usePayOrder } from '@/features/customer-orders/usePayOrder';

const POLL_MS = 15000;

const COLUMNS: { key: string; title: string; statuses: CustomerOrderStatus[]; accent: string }[] = [
  { key: 'new', title: 'Baru Masuk', statuses: ['NEW'], accent: 'bg-error-500' },
  { key: 'progress', title: 'Diproses', statuses: ['ACCEPTED', 'IN_PROGRESS'], accent: 'bg-warning-500' },
  { key: 'ready', title: 'Siap Diambil / Diantar', statuses: ['READY'], accent: 'bg-success-500' },
];

/** Bunyi "ding" singkat saat ada pesanan baru (tanpa file audio). */
function ding() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    // browser memblokir audio sebelum ada interaksi — abaikan
  }
}

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

function OrderCard({
  order,
  canProcess,
  busy,
  paying,
  onOpen,
  onAdvance,
  onPay,
}: {
  order: CustomerOrder;
  canProcess: boolean;
  busy: boolean;
  paying: boolean;
  onOpen: () => void;
  onAdvance: (status: CustomerOrderStatus) => void;
  onPay: () => void;
}) {
  const meta = STATUS_META[order.status];
  const next = nextAction(order.status);
  const isNew = order.status === 'NEW';
  return (
    <div
      onClick={onOpen}
      className={cn(
        'cursor-pointer animate-fade-in rounded-xl border bg-white p-4 shadow-card transition hover:shadow-md',
        isNew ? 'border-error-200 ring-2 ring-error-100' : 'border-line',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-bold text-ink">{order.customerName}</p>
          <p className="text-[12.5px] text-ink-3">
            {order.orderNumber} · {timeAgo(order.createdAt)}
          </p>
        </div>
        <Badge variant={meta.variant}>{meta.label}</Badge>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-ink-2">{itemSummary(order)}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] font-semibold">
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-ink-2">{FULFILLMENT_LABEL[order.fulfillment]}</span>
        {order.tableLabel ? <span className="rounded-full bg-primary-50 px-2 py-0.5 text-primary-700">Meja {order.tableLabel}</span> : null}
        <span className="ml-auto text-sm font-bold text-ink">{rupiah(order.subtotal)}</span>
      </div>
      {['NEW', 'ACCEPTED', 'IN_PROGRESS', 'READY'].includes(order.status) ? (
        <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
          {next && canProcess ? (
            <Button size="sm" variant={isNew ? 'solid' : 'secondary'} className="flex-1" loading={busy} onClick={() => onAdvance(next.status)}>
              {next.label}
            </Button>
          ) : null}
          <Button size="sm" variant={order.status === 'READY' ? 'success' : 'outline'} className="flex-1" loading={paying} onClick={onPay}>
            Bayar di Kasir
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function OrderDetail({
  order,
  canProcess,
  busy,
  paying,
  onAdvance,
  onCancel,
  onPay,
}: {
  order: CustomerOrder;
  canProcess: boolean;
  busy: boolean;
  paying: boolean;
  onAdvance: (status: CustomerOrderStatus) => void;
  onCancel: () => void;
  onPay: () => void;
}) {
  const meta = STATUS_META[order.status];
  const next = nextAction(order.status);
  const active = ['NEW', 'ACCEPTED', 'IN_PROGRESS', 'READY'].includes(order.status);
  const wa = order.customerPhone?.replace(/\D/g, '').replace(/^0/, '62');
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant={meta.variant}>{meta.label}</Badge>
        <span className="text-[12.5px] text-ink-3">
          {order.source === 'ONLINE' ? 'Toko online' : 'Kasir'} · {new Date(order.createdAt).toLocaleString('id-ID')}
        </span>
      </div>
      <div className="space-y-1.5 rounded-xl bg-gray-50 p-4 text-sm">
        <p className="flex items-center gap-2 font-semibold text-ink">
          <PeopleIcon size={15} /> {order.customerName}
          {order.customerPhone ? <span className="font-normal text-ink-3">· {order.customerPhone}</span> : null}
        </p>
        <p className="flex items-center gap-2 text-ink-2">
          <ClockIcon size={15} /> {FULFILLMENT_LABEL[order.fulfillment]}
          {order.tableLabel ? ` · Meja ${order.tableLabel}` : ''}
        </p>
        {order.deliveryAddress ? (
          <p className="flex items-start gap-2 text-ink-2">
            <PinIcon size={15} className="mt-0.5 shrink-0" /> {order.deliveryAddress}
          </p>
        ) : null}
        {order.notes ? <p className="text-ink-2 italic">“{order.notes}”</p> : null}
      </div>
      <div>
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between gap-3 border-b border-gray-100 py-2 text-sm last:border-0">
            <span>
              <span className="font-semibold text-ink">
                {Number(item.quantity)}× {item.productName}
              </span>
              {item.notes ? <span className="block text-[12.5px] text-warning-700">“{item.notes}”</span> : null}
            </span>
            <span className="font-semibold">{rupiah(item.subtotal)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between">
          <span className="text-ink-2">Total</span>
          <span className="text-xl font-extrabold">{rupiah(order.subtotal)}</span>
        </div>
      </div>
      {active ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            {next && canProcess ? (
              <Button className="flex-1" loading={busy} onClick={() => onAdvance(next.status)}>
                {next.label}
              </Button>
            ) : null}
            <Button variant="success" className="flex-1" loading={paying} onClick={onPay}>
              Bayar di Kasir
            </Button>
          </div>
          <div className="flex gap-2">
            {wa ? (
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="flex-1 rounded-lg border border-gray-200 py-2.5 text-center text-sm font-semibold text-ink">
                Hubungi via WhatsApp
              </a>
            ) : null}
            {canProcess ? (
              <Button variant="dangerOutline" className="flex-1" onClick={onCancel}>
                Batalkan
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
