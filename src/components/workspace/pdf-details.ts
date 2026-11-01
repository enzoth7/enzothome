import type { Client, Invoice } from "./model";

export type InvoicePdfDetails = {
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  recipientCountry: string;
  recipientCompany: string;
  bankAccountId: string;
  secondaryBankAccountId: string;
  paymentDays: number;
};

export function invoicePdfDetails(invoice: Invoice | undefined, client: Client | undefined): InvoicePdfDetails {
  let saved: Partial<InvoicePdfDetails> = {};
  try {
    const parsed: unknown = JSON.parse(invoice?.paymentInfo || "{}");
    if (parsed && typeof parsed === "object" && "pdf" in parsed && parsed.pdf && typeof parsed.pdf === "object") saved = parsed.pdf as Partial<InvoicePdfDetails>;
  } catch { /* Older payment notes were plain text. */ }
  return {
    recipientName: saved.recipientName || client?.name || "",
    recipientEmail: saved.recipientEmail || client?.email || "",
    recipientPhone: saved.recipientPhone || client?.phone || "",
    recipientCountry: saved.recipientCountry || client?.country || "",
    recipientCompany: saved.recipientCompany || client?.company || "",
    bankAccountId: saved.bankAccountId || "",
    secondaryBankAccountId: typeof saved.secondaryBankAccountId === "string" ? saved.secondaryBankAccountId : "",
    paymentDays: typeof saved.paymentDays === "number" && Number.isFinite(saved.paymentDays) ? saved.paymentDays : client?.language === "Inglés" ? 14 : 30,
  };
}

export function serializeInvoicePdfDetails(details: InvoicePdfDetails, previous = "") {
  let saved: Record<string, unknown> = {};
  if (previous) {
    try {
      const parsed: unknown = JSON.parse(previous);
      saved = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : { notes: previous };
    } catch { saved = { notes: previous }; }
  }
  return JSON.stringify({ ...saved, pdf: details });
}
