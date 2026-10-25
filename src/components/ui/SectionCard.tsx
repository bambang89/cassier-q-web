import type { ReactNode } from 'react';

/** Kartu bagian form dengan judul kecil di atasnya. */
export function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <p className="mb-2 ml-1 text-[11.5px] font-bold tracking-[0.08em] text-ink-3">{title.toUpperCase()}</p>
      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">{children}</div>
    </section>
  );
}
