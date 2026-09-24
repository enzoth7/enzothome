"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/src/context/LanguageContext";

const EMAIL = "enzothome1@gmail.com";

const OTHER_PROJECTS = [
  { name: "Polarist", href: "https://polarist.app", src: "/Polarist.png" },
  { name: "Mi Admi", href: "https://miadmi.com", src: "/Mi Admi.png" },
  { name: "Techs Uruguay", href: "https://techsuruguay.vercel.app/", src: "/TechsUruguay.png" },
  { name: "Via Nostra", href: "https://vianostra.vercel.app/", src: "/ViaNostra.png" },
] as const;

export default function SiteFooter({ className = "" }: { className?: string }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <footer className={`py-12 sm:py-14 ${className}`}>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-16">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-[#FAF9F6]/30" />
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#FAF9F6]/60">
              {t.contact.subtitle}
            </p>
          </div>

          <p className="max-w-2xl text-lg leading-relaxed text-[#FAF9F6]/75">
            {t.contact.footerDescription}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href={`mailto:${EMAIL}`}
              className="text-xl font-bold text-[#FAF9F6] underline decoration-[#FAF9F6]/35 underline-offset-8 transition hover:decoration-[#FAF9F6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FAF9F6] sm:text-2xl"
            >
              {EMAIL}
            </a>
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={handleCopy}
              title={copied ? t.contact.copied : t.contact.copy}
              aria-label={copied ? t.contact.copied : t.contact.copy}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAF9F6] text-[#0F172A] shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FAF9F6]"
            >
              {copied ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                  <rect width="14" height="14" x="8" y="8" rx="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              )}
            </motion.button>
          </div>
        </div>

        <div className="flex flex-col items-start gap-4">
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-[#FAF9F6]/30" />
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#FAF9F6]/60">
              {t.contact.otherProjects}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            {OTHER_PROJECTS.map((project) => (
              <motion.a
                key={project.name}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                href={project.href}
                target="_blank"
                rel="noreferrer"
                aria-label={project.name}
                className="group inline-flex min-h-14 w-fit items-center justify-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FAF9F6]"
              >
                <Image
                  src={project.src}
                  alt={project.name}
                  width={200}
                  height={200}
                  sizes="128px"
                  quality={100}
                  className="h-12 w-auto max-w-32 object-contain grayscale opacity-45 transition duration-300 group-hover:grayscale-0 group-hover:opacity-100"
                />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
