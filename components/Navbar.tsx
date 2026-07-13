"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import LanguageToggle from "@/src/components/LanguageToggle";
import { useLanguage } from "@/src/context/LanguageContext";

export default function Navbar() {
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled
        ? "bg-[#0f172a]/80 border-b border-white/10 shadow-lg backdrop-blur-lg"
        : "bg-transparent border-b border-transparent"
        }`}
    >
      <div
        className={`relative mx-auto grid max-w-[95%] grid-cols-[auto_1fr] items-center gap-3 px-3 transition-all duration-500 sm:px-5 md:grid-cols-[auto_1fr_auto] md:gap-3 ${isScrolled ? "py-4 sm:py-3 md:py-1" : "py-4 sm:py-4 md:py-1.5"
          }`}
      >
        <Link
          href="/"
          aria-label="Enzo Thome"
          className="flex items-center w-[120px] sm:w-[180px] md:w-[280px]"
        >
          <Image
            src="/logotransp4.png"
            alt="Enzo Thome"
            width={1200}
            height={250}
            priority
            className={`w-full object-contain transition-all duration-500 ${isScrolled ? "h-12 md:h-14" : "h-14 md:h-16"
              }`}
          />
        </Link>

        <nav className="min-w-0">
          <div className="flex items-center justify-end gap-3 pr-1 sm:gap-5 md:justify-center md:gap-10 md:pr-0">
            <Link
              href="/"
              className="hidden sm:block whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.16em] text-white/90 transition hover:text-white sm:text-[11px] sm:tracking-[0.2em] md:text-sm md:tracking-wider"
            >
              {t.nav.home}
            </Link>
            <Link
              href="/services"
              className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.16em] text-white/90 transition hover:text-white sm:text-[11px] sm:tracking-[0.2em] md:text-sm md:tracking-wider"
            >
              {t.nav.services}
            </Link>
            <Link
              href="/projects"
              className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.16em] text-white/90 transition hover:text-white sm:text-[11px] sm:tracking-[0.2em] md:text-sm md:tracking-wider"
            >
              {t.nav.projects}
            </Link>
            <Link
              href="/about-me"
              className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.16em] text-white/90 transition hover:text-white sm:text-[11px] sm:tracking-[0.2em] md:text-sm md:tracking-wider"
            >
              {t.nav.about}
            </Link>
            <a
              href="https://calendly.com/enzothome1/consulting"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-[#0f172a] transition hover:bg-slate-100 md:inline-flex"
            >
              {t.nav.cta}
            </a>
          </div>
        </nav>

        <div className="ml-auto hidden items-center md:flex">
          <LanguageToggle inline dark />
        </div>
      </div>
    </header>
  );
}
