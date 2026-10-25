'use client';

import { useState, useEffect } from 'react';

import type { Employee } from '@/types/models';
import * as employeesApi from '@/services/employeesApi';
import { fetchEmployees } from '@/lib/store/slices/employeesSlice';
import { Alert } from '@/lib/alert';
import { useAppDispatch } from '@/hooks/store';
import { photoProblem, pickPhoto } from '@/utils/pickPhoto';
import { apiErrorMessage } from '@/utils/apiErrors';
import { FormControl, PasswordInput, Input, Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { PencilIcon } from '@/components/ui/icons/ActionIcons';
import { Avatar } from '@/features/employees/components/EmployeeAvatar';

export function EmployeeForm({
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
