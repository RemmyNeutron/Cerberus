import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { PricingSection } from "@/components/pricing-section";
import { DonationSection } from "@/components/donation-section";
import { Footer } from "@/components/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <DonationSection />
      </main>
      <Footer />
    </div>
  );
}
