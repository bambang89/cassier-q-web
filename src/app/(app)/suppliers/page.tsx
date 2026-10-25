'use client';

import { useEffect, useState } from 'react';

import type { Supplier } from '@/types/models';
import { Alert } from '@/lib/alert';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createSupplier, deactivateSupplier, fetchSuppliers, updateSupplier } from '@/store/slices/suppliersSlice';
import { usePermissions } from '@/hooks/usePermissions';
import { PageBody, PageHeader } from '@/components/layout/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import { FormControl, Input } from '@/components/ui/Field';
import { Badge, EmptyState } from '@/components/ui/Display';
import { LoadingBlock } from '@/components/ui/Spinner';
import { ListRow, RowIcon } from '@/components/ui/ListRow';
import { PlusIcon, TruckIcon } from '@/components/icons/LineIcons';

export default function SuppliersPage() {
  const { can } = usePermissions();
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector((state) => state.suppliers);
  const [editing, setEditing] = useState<Supplier | 'new' | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Supplier | null>(null);

  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  const onDeactivate = async (supplier: Supplier) => {
    try {
      await dispatch(deactivateSupplier(supplier.id)).unwrap();
    } catch {
      Alert.alert('Gagal', 'Pemasok tidak bisa dinonaktifkan.');
    } finally {
      setDeactivateTarget(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Pemasok"
        subtitle={`${items.length} pemasok`}
        right={
          can('suppliers.create') ? (
            <Button size="sm" leftIcon={<PlusIcon size={14} />} onClick={() => setEditing('new')}>
              Baru
            </Button>
          ) : undefined
        }
      />
      <PageBody>
        <div className="mx-auto grid max-w-[1000px] gap-2.5 lg:grid-cols-2">
          {items.length === 0 ? (
            <div className="lg:col-span-2">
              {status === 'loading' ? (
                <LoadingBlock label="Memuat pemasok..." />
              ) : (
                <EmptyState
                  icon={TruckIcon}
                  title="Belum Ada Pemasok"
                  description="Daftarkan pemasok dulu supaya bisa membuat Purchase Order (PO) pembelian barang."
                  actionLabel={can('suppliers.create') ? '+ Tambah Pemasok' : undefined}
                  onAction={can('suppliers.create') ? () => setEditing('new') : undefined}
                />
              )}
            </div>
          ) : (
            items.map((item, index) => (
              <ListRow
                key={item.id}
                index={index}
                onClick={can('suppliers.update') ? () => setEditing(item) : undefined}
                icon={
                  <RowIcon className="bg-info-50 text-info-700">
                    <TruckIcon size={18} />
                  </RowIcon>
                }
                title={item.supplierName}
                subtitle={`${item.supplierCode}${item.contactPerson ? ` · ${item.contactPerson}` : ''}${item.phone ? ` · ${item.phone}` : ''}`}
                right={
                  item.active ? (
                    can('suppliers.delete') ? (
                      <Button variant="ghost" size="sm" className="text-error-600 hover:bg-error-50" onClick={() => setDeactivateTarget(item)}>
                        Nonaktifkan
                      </Button>
                    ) : null
                  ) : (
                    <Badge variant="neutral">Nonaktif</Badge>
                  )
                }
              />
            ))
          )}
        </div>
      </PageBody>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)}>
        {editing ? <SupplierForm supplier={editing === 'new' ? null : editing} onDone={() => setEditing(null)} onCancel={() => setEditing(null)} /> : null}
      </Modal>
      <AlertDialog
        isOpen={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        title="Nonaktifkan pemasok?"
        description={`"${deactivateTarget?.supplierName}" tidak akan muncul lagi saat membuat PO baru.`}
        confirmText="Nonaktifkan"
        isDanger
        onConfirm={() => deactivateTarget && onDeactivate(deactivateTarget)}
      />
    </>
  );
}

function SupplierForm({ supplier, onDone, onCancel }: { supplier: Supplier | null; onDone: () => void; onCancel: () => void }) {
  const dispatch = useAppDispatch();
  const [supplierCode, setSupplierCode] = useState(supplier?.supplierCode ?? '');
  const [supplierName, setSupplierName] = useState(supplier?.supplierName ?? '');
  const [contactPerson, setContactPerson] = useState(supplier?.contactPerson ?? '');
  const [phone, setPhone] = useState(supplier?.phone ?? '');
  const [email, setEmail] = useState(supplier?.email ?? '');
  const [address, setAddress] = useState(supplier?.address ?? '');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierCode || !supplierName) return;
    setSubmitting(true);
    try {
      const payload = {
        supplierCode,
        supplierName,
        contactPerson: contactPerson || undefined,
        phone: phone || undefined,
        email: email || undefined,
        address: address || undefined,
      };
      if (supplier) await dispatch(updateSupplier({ id: supplier.id, payload })).unwrap();
      else await dispatch(createSupplier(payload)).unwrap();
      onDone();
    } catch {
      Alert.alert('Gagal', 'Data pemasok tidak bisa disimpan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <p className="mb-4 text-lg font-bold text-ink">{supplier ? 'Ubah Pemasok' : 'Pemasok Baru'}</p>
      <div className="grid gap-x-3 sm:grid-cols-2">
        <FormControl label="Kode pemasok" isRequired helperText="mis. SUP-001">
          <Input autoFocus value={supplierCode} onChange={(e) => setSupplierCode(e.target.value.toUpperCase())} placeholder="mis. SUP-001" />
        </FormControl>
        <FormControl label="Nama pemasok" isRequired>
          <Input value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="Nama toko/perusahaan pemasok" />
        </FormControl>
        <FormControl label="Nama kontak (PIC)">
          <Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Opsional" />
        </FormControl>
        <FormControl label="No. HP">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Opsional" type="tel" />
        </FormControl>
      </div>
      <FormControl label="Email">
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Opsional" type="email" />
      </FormControl>
      <FormControl label="Alamat">
        <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Opsional" />
      </FormControl>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} className="min-w-[90px]">
          Batal
        </Button>
        <Button type="submit" loading={submitting} disabled={!supplierCode || !supplierName} className="min-w-[90px]">
          Simpan
        </Button>
      </div>
    </form>
  );
}
