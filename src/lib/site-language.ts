export type SiteLanguage = "es" | "en";

// Countries and territory where Spanish is an official or primary language.
const SPANISH_SPEAKING_COUNTRIES = new Set([
  "AR", "BO", "CL", "CO", "CR", "CU", "DO", "EC", "ES", "GQ",
  "GT", "HN", "MX", "NI", "PA", "PE", "PR", "PY", "SV", "UY", "VE",
]);

export function languageForCountry(country: string | null): SiteLanguage | null {
  if (!country) return null;
  return SPANISH_SPEAKING_COUNTRIES.has(country.toUpperCase()) ? "es" : "en";
}

export function languageForRequest(country: string | null, acceptLanguage: string | null): SiteLanguage {
  const countryLanguage = languageForCountry(country);
  if (countryLanguage) return countryLanguage;

  // Geolocation headers are unavailable on localhost and some hosts.
  return acceptLanguage?.trim().toLowerCase().startsWith("es") ? "es" : "en";
}
