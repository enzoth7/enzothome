import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enzo Thome | Proyectos",
  description: "Explora los casos de estudio y proyectos de optimización de operaciones y analítica de datos.",
  alternates: {
    canonical: "/projects",
  },
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
