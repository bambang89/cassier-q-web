import { LANDING } from '@/config/site';
import { CheckCircleIcon } from '@/components/ui/icons/ActionIcons';
import { ArrowRightIcon } from '@/components/ui/icons/NavIcons';
import { MockCaption, PhoneStoreMockup, PosMockup } from '@/features/landing/components/mockups';
import { TrackedLink } from '@/features/landing/components/ui';

export function HeroSection() {
  return (
    <section aria-labelledby="hero-title" className="relative -mt-16 overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[640px] bg-[radial-gradient(60%_50%_at_70%_10%,rgb(61_123_255/0.14),transparent_70%),radial-gradient(40%_40%_at_10%_30%,rgb(14_122_91/0.10),transparent_70%)]"
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-electric-100 bg-electric-50 px-3 py-1 text-[13px] font-semibold text-electric-700">
            <span className="size-1.5 rounded-full bg-pine-500" />
            Aplikasi kasir & manajemen usaha
          </p>
          <h1 id="hero-title" className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-balance sm:text-5xl lg:text-[3.4rem]">
            Bisnis makin mudah, semua penjualan dalam{' '}
            <span className="bg-gradient-to-r from-electric-600 to-pine-600 bg-clip-text text-transparent">satu genggaman.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2 text-pretty">
            Kelola transaksi, pantau stok, dan pahami performa bisnis Anda melalui satu sistem POS yang dirancang untuk UMKM, toko retail, kafe, dan usaha yang
            sedang berkembang.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <TrackedLink href={LANDING.routes.register} variant="primary" size="lg" event="cta_primary_click" eventProps={{ placement: 'hero' }}>
              Mulai Sekarang <ArrowRightIcon size={18} />
            </TrackedLink>
            <TrackedLink href="#demo" variant="secondary" size="lg" event="cta_secondary_click" eventProps={{ placement: 'hero' }}>
              Lihat Cara Kerjanya
            </TrackedLink>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-2">
            {['Kasir, stok & laporan', 'Web dan aplikasi mobile', 'Toko online & pesanan meja'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <CheckCircleIcon size={18} className="text-pine-600" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <PosMockup />
          <PhoneStoreMockup className="absolute -bottom-10 -left-4 hidden sm:block lg:-left-12" />
          <MockCaption className="sm:mt-14" />
        </div>
      </div>
    </section>
  );
}
