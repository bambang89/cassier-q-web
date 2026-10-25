import { whatsappLink, LANDING } from '@/config/site';
import { ChatIcon } from '@/components/ui/icons/DataIcons';
import { ArrowRightIcon } from '@/components/ui/icons/NavIcons';
import { TrackedLink } from '@/features/landing/components/ui';
import { LeadForm } from '@/features/landing/components/LeadForm';

export function FinalCtaSection() {
  const wa = whatsappLink(`Halo tim ${LANDING.brand}, saya ingin tahu lebih lanjut tentang aplikasi kasirnya.`);
  return (
    <section id="konsultasi" aria-labelledby="cta-title" className="scroll-mt-16 bg-night px-4 py-20 text-white sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <h2 id="cta-title" className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            Siap membuat pengelolaan bisnis lebih praktis?
          </h2>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-gray-300">Kenali cara yang lebih mudah untuk mengelola transaksi dan memahami performa bisnis Anda.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <TrackedLink href={LANDING.routes.register} variant="onDark" size="lg" event="cta_primary_click" eventProps={{ placement: 'final' }}>
              Mulai Sekarang <ArrowRightIcon size={18} />
            </TrackedLink>
            {wa && (
              <TrackedLink href={wa} external variant="onDarkGhost" size="lg" event="whatsapp_click" eventProps={{ placement: 'final' }}>
                <ChatIcon size={18} /> Chat WhatsApp
              </TrackedLink>
            )}
          </div>
          <p className="mt-6 text-sm text-gray-400">Atau isi form — tim kami akan menghubungi Anda untuk konsultasi.</p>
        </div>
        <LeadForm />
      </div>
    </section>
  );
}
