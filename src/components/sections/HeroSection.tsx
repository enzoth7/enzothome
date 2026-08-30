"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/src/context/LanguageContext";

function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopViewport = window.matchMedia("(min-width: 768px)");
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;

    const updateVideoPreference = () => {
      const constrainedConnection =
        connection?.saveData || connection?.effectiveType?.includes("2g");

      if (reducedMotion.matches || constrainedConnection) {
        setVideoReady(false);
        setVideoSource(null);
        return;
      }

      setVideoReady(false);
      setVideoSource(
        desktopViewport.matches
          ? "/VideoBackground.web.v1.mp4"
          : "/VideoBackground.mobile.v1.mp4",
      );
    };

    updateVideoPreference();
    reducedMotion.addEventListener("change", updateVideoPreference);
    desktopViewport.addEventListener("change", updateVideoPreference);

    return () => {
      reducedMotion.removeEventListener("change", updateVideoPreference);
      desktopViewport.removeEventListener("change", updateVideoPreference);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!videoSource || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [videoSource]);

  const videoPoster = videoSource?.includes("mobile")
    ? "/VideoBackground.mobile.v1.poster.webp"
    : "/VideoBackground.web.v1.poster.webp";

  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      <picture className="absolute inset-0 block h-full w-full">
        <source
          media="(max-width: 767px)"
          srcSet="/VideoBackground.mobile.v1.poster.webp"
        />
        <img
          src="/VideoBackground.web.v1.poster.webp"
          alt=""
          width={1600}
          height={900}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover object-center"
        />
      </picture>

      {videoSource && (
        <video
          key={videoSource}
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ease-out ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={videoPoster}
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoReady(false)}
        >
          <source src={videoSource} type="video/mp4" />
        </video>
      )}

      <div className="absolute inset-0 bg-[#071524]/60" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,21,36,0.28)_0%,rgba(7,21,36,0.08)_45%,rgba(7,21,36,0.3)_100%)]" />
    </div>
  );
}

export default function HeroSection() {
  const { t } = useLanguage();

  const titleLines = [
    t.hero.titleLine1,
    t.hero.titleLine2,
    t.hero.titleLine3,
  ];

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-transparent text-[#FAF9F6]">
      <HeroVideoBackground />

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1800px] grid-cols-1 gap-10 px-6 pb-16 pt-28 sm:px-10 sm:pb-20 sm:pt-32 lg:grid-cols-[38%_62%] lg:gap-0 lg:pb-14 lg:pl-14 lg:pr-28 lg:pt-24 xl:pl-20 xl:pr-32">
        <div className="order-1 flex items-start justify-center lg:order-2 lg:items-center lg:justify-end">
          <div className="flex w-full max-w-[52rem] flex-col items-end lg:-translate-y-[2vh]">
            <h1 className="w-full font-sans text-[clamp(2.75rem,12vw,3.75rem)] font-black uppercase leading-[1.14] tracking-[-0.055em] text-[#FAF9F6] sm:text-7xl lg:text-[clamp(4.6rem,6.1vw,7.6rem)]">
              {titleLines.map((line, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 0.9, y: 0 }}
                  transition={{ duration: 0.7, delay: index * 0.2, ease: "easeOut" }}
                  className="block text-right"
                >
                  {line}
                </motion.span>
              ))}
            </h1>
          </div>
        </div>

        <div className="order-2 flex items-start justify-center lg:order-1 lg:items-center lg:justify-start">
          <div className="flex w-full max-w-md flex-col items-center text-center lg:translate-x-[9%] lg:translate-y-[9vh] lg:items-start lg:text-left">
            <p className="max-w-md text-base font-normal leading-relaxed text-[#FAF9F6]/90 sm:text-lg lg:text-xl">
              {t.hero.description}
            </p>

            <div className="relative inline-block">
              <Link
                href="/onboarding"
                className="relative mt-8 block rounded-lg border border-white/60 bg-white/[0.04] px-7 py-3.5 text-center font-sans text-sm font-medium uppercase tracking-[0.14em] text-white backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:border-white hover:bg-white hover:text-[#0f172a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                {t.hero.ctaPrimary}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
