'use client';

import { useState } from 'react';

import { uploadStorefrontImage } from '@/services/storefrontApi';
import { Alert } from '@/lib/alert';
import { apiErrorMessage } from '@/utils/apiErrors';
import { cn } from '@/utils/cn';
import { pickPhoto, photoProblem } from '@/utils/pickPhoto';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';

export function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = async (file: File | null | undefined) => {
    if (!file) return;
    const problem = photoProblem(file);
    if (problem) return Alert.alert('Gambar tidak valid', problem);
    setUploading(true);
    try {
      onChange(await uploadStorefrontImage(file));
    } catch (error) {
      Alert.alert('Gagal', apiErrorMessage(error, 'Gambar gagal diunggah.'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <span className="mb-1 block text-sm font-semibold text-ink">{label}</span>
      {/* File gambar dari komputer bisa langsung diseret ke kotak ini. */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void uploadFile(e.dataTransfer.files?.[0]);
        }}
        className={cn('overflow-hidden rounded-xl border border-dashed bg-gray-50 transition', dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300')}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="aspect-[16/9] w-full object-cover" />
        ) : (
          <div className="flex aspect-[16/9] flex-col items-center justify-center gap-1 text-center text-sm text-ink-3">
            <span className="text-2xl">🖼️</span>
            {uploading ? 'Mengunggah…' : 'Seret gambar ke sini'}
          </div>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        <Button size="sm" variant="outline" onClick={async () => uploadFile(await pickPhoto())} loading={uploading} className="flex-1">
          {value ? 'Ganti Gambar' : 'Unggah Gambar'}
        </Button>
        {value ? (
          <Button size="sm" variant="ghost" onClick={() => onChange('')}>
            Hapus
          </Button>
        ) : null}
      </div>
      <details className="mt-2">
        <summary className="cursor-pointer text-[12px] text-ink-3">atau tempel URL gambar</summary>
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://…" className="mt-1" />
      </details>
    </div>
  );
}
