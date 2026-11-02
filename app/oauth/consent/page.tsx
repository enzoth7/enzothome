import type { Metadata } from "next";
import OAuthConsent from "./OAuthConsent";

export const metadata: Metadata = {
  title: "Autorizar acceso · Operaciones",
  robots: { index: false, follow: false },
};

export default async function ConsentPage({ searchParams }: { searchParams: Promise<{ authorization_id?: string }> }) {
  const { authorization_id: authorizationId = "" } = await searchParams;
  return <OAuthConsent authorizationId={authorizationId} />;
}
