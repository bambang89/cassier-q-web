import { LandingNav } from '@/features/landing/components/LandingNav';
import { HeroSection } from '@/features/landing/components/sections/HeroSection';
import { TrustStrip } from '@/features/landing/components/sections/TrustStrip';
import { PainSection } from '@/features/landing/components/sections/PainSection';
import { FeaturesSection } from '@/features/landing/components/sections/FeaturesSection';
import { SolutionsSection } from '@/features/landing/components/sections/SolutionsSection';
import { DemoSection } from '@/features/landing/components/sections/DemoSection';
import { BenefitsSection } from '@/features/landing/components/sections/BenefitsSection';
import { StepsSection } from '@/features/landing/components/sections/StepsSection';
import { PricingSection } from '@/features/landing/components/sections/PricingSection';
import { TestimonialsSection } from '@/features/landing/components/sections/TestimonialsSection';
import { AboutSection } from '@/features/landing/components/sections/AboutSection';
import { FaqSection } from '@/features/landing/components/sections/FaqSection';
import { FinalCtaSection } from '@/features/landing/components/sections/FinalCtaSection';
import { LandingFooter } from '@/features/landing/components/sections/LandingFooter';

export function LandingPage() {
  return (
    <div className="bg-white text-ink">
      <a href="#konten" className="sr-only z-[60] rounded-lg bg-white px-4 py-2 font-semibold focus:not-sr-only focus:fixed focus:left-4 focus:top-3">
        Lewati ke konten
      </a>
      <LandingNav />

      <main id="konten">
        <HeroSection />
        <TrustStrip />
        <PainSection />
        <FeaturesSection />
        <SolutionsSection />
        <DemoSection />
        <BenefitsSection />
        <StepsSection />
        <PricingSection />
        <TestimonialsSection />
        <AboutSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}

