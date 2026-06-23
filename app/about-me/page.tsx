"use client";

import Image from "next/image";
import MobileLanguageToggle from "@/components/MobileLanguageToggle";
import Navbar from "@/components/Navbar";
import SocialRail from "@/components/SocialRail";
import Background from "@/src/components/sections/Background";
import { LanguageProvider, useLanguage } from "@/src/context/LanguageContext";

function AboutContent() {
  const { t } = useLanguage();

  const pillars = [
    {
      title: t.whoAmI.title1,
      description: t.whoAmI.desc1,
    },
    {
      title: t.whoAmI.title2,
      description: t.whoAmI.desc2,
    },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0f172a] text-[#171717]">
      <div className="absolute inset-0 z-0 text-white/50">
        <Background variant="wallpaper" />
      </div>

      <div className="relative z-40">
        <SocialRail />
      </div>

      <div className="relative z-50">
        <Navbar />
      </div>

      <MobileLanguageToggle />

      <div className="relative z-20 px-3 py-24 sm:px-5 sm:py-28 lg:px-8">
        <main className="relative z-30 mx-auto max-w-[1400px] overflow-hidden rounded-none bg-[#FAF9F6] shadow-[0_0_80px_rgba(0,0,0,0.4)]">
          <section id="sobre-mi" className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_500px] lg:items-stretch xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
                <div className="max-w-4xl space-y-8">
                  <div className="flex items-center gap-4">
                    <span className="h-px w-10 bg-[#064e3b]/28" />
                    <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                      {t.whoAmI.subtitle}
                    </span>
                  </div>

                  <div className="space-y-12">
                    {pillars.map((pillar, index) => (
                      <div key={index} className="space-y-4">
                        <h3 className="font-sans text-4xl font-black tracking-tighter text-neutral-900 sm:text-5xl lg:text-6xl">
                          {pillar.title}
                        </h3>
                        <p className="text-lg font-light leading-relaxed tracking-[0.04em] text-neutral-600 sm:text-xl">
                          {pillar.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative h-[600px] overflow-hidden border-t border-neutral-200 lg:h-auto lg:min-h-full lg:border-l lg:border-t-0">
                <div className="absolute inset-0">
                  <Image
                    src="/1_ext.webp"
                    alt="Enzo Thome"
                    fill
                    quality={100}
                    priority
                    placeholder="blur"
                    blurDataURL="data:image/webp;base64,UklGRkIAAABXRUJQVlA4IDYAAADwAQCdASoKAAoAAUAmJZwAAt0M1h/eIAAA/vXrzYdRx5t0cByMfcUDWOh00p5zO0QVWuyAAAA="
                    className="object-cover object-center"
                    sizes="(min-width: 1024px) 1200px, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default function AboutMePage() {
  return (
    <LanguageProvider>
      <AboutContent />
    </LanguageProvider>
  );
}
