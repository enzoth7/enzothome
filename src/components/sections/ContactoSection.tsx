"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/src/context/LanguageContext";

const EMAIL = "enzothome1@gmail.com";
const PROJECTS = [
  {
    name: "Mi Admi",
    href: "https://miadmi.com",
    src: "/Mi Admi.png",
    width: 200,
    height: 200,
    className: "h-12 w-auto",
  },
  {
    name: "Polarist",
    href: "https://polarist.app",
    src: "/polarist.jpeg",
    width: 200,
    height: 200,
    className: "h-12 w-auto",
  },
] as const;

function SectionEyebrow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="h-px w-10 bg-slate-700" />
      <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
        {label}
      </span>
    </div>
  );
}

export default function ContactoSection() {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(EMAIL);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = EMAIL;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopied(true);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      id="contacto"
      className="py-12 pb-16 sm:py-14 sm:pb-18"
    >
      <div className="grid max-w-5xl gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-16">
        <div className="flex flex-col gap-6">
          <SectionEyebrow label={t.contact.subtitle} />

          <div className="flex flex-col gap-6">
            <p className="max-w-2xl text-lg leading-relaxed text-slate-300">
              {t.contact.description}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href={`mailto:${EMAIL}`}
                className="text-xl sm:text-2xl font-bold text-[#ffffff] underline decoration-slate-500 underline-offset-8 transition hover:decoration-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {EMAIL}
              </a>
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={handleCopy}
                aria-label={t.contact.copy}
                className="rounded-full bg-[#FAF9F6] text-[#0f172a] hover:bg-white px-5 py-2.5 text-sm font-semibold shadow-md transition-all"
              >
                {copied ? t.contact.copied : t.contact.copy}
              </motion.button>
            </div>

            <div className="mt-2 flex lg:hidden items-center gap-4">
              <motion.a
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                href="https://www.instagram.com/enzo.th/"
                target="_blank"
                rel="noreferrer me"
                aria-label="Instagram"
                title="Instagram"
                className="rounded-full border border-slate-700 bg-slate-800/80 p-2.5 text-slate-300 shadow-sm transition hover:border-slate-500 hover:bg-slate-700 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                href="https://es.fiverr.com/enzoth98"
                target="_blank"
                rel="noreferrer me"
                aria-label="Fiverr"
                title="Fiverr"
                className="rounded-full border border-slate-700 bg-slate-800/80 p-2.5 text-slate-300 shadow-sm transition hover:border-slate-500 hover:bg-slate-700 hover:text-white"
              >
                <svg
                  viewBox="-2.5 -2 24 24"
                  className="h-5 w-5"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M16.25 16.25v-10h-10v-.625c0-1.034.841-1.875 1.875-1.875H10V0H8.125A5.632 5.632 0 0 0 2.5 5.625v.625H0V10h2.5v6.25H0V20h8.75v-3.75h-2.5V10h6.285v6.25H10V20h8.75v-3.75h-2.5z" />
                  <circle cx="14.375" cy="1.875" r="1.875" />
                </svg>
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                href="https://github.com/enzoth7"
                target="_blank"
                rel="noreferrer me"
                aria-label="GitHub"
                title="GitHub"
                className="rounded-full border border-slate-700 bg-slate-800/80 p-2.5 text-slate-300 shadow-sm transition hover:border-slate-500 hover:bg-slate-700 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M12 .5C5.73.5.75 5.63.75 12c0 5.1 3.29 9.43 7.86 10.96.58.11.79-.26.79-.57v-2.1c-3.2.71-3.87-1.57-3.87-1.57-.52-1.35-1.28-1.71-1.28-1.71-1.05-.74.08-.73.08-.73 1.16.08 1.77 1.22 1.77 1.22 1.03 1.79 2.7 1.27 3.36.97.1-.76.4-1.27.73-1.56-2.56-.3-5.26-1.3-5.26-5.8 0-1.28.45-2.33 1.2-3.15-.12-.3-.52-1.52.11-3.16 0 0 .98-.32 3.2 1.2.93-.26 1.92-.4 2.9-.4.99 0 1.98.14 2.9.4 2.22-1.52 3.2-1.2 3.2-1.2.63 1.64.23 2.86.11 3.16.75.82 1.2 1.87 1.2 3.15 0 4.51-2.71 5.5-5.29 5.79.41.36.78 1.07.78 2.16v3.2c0 .31.21.68.8.57A11.27 11.27 0 0 0 23.25 12C23.25 5.63 18.27.5 12 .5z" />
                </svg>
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                href="https://www.linkedin.com/in/enzothome/"
                target="_blank"
                rel="noreferrer me"
                aria-label="LinkedIn"
                title="LinkedIn"
                className="rounded-full border border-slate-700 bg-slate-800/80 p-2.5 text-slate-300 shadow-sm transition hover:border-slate-500 hover:bg-slate-700 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.62-1.85 3.34-1.85 3.57 0 4.23 2.35 4.23 5.41v6.33zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.11 20.45H3.56V9h3.55v11.45z" />
                </svg>
              </motion.a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-4">
          <SectionEyebrow label={t.contact.otherProjects} />

          <div className="flex items-center gap-5">
            {PROJECTS.map((project) => (
              <motion.a
                key={project.name}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                href={project.href}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex w-fit items-center justify-start focus:outline-none transition-all"
                aria-label={project.name}
              >
                <Image
                  src={project.src}
                  alt={project.name}
                  width={project.width}
                  height={project.height}
                  priority
                  sizes="48px"
                  quality={100}
                  className={`${project.className} grayscale opacity-40 transition duration-300 group-hover:grayscale-0 group-hover:opacity-100`}
                />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

