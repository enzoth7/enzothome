import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enzo Thome | Sobre Mí",
  description: "Conoce más sobre Enzo Thome, especialista en automatización de procesos, n8n y arquitectura de datos.",
  alternates: {
    canonical: "/about-me",
  },
};

export default function AboutMeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
