import { HeroSection } from "@/components/home/hero-section";
import { ServicesSection } from "@/components/home/services-section";
import { GardenSection } from "@/components/home/garden-section";
import { PodcastSection } from "@/components/home/podcast-section";
import { DonorSection } from "@/components/home/donor-section";
import { ImpactSection } from "@/components/home/impact-section";
import { CtaSection } from "@/components/home/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <GardenSection />
      <PodcastSection />
      <ImpactSection />
      <DonorSection />
      <CtaSection />
    </>
  );
}
