import type { Metadata } from "next";
import Workspace from "@/src/components/workspace/Workspace";

export const metadata: Metadata = {
  title: "Portal",
  description: "Proyectos, documentación y próximos pasos.",
  robots: { index: false, follow: false },
};
export default function PortalPage() { return <Workspace mode="portal" />; }
