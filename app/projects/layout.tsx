import type { Metadata } from "next";
import { SITE_URL } from "@/src/constants/seo";

export const metadata: Metadata = {
  title: "Proyectos | Enzo Thome — Casos de Automatización y Datos",
  description:
    "Casos de estudio reales: automatización de operaciones, dashboards de datos e integraciones de IA implementadas por Enzo Thome para empresas en Uruguay y España.",
  keywords: [
    "proyectos automatización Uruguay",
    "casos de estudio n8n",
    "ejemplos automatización PYMES",
    "dashboards datos Uruguay",
    "portfolio freelance automatización",
    "proyectos IA Uruguay",
  ],
  openGraph: {
    title: "Proyectos | Enzo Thome",
    description:
      "Casos reales de automatización, datos e IA. Mirá cómo empresas optimizaron sus operaciones con soluciones a medida.",
    url: `${SITE_URL}/projects`,
    siteName: "Enzo Thome",
    locale: "es_UY",
    type: "website",
    images: ["/LogoET.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Proyectos | Enzo Thome",
    images: ["/LogoET.png"],
  },
  alternates: {
    canonical: `${SITE_URL}/projects`,
  },
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
