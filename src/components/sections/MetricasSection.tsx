"use client";

import ExpandableGallery, { GalleryItem } from "@/src/components/ui/gallery-animation";
import { useLanguage } from "@/src/context/LanguageContext";

const PHOTOS = [
  {
    src: "/señales/5870554.jpg",
    altEs: "Dos personas comparando comprobantes, formularios y planillas sobre una mesa",
    altEn: "Two people comparing receipts, forms, and spreadsheets on a table",
  },
  {
    src: "/señales/1.jpg",
    altEs: "Notas de distintos colores distribuidas sobre una pared de trabajo",
    altEn: "Notes in different colors scattered across a work wall",
  },
  {
    src: "/señales/5875646.jpg",
    altEs: "Persona cargando comprobantes frente a una planilla digital",
    altEn: "Person entering receipts into a digital spreadsheet",
  },
  {
    src: "/señales/5799084.jpg",
    altEs: "Cabina de control con indicadores y una vista general de la operación",
    altEn: "Control cockpit with indicators and an overview of the operation",
  },
  {
    src: "/señales/2970887.jpg",
    altEs: "Personas rodeadas de pantallas, gráficos y reportes impresos",
    altEn: "People surrounded by screens, charts, and printed reports",
  },
] as const;

export default function MetricasSection() {
  const { t, language } = useLanguage();

  const galleryItems: GalleryItem[] = t.precisionMetrics.problems.map((problem: string, index: number) => ({
    src: PHOTOS[index].src,
    alt: language === "es" ? PHOTOS[index].altEs : PHOTOS[index].altEn,
    label: problem,
    number: String(index + 1).padStart(2, "0"),
  }));

  return (
    <section aria-labelledby="friction-title" className="py-14 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:gap-16 xl:gap-20">
        <div className="lg:sticky lg:top-28">
          <h2
            id="friction-title"
            className="max-w-xl font-sans text-4xl font-semibold tracking-tighter text-[#0F172A] sm:text-5xl lg:text-6xl"
          >
            {t.precisionMetrics.title}
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-700">
            {t.precisionMetrics.description}
          </p>
        </div>

        <ExpandableGallery items={galleryItems} />
      </div>
    </section>
  );
}
