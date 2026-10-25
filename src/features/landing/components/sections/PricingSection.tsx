import { LANDING } from '@/config/site';
import { cn } from '@/utils/cn';
import { CheckCircleIcon } from '@/components/ui/icons/ActionIcons';
import { Heading, Section } from '@/features/landing/components/sections/primitives';
import { TrackedLink } from '@/features/landing/components/ui';

export function PricingSection() {
  return (
    <Section id="harga" labelledBy="harga-title" className="bg-gray-25">
      {LANDING.pricing ? (
        <>
          <Heading id="harga-title" eyebrow="Harga" title="Paket yang transparan" center />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {LANDING.pricing.map((p) => (
              <article key={p.name} className={cn('rounded-2xl border bg-white p-6', p.highlight ? 'border-electric-500 ring-1 ring-electric-500' : 'border-gray-200')}>
                <h3 className="font-extrabold">{p.name}</h3>
                <p className="mt-3 text-3xl font-extrabold">
                  {p.price}
                  <span className="text-base font-medium text-ink-3"> / {p.period}</span>
                </p>
                <ul className="mt-5 space-y-2 text-sm text-ink-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <CheckCircleIcon size={18} className="shrink-0 text-pine-600" />
                      {f}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-gray-200 bg-white p-8 sm:p-10 md:flex-row md:items-center">
          <div className="max-w-xl">
            <p className="text-sm font-bold text-electric-700">Harga</p>
            <h2 id="harga-title" className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Hubungi kami untuk informasi harga
            </h2>
            <p className="mt-3 leading-relaxed text-ink-2">Kami bantu memilih paket sesuai jumlah kasir, karyawan, dan kebutuhan usaha Anda.</p>
          </div>
          <TrackedLink href="#konsultasi" variant="primary" size="lg" event="demo_request" eventProps={{ placement: 'pricing' }}>
            Minta Penawaran
          </TrackedLink>
        </div>
      )}
    </Section>
  );
}
