// Padanan services/photos/pickPhoto mobile: buka pemilih file (atau kamera di HP).
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

export function pickPhoto(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = ACCEPTED.join(',');
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.oncancel = () => resolve(null);
    input.click();
  });
}

/** Pesan validasi bila file tidak memenuhi syarat backend (JPG/PNG/WEBP, maks 5MB); null bila oke. */
export function photoProblem(file: File): string | null {
  if (!ACCEPTED.includes(file.type)) return 'Foto harus berformat JPG, PNG, atau WEBP.';
  if (file.size > MAX_BYTES) return 'Ukuran foto maksimal 5MB.';
  return null;
}
