import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { BankAccount, Invoice } from "./model";
import type { InvoicePdfDetails } from "./pdf-details";

const WIDTH = 1240;
const INVOICE_HEIGHT = 1754;
const RECEIPT_HEIGHT = 1105;
const navy = rgb(15 / 255, 23 / 255, 42 / 255);
const muted = rgb(69 / 255, 77 / 255, 89 / 255);
const paper = rgb(250 / 255, 249 / 255, 246 / 255);

type PdfFonts = { regular: PDFFont; semiBold: PDFFont; bold: PDFFont };

async function loadFonts(doc: PDFDocument): Promise<PdfFonts> {
  doc.registerFontkit(fontkit);
  const names = ["Regular", "SemiBold", "Bold"] as const;
  const bytes = await Promise.all(names.map(async weight => {
    const response = await fetch(`/workspace-pdf/fonts/IBMPlexSans-${weight}.ttf`);
    if (!response.ok) throw new Error("No se encontró la tipografía del PDF.");
    return response.arrayBuffer();
  }));
  const [regular, semiBold, bold] = await Promise.all(bytes.map(value => doc.embedFont(value, { subset: true })));
  return { regular, semiBold, bold };
}

function date(dateValue: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;
  const [year, month, day] = dateValue.split("-");
  return `${day}/${month}/${year}`;
}

function amount(value: number) {
  return new Intl.NumberFormat("es-UY", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function daysBetween(start: string, end: string) {
  const first = Date.parse(`${start}T12:00:00Z`);
  const last = Date.parse(`${end}T12:00:00Z`);
  return Number.isFinite(first) && Number.isFinite(last) ? Math.max(0, Math.round((last - first) / 86400000)) : 0;
}

function draw(page: PDFPage, text: string, x: number, top: number, size: number, font: PDFFont, color = navy) {
  if (!text) return;
  try { font.encodeText(text); } catch { throw new Error(`El PDF no admite un carácter de “${text.slice(0, 40)}”. Usá letras y signos habituales.`); }
  page.drawText(text, { x, y: page.getHeight() - top - size, size, font, color });
}

function right(page: PDFPage, text: string, rightEdge: number, top: number, size: number, font: PDFFont, color = navy) {
  draw(page, text, rightEdge - font.widthOfTextAtSize(text, size), top, size, font, color);
}

function drawParts(page: PDFPage, parts: { text: string; font: PDFFont }[], x: number, top: number, size: number, color = muted) {
  for (const part of parts) {
    draw(page, part.text, x, top, size, part.font, color);
    x += part.font.widthOfTextAtSize(part.text, size);
  }
}

function rightParts(page: PDFPage, parts: { text: string; font: PDFFont }[], rightEdge: number, top: number, size: number, color = muted) {
  const width = parts.reduce((sum, part) => sum + part.font.widthOfTextAtSize(part.text, size), 0);
  drawParts(page, parts, rightEdge - width, top, size, color);
}

function rule(page: PDFPage, top: number, from = 72, to = 1168, width = 1.5) {
  page.drawLine({ start: { x: from, y: page.getHeight() - top }, end: { x: to, y: page.getHeight() - top }, thickness: width, color: navy });
}

function lines(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const result: string[] = [];
  for (const paragraph of text.split(/\r?\n/)) {
    if (!paragraph.trim()) { result.push(""); continue; }
    let line = "";
    for (const word of paragraph.trim().split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) <= maxWidth) { line = next; continue; }
      if (line) result.push(line);
      if (font.widthOfTextAtSize(word, size) > maxWidth) throw new Error("Una palabra es demasiado larga para el PDF. Separala en la descripción.");
      line = word;
    }
    if (line) result.push(line);
  }
  return result;
}

function paragraph(page: PDFPage, text: string, x: number, top: number, size: number, lineHeight: number, maxWidth: number, font: PDFFont, color = muted) {
  const wrapped = lines(text, font, size, maxWidth);
  wrapped.forEach((line, index) => draw(page, line, x, top + index * lineHeight, size, font, color));
  return top + wrapped.length * lineHeight;
}

function fitted(page: PDFPage, text: string, x: number, top: number, maxWidth: number, initialSize: number, font: PDFFont) {
  let size = initialSize;
  while (size > 16 && font.widthOfTextAtSize(text, size) > maxWidth) size -= 1;
  if (font.widthOfTextAtSize(text, size) > maxWidth) throw new Error("El nombre no entra en el modelo PDF. Acortalo.");
  draw(page, text, x, top, size, font);
}

