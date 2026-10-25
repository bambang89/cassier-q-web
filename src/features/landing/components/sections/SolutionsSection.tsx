import { cn } from '@/utils/cn';
import { Heading, Section } from '@/features/landing/components/sections/primitives';
import { SOLUTIONS } from '@/features/landing/content';

export function SolutionsSection() {
  return (
    <Section id="solusi" labelledBy="solusi-title">
      <Heading
        id="solusi-title"
        eyebrow="Solusi bisnis"
        title="Satu sistem POS untuk berbagai jenis bisnis"
        lead="Fitur yang sama, dipakai dengan cara yang paling pas untuk usaha Anda."
      />
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SOLUTIONS.map((s, i) => (
          <article key={s.title} className="group flex flex-col rounded-2xl border border-gray-200 p-6 transition-colors hover:border-electric-400">
            <span
              aria-hidden="true"
              className={cn(
                'flex size-11 items-center justify-center rounded-xl text-lg font-extrabold text-white',
                ['bg-electric-600', 'bg-pine-600', 'bg-violet-600', 'bg-navy-800', 'bg-cyan-700', 'bg-electric-700'][i],
              )}
            >
              {s.title[0]}
            </span>
            <h3 className="mt-4 text-lg font-extrabold">{s.title}</h3>
            <p className="mt-2 text-sm text-ink-3">
              <span className="font-semibold text-ink-2">Tantangan: </span>
              {s.challenge}
            </p>
            <p className="mt-3 leading-relaxed text-ink-2">{s.help}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
