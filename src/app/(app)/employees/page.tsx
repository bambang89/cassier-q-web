'use client';

import { useEffect, useState } from 'react';

import * as employeesApi from '@/api/employeesApi';
import { apiErrorMessage } from '@/api/errors';
import type { Employee } from '@/types/models';
import { Alert } from '@/lib/alert';
import { photoProblem, pickPhoto } from '@/lib/pickPhoto';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { deactivateEmployee, fetchEmployees, reactivateEmployee } from '@/store/slices/employeesSlice';
import { fetchRoles } from '@/store/slices/rolesSlice';
import { PageBody, PageHeader } from '@/components/layout/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import { FormControl, Input, PasswordInput, Select } from '@/components/ui/Field';
import { Badge, EmptyState } from '@/components/ui/Display';
import { ActionMenu } from '@/components/ui/ActionMenu';
import { LoadingBlock } from '@/components/ui/Spinner';
import { EmployeeIcon, PencilIcon, PlusIcon } from '@/components/icons/LineIcons';

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

function Avatar({ employee, size = 'size-10' }: { employee: Pick<Employee, 'name' | 'photoUrl'>; size?: string }) {
  return (
    <span className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-info-600 to-primary-600 font-bold text-white`}>
      {employee.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={employee.photoUrl} alt="" className="size-full object-cover" />
      ) : (
        employee.name.charAt(0).toUpperCase()
      )}
    </span>
  );
}

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

function EmployeeForm({
  employee,
  roleOptions,
  onDone,
  onCancel,
}: {
  employee: Employee | null;
  roleOptions: { label: string; value: string }[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(employee?.name ?? '');
  const [username, setUsername] = useState(employee?.username ?? '');
  const [email, setEmail] = useState(employee?.email ?? '');
  const [phone, setPhone] = useState(employee?.phone ?? '');
  const [password, setPassword] = useState('');
  const [roleCode, setRoleCode] = useState<string | null>(employee?.roles[0] ?? null);
  const [nationalId, setNationalId] = useState(employee?.nationalId ?? '');
  const [employeeNumber, setEmployeeNumber] = useState(employee?.employeeNumber ?? '');
  // Foto dipilih di form, diunggah setelah karyawan tersimpan. 'remove' = hapus foto saat ini.
  const [photo, setPhoto] = useState<File | 'remove' | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!(photo instanceof File)) return setPhotoPreview(null);
    const url = URL.createObjectURL(photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const nationalIdValid = nationalId === '' || /^\d{16}$/.test(nationalId);
  const canSubmit = nationalIdValid && (employee ? !!name && !!roleCode : !!name && !!username && password.length >= 8 && !!roleCode);
  const previewUri = photo === 'remove' ? null : (photoPreview ?? employee?.photoUrl ?? null);

  const choosePhoto = async () => {
    const file = await pickPhoto();
    if (!file) return;
    const problem = photoProblem(file);
    if (problem) return Alert.alert('Foto tidak valid', problem);
    setPhoto(file);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleCode || !canSubmit) return;
    setSubmitting(true);
    const identity = { nationalId: nationalId.trim() || undefined, employeeNumber: employeeNumber.trim() || undefined };
    try {
      const saved = employee
        ? await employeesApi.updateEmployee(employee.employeeId, { name, email: email || undefined, phone: phone || undefined, roleCode, ...identity })
        : await employeesApi.createEmployee({ name, username, email: email || undefined, phone: phone || undefined, password, roleCode, ...identity });
      try {
        if (photo === 'remove') await employeesApi.removeEmployeePhoto(saved.employeeId);
        else if (photo) await employeesApi.uploadEmployeePhoto(saved.employeeId, photo);
      } catch (error) {
        Alert.alert('Foto belum tersimpan', apiErrorMessage(error, 'Data karyawan tersimpan, tetapi fotonya gagal diunggah.'));
      }
      dispatch(fetchEmployees());
      onDone();
    } catch (error) {
      Alert.alert(
        'Gagal',
        apiErrorMessage(error, employee ? 'Data karyawan tidak bisa disimpan.' : 'Karyawan tidak bisa ditambahkan (mungkin username sudah dipakai).'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <p className="mb-4 text-lg font-bold text-ink">{employee ? 'Ubah Karyawan' : 'Karyawan Baru'}</p>
      <div className="mb-5 flex items-center gap-4 rounded-xl bg-gray-50 p-4">
        <button type="button" onClick={choosePhoto} className="relative cursor-pointer" aria-label="Pilih foto karyawan">
          <Avatar employee={{ name: name || '?', photoUrl: previewUri }} size="size-16" />
          <span className="absolute -right-0.5 -bottom-0.5 flex size-6 items-center justify-center rounded-full border-2 border-white bg-primary-600 text-white">
            <PencilIcon size={11} />
          </span>
        </button>
        <div>
          <p className="text-sm font-semibold text-ink">Foto karyawan</p>
          <p className="text-[12.5px] text-ink-3">Opsional · JPG/PNG/WEBP maks. 5MB</p>
          <div className="mt-1 flex gap-3">
            <button type="button" onClick={choosePhoto} className="cursor-pointer text-[12.5px] font-semibold text-primary-600">
              {previewUri ? 'Ganti foto' : 'Tambah foto'}
            </button>
            {previewUri ? (
              <button type="button" onClick={() => setPhoto('remove')} className="cursor-pointer text-[12.5px] font-semibold text-error-600">
                Hapus
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <FormControl label="Nama" isRequired>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" />
      </FormControl>
      {!employee ? (
        <div className="grid gap-x-3 sm:grid-cols-2">
          <FormControl label="Username" isRequired helperText="Dipakai untuk login, tidak bisa diubah nanti">
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="mis. kasir2" autoCapitalize="none" autoComplete="off" />
          </FormControl>
          <FormControl label="Kata sandi awal" isRequired helperText="Minimal 8 karakter">
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
          </FormControl>
        </div>
      ) : (
        <p className="-mt-2 mb-4 text-[12.5px] text-ink-3">Username: @{employee.username} (tidak bisa diubah di sini)</p>
      )}
      <div className="grid gap-x-3 sm:grid-cols-2">
        <FormControl label="Email">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Opsional" type="email" />
        </FormControl>
        <FormControl label="No. HP">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Opsional" type="tel" />
        </FormControl>
      </div>
      <FormControl label="Role" isRequired>
        <Select value={roleCode} onChange={setRoleCode} placeholder="Pilih role" options={roleOptions} />
      </FormControl>
      <div className="grid gap-x-3 sm:grid-cols-2">
        <FormControl label="NIK KTP" isInvalid={!nationalIdValid} errorText="NIK KTP harus 16 angka" helperText="Opsional · 16 angka sesuai KTP">
          <Input value={nationalId} onChange={(e) => setNationalId(e.target.value.replace(/\D/g, '').slice(0, 16))} placeholder="Opsional" inputMode="numeric" maxLength={16} />
        </FormControl>
        <FormControl label="NIK Karyawan" helperText="Opsional · nomor induk karyawan di toko">
          <Input value={employeeNumber} onChange={(e) => setEmployeeNumber(e.target.value.toUpperCase())} placeholder="mis. HDY-2026-001" maxLength={50} />
        </FormControl>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} className="min-w-[90px]">
          Batal
        </Button>
        <Button type="submit" loading={submitting} disabled={!canSubmit} className="min-w-[90px]">
          Simpan
        </Button>
      </div>
    </form>
  );
}
