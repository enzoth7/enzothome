import { LanguageProvider } from "@/src/context/LanguageContext";
import ServicesClient from "./ServicesClient";

export default function ServicesPage() {
  return (
    <LanguageProvider>
      <ServicesClient />
    </LanguageProvider>
  );
}
