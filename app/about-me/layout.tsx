import type { Metadata } from "next";
import { SITE_URL } from "@/src/constants/seo";

export const metadata: Metadata = {
  title: { absolute: "Enzo Thome | Sobre mí, sistemas, datos y criterio operativo" },
  description:
    "Mi nombre es Enzo Thome: analista de datos y desarrollador de sistemas internos para empresas. Basado en Uruguay, trabajo con organizaciones locales y de distintos países.",
  keywords: [
    "Enzo Thome",
    "consultor sistemas internos Uruguay",
    "analista de datos Uruguay",
    "desarrollo de dashboards Uruguay",
    "centralización de datos empresas",
  ],
  openGraph: {
    title: "Enzo Thome | Sobre Mí",
    description:
      "Diseño sistemas internos y estructuras de datos que dan claridad y control a las empresas.",
    url: `${SITE_URL}/about-me`,
    siteName: "Enzo Thome",
    locale: "es_UY",
    type: "profile",
    images: ["/LogoET.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Enzo Thome | Sobre Mí",
    description:
      "Diseño sistemas internos y estructuras de datos que dan claridad y control a las empresas.",
    images: [{ url: "/LogoET.png", alt: "Enzo Thome" }],
  },
  alternates: {
    canonical: `${SITE_URL}/about-me`,
  },
};

export default function AboutMeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
