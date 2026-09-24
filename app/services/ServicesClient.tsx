"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import MobileLanguageToggle from "@/components/MobileLanguageToggle";
import Navbar from "@/components/Navbar";
import SocialRail from "@/components/SocialRail";
import Background from "@/src/components/sections/Background";
import SiteFooter from "@/src/components/sections/SiteFooter";
import { useLanguage } from "@/src/context/LanguageContext";
import { trackEvent } from "@/src/lib/analytics";

const PAGE_COPY = {
  es: {
    title: "La forma depende del problema.",
    lead: "Primero entiendo cómo funciona la empresa, dónde se fragmenta la información y qué necesita ver cada persona. Después definimos qué conviene construir.",
    principle: "Un sistema, un tablero o un sitio web tienen sentido cuando hacen que la operación sea más clara y fácil de manejar.",
    items: [
      {
        title: "Sistemas internos y control operativo",
        description: "Construyo herramientas de uso diario para centralizar la operación, dar seguimiento al trabajo y hacer visible qué está pasando en cada área.",
        href: "/services/sistemas-internos",
        cta: "Conocer esta solución",
        image: "/señales/a.jpg",
        alt: "Persona utilizando un sistema interno desde una tablet",
      },
      {
        title: "Datos y tableros de gestión",
        description: "Reúno planillas y fuentes separadas en una vista clara, con indicadores y reportes que sirven para entender la empresa y decidir a tiempo.",
        href: "/services/datos-y-tableros-de-gestion",
        cta: "Ver datos y tableros",
        image: "/señales/b.png",
        alt: "Tablero de gestión con indicadores operativos",
      },
      {
        title: "Sitios web y portales conectados",
        description: "Desarrollo sitios, portales y tiendas que reciben consultas, organizan información y se integran con lo que la empresa necesita para operar.",
        href: "/services/sitios-web-para-empresas",
        cta: "Ver sitios y portales",
        image: "/señales/c.png",
        alt: "Estación de desarrollo de sitios y portales web",
      },
    ],
    closingTitle: "No hace falta que sepas qué herramienta necesitás.",
    closingBody: "Alcanza con identificar qué información está dispersa, qué parte del trabajo cuesta seguir o qué debería verse con mayor claridad.",
    closingCta: "Contame tu situación",
  },
  en: {
    eyebrow: "Solutions",
    title: "The shape depends on the problem.",
    lead: "I first understand how the company works, where information becomes fragmented, and what each person needs to see. Then we define what should be built.",
    principle: "A system, dashboard, or website is useful when it makes the operation clearer and easier to manage.",
    items: [
      {
        title: "Internal systems and operational control",
        description: "I build everyday tools that centralize operations, organize work tracking, and make activity across the company visible.",
        href: "/services/sistemas-internos",
        cta: "Explore this solution",
        image: "/señales/a.jpg",
        alt: "Person using an internal system on a tablet",
      },
      {
        title: "Data and management dashboards",
        description: "I bring separate spreadsheets and sources into one clear view, with indicators and reports that help teams understand the company and decide on time.",
        href: "/services/datos-y-tableros-de-gestion",
        cta: "Explore data and dashboards",
        image: "/señales/b.png",
        alt: "Management dashboard with operational indicators",
      },
      {
        title: "Connected websites and portals",
        description: "I build websites, portals, and stores that receive enquiries, organize information, and connect with the systems a company uses to operate.",
        href: "/services/sitios-web-para-empresas",
        cta: "Explore websites and portals",
        image: "/señales/c.png",
        alt: "Website and portal development workstation",
      },
    ],
    closingTitle: "You do not need to know which tool you need.",
    closingBody: "It is enough to identify which information is scattered, which part of the work is difficult to track, or what should be seen more clearly.",
    closingCta: "Tell me your situation",
  },
} as const;

export default function ServicesClient() {
  const { language } = useLanguage();
  const copy = PAGE_COPY[language];
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative min-h-screen overflow-x-hidden text-[#FAF9F6]">
      <div className="fixed inset-0 z-0"><Background variant="wallpaper" /></div>
      <div className="relative z-40"><SocialRail /></div>
      <div className="relative z-50"><Navbar /></div>
      <MobileLanguageToggle />

      <main id="main-content" className="relative z-20">
        <header className="mx-auto max-w-[1400px] px-6 pb-20 pt-36 sm:px-10 sm:pb-24 sm:pt-40 lg:px-12 lg:pb-28 lg:pt-48">
          <h1 className="max-w-5xl font-sans text-5xl font-semibold tracking-[-0.055em] text-[#FAF9F6] sm:text-6xl lg:text-8xl">
            {copy.title}
          </h1>
          <div className="mt-9 grid gap-8 border-t border-[#FAF9F6]/20 pt-8 lg:grid-cols-2 lg:gap-16">
            <p className="max-w-3xl text-lg leading-relaxed text-[#FAF9F6]/78 sm:text-xl">{copy.lead}</p>
            <p className="max-w-2xl text-lg font-semibold leading-relaxed text-[#FAF9F6] sm:text-xl">{copy.principle}</p>
          </div>
        </header>

        <section className="border-y border-[#FAF9F6]/35 bg-[#FAF9F6]/45 text-[#0F172A] backdrop-blur-md">
          <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-12">
            {copy.items.map((item, index) => (
              <motion.article
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-12%" }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="grid gap-9 border-b border-[#0F172A]/12 py-14 last:border-b-0 sm:py-20 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-16 lg:py-24"
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <h2 className="max-w-2xl font-sans text-4xl font-semibold leading-[0.95] tracking-[-0.045em] text-[#0F172A] sm:text-5xl lg:text-6xl">
                    {item.title}
                  </h2>
                  <p className="mt-7 max-w-2xl text-lg leading-relaxed text-[#0F172A]/72">{item.description}</p>
                  <Link
                    href={item.href}
                    className="mt-8 inline-flex min-h-12 items-center rounded-xl border border-[#0F172A]/35 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#0F172A] transition duration-200 hover:-translate-y-0.5 hover:bg-[#0F172A] hover:text-[#FAF9F6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F172A]"
                  >
                    {item.cta}
                  </Link>
                </div>

                <div className={`group relative aspect-[5/4] overflow-hidden bg-[#111111] ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    quality={92}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                  />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/55 via-transparent to-transparent" />
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-6 py-20 sm:px-10 sm:py-24 lg:px-12 lg:py-28">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
            <h2 className="max-w-4xl font-sans text-4xl font-semibold tracking-[-0.045em] text-[#FAF9F6] sm:text-5xl lg:text-6xl">{copy.closingTitle}</h2>
            <div>
              <p className="text-lg leading-relaxed text-[#FAF9F6]/72">{copy.closingBody}</p>
              <Link
                href="/#contacto"
                onClick={() => trackEvent("contact_cta_click", { location: "services_page" })}
                className="mt-7 inline-flex min-h-12 items-center rounded-xl bg-[#FAF9F6] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#0F172A] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FAF9F6]"
              >
                {copy.closingCta}
              </Link>
            </div>
          </div>

        </section>

        <div className="px-6 sm:px-10 lg:px-12">
          <div className="mx-auto max-w-[1400px]">
            <SiteFooter className="border-t border-[#FAF9F6]/15" />
          </div>
        </div>
      </main>
    </div>
  );
}
