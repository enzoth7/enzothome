import * as React from "react";

type EmailTemplateProps = {
  name: string;
  company: string;
  email: string;
  challenge: string;
};

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  name,
  company,
  email,
  challenge,
}) => (
  <div
    style={{
      backgroundColor: "#FAF9F6",
      color: "#111111",
      fontFamily: "Arial, sans-serif",
      margin: "0 auto",
      maxWidth: "640px",
      padding: "32px",
    }}
  >
    <p style={{ color: "#0F172A", fontSize: "12px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
      Nueva consulta desde enzothome.com
    </p>
    <h1 style={{ color: "#0F172A", fontSize: "28px", lineHeight: 1.2, margin: "16px 0 28px" }}>
      {company || name}
    </h1>
    <table style={{ borderCollapse: "collapse", fontSize: "16px", width: "100%" }}>
      <tbody>
        <tr>
          <td style={{ borderTop: "1px solid #0F172A", fontWeight: 700, padding: "14px 0", width: "120px" }}>Nombre</td>
          <td style={{ borderTop: "1px solid #0F172A", padding: "14px 0" }}>{name}</td>
        </tr>
        <tr>
          <td style={{ borderTop: "1px solid #0F172A", fontWeight: 700, padding: "14px 0" }}>Email</td>
          <td style={{ borderTop: "1px solid #0F172A", padding: "14px 0" }}>{email}</td>
        </tr>
      </tbody>
    </table>
    <h2 style={{ color: "#0F172A", fontSize: "18px", margin: "32px 0 12px" }}>
      Situación que quiere ordenar
    </h2>
    <p style={{ fontSize: "16px", lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap" }}>{challenge}</p>
  </div>
);
