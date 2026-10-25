'use client';

import { useEffect, useState } from 'react';

import type { Employee } from '@/types/models';
import { Alert } from '@/lib/alert';
import { deactivateEmployee, fetchEmployees, reactivateEmployee } from '@/lib/store/slices/employeesSlice';
import { fetchRoles } from '@/lib/store/slices/rolesSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { PageBody, PageHeader } from '@/components/common/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import { Badge, EmptyState } from '@/components/ui/Display';
import { ActionMenu } from '@/components/ui/ActionMenu';
import { LoadingBlock } from '@/components/ui/Spinner';
import { EmployeeIcon } from '@/components/ui/icons/NavIcons';
import { PlusIcon, PencilIcon } from '@/components/ui/icons/ActionIcons';
import { EmployeeForm } from '@/features/employees/components/EmployeeForm';
import { Avatar } from '@/features/employees/components/EmployeeAvatar';

// Dipakai bila GET /roles belum termuat — hanya role staf.
const FALLBACK_ROLE_OPTIONS = [
  { label: 'Kasir', value: 'KASIR' },
  { label: 'Staf Produk', value: 'PRODUCT' },
  { label: 'Staf Gudang', value: 'GUDANG' },
];

const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: 'Pemilik Aplikasi',
  KEPALA_TOKO: 'Kepala Toko',
  PRODUCT: 'Staf Produk',
  GUDANG: 'Staf Gudang',
  KASIR: 'Kasir',
};

export default function EmployeesPage() {
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector((state) => state.employees);
  const roles = useAppSelector((state) => state.roles.items);
  const user = useAppSelector((state) => state.auth.user);
  const [editing, setEditing] = useState<Employee | 'new' | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Employee | null>(null);

  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchRoles());
  }, [dispatch]);

  const roleOptions = roles.length > 0 ? roles.map((r) => ({ label: r.roleName, value: r.roleCode })) : FALLBACK_ROLE_OPTIONS;
  const roleLabel = (code: string) => roleOptions.find((r) => r.value === code)?.label ?? ROLE_LABELS[code] ?? code;
  // Kepala Toko tidak bisa menonaktifkan dirinya sendiri atau sesama Kepala Toko.
  const canToggle = (employee: Employee) => employee.userId !== user?.id && (!!user?.superadmin || !employee.roles.includes('KEPALA_TOKO'));

  const onToggleActive = async (employee: Employee) => {
    try {
      if (employee.active) await dispatch(deactivateEmployee(employee.employeeId)).unwrap();
      else await dispatch(reactivateEmployee(employee.employeeId)).unwrap();
    } catch {
      Alert.alert('Gagal', 'Status karyawan tidak bisa diubah.');
    } finally {
      setToggleTarget(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Karyawan"
        subtitle={`${items.length} akun karyawan`}
        phoneSubtitle="Kelola akun & akses karyawan"
        right={
          <Button size="sm" leftIcon={<PlusIcon size={14} />} onClick={() => setEditing('new')} className="hidden tab:inline-flex">
            Baru
          </Button>
        }
      />
      <PageBody>
        {items.length === 0 ? (
          status === 'loading' ? (
            <LoadingBlock label="Memuat karyawan..." />
          ) : (
            <EmptyState
              icon={EmployeeIcon}
              title="Belum Ada Karyawan Lain"
              description="Tambahkan akun untuk kasir/staf lain di toko ini — masing-masing bisa punya role sendiri (Kasir, Gudang, dst)."
              actionLabel="+ Tambah Karyawan"
              onAction={() => setEditing('new')}
            />
          )
        ) : (
          <>
            <div className="mx-auto hidden max-w-[1080px] overflow-hidden rounded-2xl border border-line bg-white shadow-card tab:block">
              <table className="w-full text-[13.5px]">
                <thead className="bg-gray-50 text-left text-[11.5px] font-semibold tracking-wide text-gray-500 uppercase">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Nama</th>
                    <th className="px-3 py-3 font-semibold">Peran</th>
                    <th className="px-3 py-3 font-semibold">Kontak</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="w-28 px-5 py-3 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.employeeId} className="border-t border-gray-100 hover:bg-gray-25">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar employee={item} size="size-9" />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-ink">{item.name}</p>
                            <p className="text-[12.5px] text-ink-3">@{item.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant="primary">{item.roles.map(roleLabel).join(', ')}</Badge>
                      </td>
                      <td className="px-3 py-3 text-ink-2">{item.phone ?? item.email ?? '—'}</td>
                      <td className="px-3 py-3">
                        <Badge variant={item.active ? 'success' : 'neutral'}>{item.active ? 'Aktif' : 'Nonaktif'}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditing(item)}
                            aria-label="Ubah"
                            className="flex size-8 cursor-pointer items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50"
                          >
                            <PencilIcon size={14} />
                          </button>
                          {canToggle(item) ? (
                            <ActionMenu actions={[{ label: item.active ? 'Nonaktifkan' : 'Aktifkan', destructive: item.active, onSelect: () => setToggleTarget(item) }]} />
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-2.5 tab:hidden">
              {items.map((item) => (
                <div key={item.employeeId} onClick={() => setEditing(item)} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-white p-3.5">
                  <Avatar employee={item} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{item.name}</p>
                    <p className="truncate text-[12.5px] text-ink-2">
                      @{item.username} · {item.roles.map(roleLabel).join(', ')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <Badge variant={item.active ? 'success' : 'neutral'}>{item.active ? 'Aktif' : 'Nonaktif'}</Badge>
                    {canToggle(item) ? (
                      <button type="button" onClick={() => setToggleTarget(item)} className="cursor-pointer text-[12.5px] font-semibold text-primary-600">
                        {item.active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </PageBody>

      <button
        type="button"
        aria-label="Tambah karyawan"
        onClick={() => setEditing('new')}
        className="fixed right-5 bottom-[96px] z-30 flex size-14 cursor-pointer items-center justify-center rounded-2xl bg-primary-600 text-white shadow-float active:scale-90 tab:hidden"
      >
        <PlusIcon size={24} />
      </button>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} size="lg">
        {editing ? (
          <EmployeeForm employee={editing === 'new' ? null : editing} roleOptions={roleOptions} onDone={() => setEditing(null)} onCancel={() => setEditing(null)} />
        ) : null}
      </Modal>
      <AlertDialog
        isOpen={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        title={toggleTarget?.active ? 'Nonaktifkan karyawan?' : 'Aktifkan kembali karyawan?'}
        description={
          toggleTarget?.active
            ? `"${toggleTarget?.name}" tidak akan bisa login lagi, sesi aktifnya juga langsung dicabut.`
            : `"${toggleTarget?.name}" akan bisa login lagi seperti biasa.`
        }
        confirmText={toggleTarget?.active ? 'Nonaktifkan' : 'Aktifkan'}
        isDanger={!!toggleTarget?.active}
        onConfirm={() => toggleTarget && onToggleActive(toggleTarget)}
      />
    </>
  );
}

