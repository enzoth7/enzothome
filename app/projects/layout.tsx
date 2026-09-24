import type { Metadata } from "next";
import { SITE_URL } from "@/src/constants/seo";

export const metadata: Metadata = {
  title: { absolute: "Enzo Thome | Proyectos realizados" },
  description:
    "Una selección de proyectos en los que trabajé: qué problema existía, qué se construyó y cómo quedó funcionando.",
  keywords: [
    "proyectos sistemas de gestión",
    "dashboards internos Uruguay",
    "centralización de datos empresas",
    "paneles de control operativo",
    "desarrollo web Uruguay",
  ],
  openGraph: {
    title: "Enzo Thome | Proyectos realizados",
    description:
      "Proyectos construidos alrededor de problemas de información, gestión y operación.",
    url: `${SITE_URL}/projects`,
    siteName: "Enzo Thome",
    locale: "es_UY",
    type: "website",
    images: ["/LogoET.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Enzo Thome | Proyectos",
    description:
      "Proyectos construidos alrededor de problemas de información, gestión y operación.",
    images: [{ url: "/LogoET.png", alt: "Proyectos de Enzo Thome" }],
  },
  alternates: {
    canonical: `${SITE_URL}/projects`,
  },
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
