import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enzo Thome | Onboarding",
  description: "Inicia el proceso de consultoría en automatización y optimización de flujos de trabajo.",
  alternates: {
    canonical: "/onboarding",
  },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
