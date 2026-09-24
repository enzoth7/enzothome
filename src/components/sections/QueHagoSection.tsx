"use client";

import { useLanguage } from "@/src/context/LanguageContext";
import { ConnoisseurStackInteractor } from "@/src/components/ui/connoisseur-stack-interactor";

export default function QueHagoSection() {
  const { t } = useLanguage();

  const services = [
    { ...t.whatIDo.primary, href: "/services/sistemas-internos", number: "01", image: "/señales/a.jpg" },
    { ...t.whatIDo.secondary, href: "/services/datos-y-tableros-de-gestion", number: "02", image: "/señales/b.png" },
    { ...t.whatIDo.tertiary, href: "/services/sitios-web-para-empresas", number: "03", image: "/señales/c.png" },
  ];

  return (
    <section id="soluciones" className="scroll-mt-24 py-16 sm:py-24">
      <div className="space-y-12 sm:space-y-16">
        <div className="max-w-5xl">
          <h2 className="font-sans text-4xl font-semibold tracking-tighter text-[#FAF9F6] sm:text-5xl lg:text-6xl">
            {t.whatIDo.title}
          </h2>
          <p className="mt-6 max-w-4xl text-lg leading-relaxed text-slate-300 sm:text-xl">
            {t.whatIDo.description}
          </p>
        </div>

        <ConnoisseurStackInteractor items={services} linkLabel={t.whatIDo.learnMore} listLabel={t.whatIDo.subtitle} />
      </div>
    </section>
  );
}
