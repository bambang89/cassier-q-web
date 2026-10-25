'use client';

import { useEffect, useState } from 'react';

import { fetchCustomerLedger, fetchCustomers } from '@/lib/store/slices/customersSlice';
import { usePermissions } from '@/hooks/usePermissions';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { cn } from '@/utils/cn';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { LoadingBlock } from '@/components/ui/Spinner';
import { ReceiptIcon } from '@/components/ui/icons/NavIcons';
import { CreditCardIcon, PinIcon, HistoryIcon } from '@/components/ui/icons/DataIcons';
import { CustomerForm, RecordPaymentForm } from '@/features/customers/components/CustomerForm';

const ENTRY_VARIANT: Record<string, 'error' | 'success' | 'neutral'> = { DEBT: 'error', PAYMENT: 'success', VOID: 'neutral' };
const ENTRY_LABEL: Record<string, string> = { DEBT: 'Utang', PAYMENT: 'Pembayaran', VOID: 'Dibatalkan' };

/** Kartu identitas + saldo utang + riwayat — dipakai halaman HP dan panel kanan layar lebar. */
export function CustomerDetailContent({ customerId, showEditInline = true }: { customerId: string; showEditInline?: boolean }) {
  const { can } = usePermissions();
  const dispatch = useAppDispatch();
  const customer = useAppSelector((state) => state.customers.items.find((c) => c.id === customerId));
  const listStatus = useAppSelector((state) => state.customers.status);
  const ledger = useAppSelector((state) => state.customers.ledgerByCustomerId[customerId]);
  const ledgerStatus = useAppSelector((state) => state.customers.ledgerStatusByCustomerId[customerId]);
  const [editVisible, setEditVisible] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);

  useEffect(() => {
    if (!customer && listStatus === 'idle') dispatch(fetchCustomers());
    dispatch(fetchCustomerLedger(customerId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, customerId]);

  if (!customer) {
    return listStatus === 'loading' ? <LoadingBlock /> : <p className="p-10 text-center text-ink-3">Pelanggan tidak ditemukan.</p>;
  }

  const hasDebt = customer.balance > 0;
  const usage = customer.creditLimit > 0 ? Math.min(100, (customer.balance / customer.creditLimit) * 100) : 0;

  return (
    <div className="mx-auto max-w-[760px] space-y-4">
      <div className="flex items-start gap-4 rounded-2xl border border-line bg-white p-5 shadow-card">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-xl font-bold text-white">
          {customer.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold text-ink">{customer.name}</p>
          <p className="text-sm text-ink-2">
            {customer.customerCode}
            {customer.phone ? ` · ${customer.phone}` : ''}
          </p>
          {customer.address ? (
            <p className="mt-1 flex items-start gap-1 text-[12.5px] text-ink-3">
              <PinIcon size={12} className="mt-0.5 shrink-0" /> {customer.address}
            </p>
          ) : null}
        </div>
        {showEditInline && can('customers.update') ? (
          <Button size="sm" variant="outline" onClick={() => setEditVisible(true)}>
            Ubah
          </Button>
        ) : null}
      </div>

      <div
        className={cn(
          'rounded-2xl border p-5',
          hasDebt ? 'border-error-100 bg-gradient-to-br from-error-50 to-white' : 'border-success-100 bg-gradient-to-br from-success-50 to-white',
        )}
      >
        <p className="text-sm text-ink-2">Sisa hutang saat ini</p>
        <p className={cn('mt-1 text-[32px] leading-tight font-extrabold', hasDebt ? 'text-error-600' : 'text-ink')}>
          Rp {customer.balance.toLocaleString('id-ID')}
        </p>
        {customer.creditLimit > 0 ? (
          <div className="mt-3">
            <div className="h-2 overflow-hidden rounded-full bg-white ring-1 ring-gray-200">
              <div className={cn('h-full rounded-full', usage > 80 ? 'bg-error-500' : 'bg-primary-500')} style={{ width: `${usage}%` }} />
            </div>
            <p className="mt-1 text-[12.5px] text-ink-3">Limit kredit: Rp {customer.creditLimit.toLocaleString('id-ID')}</p>
          </div>
        ) : null}
        {can('customers.payment') ? (
          <Button className="mt-4" disabled={!hasDebt} leftIcon={hasDebt ? <CreditCardIcon size={16} /> : undefined} onClick={() => setPaymentVisible(true)}>
            {hasDebt ? 'Catat Pembayaran' : 'Tidak Ada Utang'}
          </Button>
        ) : null}
      </div>

      <div>
        <p className="mb-2 flex items-center gap-2 text-lg font-bold text-ink">
          <HistoryIcon size={16} className="text-ink-2" /> Riwayat
        </p>
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          {!ledger || ledgerStatus === 'loading' ? (
            <LoadingBlock label="Memuat riwayat..." />
          ) : ledger.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <ReceiptIcon size={22} />
              </span>
              <p className="text-ink-2">Belum ada transaksi atau pembayaran tercatat untuk pelanggan ini.</p>
            </div>
          ) : (
            ledger.map((entry) => (
              <div key={entry.id} className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3.5 last:border-0">
                <div className="min-w-0 space-y-1">
                  <Badge variant={ENTRY_VARIANT[entry.entryType] ?? 'neutral'}>{ENTRY_LABEL[entry.entryType] ?? entry.entryType}</Badge>
                  <p className="text-[12.5px] text-ink-2">
                    {new Date(entry.createdAt).toLocaleString('id-ID')}
                    {entry.salesTransactionNumber ? ` · ${entry.salesTransactionNumber}` : ''}
                  </p>
                  {entry.notes ? <p className="line-clamp-2 text-[12.5px] text-ink-3">{entry.notes}</p> : null}
                  {entry.createdByName ? <p className="text-[12.5px] text-ink-3">oleh {entry.createdByName}</p> : null}
                </div>
                <p className="shrink-0 font-bold text-ink">Rp {entry.amount.toLocaleString('id-ID')}</p>
              </div>
            ))
          )}
        </div>
        {ledger && ledger.length > 0 ? (
          <p className="mt-2 text-[12.5px] text-ink-3">
            Urutan dari sistem, transaksi terbaru di atas. Saldo hutang di atas sudah dihitung otomatis oleh server.
          </p>
        ) : null}
      </div>

      <Modal isOpen={editVisible} onClose={() => setEditVisible(false)}>
        <CustomerForm customer={customer} onDone={() => setEditVisible(false)} onCancel={() => setEditVisible(false)} />
      </Modal>
      <Modal isOpen={paymentVisible} onClose={() => setPaymentVisible(false)} size="sm">
        <RecordPaymentForm
          customerId={customer.id}
          customerName={customer.name}
          maxAmount={customer.balance}
          onDone={() => {
            setPaymentVisible(false);
            dispatch(fetchCustomerLedger(customerId));
          }}
          onCancel={() => setPaymentVisible(false)}
        />
      </Modal>
    </div>
  );
}
