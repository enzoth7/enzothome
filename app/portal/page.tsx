import type { Metadata, Viewport } from "next";
import Workspace from "@/src/components/workspace/Workspace";

export const metadata: Metadata = {
  title: "Portal",
  description: "Proyectos, documentación y próximos pasos.",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", interactiveWidget: "resizes-content", themeColor: "#0F172A" };
export default function PortalPage() { return <Workspace mode="portal" />; }
