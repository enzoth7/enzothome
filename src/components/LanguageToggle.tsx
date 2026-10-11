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
        <div className="relative block h-2.5 w-3.5 overflow-hidden rounded-[1px] sm:h-3 sm:w-4">
          <svg viewBox="0 0 640 480" className="h-full w-full object-cover">
            <path fill="#c60b1e" d="M0 0h640v480H0z" />
            <path fill="#ffc400" d="M0 120h640v240H0z" />
          </svg>
        </div>
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
        <div className="relative block h-2.5 w-3.5 overflow-hidden rounded-[1px] sm:h-3 sm:w-4">
          <svg viewBox="0 0 60 30" className="h-full w-full object-cover" aria-hidden="true">
            <path fill="#012169" d="M0 0h60v30H0z" />
            <path stroke="#fff" strokeWidth="6" d="M0 0l60 30M60 0L0 30" />
            <path stroke="#C8102E" strokeWidth="2" d="M0 0l60 30M60 0L0 30" />
            <path stroke="#fff" strokeWidth="10" d="M30 0v30M0 15h60" />
            <path stroke="#C8102E" strokeWidth="6" d="M30 0v30M0 15h60" />
          </svg>
        </div>
        EN
      </button>
    </div>
  );
}
