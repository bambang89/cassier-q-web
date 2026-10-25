import { Heading, Section } from '@/features/landing/components/sections/primitives';
import { FAQS } from '@/features/landing/content';

export function FaqSection() {
  return (
    <Section id="faq" labelledBy="faq-title" className="bg-gray-25">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <Heading id="faq-title" eyebrow="Pusat bantuan" title="Pertanyaan yang sering diajukan" lead="Belum menemukan jawabannya? Tanyakan langsung lewat form konsultasi." />
        <div className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">
          {FAQS.map((f) => (
            <details key={f.q} className="group px-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-500">
                <h3>{f.q}</h3>
                <span aria-hidden="true" className="text-xl leading-none text-ink-3 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-5 leading-relaxed text-ink-2">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
