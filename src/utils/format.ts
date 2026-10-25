/** Rupiah, mis. `Rp12.000`, atau `Rp 12.000` bila `spaced`. Nilai negatif bertanda di depan. */
export function formatRupiah(value: number, spaced = false): string {
  const amount = Math.abs(Math.round(value)).toLocaleString('id-ID');
  return `${value < 0 ? '-' : ''}Rp${spaced ? ' ' : ''}${amount}`;
}

/** Angka tanpa nol di belakang, mis. 12 atau 1,5. */
export function formatQty(value: number): string {
  return Number(value).toLocaleString('id-ID', { maximumFractionDigits: 3 });
}
