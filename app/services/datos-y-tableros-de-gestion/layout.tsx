import type { Metadata } from "next";
import { SITE_URL } from "@/src/constants/seo";

export const metadata: Metadata = {
  title: { absolute: "Enzo Thome | Datos y tableros de gestión para empresas" },
  description: "Centralizá planillas y fuentes dispersas en tableros de gestión claros para seguir indicadores y decidir a tiempo.",
  keywords: ["tableros de gestión", "dashboards para empresas", "centralización de datos empresariales", "indicadores operativos"],
  alternates: { canonical: `${SITE_URL}/services/datos-y-tableros-de-gestion` },
  openGraph: { title: "Enzo Thome | Datos y tableros de gestión", description: "Una vista clara de los datos que la empresa necesita para operar y decidir.", url: `${SITE_URL}/services/datos-y-tableros-de-gestion`, siteName: "Enzo Thome", locale: "es_UY", type: "website", images: [{ url: "/LogoET.png", alt: "Datos y tableros de gestión" }] },
  twitter: { card: "summary_large_image", title: "Enzo Thome | Datos y tableros de gestión", description: "Una vista clara de los datos que la empresa necesita para operar y decidir.", images: [{ url: "/LogoET.png", alt: "Datos y tableros de gestión" }] },
};

export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
