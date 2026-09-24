"use client";

import { useEffect } from "react";
import Link from "next/link";
import MobileLanguageToggle from "@/components/MobileLanguageToggle";
import Navbar from "@/components/Navbar";
import SocialRail from "@/components/SocialRail";
import Background from "@/src/components/sections/Background";
import TabletMockup3D from "@/src/components/ui/tablet-mockup-3d";
import { LanguageProvider, useLanguage } from "@/src/context/LanguageContext";
import { trackEvent } from "@/src/lib/analytics";

export type DetailPageCopy = {
  eyebrow?: string;
  title: string;
  lead: string;
  blocks: Array<{
    label?: string;
    title: string;
    body: string;
    items?: string[];
  }>;
  quote?: { text: string; attribution: string };
  cta?: string;
};

function DetailContent({ es, en, caseName, minimalChrome = false, heroImage, heroAlt }: { es: DetailPageCopy; en: DetailPageCopy; caseName?: string; minimalChrome?: boolean; heroImage?: string; heroAlt?: { es: string; en: string } }) {
  const { language } = useLanguage();
  const copy = language === "es" ? es : en;

  useEffect(() => {
    if (caseName) trackEvent("case_view", { case_name: caseName, location: "case_page" });
  }, [caseName]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0F172A] text-[#111111]">
      <div className="fixed inset-0 z-0"><Background variant="wallpaper" /></div>
      <div className="relative z-40"><SocialRail /></div>
      <div className="relative z-50"><Navbar /></div>
      <MobileLanguageToggle />

      <div className="relative z-20 px-3 py-24 sm:px-5 sm:py-28 lg:px-8">
        <main id="main-content" className="mx-auto max-w-[1400px] bg-[#FAF9F6] shadow-[0_0_80px_rgba(0,0,0,0.35)]">
          <header className={`px-6 py-16 sm:px-10 lg:px-12 ${heroImage ? "lg:relative lg:min-h-[760px] lg:overflow-visible lg:py-16" : "lg:py-24"}`}>
            <div className={heroImage ? "lg:flex lg:min-h-[632px] lg:w-[47%] lg:translate-y-24 lg:flex-col lg:justify-center" : ""}>
              {!minimalChrome && copy.eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-600">{copy.eyebrow}</p> : null}
              <h1 className={`${minimalChrome || !copy.eyebrow ? "" : "mt-5 "}max-w-5xl font-sans text-5xl font-semibold tracking-tighter text-[#0F172A] sm:text-6xl ${heroImage ? "lg:text-5xl xl:text-6xl" : "lg:text-7xl"}`}>{copy.title}</h1>
              <p className="mt-7 max-w-4xl text-lg leading-relaxed text-slate-700 sm:text-xl">{copy.lead}</p>
              {!minimalChrome && copy.cta ? <Link href="/#contacto" onClick={() => trackEvent("contact_cta_click", { location: caseName ? "case_page" : "service_page" })} className="mt-9 inline-flex min-h-12 items-center rounded-xl bg-[#0F172A] px-7 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#FAF9F6] transition hover:bg-[#111111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F172A]">{copy.cta}</Link> : null}
            </div>

            {heroImage ? (
              <div className="mt-10 lg:absolute lg:left-[51%] lg:top-36 lg:mt-0 lg:w-[69%] xl:left-[52%] xl:w-[70%]">
                <TabletMockup3D
                  src={heroImage}
                  alt={heroAlt?.[language] ?? ""}
                  priority
                />
              </div>
            ) : null}
          </header>

          <section className="border-t border-[#0F172A]/15">
            {copy.blocks.map((block, index) => (
              <article key={block.title} className={`grid gap-8 border-b border-[#0F172A]/15 px-6 py-14 sm:px-10 lg:px-12 lg:py-20 ${minimalChrome ? "lg:grid-cols-1" : "lg:grid-cols-[0.42fr_1fr]"}`}>
                {!minimalChrome ? <div>
                  <span className="text-xs font-semibold tracking-[0.2em] text-slate-500">{String(index + 1).padStart(2, "0")}</span>
                  {block.label ? <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">{block.label}</p> : null}
                </div> : null}
                <div>
                  <h2 className="max-w-3xl font-sans text-3xl font-semibold tracking-tight text-[#111111] sm:text-4xl">{block.title}</h2>
                  <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-700">{block.body}</p>
                  {block.items ? (
                    <ul className="mt-9 grid gap-px border border-[#0F172A]/15 bg-[#0F172A]/15 sm:grid-cols-2">
                      {block.items.map((item) => <li key={item} className="bg-[#FAF9F6] p-5 text-base font-semibold text-[#0F172A]">{item}</li>)}
                    </ul>
                  ) : null}
                </div>
              </article>
            ))}
          </section>

          {copy.quote ? (
            <figure className="bg-[#0F172A] px-6 py-16 text-[#FAF9F6] sm:px-10 lg:px-12 lg:py-20">
              <blockquote className="max-w-5xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">&ldquo;{copy.quote.text}&rdquo;</blockquote>
              <figcaption className="mt-7 text-sm uppercase tracking-[0.16em] text-slate-300">{copy.quote.attribution}</figcaption>
            </figure>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default function EditorialDetailPage(props: { es: DetailPageCopy; en: DetailPageCopy; caseName?: string; minimalChrome?: boolean; heroImage?: string; heroAlt?: { es: string; en: string } }) {
  return <LanguageProvider><DetailContent {...props} /></LanguageProvider>;
}
