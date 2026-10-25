import { GlobeIcon } from '@/components/ui/icons/NavIcons';
import { DevicesIcon } from '@/components/ui/icons/DataIcons';
import { Heading, Section } from '@/features/landing/components/sections/primitives';

export function AboutSection() {
  return (
    <Section id="tentang" labelledBy="tentang-title">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <Heading
          id="tentang-title"
          eyebrow="Tentang kami"
          title="Dibuat untuk usaha Indonesia"
          lead="cassier-Q dibuat untuk kebutuhan yang sederhana: pemilik usaha ingin tahu apa yang terjual, berapa stok yang tersisa, dan bagaimana usahanya berjalan — tanpa harus merekap manual setiap malam."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { Icon: GlobeIcon, title: 'Bahasa Indonesia', text: 'Seluruh aplikasi, struk, dan laporan berbahasa Indonesia, dengan format Rupiah.' },
            { Icon: DevicesIcon, title: 'Satu akun, banyak perangkat', text: 'Pemilik dan karyawan masuk dengan akun masing-masing.' },
          ].map(({ Icon, title, text }) => (
            <div key={title} className="rounded-2xl bg-gray-25 p-6">
              <Icon size={22} className="text-pine-600" />
              <p className="mt-3 font-bold">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-2">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
