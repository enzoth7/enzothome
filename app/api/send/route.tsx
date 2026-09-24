import { NextResponse } from "next/server";
import { render } from "@react-email/render";
import { Resend } from "resend";
import { EmailTemplate } from "@/src/components/EmailTemplate";

const FROM_EMAIL = "onboarding@resend.dev";
const TO_EMAIL = "enzothome1@gmail.com";

type SendRequestBody = {
  name?: unknown;
  company?: unknown;
  email?: unknown;
  challenge?: unknown;
  website?: unknown;
};

const normalize = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is missing in /api/send");
    return NextResponse.json({ error: true, message: "Email service is not configured." }, { status: 500 });
  }

  let body: SendRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: true, message: "Invalid request body." }, { status: 400 });
  }

  const name = normalize(body.name);
  const company = normalize(body.company);
  const email = normalize(body.email);
  const challenge = normalize(body.challenge);
  const website = normalize(body.website);

  if (website) return NextResponse.json({ ok: true }, { status: 200 });

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (
    !name ||
    name.length > 120 ||
    company.length > 160 ||
    !isValidEmail ||
    challenge.length < 20 ||
    challenge.length > 2000
  ) {
    return NextResponse.json(
      { error: true, message: "Expected valid name, email and challenge." },
      { status: 400 }
    );
  }

  const template = <EmailTemplate name={name} company={company} email={email} challenge={challenge} />;

  try {
    const html = await render(template);
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: `Consulta web <${FROM_EMAIL}>`,
      to: [TO_EMAIL],
      replyTo: email,
      subject: company ? `Consulta web | ${company} | ${name}` : `Consulta web | ${name}`,
      html,
    });

    if (error) {
      console.error("Resend rejected /api/send", error);
      return NextResponse.json({ error: true, message: "Email provider rejected the request." }, { status: 502 });
    }

    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (error) {
    console.error("Unhandled /api/send error", error);
    return NextResponse.json({ error: true, message: "Unable to send the enquiry." }, { status: 500 });
  }
}
