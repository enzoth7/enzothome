import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enzo Thome | Servicios",
  description: "Diseño e implementación de sistemas a medida de automatización, datos y operaciones.",
  alternates: {
    canonical: "/services",
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
