import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding | Enzo Thome — Empezá tu proyecto",
  description:
    "Iniciá el proceso de trabajo con Enzo Thome. Contame tu proyecto de automatización, datos o IA y empecemos a construir la solución juntos.",
  keywords: [
    "contratar automatización Uruguay",
    "consultoría n8n Uruguay",
    "freelance automatización contacto",
    "empezar proyecto datos Uruguay",
  ],
  openGraph: {
    title: "Onboarding | Enzo Thome",
    description:
      "Contame tu proyecto de automatización, datos o IA. Empezamos a construir la solución juntos.",
    url: "https://enzothome.com/onboarding",
    siteName: "Enzo Thome",
    locale: "es_UY",
    type: "website",
    images: ["/LogoET.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Onboarding | Enzo Thome",
    images: ["/LogoET.png"],
  },
  alternates: {
    canonical: "/onboarding",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
