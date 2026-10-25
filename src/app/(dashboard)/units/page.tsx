'use client';

import { useEffect, useState } from 'react';

import type { Unit } from '@/types/models';
import { Alert } from '@/lib/alert';
import { createUnit, deleteUnit, fetchUnits, updateUnit } from '@/lib/store/slices/unitsSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { usePermissions } from '@/hooks/usePermissions';
import { PageBody, PageHeader } from '@/components/common/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import { FormControl, Input } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/Display';
import { LoadingBlock } from '@/components/ui/Spinner';
import { ListRow, RowIcon } from '@/components/ui/ListRow';
import { PlusIcon } from '@/components/ui/icons/ActionIcons';
import { ScaleIcon } from '@/components/ui/icons/DataIcons';

export default function UnitsPage() {
  const { can } = usePermissions();
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector((state) => state.units);
  const [editing, setEditing] = useState<Unit | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Unit | null>(null);

  useEffect(() => {
    dispatch(fetchUnits());
  }, [dispatch]);

  const onDelete = async (unit: Unit) => {
    try {
      await dispatch(deleteUnit(unit.id)).unwrap();
    } catch {
      Alert.alert('Gagal', 'Satuan tidak bisa dihapus (mungkin masih dipakai produk).');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Satuan"
        subtitle={`${items.length} satuan`}
        right={
          can('units.create') ? (
            <Button size="sm" leftIcon={<PlusIcon size={14} />} onClick={() => setEditing('new')}>
              Baru
            </Button>
          ) : undefined
        }
      />
      <PageBody>
        <div className="mx-auto grid max-w-[960px] gap-2.5 sm:grid-cols-2">
          {items.length === 0 ? (
            <div className="sm:col-span-2">
              {status === 'loading' ? (
                <LoadingBlock label="Memuat satuan..." />
              ) : (
                <EmptyState
                  icon={ScaleIcon}
                  title="Belum Ada Satuan"
                  description="Satuan (Pcs, Dus, Kg, dll) dipakai untuk menentukan cara jual produk. Buat dulu sebelum menambah produk baru."
                  actionLabel={can('units.create') ? '+ Buat Satuan' : undefined}
                  onAction={() => setEditing('new')}
                />
              )}
            </div>
          ) : (
            items.map((item, index) => (
              <ListRow
                key={item.id}
                index={index}
                onClick={can('units.update') ? () => setEditing(item) : undefined}
                icon={
                  <RowIcon>
                    <span className="text-[11px] font-extrabold tracking-wide">{item.unitCode.slice(0, 3)}</span>
                  </RowIcon>
                }
                title={item.unitName}
                subtitle={item.unitCode}
                right={
                  can('units.delete') ? (
                    <Button variant="ghost" size="sm" className="text-error-600 hover:bg-error-50" onClick={() => setDeleteTarget(item)}>
                      Hapus
                    </Button>
                  ) : null
                }
              />
            ))
          )}
        </div>
      </PageBody>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)}>
        {editing ? <UnitForm unit={editing === 'new' ? null : editing} onDone={() => setEditing(null)} onCancel={() => setEditing(null)} /> : null}
      </Modal>
      <AlertDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus satuan?"
        description={`"${deleteTarget?.unitName}" akan dihapus.`}
        confirmText="Hapus"
        isDanger
        onConfirm={() => deleteTarget && onDelete(deleteTarget)}
      />
    </>
  );
}

function UnitForm({ unit, onDone, onCancel }: { unit: Unit | null; onDone: () => void; onCancel: () => void }) {
  const dispatch = useAppDispatch();
  const [unitCode, setUnitCode] = useState(unit?.unitCode ?? '');
  const [unitName, setUnitName] = useState(unit?.unitName ?? '');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitCode || !unitName) return;
    setSubmitting(true);
    try {
      if (unit) await dispatch(updateUnit({ id: unit.id, payload: { unitCode, unitName } })).unwrap();
      else await dispatch(createUnit({ unitCode, unitName })).unwrap();
      onDone();
    } catch {
      Alert.alert('Gagal', 'Satuan tidak bisa disimpan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <p className="mb-4 text-lg font-bold text-ink">{unit ? 'Ubah Satuan' : 'Satuan Baru'}</p>
      <FormControl label="Kode satuan" isRequired helperText="mis. PCS, DUS, KG">
        <Input autoFocus value={unitCode} onChange={(e) => setUnitCode(e.target.value.toUpperCase())} placeholder="mis. PCS" />
      </FormControl>
      <FormControl label="Nama satuan" isRequired>
        <Input value={unitName} onChange={(e) => setUnitName(e.target.value)} placeholder="mis. Pieces" />
      </FormControl>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} className="min-w-[90px]">
          Batal
        </Button>
        <Button type="submit" loading={submitting} disabled={!unitCode || !unitName} className="min-w-[90px]">
          Simpan
        </Button>
      </div>
    </form>
  );
}
