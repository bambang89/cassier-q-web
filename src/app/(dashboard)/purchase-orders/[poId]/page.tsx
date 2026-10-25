'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import type { PurchaseOrder } from '@/types/models';
import type { ReceiveItemPayload } from '@/types/api';
import { Alert } from '@/lib/alert';
import { cancelPurchaseOrder, clearCurrentPurchaseOrder, fetchPurchaseOrder, receivePurchaseOrder } from '@/lib/store/slices/purchaseOrdersSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/utils/cn';
import { hasAnyReceived, isCancelled, isFullyReceived, poStatusMeta, remainingToReceive } from '@/utils/purchaseOrders';
import { PageBody, PageHeader } from '@/components/common/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Display';
import { LoadingBlock } from '@/components/ui/Spinner';
import { ReceiptIcon } from '@/components/ui/icons/NavIcons';
import { ReceiveIcon } from '@/components/ui/icons/ActionIcons';
import { StickyNoteIcon } from '@/components/ui/icons/DataIcons';

export default function PurchaseOrderDetailPage() {
  const { poId } = useParams<{ poId: string }>();
  const { can } = usePermissions();
  const dispatch = useAppDispatch();
  const po = useAppSelector((state) => state.purchaseOrders.current);
  const currentStatus = useAppSelector((state) => state.purchaseOrders.currentStatus);
  const [receiveVisible, setReceiveVisible] = useState(false);
  const [cancelVisible, setCancelVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchPurchaseOrder(poId));
    return () => {
      dispatch(clearCurrentPurchaseOrder());
    };
  }, [dispatch, poId]);

  if (!po || po.id !== poId) {
    return (
      <>
        <PageHeader title="Purchase Order" backHref="/purchase-orders" />
        {currentStatus === 'loading' ? <LoadingBlock /> : <p className="p-10 text-center text-ink-3">PO tidak ditemukan.</p>}
      </>
    );
  }

  const meta = poStatusMeta(po);
  const cancellable = !isCancelled(po) && !isFullyReceived(po) && !hasAnyReceived(po);
  const receivable = !isCancelled(po) && !isFullyReceived(po);

  const onCancel = async () => {
    try {
      await dispatch(cancelPurchaseOrder(po.id)).unwrap();
    } catch {
      Alert.alert('Gagal', 'PO tidak bisa dibatalkan (mungkin sudah ada barang yang diterima).');
    } finally {
      setCancelVisible(false);
    }
  };

  return (
    <>
      <PageHeader title={po.poNumber} subtitle={po.supplierName} backHref="/purchase-orders" />
      <PageBody>
        <div className="mx-auto max-w-[860px] space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_260px]">
            <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold text-ink">{po.supplierName}</p>
                  <p className="text-sm text-ink-2">
                    Dibuat {new Date(po.orderDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {po.expectedDate ? ` · Diharapkan datang ${new Date(po.expectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}` : ''}
                  </p>
                </div>
                <Badge variant={meta.variant}>{meta.label}</Badge>
              </div>
              {po.notes ? (
                <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-gray-50 p-3 text-sm text-ink-2">
                  <StickyNoteIcon size={13} className="mt-0.5 shrink-0 text-ink-3" /> {po.notes}
                </p>
              ) : null}
            </div>
            <div className="rounded-2xl bg-[linear-gradient(135deg,#0B1F33_0%,#123E7A_100%)] p-5 text-white shadow-lg">
              <p className="text-[11.5px] font-semibold tracking-[0.1em] text-white/60">TOTAL PEMBELIAN</p>
              <p className="mt-1 text-[26px] font-extrabold">Rp {po.totalCost.toLocaleString('id-ID')}</p>
            </div>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-2 text-lg font-bold text-ink">
              <ReceiptIcon size={16} className="text-ink-2" /> Barang
            </p>
            <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
              {po.items.map((item) => {
                const remaining = remainingToReceive(item);
                const progress = item.quantity > 0 ? ((item.quantity - remaining) / item.quantity) * 100 : 0;
                return (
                  <div key={item.id} className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3.5 last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink">{item.productName}</p>
                      <p className="text-[12.5px] text-ink-2">
                        {item.quantity} {item.unitName} × Rp {item.unitCost.toLocaleString('id-ID')}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-gray-100">
                          <div className={cn('h-full rounded-full', remaining > 0 ? 'bg-warning-500' : 'bg-success-500')} style={{ width: `${progress}%` }} />
                        </div>
                        <p className={cn('text-[12.5px]', remaining > 0 ? 'text-warning-700' : 'text-success-700')}>
                          {remaining > 0
                            ? `Diterima ${(item.quantity - remaining).toLocaleString('id-ID')} / ${item.quantity} ${item.unitName}`
                            : `Sudah diterima penuh (${item.quantity} ${item.unitName})`}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-ink">Rp {item.subtotal.toLocaleString('id-ID')}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {receivable && can('purchase_orders.receive') ? (
              <Button leftIcon={<ReceiveIcon size={16} />} onClick={() => setReceiveVisible(true)}>
                Terima Barang
              </Button>
            ) : null}
            {cancellable && can('purchase_orders.cancel') ? (
              <Button variant="dangerOutline" onClick={() => setCancelVisible(true)}>
                Batalkan PO
              </Button>
            ) : null}
          </div>
          {!cancellable && !isCancelled(po) && !isFullyReceived(po) ? (
            <p className="text-[12.5px] text-ink-3">PO ini tidak bisa dibatalkan lagi karena sudah ada barang yang diterima.</p>
          ) : null}
        </div>
      </PageBody>

      <Modal isOpen={receiveVisible} onClose={() => setReceiveVisible(false)}>
        <ReceiveForm po={po} onDone={() => setReceiveVisible(false)} onCancel={() => setReceiveVisible(false)} />
      </Modal>
      <AlertDialog
        isOpen={cancelVisible}
        onClose={() => setCancelVisible(false)}
        title="Batalkan purchase order ini?"
        description={`PO ${po.poNumber} ke ${po.supplierName} akan dibatalkan.`}
        confirmText="Batalkan"
        isDanger
        onConfirm={onCancel}
      />
    </>
  );
}

function ReceiveForm({ po, onDone, onCancel }: { po: PurchaseOrder; onDone: () => void; onCancel: () => void }) {
  const dispatch = useAppDispatch();
  const pendingItems = po.items.filter((item) => remainingToReceive(item) > 0);
  const [amounts, setAmounts] = useState<Record<string, string>>(() => Object.fromEntries(pendingItems.map((item) => [item.id, String(remainingToReceive(item))])));
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const items: ReceiveItemPayload[] = pendingItems
      .map((item) => ({ purchaseOrderItemId: item.id, receivedQuantity: Number(amounts[item.id] || 0) }))
      .filter((entry) => entry.receivedQuantity > 0);
    if (items.length === 0) {
      Alert.alert('Belum ada jumlah', 'Isi jumlah yang diterima untuk minimal satu barang.');
      return;
    }
    setSubmitting(true);
    try {
      await dispatch(receivePurchaseOrder({ id: po.id, items })).unwrap();
      onDone();
    } catch {
      Alert.alert('Gagal', 'Penerimaan barang tidak bisa disimpan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <p className="mb-1 flex items-center gap-2 text-lg font-bold text-ink">
        <ReceiveIcon size={16} /> Terima Barang
      </p>
      <p className="mb-4 text-sm text-ink-2">Isi jumlah barang yang benar-benar datang. Boleh sebagian — sisanya tetap tercatat sebagai belum diterima.</p>
      <div className="space-y-3">
        {pendingItems.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{item.productName}</p>
              <p className="text-[12.5px] text-ink-3">
                Sisa {remainingToReceive(item).toLocaleString('id-ID')} {item.unitName}
              </p>
            </div>
            <Input
              wrapperClassName="w-32"
              inputMode="decimal"
              value={amounts[item.id] ?? ''}
              onChange={(e) => setAmounts((prev) => ({ ...prev, [item.id]: e.target.value.replace(/[^0-9.]/g, '') }))}
              placeholder="0"
            />
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} className="min-w-[90px]">
          Batal
        </Button>
        <Button type="submit" loading={submitting} className="min-w-[90px]">
          Simpan
        </Button>
      </div>
    </form>
  );
}
