"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import MobileLanguageToggle from "@/components/MobileLanguageToggle";
import Navbar from "@/components/Navbar";
import SocialRail from "@/components/SocialRail";
import Background from "@/src/components/sections/Background";
import SiteFooter from "@/src/components/sections/SiteFooter";
import { LanguageProvider, useLanguage } from "@/src/context/LanguageContext";
import { trackEvent } from "@/src/lib/analytics";

type Language = "es" | "en";
type ProjectMedia = { src: string; alt: string; caption?: string };
type ProjectCase = {
  id: string;
  client: string;
  title: string;
  summary: string;
  situation: { title: string; body: string };
  construction: { title: string; body: string };
  outcome: { title: string; body: string };
  cover?: ProjectMedia;
  gallery?: ProjectMedia[];
};
type PageCopy = {
  title: string;
  lead: string;
  open: string;
  close: string;
  projects: ProjectCase[];
};

const PROJECT_IDS = new Set(["pearl-connexions", "operacion-centralizada", "matearte"]);

const CASE_COPY: Record<Language, PageCopy> = {
  es: {
    title: "Proyectos construidos alrededor de problemas reales.",
    lead: "Cada proyecto empieza con una situación distinta. Acá muestro qué estaba pasando, qué construí y cómo quedó funcionando.",
    open: "Ver proyecto",
    close: "Cerrar proyecto",
    projects: [
      {
        id: "pearl-connexions",
        client: "Pearl Connexions",
        title: "Una fuente compartida para organizar la empresa",
        summary: "La información que vivía en distintas planillas pasó a una estructura central para el trabajo diario y el seguimiento de la organización.",
        situation: {
          title: "La información estaba, pero no ofrecía una vista común",
          body: "Los datos se encontraban repartidos entre archivos y formatos diferentes. Esto dificultaba consultar el estado de la organización y mantener un criterio compartido.",
        },
        construction: {
          title: "Una estructura limpia y clara para el uso cotidiano",
          body: "Se construyó un sistema interno que reúne la información relevante y la presenta de una forma más clara para consultar, actualizar y dar seguimiento.",
        },
        outcome: {
          title: "Más claridad para sostener el crecimiento",
          body: "La empresa cuenta con una base organizada que acompaña el trabajo del equipo y permite seguir mejorando la forma en que gestiona su información.",
        },
        cover: {
          src: "/projects/ProjectC.png",
          alt: "Panel de control operativo desarrollado para Pearl Connexions",
        },
        gallery: [],
      },
      {
        id: "operacion-centralizada",
        client: "MateArte",
        title: "El estado de la operación en un solo lugar",
        summary: "Pedidos, producción, clientes y valores de la operación reunidos en un tablero de uso diario.",
        situation: {
          title: "El seguimiento dependía de registros separados",
          body: "Los pedidos, sus variantes y el avance de la producción necesitaban una vista común para evitar consultar distintas fuentes cada vez que había que entender el estado del trabajo.",
        },
        construction: {
          title: "Un tablero pensado para el trabajo cotidiano",
          body: "Se construyó un sistema interno que organiza pedidos, clientes, productos y estados de producción, con vistas de detalle y un resumen general de la operación.",
        },
        outcome: {
          title: "Una referencia común y digital para coordinar",
          body: "El equipo puede consultar qué está pendiente, qué se encuentra en producción y cómo se distribuye la carga de trabajo desde un mismo lugar.",
        },
        cover: {
          src: "/projects/ProjectBB.png",
          alt: "Tablero con el resumen general de una operación",
        },
        gallery: [
          { src: "/projects/ProjectB.png", alt: "Vista de pedidos y seguimiento de producción de MateArte" },
        ],
      },
      {
        id: "matearte",
        client: "MateArte",
        title: "Una tienda para descubrir y personalizar productos",
        summary: "Un sitio de venta pensado para presentar la marca, recorrer el catálogo y elegir productos artesanales.",
        situation: {
          title: "La propuesta necesitaba un espacio digital propio",
          body: "La variedad de productos, las opciones personalizadas y la identidad de la marca necesitaban convivir en una experiencia clara para quien llega a comprar.",
        },
        construction: {
          title: "Una tienda construida alrededor del catálogo",
          body: "Se desarrolló un sitio que combina presentación de marca, catálogo con filtros, productos destacados y accesos a las opciones de personalización.",
        },
        outcome: {
          title: "Una experiencia coherente desde el inicio hasta la compra",
          body: "La empresa cuenta con un canal digital donde las personas pueden conocer la propuesta, explorar los productos y avanzar hacia la compra desde una misma experiencia.",
        },
        cover: {
          src: "/projects/ProjectAA.png",
          alt: "Página principal de la tienda web de MateArte",
        },
        gallery: [
          { src: "/projects/ProjectA.png", alt: "Catálogo de productos de la tienda de MateArte" },
        ],
      },
    ],
  },
  en: {
    title: "Projects built around real problems.",
    lead: "Every project begins with a different situation. Here I show what was happening, what I built, and how it works today.",
    open: "View project",
    close: "Close project",
    projects: [
      {
        id: "pearl-connexions",
        client: "Pearl Connexions",
        title: "One shared source to organize the company",
        summary: "Information held across separate spreadsheets moved into one central structure for daily work and organizational tracking.",
        situation: {
          title: "The information existed, but there was no shared view",
          body: "Data was spread across different files and formats. This made it difficult to understand the state of the organization and maintain a shared way of working.",
        },
        construction: {
          title: "A central structure for everyday use",
          body: "I built an internal system that brings the relevant information together and presents it clearly for consultation, updates, and follow-up.",
        },
        outcome: {
          title: "Greater clarity to support growth",
          body: "The company now has an organized foundation that supports the team and can evolve as the way they manage information continues to improve.",
        },
        cover: {
          src: "/projects/ProjectC.png",
          alt: "Operational dashboard built for Pearl Connexions",
        },
        gallery: [],
      },
      {
        id: "operacion-centralizada",
        client: "MateArte",
        title: "The state of the operation in one place",
        summary: "Orders, production, clients, and operational values brought together in one everyday dashboard.",
        situation: {
          title: "Tracking depended on separate records",
          body: "Orders, their variants, and production progress needed a shared view so the team would not have to consult different sources whenever it needed to understand the state of the work.",
        },
        construction: {
          title: "A dashboard designed for everyday work",
          body: "I built an internal system that organizes orders, clients, products, and production status through detailed views and an overall operational summary.",
        },
        outcome: {
          title: "A shared reference for coordination",
          body: "The team can see what is pending, what is in production, and how the workload is distributed from one place.",
        },
        cover: {
          src: "/projects/ProjectBB.png",
          alt: "Dashboard showing an overall operational summary",
        },
        gallery: [
          { src: "/projects/ProjectB.png", alt: "MateArte order and production tracking view" },
        ],
      },
      {
        id: "matearte",
        client: "MateArte",
        title: "A store for discovering and customizing products",
        summary: "An online store designed to present the brand, browse the catalog, and choose handcrafted products.",
        situation: {
          title: "The offering needed its own digital space",
          body: "The product range, customization options, and brand identity needed to coexist in one clear experience for people arriving to buy.",
        },
        construction: {
          title: "A store built around the catalog",
          body: "I developed a site combining the brand story, a filterable catalog, featured products, and direct access to customization options.",
        },
        outcome: {
          title: "One coherent experience from arrival to purchase",
          body: "The company has a digital channel where people can understand the offering, explore products, and move toward a purchase within one experience.",
        },
        cover: {
          src: "/projects/ProjectAA.png",
          alt: "MateArte online store home page",
        },
        gallery: [
          { src: "/projects/ProjectA.png", alt: "MateArte online product catalog" },
        ],
      },
    ],
  },
};

