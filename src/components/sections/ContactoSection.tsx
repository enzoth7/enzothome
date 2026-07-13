"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
      <span className="h-px w-10 bg-[#064e3b]/28" />
      <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
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
      className="border-t border-neutral-200 pt-24 pb-32 sm:pt-28 sm:pb-36"
    >
      <div className="grid max-w-5xl gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-16">
        <div className="flex flex-col gap-6">
          <SectionEyebrow label={t.contact.subtitle} />

          <div className="flex flex-col gap-6">
            <p className="max-w-2xl text-lg leading-relaxed text-neutral-600">
              {t.contact.description}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href={`mailto:${EMAIL}`}
                className="text-lg font-semibold text-neutral-950 underline decoration-neutral-300 underline-offset-8 transition hover:decoration-[#064e3b]/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-300 sm:text-xl"
              >
                {EMAIL}
              </a>
              <button
                type="button"
                onClick={handleCopy}
                aria-label={t.contact.copy}
                className="rounded-full border border-neutral-200 bg-slate-50/90 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:border-neutral-300 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-300"
              >
                {copied ? t.contact.copied : t.contact.copy}
              </button>
            </div>

            <div className="mt-2 flex items-center gap-4 lg:hidden">
              <a
                href="https://es.fiverr.com/enzoth98"
                target="_blank"
                rel="noreferrer"
                aria-label="Fiverr"
                title="Fiverr"
                className="rounded-full border border-neutral-200 bg-slate-50/90 p-2.5 text-slate-500 shadow-sm transition hover:border-neutral-300 hover:bg-white hover:text-neutral-950"
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
              </a>

              <a
                href="https://github.com/enzoth7"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                title="GitHub"
                className="rounded-full border border-neutral-200 bg-slate-50/90 p-2.5 text-slate-500 shadow-sm transition hover:border-neutral-300 hover:bg-white hover:text-neutral-950"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M12 .5C5.73.5.75 5.63.75 12c0 5.1 3.29 9.43 7.86 10.96.58.11.79-.26.79-.57v-2.1c-3.2.71-3.87-1.57-3.87-1.57-.52-1.35-1.28-1.71-1.28-1.71-1.05-.74.08-.73.08-.73 1.16.08 1.77 1.22 1.77 1.22 1.03 1.79 2.7 1.27 3.36.97.1-.76.4-1.27.73-1.56-2.56-.3-5.26-1.3-5.26-5.8 0-1.28.45-2.33 1.2-3.15-.12-.3-.52-1.52.11-3.16 0 0 .98-.32 3.2 1.2.93-.26 1.92-.4 2.9-.4.99 0 1.98.14 2.9.4 2.22-1.52 3.2-1.2 3.2-1.2.63 1.64.23 2.86.11 3.16.75.82 1.2 1.87 1.2 3.15 0 4.51-2.71 5.5-5.29 5.79.41.36.78 1.07.78 2.16v3.2c0 .31.21.68.8.57A11.27 11.27 0 0 0 23.25 12C23.25 5.63 18.27.5 12 .5z" />
                </svg>
              </a>

              <a
                href="https://www.linkedin.com/in/enzothome/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
                className="rounded-full border border-neutral-200 bg-slate-50/90 p-2.5 text-slate-500 shadow-sm transition hover:border-neutral-300 hover:bg-white hover:text-neutral-950"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.62-1.85 3.34-1.85 3.57 0 4.23 2.35 4.23 5.41v6.33zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.11 20.45H3.56V9h3.55v11.45z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2">
          <SectionEyebrow label={t.contact.otherProjects} />

          <div className="flex items-center gap-5">
            {PROJECTS.map((project) => (
              <a
                key={project.name}
                href={project.href}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex w-fit items-center justify-start focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300"
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
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
