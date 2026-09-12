import type { Metadata } from "next";
import { SITE_URL } from "@/src/constants/seo";

export const metadata: Metadata = {
  title: "Proyectos — Automatización, Datos y Desarrollo Web",
  description:
    "Proyectos de automatización, datos, inteligencia artificial y desarrollo web, desde landing pages hasta e-commerce conectados a la operación del negocio.",
  keywords: [
    "proyectos automatización Uruguay",
    "casos de estudio n8n",
    "ejemplos automatización PYMES",
    "dashboards datos Uruguay",
    "portfolio freelance automatización",
    "proyectos IA Uruguay",
    "desarrollo web Uruguay",
    "landing pages Uruguay",
    "e-commerce Uruguay",
  ],
  openGraph: {
    title: "Enzo Thome | Proyectos",
    description:
      "Automatización, datos, IA y desarrollo web aplicados a soluciones de negocio a medida.",
    url: `${SITE_URL}/projects`,
    siteName: "Enzo Thome",
    locale: "es_UY",
    type: "website",
    images: ["/LogoET.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Enzo Thome | Proyectos",
    images: ["/LogoET.png"],
  },
  alternates: {
    canonical: `${SITE_URL}/projects`,
  },
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
