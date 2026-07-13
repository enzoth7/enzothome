"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import MobileLanguageToggle from "@/components/MobileLanguageToggle";
import Navbar from "@/components/Navbar";
import SocialRail from "@/components/SocialRail";
import { SERVICE_ORDER, SERVICES_DATA } from "@/src/constants/services";
import Background from "@/src/components/sections/Background";
import { LanguageProvider, useLanguage } from "@/src/context/LanguageContext";

type Language = "es" | "en";

type ServiceItem = {
  id: string;
  images: string[];
  title: Record<Language, string>;
  description: Record<Language, string>;
};

const PAGE_COPY = {
  es: {
    eyebrow: "Servicios",
    title: "Soluciones",
    lead:
      "Resuelvo problemas operativos mediante datos, automatización e inteligencia artificial. Diseño e implemento sistemas escalables para eliminar tareas repetitivas, centralizar información y dar soporte a decisiones estratégicas en cada negocio.",
    close: "Cerrar",
    previous: "Anterior",
    next: "Siguiente",
    contact: "Contactarme",
  },
  en: {
    eyebrow: "Services",
    title: "Solutions",
    lead:
      "I solve operational problems through data, automation, and artificial intelligence. I design and implement scalable systems to eliminate repetitive tasks, centralize data, and support strategic decision-making in each business.",
    close: "Close",
    previous: "Previous",
    next: "Next",
    contact: "Contact me",
  },
} as const;

const SERVICES: ServiceItem[] = SERVICE_ORDER.map((id) => {
  const service = SERVICES_DATA[id];

  return {
    id,
    images: service.images,
    title: {
      es: service.title_es,
      en: service.title_en,
    },
    description: {
      es: service.description_es,
      en: service.description_en,
    },
  };
});

function SectionEyebrow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="h-px w-10 bg-[#064e3b]/28" />
      <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
        {label}
      </span>
    </div>
  );
}

function LightboxButton({
  direction,
  label,
  onClick,
}: {
  direction: "left" | "right";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={[
        "absolute top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-none border border-white/15 bg-black/35 text-white/90 backdrop-blur-md transition hover:bg-black/55",
        direction === "left" ? "left-4 sm:left-6" : "right-4 sm:right-6",
      ].join(" ")}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-6 w-6"
      >
        {direction === "left" ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 5l-7 7 7 7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        )}
      </svg>
    </button>
  );
}

function ServiceCard({
  service,
  language,
  onOpen,
  priority = false,
}: {
  service: ServiceItem;
  language: Language;
  onOpen: () => void;
  priority?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full w-full flex-col gap-4 text-left outline-none sm:gap-6"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-none bg-white shadow-[0_24px_48px_rgba(15,23,42,0.16)] transition-shadow duration-500 ease-out group-hover:shadow-[0_32px_72px_rgba(15,23,42,0.22)] lg:aspect-auto lg:h-[420px]">
        {service.images[0].endsWith(".mp4") ? (
          <video
            src={service.images[0]}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-105 lg:object-cover"
          />
        ) : (
          <Image
            src={service.images[0]}
            alt={service.title[language]}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-contain transition-transform duration-500 ease-out group-hover:scale-105 lg:object-cover"
            quality={92}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <h2 className="font-sans text-xl font-black uppercase tracking-tighter text-neutral-900 sm:text-2xl">
          {service.title[language]}
        </h2>
        <p className="text-[15px] font-light leading-relaxed tracking-[0.04em] text-neutral-600 sm:text-base">
          {service.description[language]}
        </p>
      </div>
    </button>
  );
}

function ServicesContent() {
  const { language } = useLanguage();
  const copy = PAGE_COPY[language];
  const [lightboxServiceIndex, setLightboxServiceIndex] = useState<number | null>(null);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);

  const activeService =
    lightboxServiceIndex === null ? null : SERVICES[lightboxServiceIndex];

  const openLightbox = (serviceIndex: number) => {
    setLightboxServiceIndex(serviceIndex);
    setLightboxImageIndex(0);
  };

  const closeLightbox = useCallback(() => {
    setLightboxServiceIndex(null);
    setLightboxImageIndex(0);
  }, []);

  const showPrevious = useCallback(() => {
    if (!activeService) {
      return;
    }

    setLightboxImageIndex((current) =>
      current === 0 ? activeService.images.length - 1 : current - 1
    );
  }, [activeService]);

  const showNext = useCallback(() => {
    if (!activeService) {
      return;
    }

    setLightboxImageIndex((current) =>
      current === activeService.images.length - 1 ? 0 : current + 1
    );
  }, [activeService]);

  useEffect(() => {
    if (lightboxServiceIndex === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
      }

      if (event.key === "ArrowLeft") {
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxServiceIndex, closeLightbox, showPrevious, showNext]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0f172a] text-[#171717]">
      <div className="absolute inset-0 z-0">
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
          <div className="px-6 sm:px-10 lg:px-12">
            <section className="py-16 sm:py-20 lg:py-24">
              <div className="max-w-none space-y-8">
                <SectionEyebrow label={copy.eyebrow} />
                <h1 className="font-sans text-4xl font-black tracking-tighter text-neutral-900 sm:text-5xl lg:text-6xl">
                  {copy.title}
                </h1>
                <p className="max-w-none text-lg font-light leading-relaxed tracking-[0.04em] text-neutral-600 sm:text-xl">
                  {copy.lead}
                </p>
              </div>
            </section>

            <section className="py-8 sm:py-12">
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                {SERVICES.map((service, index) => (
                  <div key={service.id} className="h-full">
                    <ServiceCard
                      service={service}
                      language={language}
                      priority={index < 2}
                      onOpen={() => openLightbox(index)}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-16 mb-8 flex justify-center">
                <Link
                  href="/#contacto"
                  className="inline-flex items-center justify-center rounded-none bg-[#0f172a] px-8 py-4 text-base font-semibold tracking-wide text-white transition-all duration-300 hover:bg-[#1e293b] hover:scale-[1.02] shadow-[0_8px_20px_rgba(15,23,42,0.15)] hover:shadow-[0_12px_28px_rgba(15,23,42,0.25)]"
                >
                  {copy.contact}
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {activeService ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md"
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute right-4 top-4 z-20 rounded-none border border-white/15 bg-black/35 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-md transition hover:bg-black/55 sm:right-6 sm:top-6"
            >
              {copy.close}
            </button>

            {activeService.images.length > 1 ? (
              <>
                <LightboxButton direction="left" label={copy.previous} onClick={showPrevious} />
                <LightboxButton direction="right" label={copy.next} onClick={showNext} />
              </>
            ) : null}

            <div className="relative flex h-full w-full items-center justify-center px-16 py-16 sm:px-24">
              <motion.div
                key={activeService.images[lightboxImageIndex]}
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.985 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex h-full w-full max-w-7xl items-center justify-center"
              >
                {activeService.images[lightboxImageIndex].endsWith(".mp4") ? (
                  <video
                    src={activeService.images[lightboxImageIndex]}
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <Image
                    src={activeService.images[lightboxImageIndex]}
                    alt={activeService.title[language]}
                    fill
                    sizes="100vw"
                    quality={100}
                    className="object-contain"
                  />
                )}
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <LanguageProvider>
      <ServicesContent />
    </LanguageProvider>
  );
}
