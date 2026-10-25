import { LANDING } from '@/config/site';
import { Heading, Section } from '@/features/landing/components/sections/primitives';

export function TestimonialsSection() {
  return (
    <>
      {LANDING.testimonials.length > 0 && (
        <Section labelledBy="testi-title">
          <Heading id="testi-title" eyebrow="Cerita pengguna" title="Dipakai oleh pemilik usaha seperti Anda" center />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {LANDING.testimonials.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-gray-200 p-6">
                <blockquote className="leading-relaxed text-ink">“{t.quote}”</blockquote>
                <figcaption className="mt-4 text-sm">
                  <span className="font-bold">{t.name}</span> · <span className="text-ink-3">{t.business}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
