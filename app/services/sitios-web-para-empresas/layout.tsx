import type { Metadata } from "next";
import { SITE_URL } from "@/src/constants/seo";

export const metadata: Metadata = {
  title: { absolute: "Enzo Thome | Desarrollo web para empresas" },
  description: "Sitios web, portales y tiendas conectados con formularios, pagos y datos para acompañar la operación real de cada empresa.",
  keywords: ["desarrollo web para empresas", "sitios web Uruguay", "portales web a medida", "tiendas online conectadas"],
  alternates: { canonical: `${SITE_URL}/services/sitios-web-para-empresas` },
  openGraph: { title: "Enzo Thome | Sitios web conectados al negocio", description: "Sitios, portales y tiendas que forman parte de la operación de la empresa.", url: `${SITE_URL}/services/sitios-web-para-empresas`, siteName: "Enzo Thome", locale: "es_UY", type: "website", images: [{ url: "/LogoET.png", alt: "Sitios web y portales conectados" }] },
  twitter: { card: "summary_large_image", title: "Enzo Thome | Sitios web conectados al negocio", description: "Sitios, portales y tiendas que forman parte de la operación de la empresa.", images: [{ url: "/LogoET.png", alt: "Sitios web y portales conectados" }] },
};

export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