function OperationsVisual() {
  return (
    <div className="relative h-full overflow-hidden bg-[#FAF9F6] p-5 sm:p-8" aria-hidden="true">
      <div className="h-full overflow-hidden rounded-xl border border-[#0F172A]/15 bg-[#0F172A] p-5 shadow-2xl sm:p-7">
        <div className="flex items-center justify-between border-b border-[#FAF9F6]/18 pb-4">
          <div className="h-2 w-28 rounded-full bg-[#FAF9F6]" />
          <div className="flex gap-2"><span className="h-3 w-3 rounded-full border border-[#FAF9F6]/60" /><span className="h-3 w-3 rounded-full bg-[#FAF9F6]" /></div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {["62%", "78%", "48%"].map((width) => <div key={width} className="rounded-xl border border-[#FAF9F6]/20 p-3 sm:p-4"><div className="h-2 rounded-full bg-[#FAF9F6]/40" style={{ width }} /><div className="mt-4 h-5 w-1/2 rounded-sm bg-[#FAF9F6]" /></div>)}
        </div>
        <div className="mt-3 grid h-[48%] grid-cols-[1.35fr_0.65fr] gap-3">
          <div className="flex items-end gap-2 rounded-xl border border-[#FAF9F6]/20 p-4">{[42, 70, 54, 84, 62, 76].map((height) => <div key={height} className="flex-1 rounded-t-sm bg-[#FAF9F6]" style={{ height: `${height}%` }} />)}</div>
          <div className="rounded-xl bg-[#FAF9F6] p-4"><div className="h-2 w-3/4 rounded-full bg-[#0F172A]" /><div className="mt-5 space-y-3">{["100%", "82%", "90%", "68%"].map((width) => <div key={width} className="h-2 rounded-full bg-[#0F172A]/25" style={{ width }} />)}</div></div>
        </div>
      </div>
    </div>
  );
}

