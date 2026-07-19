"use client";

import Link from "next/link";
import { useLanguage } from "@/src/context/LanguageContext";
import SystemMap from "./SystemMap";

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-transparent text-white">
      {/* Background System Architecture Layer */}
      <SystemMap />

      <div className="relative z-10 grid min-h-screen w-full grid-cols-1 gap-12 md:gap-0 px-6 pt-32 sm:pt-28 md:pt-0 pb-16 sm:pb-20 md:py-0 text-center sm:px-10 sm:pb-20 md:grid-cols-2 md:px-12 md:py-0">
        <div className="order-1 flex items-start justify-center md:order-2 md:items-center md:justify-center md:pr-16 lg:pr-28 xl:pr-40">
          <div className="flex max-w-md flex-col items-center text-center justify-center w-full md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto">
            <h1 className="font-sans text-6xl sm:text-7xl md:text-6xl lg:text-7xl xl:text-[7.5rem] font-black leading-[0.95] tracking-tighter text-white text-center mx-auto w-full">
              <span className="block opacity-90 text-center">{t.hero.titleLine1}</span>
              <span className="block opacity-90 text-center">{t.hero.titleLine2}</span>
              <span className="block opacity-90 text-center">{t.hero.titleLine3}</span>
            </h1>
            <div className="mt-6 h-px w-20 bg-gradient-to-r from-transparent via-white/40 to-transparent md:mt-8 md:w-24" />
            <p className="mt-8 max-w-md text-base font-normal leading-relaxed text-white sm:text-lg md:text-xl text-center mx-auto">
              {t.hero.description}
            </p>
          </div>
        </div>

        <div className="order-2 flex items-end justify-center mt-24 sm:mt-28 md:mt-0 md:order-1 md:items-center pb-4 md:pb-0">
          <div className="flex max-w-sm flex-col items-center text-center">
            {/* Raiz del Mindmap a partir de este botón */}
            <Link
              href="/onboarding"
              className="group relative rounded-[1.125rem] border border-white/10 bg-white/5 px-12 py-5 text-sm font-medium tracking-[0.2em] text-white backdrop-blur-xl transition-all duration-700 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]"
            >
              {t.hero.ctaPrimary}
              {/* Sutil resplandor interior */}
              <div className="absolute inset-0 rounded-[1.125rem] bg-gradient-to-tr from-white/0 to-white/5 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
            </Link>
            <p className="mt-8 max-w-[18rem] text-center text-[10px] font-normal uppercase tracking-[0.3em] text-white/60">
              {t.hero.subtext}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
