import { whatsappLink, LANDING } from '@/config/site';
import { MailIcon, ChatIcon } from '@/components/ui/icons/DataIcons';
import { SOLUTIONS, NAV_LINKS } from '@/features/landing/content';
import { TrackedLink } from '@/features/landing/components/ui';

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-sm font-bold text-white">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} className="hover:text-white">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LandingFooter() {
  const wa = whatsappLink(`Halo tim ${LANDING.brand}, saya ingin tahu lebih lanjut tentang aplikasi kasirnya.`);
  return (
    <footer className="bg-night px-4 pb-10 text-gray-400 sm:px-6">
      <div className="mx-auto max-w-6xl border-t border-white/10 pt-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/branding/cassier-q-logo-horizontal-ondark.svg" alt="cassier-Q" width={97} height={40} className="h-10 w-auto" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed">Aplikasi kasir dan manajemen usaha untuk UMKM, toko retail, dan kafe di Indonesia.</p>
          </div>
          <FooterCol title="Produk" links={[...NAV_LINKS.slice(0, 1), { href: '#demo', label: 'Cara kerja' }, { href: '#harga', label: 'Harga' }, { href: '#faq', label: 'FAQ' }]} />
          <FooterCol title="Solusi" links={SOLUTIONS.slice(0, 4).map((s) => ({ href: '#solusi', label: s.title }))} />
          <div>
            <p className="text-sm font-bold text-white">Kontak</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {wa && (
                <li>
                  <TrackedLink href={wa} external event="whatsapp_click" eventProps={{ placement: 'footer' }} className="inline-flex items-center gap-2 hover:text-white">
                    <ChatIcon size={16} /> WhatsApp
                  </TrackedLink>
                </li>
              )}
              {LANDING.contact.email && (
                <li>
                  <a href={`mailto:${LANDING.contact.email}`} className="inline-flex items-center gap-2 hover:text-white">
                    <MailIcon size={16} /> {LANDING.contact.email}
                  </a>
                </li>
              )}
              {LANDING.contact.address && <li>{LANDING.contact.address}</li>}
              <li>
                <a href="#konsultasi" className="hover:text-white">
                  Form konsultasi
                </a>
              </li>
              <li>
                <TrackedLink href={LANDING.routes.login} className="hover:text-white">
                  Masuk ke aplikasi
                </TrackedLink>
              </li>
            </ul>
            {LANDING.social.length > 0 && (
              <ul className="mt-4 flex gap-3 text-sm">
                {LANDING.social.map((s) => (
                  <li key={s.href}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} cassier-Q. Hak cipta dilindungi.</p>
          <ul className="flex gap-5">
            {LANDING.legal.privacy && (
              <li>
                <a href={LANDING.legal.privacy} className="hover:text-white">
                  Kebijakan Privasi
                </a>
              </li>
            )}
            {LANDING.legal.terms && (
              <li>
                <a href={LANDING.legal.terms} className="hover:text-white">
                  Syarat & Ketentuan
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
    </footer>
  );
}
