import type { Metadata } from "next";
import { SITE_URL } from "@/src/constants/seo";

export const metadata: Metadata = {
  title: { absolute: "Enzo Thome | Servicios, sistemas internos, datos y desarrollo web" },
  description:
    "Sistemas internos, paneles de gestión y sitios web conectados para centralizar datos y mejorar las operaciones de empresas en Uruguay y el exterior.",
  keywords: [
    "sistemas de gestión a medida",
    "paneles internos para empresas",
    "centralización de datos empresariales",
    "dashboards operativos Uruguay",
    "desarrollo web para empresas",
  ],
  openGraph: {
    title: "Enzo Thome | Servicios para ordenar datos y operaciones",
    description:
      "Sistemas internos, paneles de gestión y sitios web conectados para empresas.",
    url: `${SITE_URL}/services`,
    siteName: "Enzo Thome",
    locale: "es_UY",
    type: "website",
    images: ["/LogoET.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Enzo Thome | Servicios",
    description:
      "Sistemas internos, paneles de gestión y sitios web conectados para empresas.",
    images: [{ url: "/LogoET.png", alt: "Servicios de Enzo Thome" }],
  },
  alternates: {
    canonical: `${SITE_URL}/services`,
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
