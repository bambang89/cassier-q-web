'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCustomers } from '@/store/slices/customersSlice';
import { usePermissions } from '@/hooks/usePermissions';
import { useIsWide } from '@/lib/useMedia';
import { PageBody, PageHeader } from '@/components/layout/PageHeader';
import { SplitItem, SplitView } from '@/components/layout/SplitView';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { Badge, EmptyState } from '@/components/ui/Display';
import { LoadingBlock } from '@/components/ui/Spinner';
import { CreditCardIcon, PeopleIcon, PlusIcon, SearchIcon } from '@/components/icons/LineIcons';
import { CustomerForm } from '@/features/customers/CustomerForm';
import { CustomerDetailContent } from '@/features/customers/CustomerDetailContent';

export default function CustomersPage() {
  const router = useRouter();
  const { can } = usePermissions();
  const dispatch = useAppDispatch();
  const isWide = useIsWide();
  const { items, status } = useAppSelector((state) => state.customers);
  const [search, setSearch] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) => c.name.toLowerCase().includes(q) || c.customerCode.toLowerCase().includes(q) || (c.phone ?? '').toLowerCase().includes(q));
  }, [items, search]);

  const totalDebt = useMemo(() => items.reduce((sum, c) => sum + Math.max(0, c.balance), 0), [items]);

  useEffect(() => {
    if (isWide && !selectedId && items.length > 0) setSelectedId(items[0].id);
  }, [isWide, items, selectedId]);

  const empty =
    status === 'loading' ? (
      <LoadingBlock label="Memuat pelanggan..." />
    ) : search ? (
      <EmptyState icon={SearchIcon} title="Tidak Ditemukan" description={`Tidak ada pelanggan yang cocok dengan "${search}".`} />
    ) : (
      <EmptyState
        icon={PeopleIcon}
        title="Belum Ada Pelanggan"
        description="Daftarkan pelanggan langganan supaya bisa mencatat penjualan bon/utang di kasir."
        actionLabel={can('customers.create') ? '+ Tambah Pelanggan' : undefined}
        onAction={can('customers.create') ? () => setFormVisible(true) : undefined}
      />
    );

  return (
    <>
      <PageHeader
        title="Pelanggan"
        subtitle={`${items.length} pelanggan · Rp ${totalDebt.toLocaleString('id-ID')} piutang`}
        phoneSubtitle="Kelola data & piutang pelanggan"
        right={
          can('customers.create') ? (
            <Button size="sm" leftIcon={<PlusIcon size={14} />} onClick={() => setFormVisible(true)} className="hidden tab:inline-flex">
              Baru
            </Button>
          ) : undefined
        }
      />

      {isWide ? (
        <SplitView
          detailKey={selectedId}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Cari pelanggan"
          detail={
            <div className="p-6">
              {selectedId ? (
                <CustomerDetailContent key={selectedId} customerId={selectedId} />
              ) : (
                <p className="p-10 text-center text-ink-3">Pilih pelanggan di daftar untuk melihat detail.</p>
              )}
            </div>
          }
        >
          {filtered.length === 0
            ? empty
            : filtered.map((item) => (
                <SplitItem
                  key={item.id}
                  active={item.id === selectedId}
                  onClick={() => setSelectedId(item.id)}
                  title={item.name}
                  amount={item.balance > 0 ? `Rp ${item.balance.toLocaleString('id-ID')}` : undefined}
                  meta={`${item.customerCode}${item.phone ? ` · ${item.phone}` : ''}`}
                />
              ))}
        </SplitView>
      ) : (
        <PageBody className="space-y-3">
          {items.length > 0 ? (
            <div className="flex items-center gap-2.5 rounded-xl border border-primary-100 bg-primary-50 p-3.5">
              <CreditCardIcon size={18} className="text-primary-600" />
              <p className="text-sm font-semibold text-ink">
                Total piutang dari {items.filter((c) => c.balance > 0).length} pelanggan:{' '}
                <span className={totalDebt > 0 ? 'text-error-600' : 'text-ink-2'}>Rp {totalDebt.toLocaleString('id-ID')}</span>
              </p>
            </div>
          ) : null}
          <Input placeholder="Cari nama, kode, atau no. HP..." value={search} onChange={(e) => setSearch(e.target.value)} leftElement={<SearchIcon size={16} className="text-ink-3" />} />
          {filtered.length === 0 ? (
            empty
          ) : (
            <div className="space-y-2.5">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => router.push(`/customers/${item.id}`)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-line bg-white p-3.5 text-left active:scale-[0.99]"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-600 font-bold text-white">
                    {item.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink">{item.name}</span>
                    <span className="block truncate text-[12.5px] text-ink-2">
                      {item.customerCode}
                      {item.phone ? ` · ${item.phone}` : ''}
                    </span>
                  </span>
                  <Badge variant={item.balance > 0 ? 'error' : 'success'}>
                    {item.balance > 0 ? `Utang Rp ${item.balance.toLocaleString('id-ID')}` : 'Lunas'}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </PageBody>
      )}

      {can('customers.create') ? (
        <button
          type="button"
          aria-label="Tambah pelanggan"
          onClick={() => setFormVisible(true)}
          className="fixed right-5 bottom-[96px] z-30 flex size-14 cursor-pointer items-center justify-center rounded-2xl bg-primary-600 text-white shadow-float active:scale-90 tab:hidden"
        >
          <PlusIcon size={24} />
        </button>
      ) : null}

      <Modal isOpen={formVisible} onClose={() => setFormVisible(false)}>
        <CustomerForm onDone={() => setFormVisible(false)} onCancel={() => setFormVisible(false)} />
      </Modal>
    </>
  );
}