async function artwork(doc: PDFDocument, page: PDFPage, kind: "invoice" | "receipt") {
  const [headerBytes, footerBytes, signatureBytes] = await Promise.all(["header", "footer", "signature"].map(async asset => {
    const response = await fetch(`/workspace-pdf/${asset}.png`);
    if (!response.ok) throw new Error("No se encontraron los elementos gráficos del PDF.");
    return response.arrayBuffer();
  }));
  const [header, footer, signature] = await Promise.all([doc.embedPng(headerBytes), doc.embedPng(footerBytes), doc.embedPng(signatureBytes)]);
  const height = page.getHeight();
  page.drawRectangle({ x: 0, y: 0, width: WIDTH, height, color: paper });
  page.drawImage(header, { x: 0, y: height - 170, width: WIDTH, height: 170 });
  page.drawImage(footer, { x: 0, y: 0, width: WIDTH, height: 36 });
  page.drawImage(signature, { x: 880, y: height - (kind === "invoice" ? 1370 : 762) - 205, width: 288, height: 205 });
}

function recipient(page: PDFPage, details: InvoicePdfDetails, english: boolean, fonts: PdfFonts, receipt: boolean) {
  const { regular, semiBold, bold } = fonts;
  draw(page, receipt ? english ? "I RECEIVED FROM" : "RECIBÍ DE" : english ? "INVOICE TO" : "FACTURA A", 72, 216, 32, bold);
  fitted(page, details.recipientName.toUpperCase(), 72, 286, 510, 20, semiBold);
  drawParts(page, [{ text: `${english ? "Phone" : "Celular"}: `, font: bold }, { text: details.recipientPhone || "-", font: regular }], 72, 316, 16);
  drawParts(page, [{ text: "Email: ", font: bold }, { text: details.recipientEmail || "-", font: regular }], 72, 335, 16);
  drawParts(page, [{ text: `${english ? "Company" : "Empresa"}: `, font: bold }, { text: details.recipientCompany || "-", font: regular }], 72, 354, 16);
}

async function bankInfo(doc: PDFDocument, page: PDFPage, invoice: Invoice, details: InvoicePdfDetails, bank: BankAccount | undefined, english: boolean, fonts: PdfFonts) {
  const { regular, semiBold, bold } = fonts;
  draw(page, english ? "Payment Terms" : "Información para el pago", 72, 1296, 32, bold);
  const count = Number.isFinite(details.paymentDays) ? details.paymentDays : daysBetween(invoice.date, invoice.due);
  let y = 1340;
  drawParts(page, english
    ? [{ text: "Payment due within ", font: regular }, { text: `${count} days`, font: bold }, { text: " of the invoice date.", font: regular }]
    : [{ text: "El pago debe efectuarse en un plazo de ", font: regular }, { text: `${count} días`, font: bold }, { text: " a partir de la fecha de la factura.", font: regular }], 72, y, 16);
  y += 20;
  if (bank) {
    drawParts(page, [{ text: `${english ? "Account name" : "Titular de la cuenta"}: `, font: bold }, { text: bank.accountHolder, font: regular }], 72, y, 16); y += 20;
    drawParts(page, [{ text: `${english ? "Account / IBAN" : "Número de cuenta"}: `, font: bold }, { text: bank.accountNumber, font: regular }], 72, y, 16); y += 20;
    drawParts(page, [{ text: `${english ? "Bank" : "Banco"}: `, font: bold }, { text: bank.bankName, font: regular }], 72, y, 16); y += 20;
    if (bank.instructions) {
      for (const instruction of bank.instructions.split(/\r?\n/).filter(Boolean)) {
        const colon = instruction.indexOf(":");
        if (colon > 0 && colon < 30) {
          drawParts(page, [{ text: instruction.slice(0, colon + 1), font: bold }, { text: instruction.slice(colon + 1), font: regular }], 72, y, 16);
          y += 20;
        } else y = paragraph(page, instruction, 72, y, 16, 20, 690, regular);
      }
    }
    if (bank.paymentUrl && /paypal/i.test(bank.paymentUrl)) {
      const response = await fetch("/workspace-pdf/paypal.png");
      if (!response.ok) throw new Error("No se encontró el logo de PayPal del PDF.");
      const logo = await doc.embedPng(await response.arrayBuffer());
      draw(page, english ? "or" : "o", 486, 1360, 21, semiBold, muted);
      page.drawImage(logo, { x: 610, y: page.getHeight() - 1325 - 85, width: 90, height: 85 });
      draw(page, english ? "Click on the link below" : "Abrí el enlace para pagar", 545, 1412, 14, regular, muted);
      draw(page, bank.paymentUrl, 545, 1432, 14, semiBold);
    } else if (bank.paymentUrl) y = paragraph(page, bank.paymentUrl, 72, y, 16, 20, 690, regular);
  } else {
    draw(page, english ? "Ask us for the payment details." : "Consultanos los datos para pagar.", 72, y, 16, regular, muted); y += 20;
  }
  const termsTop = Math.max(1452, y + 24);
  if (termsTop > 1515) throw new Error("Los datos de pago son demasiado largos para este modelo PDF.");
  draw(page, english ? "Terms & Conditions" : "Términos & Condiciones", 72, termsTop, 32, bold);
  const terms = english
    ? "Work will be delivered according to the agreed scope and timeline. Any requests outside the agreed scope may require a separate quotation and revised delivery date. Final files, access and handover will be provided once the outstanding balance has been paid in full. The client is responsible for providing the information, feedback and approvals needed to complete the work."
    : "El trabajo se entregará conforme al alcance y los plazos acordados. Cualquier solicitud que exceda el alcance acordado podría requerir un presupuesto adicional y una nueva fecha de entrega. Los archivos finales, los accesos y la entrega formal se facilitarán una vez que se haya abonado la totalidad del saldo pendiente. Es responsabilidad del cliente proporcionar la información, los comentarios y las aprobaciones necesarios para completar el trabajo.";
  const end = paragraph(page, terms, 72, termsTop + 42, 16, 17, 708, regular);
  if (end > 1650) throw new Error("Las condiciones no entran en la página. Acortá los datos de pago.");
}

