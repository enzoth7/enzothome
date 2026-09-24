import type { Metadata } from "next";
import { SITE_URL } from "@/src/constants/seo";

export const metadata: Metadata = {
  title: { absolute: "Enzo Thome | Sistemas internos y paneles de gestión" },
  description: "Sistemas internos, paneles y portales a medida para centralizar datos, seguir operaciones y dar a cada empresa una fuente de información clara.",
  keywords: ["sistemas de gestión a medida", "paneles internos para empresas", "centralización de datos empresariales", "dashboards operativos Uruguay"],
  alternates: { canonical: `${SITE_URL}/services/sistemas-internos` },
  openGraph: { title: "Enzo Thome | Sistemas internos y paneles de gestión", description: "Centralizá datos y operaciones en una herramienta clara para toda la empresa.", url: `${SITE_URL}/services/sistemas-internos`, siteName: "Enzo Thome", locale: "es_UY", type: "website", images: [{ url: "/LogoET.png", alt: "Sistemas internos y paneles de gestión" }] },
  twitter: { card: "summary_large_image", title: "Enzo Thome | Sistemas internos y paneles de gestión", description: "Centralizá datos y operaciones en una herramienta clara para toda la empresa.", images: [{ url: "/LogoET.png", alt: "Sistemas internos y paneles de gestión" }] },
};

export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
