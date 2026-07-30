import MobileLanguageToggle from "@/components/MobileLanguageToggle";
import Navbar from "@/components/Navbar";
import SocialRail from "@/components/SocialRail";
import Background from "@/src/components/sections/Background";
import ContactoSection from "@/src/components/sections/ContactoSection";
import HeroSection from "@/src/components/sections/HeroSection";
import MetricasSection from "@/src/components/sections/MetricasSection";
import QueHagoSection from "@/src/components/sections/QueHagoSection";
import TestimoniosSection from "@/src/components/sections/TestimoniosSection";
import { LanguageProvider } from "@/src/context/LanguageContext";

export default function Home() {
  return (
    <LanguageProvider>
      <div className="relative min-h-screen overflow-x-hidden text-[#FAF9F6]">
        <div className="fixed inset-0 z-0">
          <Background variant="wallpaper" />
        </div>

        <div className="relative z-40">
          <SocialRail />
        </div>

        <div className="relative z-50">
          <Navbar />
        </div>

        <MobileLanguageToggle />

        {/* Section 1: Hero */}
        <section className="w-full bg-transparent text-[#FAF9F6] relative z-20">
          <HeroSection />
        </section>

        {/* Section 2: Metricas */}
        <section className="w-full bg-[#FAF9F6]/45 backdrop-blur-md text-[#0f172a] relative z-20">
          <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-12">
            <MetricasSection />
          </div>
        </section>

        {/* Section 3: Que Hago */}
        <section className="w-full bg-transparent text-[#FAF9F6] relative z-20">
          <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-12">
            <QueHagoSection />
          </div>
        </section>

        {/* Section 4: Testimonios */}
        <section className="w-full bg-[#FAF9F6]/45 backdrop-blur-md text-[#0f172a] relative z-20">
          <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-12">
            <TestimoniosSection />
          </div>
        </section>

        {/* Section 5: Contacto */}
        <section className="w-full bg-transparent text-[#FAF9F6] relative z-20">
          <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-12">
            <ContactoSection />
          </div>
        </section>
      </div>
    </LanguageProvider>
  );
}