function ProjectVisual({ cover, onOpen }: { cover?: ProjectMedia; onOpen: (media: ProjectMedia) => void }) {
  if (!cover) return <OperationsVisual />;
  return (
    <button type="button" onClick={() => onOpen(cover)} aria-label={`Ampliar: ${cover.alt}`} className="absolute inset-0 cursor-zoom-in focus-visible:outline-none focus-visible:opacity-90">
      <Image src={cover.src} alt={cover.alt} fill sizes="(min-width: 1024px) 54vw, 100vw" quality={92} className="object-cover transition-transform duration-300 hover:scale-[1.015]" />
    </button>
  );
}

function CasesContent() {
  const { language } = useLanguage();
  const copy = CASE_COPY[language as Language];
  const reduceMotion = useReducedMotion();
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeMedia, setActiveMedia] = useState<ProjectMedia | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<Record<string, number>>({});
  const lastTrackedRef = useRef<string | null>(null);

  const recordCaseView = useCallback((id: string) => {
    if (lastTrackedRef.current === id) return;
    lastTrackedRef.current = id;
    trackEvent("case_view", { case_name: id, location: "projects_accordion" });
  }, []);

  useEffect(() => {
    const syncFromLocation = () => {
      const id = window.location.hash.slice(1);
      const nextId = PROJECT_IDS.has(id) ? id : null;
      setOpenId(nextId);
      if (nextId) {
        recordCaseView(nextId);
        window.requestAnimationFrame(() => document.getElementById(nextId)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }));
      } else {
        lastTrackedRef.current = null;
      }
    };
    syncFromLocation();
    window.addEventListener("hashchange", syncFromLocation);
    window.addEventListener("popstate", syncFromLocation);
    return () => {
      window.removeEventListener("hashchange", syncFromLocation);
      window.removeEventListener("popstate", syncFromLocation);
    };
  }, [recordCaseView, reduceMotion]);

  useEffect(() => {
    if (!activeMedia) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveMedia(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [activeMedia]);

  const toggleProject = (id: string) => {
    if (openId === id) {
      setOpenId(null);
      lastTrackedRef.current = null;
      window.history.pushState(null, "", window.location.pathname);
      return;
    }
    setOpenId(id);
    recordCaseView(id);
    window.history.pushState(null, "", `${window.location.pathname}#${id}`);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0F172A] text-[#FAF9F6]">
      <div className="fixed inset-0 z-0"><Background variant="wallpaper" /></div>
      <div className="relative z-40"><SocialRail /></div>
      <div className="relative z-50"><Navbar /></div>
      <MobileLanguageToggle />
      <main id="main-content" className="relative z-20">
        <header className="mx-auto max-w-[1400px] px-6 pb-20 pt-36 sm:px-10 sm:pb-24 sm:pt-40 lg:px-12 lg:pb-28 lg:pt-48">
          <h1 className="max-w-6xl font-sans text-5xl font-semibold tracking-[-0.055em] text-[#FAF9F6] sm:text-6xl lg:text-8xl">{copy.title}</h1>
          <p className="mt-9 max-w-3xl border-t border-[#FAF9F6]/20 pt-8 text-lg leading-relaxed text-[#FAF9F6]/75 sm:text-xl">{copy.lead}</p>
        </header>

        <section className="px-3 pb-8 pt-3 text-[#0F172A] sm:px-5 sm:pb-10 sm:pt-5 lg:px-8 lg:pb-12 lg:pt-8" aria-label={language === "es" ? "Proyectos" : "Projects"}>
          <div className="mx-auto max-w-[1400px] bg-[#FAF9F6] px-6 shadow-[0_0_80px_rgba(0,0,0,0.4)] sm:px-10 lg:px-12">
            {copy.projects.map((project, index) => {
              const isOpen = openId === project.id;
              const imageFirstOnDesktop = index % 2 === 0;
              const projectMedia = [project.cover, ...(project.gallery ?? [])].filter((media): media is ProjectMedia => Boolean(media));
              const selectedIndex = Math.min(selectedMedia[project.id] ?? 0, Math.max(projectMedia.length - 1, 0));
              const selectedCover = projectMedia[selectedIndex];
              return (
                <article id={project.id} key={project.id} className="scroll-mt-24 border-b border-[#0F172A]/18 py-14 first:border-t sm:py-20 lg:py-24">
                  <div className="grid items-center gap-9 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
                    <div className={`order-2 ${imageFirstOnDesktop ? "lg:order-2" : "lg:order-1"}`}>
                      <h2 id={`${project.id}-heading`} className="max-w-2xl font-sans text-4xl font-semibold tracking-[-0.045em] text-[#111111] sm:text-5xl lg:text-6xl">{project.title}</h2>
                      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#0F172A]/72">{project.summary}</p>
                      <button type="button" aria-expanded={isOpen} aria-controls={`${project.id}-details`} onClick={() => toggleProject(project.id)} className="mt-8 inline-flex min-h-12 min-w-[10.5rem] cursor-pointer items-center justify-between gap-4 rounded-xl border border-[#0F172A]/30 px-5 py-3 text-sm font-semibold leading-none tracking-[0.06em] text-[#0F172A] transition-colors duration-200 hover:bg-[#0F172A] hover:text-[#FAF9F6] active:bg-[#111111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F172A]">
                        <span>{isOpen ? copy.close : copy.open}</span>
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-5 w-5 shrink-0" aria-hidden="true">
                          <path d="M4 10h12" />
                          {!isOpen ? <path d="M10 4v12" /> : null}
                        </svg>
                      </button>
                    </div>
                    <motion.div initial={reduceMotion ? false : { opacity: 0, y: 18 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10%" }} transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] }} className={`order-1 ${imageFirstOnDesktop ? "lg:order-1" : "lg:order-2"}`}>
                      <div className="relative aspect-[2530/1340] overflow-hidden rounded-xl bg-[#0F172A] shadow-[0_10px_28px_rgba(15,23,42,0.16)]">
                        <ProjectVisual key={selectedCover?.src ?? project.id} cover={selectedCover} onOpen={setActiveMedia} />
                      </div>
                      {projectMedia.length ? (
                        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={language === "es" ? `Imágenes de ${project.title}` : `Images from ${project.title}`}>
                          {projectMedia.map((media, mediaIndex) => {
                            const isSelected = mediaIndex === selectedIndex;
                            return (
                              <button
                                key={media.src}
                                type="button"
                                aria-pressed={isSelected}
                                aria-label={language === "es" ? `Mostrar imagen ${mediaIndex + 1} de ${projectMedia.length}` : `Show image ${mediaIndex + 1} of ${projectMedia.length}`}
                                onClick={() => setSelectedMedia((current) => ({ ...current, [project.id]: mediaIndex }))}
                                className={`relative h-14 w-20 cursor-pointer overflow-hidden rounded-lg bg-[#0F172A] transition-[opacity,box-shadow] duration-200 focus-visible:outline-none focus-visible:shadow-xl sm:h-16 sm:w-24 ${isSelected ? "opacity-100 shadow-[0_6px_18px_rgba(15,23,42,0.24)]" : "opacity-55 shadow-[0_3px_10px_rgba(15,23,42,0.12)] hover:opacity-85"}`}
                              >
                                <Image src={media.src} alt="" fill sizes="96px" className="object-cover" />
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </motion.div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div id={`${project.id}-details`} role="region" aria-labelledby={`${project.id}-heading`} initial={reduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.38, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                        <div className="mt-12 grid gap-10 border-t border-[#0F172A]/18 pt-10 md:grid-cols-3 md:gap-8 lg:mt-16 lg:pt-14">
                          {[project.situation, project.construction, project.outcome].map((block) => <div key={block.title}><h3 className="font-sans text-2xl font-semibold tracking-[-0.025em] text-[#111111]">{block.title}</h3><p className="mt-4 text-base leading-relaxed text-[#0F172A]/70">{block.body}</p></div>)}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-6 pb-20 pt-10 sm:px-10 sm:pb-24 sm:pt-12 lg:px-12 lg:pb-28">
          <SiteFooter className="border-t border-[#FAF9F6]/15" />
        </section>
      </main>

      <AnimatePresence>
        {activeMedia ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={activeMedia.alt}
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setActiveMedia(null);
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111111]/90 p-4 sm:p-8"
          >
            <button type="button" onClick={() => setActiveMedia(null)} aria-label={language === "es" ? "Cerrar imagen" : "Close image"} className="absolute right-4 top-4 z-10 flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-[#FAF9F6]/40 bg-[#0F172A] text-[#FAF9F6] transition-colors hover:bg-[#111111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FAF9F6] sm:right-8 sm:top-8">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" className="h-5 w-5"><path d="m5 5 10 10M15 5 5 15" /></svg>
            </button>
            <motion.div initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: reduceMotion ? 0 : 0.2 }} className="relative h-full max-h-[88vh] w-full max-w-[1600px] overflow-hidden rounded-xl bg-[#0F172A] shadow-2xl">
              <Image src={activeMedia.src} alt={activeMedia.alt} fill sizes="100vw" quality={100} className="object-contain" priority />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function ProjectsPage() {
  return <LanguageProvider><CasesContent /></LanguageProvider>;
}
