import { CheckCircleIcon, MinusCircleIcon } from '@/components/ui/icons/ActionIcons';
import { Heading, Section } from '@/features/landing/components/sections/primitives';
import { PAINS } from '@/features/landing/content';

export function PainSection() {
  return (
    <Section labelledBy="pain-title">
      <Heading
        id="pain-title"
        eyebrow="Masalah sehari-hari"
        title="Usaha Anda layak dikelola tanpa tebak-tebakan"
        lead="Pemilik usaha menghabiskan banyak waktu untuk mencatat, merekap, dan mencocokkan. cassier-Q mengambil alih pekerjaan itu."
      />
      <div className="mt-12 overflow-hidden rounded-2xl border border-gray-200">
        <div className="hidden grid-cols-2 bg-gray-25 text-sm font-bold text-ink-2 md:grid">
          <p className="px-6 py-3">Tanpa sistem</p>
          <p className="border-l border-gray-200 px-6 py-3">Dengan cassier-Q</p>
        </div>
        {PAINS.map((p) => (
          <div key={p.pain} className="grid border-t border-gray-200 first:border-t-0 md:grid-cols-2 md:first:border-t">
            <p className="flex gap-3 px-6 pb-2 pt-5 font-semibold text-ink md:py-5">
              <MinusCircleIcon size={20} className="mt-0.5 shrink-0 text-error-500" />
              {p.pain}
            </p>
            <p className="flex gap-3 px-6 pb-5 pt-0 leading-relaxed text-ink-2 md:border-l md:border-gray-200 md:py-5">
              <CheckCircleIcon size={20} className="mt-0.5 shrink-0 text-pine-600" />
              {p.fix}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
