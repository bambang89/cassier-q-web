import { LANDING } from '@/config/site';
import { ArrowRightIcon } from '@/components/ui/icons/NavIcons';
import { Heading, Section } from '@/features/landing/components/sections/primitives';
import { TrackedLink } from '@/features/landing/components/ui';
import { STEPS } from '@/features/landing/content';

export function StepsSection() {
  return (
    <Section labelledBy="steps-title">
      <Heading id="steps-title" eyebrow="Cara memulai" title="Tiga langkah untuk mulai berjualan" center />
      <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
        <span aria-hidden="true" className="absolute left-5 top-5 bottom-5 w-px bg-gray-200 md:inset-x-[16%] md:top-5 md:bottom-auto md:h-px md:w-auto" />
        {STEPS.map((s, i) => (
          <li key={s.title} className="relative flex gap-5 md:flex-col md:items-center md:text-center">
            <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-electric-600 font-bold text-white ring-8 ring-white">{i + 1}</span>
            <div>
              <h3 className="text-lg font-extrabold">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-ink-2 md:mx-auto md:max-w-xs">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-12 text-center">
        <TrackedLink href={LANDING.routes.register} variant="primary" size="lg" event="registration_start" eventProps={{ placement: 'steps' }}>
          Daftarkan Toko Anda <ArrowRightIcon size={18} />
        </TrackedLink>
      </div>
    </Section>
  );
}
