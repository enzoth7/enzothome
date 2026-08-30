import type { Metadata } from "next";
import { SITE_URL } from "@/src/constants/seo";

export const metadata: Metadata = {
  title: "Sobre Mí | Enzo Thome — Especialista en Automatización y Datos",
  description:
    "Conocé a Enzo Thome: especialista en automatización de procesos con n8n, inteligencia artificial y arquitectura de datos. Basado en Uruguay, trabajo con empresas en LATAM y España.",
  keywords: [
    "Enzo Thome",
    "especialista automatización Uruguay",
    "freelance n8n Uruguay",
    "consultor IA Uruguay",
    "analista de datos Uruguay",
    "automatización PYMES",
    "freelance datos LATAM",
  ],
  openGraph: {
    title: "Sobre Mí | Enzo Thome",
    description:
      "Especialista en automatización de procesos, n8n e IA. Basado en Uruguay, ayudo a empresas a operar con datos y sin tareas manuales.",
    url: `${SITE_URL}/about-me`,
    siteName: "Enzo Thome",
    locale: "es_UY",
    type: "profile",
    images: ["/LogoET.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sobre Mí | Enzo Thome",
    images: ["/LogoET.png"],
  },
  alternates: {
    canonical: `${SITE_URL}/about-me`,
  },
};

export default function AboutMeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
