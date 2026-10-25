import { cn } from '@/utils/cn';
import { DiscountIcon, TruckIcon } from '@/components/ui/icons/DataIcons';
import { PrintIcon, CheckCircleIcon } from '@/components/ui/icons/ActionIcons';
import { PeopleIcon, LayersIcon, EmployeeIcon } from '@/components/ui/icons/NavIcons';
import { MockCaption, OrdersMockup, ReportMockup, StockMockup, PosMockup } from '@/features/landing/components/mockups';
import { Heading, Section } from '@/features/landing/components/sections/primitives';
import { MAIN_FEATURES, ROADMAP, MORE_FEATURES } from '@/features/landing/content';

const MOCKS = { pos: PosMockup, stock: StockMockup, report: ReportMockup, orders: OrdersMockup };

const MORE_ICONS = { employee: EmployeeIcon, people: PeopleIcon, truck: TruckIcon, discount: DiscountIcon, layers: LayersIcon, print: PrintIcon };

export function FeaturesSection() {
  return (
    <Section id="fitur" labelledBy="fitur-title" className="bg-gray-25">
      <Heading
        id="fitur-title"
        eyebrow="Fitur"
        title="Semua yang dibutuhkan untuk menjalankan toko"
        lead="Dari meja kasir sampai gudang dan laporan — setiap fitur dibuat untuk menghemat waktu dan memberi Anda kendali."
        center
      />
      <div className="mt-16 space-y-24">
        {MAIN_FEATURES.map((f, i) => {
          const Mock = MOCKS[f.mock];
          return (
            <article key={f.id} aria-labelledby={`f-${f.id}`} className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div className={cn(i % 2 === 1 && 'lg:order-2')}>
                <p className="text-sm font-bold text-pine-700">{f.eyebrow}</p>
                <h3 id={`f-${f.id}`} className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {f.title}
                </h3>
                <p className="mt-4 leading-relaxed text-ink-2">{f.what}</p>
                <p className="mt-4 rounded-xl border-l-4 border-electric-500 bg-white px-4 py-3 text-[15px] leading-relaxed text-ink shadow-sm">
                  <span className="font-bold">Kenapa penting: </span>
                  {f.why}
                </p>
                <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                  {f.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-sm text-ink-2">
                      <CheckCircleIcon size={18} className="mt-px shrink-0 text-electric-600" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={cn(i % 2 === 1 && 'lg:order-1')}>
                <Mock />
                <MockCaption />
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-24">
        <h3 className="text-xl font-extrabold">Dan masih banyak lagi</h3>
        <ul className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 sm:grid-cols-2 lg:grid-cols-3">
          {MORE_FEATURES.map((m) => {
            const Icon = MORE_ICONS[m.icon];
            return (
              <li key={m.title} className="bg-white p-6">
                <Icon size={22} className="text-electric-700" />
                <p className="mt-3 font-bold">{m.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-2">{m.text}</p>
              </li>
            );
          })}
        </ul>
        <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-5">
          <p className="text-sm font-bold text-ink">Sedang disiapkan</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {ROADMAP.map((r) => (
              <li key={r} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-ink-2">
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
