import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/marketing/hero";
import { TrustSection } from "@/components/marketing/trust";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { FeatureShowcase } from "@/components/marketing/features";
import { CommunitySection } from "@/components/marketing/community";
import { TemplatesPreview } from "@/components/marketing/templates-preview";
import { CategoriesSection } from "@/components/marketing/categories";
import { IndustriesSection } from "@/components/marketing/industries";
import { DigitalGrowthSection } from "@/components/marketing/digital-growth";
import { FaqSection } from "@/components/marketing/faq";
import { CtaSection } from "@/components/marketing/cta";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col selection:bg-blue-600 selection:text-white">
      {/* Sticky Header with Horizontal Logo */}
      <Header />

      {/* Landing Page Content */}
      <main className="flex-1">
        {/* SEO H1 Hero Section */}
        <Hero />

        {/* Concise Trust Cards */}
        <TrustSection />

        {/* 6-Step Workflow */}
        <HowItWorks />

        {/* Modern Feature Cards */}
        <FeatureShowcase />

        {/* Contributor Ecosystem */}
        <CommunitySection />

        {/* Template Library Preview */}
        <TemplatesPreview />

        {/* Category Cards */}
        <CategoriesSection />

        {/* Industry Benefit Cards */}
        <IndustriesSection />

        {/* Digital Growth Audit Recommendations */}
        <DigitalGrowthSection />

        {/* SEO FAQ Accordion */}
        <FaqSection />

        {/* Final Conversion CTA */}
        <CtaSection />
      </main>

      {/* Footer with Vertical Logo */}
      <Footer />
    </div>
  );
}
