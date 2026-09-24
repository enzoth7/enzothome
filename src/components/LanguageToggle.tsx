"use client";

import { useLanguage } from "@/src/context/LanguageContext";

type LanguageToggleProps = {
  inline?: boolean;
  dark?: boolean;
};

export default function LanguageToggle({ inline = false, dark = false }: LanguageToggleProps) {
  const { language, toggleLanguage } = useLanguage();
  const wrapperClass = inline
    ? dark
      ? "flex items-center rounded-xl border border-white/15 bg-[#13223a] p-0.5 sm:p-1"
      : "flex items-center rounded-xl border border-neutral-200 bg-slate-50/95 p-0.5 shadow-sm sm:p-1"
    : dark
      ? "fixed right-6 top-6 z-50 flex items-center rounded-xl border border-white/15 bg-[#13223a] p-1"
      : "fixed right-6 top-6 z-50 flex items-center rounded-xl border border-neutral-200 bg-slate-50/95 p-1 shadow-sm";

  return (
    <div className={wrapperClass}>
      <button
        onClick={() => language !== "es" && toggleLanguage()}
        className={`flex items-center gap-1 rounded-xl px-2 py-1 text-[10px] font-semibold tracking-[0.08em] transition-all sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs ${language === "es"
            ? dark
              ? "bg-white text-[#0f172a] shadow-sm"
              : "bg-neutral-950 text-[#f8fafc] shadow-sm"
            : dark
              ? "text-white/72 hover:text-white"
              : "text-slate-500 hover:text-neutral-900"
          }`}
      >
        <span className="relative block h-2.5 w-3.5 overflow-hidden rounded-[1px] sm:h-3 sm:w-4">
          <svg viewBox="0 0 640 480" className="h-full w-full object-cover">
            <path fill="#c60b1e" d="M0 0h640v480H0z" />
            <path fill="#ffc400" d="M0 120h640v240H0z" />
          </svg>
        </span>
        ES
      </button>
      <button
        onClick={() => language !== "en" && toggleLanguage()}
        className={`flex items-center gap-1 rounded-xl px-2 py-1 text-[10px] font-semibold tracking-[0.08em] transition-all sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs ${language === "en"
            ? dark
              ? "bg-white text-[#0f172a] shadow-sm"
              : "bg-neutral-950 text-[#f8fafc] shadow-sm"
            : dark
              ? "text-white/72 hover:text-white"
              : "text-slate-500 hover:text-neutral-900"
          }`}
      >
        <span className="relative block h-2.5 w-3.5 overflow-hidden rounded-[1px] sm:h-3 sm:w-4">
          <svg viewBox="0 0 640 480" className="h-full w-full object-cover">
            <path fill="#bf0a30" d="M0 0h640v480H0z" />
            <path fill="#fff" d="M0 0h640v480H0z" />
            {/* Stripes */}
            <g fill="#bf0a30">
              <rect width="640" height="37" y="0" />
              <rect width="640" height="37" y="74" />
              <rect width="640" height="37" y="148" />
              <rect width="640" height="37" y="222" />
              <rect width="640" height="37" y="296" />
              <rect width="640" height="37" y="370" />
              <rect width="640" height="37" y="444" />
            </g>
            <rect fill="#002868" width="296" height="259" />
            {/* Simple stars dots */}
            <g fill="#fff">
              <circle cx="25" cy="25" r="8" />
              <circle cx="150" cy="25" r="8" />
              <circle cx="270" cy="25" r="8" />

              <circle cx="85" cy="130" r="8" />
              <circle cx="205" cy="130" r="8" />

              <circle cx="25" cy="230" r="8" />
              <circle cx="150" cy="230" r="8" />
              <circle cx="270" cy="230" r="8" />
            </g>
          </svg>
        </span>
        EN
      </button>
    </div>
  );
}
