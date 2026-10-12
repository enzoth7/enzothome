import type { Metadata } from "next";
import Workspace from "@/src/components/workspace/Workspace";

export const metadata: Metadata = {
  title: "Operaciones",
  description: "Gestión de clientes y proyectos.",
  robots: { index: false, follow: false },
};
export default function OpsPage() { return <Workspace mode="ops" />; }
