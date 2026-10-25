/** `YYYY-MM-DD` (UTC) untuk parameter API. */
export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Tanggal singkat, mis. `13 Okt 2026`. */
export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Tanggal + jam singkat, mis. `13 Okt, 22.41`. */
export function formatDateTimeShort(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/** Label hari ini, mis. `Sabtu, 25 Oktober` (atau `25 Okt` bila month = 'short'). */
export function todayLabel(month: 'long' | 'short' = 'long'): string {
  return new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month });
}

/** "baru saja", "5 mnt lalu", "2 jam lalu", atau tanggal. */
export function timeAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'baru saja';
  if (minutes < 60) return `${minutes} mnt lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function timeLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const time = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  return date.toDateString() === today.toDateString()
    ? `Hari ini ${time}`
    : `${date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} ${time}`;
}

export function dateTimeLabel(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

/** ISO → "yyyy-mm-dd" (tanggal lokal) untuk <input type="date">. */
export const toInputDate = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** "yyyy-mm-dd" → ISO akhir hari itu (waktu perangkat). */
export const fromInputDate = (value: string): string | null => {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d, 23, 59, 59).toISOString();
};

export const daysFromNow = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toInputDate(d.toISOString());
};

/** "2 jam 15 mnt" sejak waktu tertentu. */
export function durationSince(iso: string): string {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours} jam ${minutes % 60} mnt` : `${minutes} mnt`;
}
