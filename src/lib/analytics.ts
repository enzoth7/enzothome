export type AnalyticsEvent =
  | "contact_cta_click"
  | "contact_form_start"
  | "contact_form_submit"
  | "whatsapp_click"
  | "calendar_click"
  | "case_view";

declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: AnalyticsEvent,
      parameters?: Record<string, string | number | boolean>
    ) => void;
  }
}

export function trackEvent(
  eventName: AnalyticsEvent,
  parameters: Record<string, string | number | boolean> = {}
) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", eventName, parameters);
}