export async function generateInvoicePdf(invoice: Invoice, details: InvoicePdfDetails, bank: BankAccount | undefined, english: boolean): Promise<File> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${english ? "Invoice" : "Factura"} ${invoice.number}`);
  doc.setAuthor("Enzo Thome");
  const page = doc.addPage([WIDTH, INVOICE_HEIGHT]);
  const fonts = await loadFonts(doc);
  const { regular, semiBold, bold } = fonts;
  await artwork(doc, page, "invoice");
  recipient(page, details, english, fonts, false);
  right(page, english ? "INVOICE" : "FACTURA", 1168, 194, 96, bold);
  right(page, `No. ${invoice.number}`, 1168, 296, 32, bold);
  rightParts(page, [{ text: `${english ? "Date" : "Fecha"}: `, font: bold }, { text: date(invoice.date), font: regular }], 1168, 367, 16);
  rightParts(page, [{ text: `${english ? "Due date" : "Fecha de vencimiento"}: `, font: bold }, { text: date(invoice.due), font: regular }], 1168, 386, 16);
  rightParts(page, [{ text: `${english ? "Currency" : "Moneda"}: `, font: bold }, { text: invoice.currency, font: regular }], 1168, 405, 16);
  draw(page, english ? "DESCRIPTION" : "DESCRIPCIÓN", 82, 493, 20, semiBold);
  right(page, english ? "QTY" : "CANTIDAD", 845, 493, 20, semiBold);
  right(page, `${english ? "AMOUNT" : "IMPORTE"} (${invoice.currency})`, 1158, 493, 20, semiBold);
  rule(page, 529);
  let rowY = 548;
  const content = invoice.lines?.length ? invoice.lines : [{ id: invoice.id, description: invoice.title, amount: invoice.amount }];
  for (const line of content) {
    const descriptions = lines(line.description, regular, 16, 670);
    descriptions.forEach((part, index) => draw(page, part, 82, rowY + index * 19, 16, regular));
    right(page, "1", 845, rowY, 16, regular);
    right(page, amount(line.amount), 1158, rowY, 16, semiBold);
    rowY += Math.max(41, descriptions.length * 19 + 16);
    rule(page, rowY);
    rowY += 11;
  }
  if (rowY > 1060) throw new Error("Hay demasiadas líneas para este modelo PDF. Dividí la factura.");
  const totalY = Math.max(690, rowY + 55);
  draw(page, "Subtotal", 768, totalY, 20, regular);
  right(page, `${amount(invoice.amount)} ${invoice.currency}`, 1168, totalY, 16, semiBold);
  draw(page, english ? "VAT / TAX" : "IVA / Impuestos", 768, totalY + 35, 20, regular);
  right(page, `0 ${invoice.currency}`, 1168, totalY + 35, 16, semiBold);
  rule(page, totalY + 70, 768, 1168);
  draw(page, english ? "Invoice Total" : "Total", 768, totalY + 76, 20, semiBold);
  right(page, `${amount(invoice.amount)} ${invoice.currency}`, 1168, totalY + 71, 36, bold);
  await bankInfo(doc, page, invoice, details, bank, english, fonts);
  const bytes = await doc.save();
  return new File([new Uint8Array(bytes)], `${english ? "Invoice" : "Factura"}-${invoice.number.replace(/[^a-zA-Z0-9_-]/g, "-")}.pdf`, { type: "application/pdf" });
}

export type ReceiptPdfInput = {
  number: string;
  description: string;
  paymentMethod: string;
  paymentDate: string;
  amount: number;
};

export async function generateReceiptPdf(invoice: Invoice, details: InvoicePdfDetails, receipt: ReceiptPdfInput, english: boolean): Promise<File> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${english ? "Receipt" : "Recibo"} ${receipt.number}`);
  doc.setAuthor("Enzo Thome");
  const page = doc.addPage([WIDTH, RECEIPT_HEIGHT]);
  const fonts = await loadFonts(doc);
  const { regular, semiBold, bold } = fonts;
  await artwork(doc, page, "receipt");
  recipient(page, details, english, fonts, true);
  right(page, english ? "RECEIPT" : "RECIBO", 1168, 194, 96, bold);
  right(page, `No. ${receipt.number}`, 1168, 296, 32, bold);
  rightParts(page, [{ text: `${english ? "Date" : "Fecha"}: `, font: bold }, { text: date(receipt.paymentDate), font: regular }], 1168, 367, 16);
  rightParts(page, [{ text: `${english ? "Currency" : "Moneda"}: `, font: bold }, { text: invoice.currency, font: regular }], 1168, 386, 16);
  const columns = english
    ? [["DESCRIPTION", 82], ["ASSOCIATED INVOICE", 315], ["PAYMENT METHOD", 580], ["STATUS", 840]] as const
    : [["DESCRIPCIÓN", 82], ["FACTURA ASOCIADA", 304], ["MÉTODO DE PAGO", 622], ["ESTADO", 850]] as const;
  for (const [label, x] of columns) draw(page, label, x, 493, 18, semiBold);
  right(page, `${english ? "AMOUNT" : "IMPORTE"} (${invoice.currency})`, 1158, 493, 18, semiBold);
  rule(page, 529);
  const cells: [string, number, number][] = [
    [receipt.description, 82, 210],
    [`${english ? "Invoice" : "Factura"} No. ${invoice.number}`, 315, 220],
    [receipt.paymentMethod, 622, 220],
    [english ? "Confirmed" : "Confirmado", 850, 130],
  ];
  for (const [value, x, maxWidth] of cells) {
    let size = 16;
    while (size > 11 && regular.widthOfTextAtSize(value, size) > maxWidth) size -= 1;
    if (regular.widthOfTextAtSize(value, size) > maxWidth) throw new Error("Un dato del recibo es demasiado largo para el modelo PDF.");
    draw(page, value, x, 545, size, regular);
  }
  right(page, amount(receipt.amount), 1158, 545, 16, semiBold);
  rule(page, 584);
  draw(page, "Subtotal", 768, 648, 20, regular);
  right(page, `${amount(receipt.amount)} ${invoice.currency}`, 1168, 648, 16, semiBold);
  rule(page, 686, 768, 1168);
  draw(page, "Total", 768, 690, 20, semiBold);
  right(page, `${amount(receipt.amount)} ${invoice.currency}`, 1168, 686, 36, bold);
  paragraph(page, english ? "Payment receipt issued by Enzo Thome. Document for informational purposes only; holds no tax-related value." : "Constancia de recepción de pago emitida por Enzo Thome. Documento de carácter informativo, sin valor fiscal.", 72, 917, 15, 18, 710, regular);
  const bytes = await doc.save();
  return new File([new Uint8Array(bytes)], `${english ? "Receipt" : "Recibo"}-${receipt.number.replace(/[^a-zA-Z0-9_-]/g, "-")}.pdf`, { type: "application/pdf" });
}
