import { ProductDemo } from '@/features/landing/components/ProductDemo';
import { Heading, Section } from '@/features/landing/components/sections/primitives';
import { TrackedLink } from '@/features/landing/components/ui';

export function DemoSection() {
  return (
    <Section id="demo" labelledBy="demo-title" className="bg-gray-25">
      <Heading id="demo-title" eyebrow="Lihat cara kerjanya" title="Sederhana sejak hari pertama" lead="Pilih bagian aplikasi untuk melihat alurnya." center />
      <div className="mt-10">
        <ProductDemo />
      </div>
      <div className="mt-12 text-center">
        <TrackedLink href="#fitur" variant="secondary" size="lg" event="cta_secondary_click" eventProps={{ placement: 'demo' }}>
          Jelajahi Fitur POS
        </TrackedLink>
      </div>
    </Section>
  );
}
