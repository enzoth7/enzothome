import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Servicios | Enzo Thome — Automatización, IA y Datos",
  description:
    "Automatización de procesos con n8n, dashboards de datos, integraciones de IA y sistemas escalables para empresas en Uruguay y España. Eliminá tareas manuales y operá con datos.",
  keywords: [
    "automatización de procesos Uruguay",
    "n8n Uruguay",
    "automatización n8n",
    "integraciones de IA",
    "business intelligence Uruguay",
    "arquitectura de datos freelance",
    "dashboards operativos",
    "sistemas escalables PYMES",
    "consultor automatización Uruguay",
  ],
  openGraph: {
    title: "Servicios | Enzo Thome — Automatización, IA y Datos",
    description:
      "Automatización de procesos con n8n, dashboards de datos e integraciones de IA. Para empresas en Uruguay y España.",
    url: "https://enzothome.com/services",
    siteName: "Enzo Thome",
    locale: "es_UY",
    type: "website",
    images: ["/LogoET.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Servicios | Enzo Thome",
    images: ["/LogoET.png"],
  },
  alternates: {
    canonical: "/services",
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
