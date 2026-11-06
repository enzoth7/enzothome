export type CalendarEmailKind = "created" | "day" | "halfHour";

export type CalendarEmailDetails = {
  title: string;
  startsAt: string;
  meetingUrl: string;
  clientName: string;
  clientLanguage: string;
  clientTimeZone: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] || character);
}

export function calendarEmail(kind: CalendarEmailKind, details: CalendarEmailDetails) {
  const english = details.clientLanguage === "Inglés";
  const zone = details.clientTimeZone || "America/Montevideo";
  const date = new Intl.DateTimeFormat(english ? "en-GB" : "es-UY", {
    timeZone: zone, weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(new Date(details.startsAt));
  const copy = {
    created: english
      ? { subject: `Meeting scheduled: ${details.title}`, lead: "Our meeting is scheduled. Here are the details:" }
      : { subject: `Reunión programada: ${details.title}`, lead: "Nuestra reunión quedó programada. Estos son los detalles:" },
    day: english
      ? { subject: `Meeting tomorrow: ${details.title}`, lead: "This is a reminder that we have a meeting tomorrow." }
      : { subject: `Reunión mañana: ${details.title}`, lead: "Te recuerdo que tenemos una reunión mañana." },
    halfHour: english
      ? { subject: `Meeting in 30 minutes: ${details.title}`, lead: "Our meeting starts in 30 minutes." }
      : { subject: `Reunión en 30 minutos: ${details.title}`, lead: "Nuestra reunión empieza en 30 minutos." },
  }[kind];
  const firstName = details.clientName.trim().split(/\s+/)[0];
  const greeting = firstName ? `${english ? "Hi" : "Hola"} ${firstName},` : english ? "Hello," : "Hola,";
  const link = /^https?:\/\//i.test(details.meetingUrl) ? details.meetingUrl : "";
  const html = `<!doctype html>
<html lang="${english ? "en" : "es"}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#FAF9F6;color:#0F172A;font-family:Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#FAF9F6;padding:32px 16px;">
    <tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#FAF9F6;border:1px solid rgba(15,23,42,.14);">
      <tr><td align="center" style="background:#0F172A;padding:10px 30px;"><img src="https://www.enzothome.com/LogoTransp.png" width="96" alt="Enzo Thome" style="display:block;width:96px;max-width:100%;height:auto;border:0;"></td></tr>
      <tr><td style="padding:34px 30px 24px;font-size:16px;line-height:1.65;">
        <p style="margin:0 0 18px;">${escapeHtml(greeting)}</p>
        <p style="margin:0 0 18px;">${escapeHtml(copy.lead)}</p>
        <h1 style="font-size:24px;line-height:1.25;margin:0 0 18px;">${escapeHtml(details.title)}</h1>
        <p style="margin:0 0 20px;"><strong>${escapeHtml(date)}</strong><br>${escapeHtml(zone.replaceAll("_", " "))}</p>
        ${link ? `<p style="margin:26px 0;"><a href="${escapeHtml(link)}" style="display:inline-block;background:#0F172A;color:#FAF9F6;text-decoration:none;padding:13px 18px;font-weight:700;">${english ? "Join meeting" : "Entrar a la reunión"}</a></p>` : ""}
        <p style="margin:0 0 22px;">${english ? "You can also see the meeting in your client portal." : "También podés ver la reunión en tu portal de cliente."}</p>
        <p style="margin:0;">${english ? "Thanks" : "Saludos"},<br>Enzo</p>
      </td></tr>
      <tr><td align="center" style="padding:18px 30px;border-top:1px solid rgba(15,23,42,.14);font-size:12px;"><a href="https://www.enzothome.com" style="color:#0F172A;text-decoration:none;">www.enzothome.com</a></td></tr>
    </table></td></tr>
  </table>
</body>
</html>`;
  return { subject: copy.subject, html };
}
