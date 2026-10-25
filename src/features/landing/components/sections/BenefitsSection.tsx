import { cn } from '@/utils/cn';
import { Heading, Section } from '@/features/landing/components/sections/primitives';
import { BENEFITS } from '@/features/landing/content';

export function BenefitsSection() {
  return (
    <Section labelledBy="benefit-title" className="bg-night text-white">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <Heading
          id="benefit-title"
          eyebrow="Hasil untuk usaha Anda"
          title="Lebih sedikit urusan administrasi, lebih banyak waktu untuk berjualan"
          lead="cassier-Q tidak menjanjikan angka ajaib. Yang kami tawarkan: catatan yang rapi dan informasi yang jelas, supaya keputusan Anda lebih tepat."
          dark
        />
        <ul className="grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2">
          {BENEFITS.map((b, i) => (
            <li key={b.title} className={cn('bg-night p-6', i === BENEFITS.length - 1 && 'sm:col-span-2')}>
              <p className="text-lg font-bold">{b.title}</p>
              <p className="mt-1.5 text-gray-400">{b.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
