"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { OAuthAuthorizationDetails } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/src/lib/supabase/client";
import styles from "./consent.module.css";

type State = "loading" | "login" | "sent" | "consent" | "working" | "error";

export default function OAuthConsent({ authorizationId }: { authorizationId: string }) {
  const [state, setState] = useState<State>("loading");
  const [details, setDetails] = useState<OAuthAuthorizationDetails | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase || !authorizationId) throw new Error("El enlace de autorización no es válido.");
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError && userError.name !== "AuthSessionMissingError") throw userError;
      if (!active) return;
      if (!user) { setState("login"); return; }
      const { data: admin, error: adminError } = await supabase.from("workspace_admins").select("email").eq("email", user.email || "").eq("active", true).maybeSingle();
      if (adminError) throw adminError;
      if (!admin) throw new Error("Esta cuenta no tiene acceso de administrador a Operaciones.");
      const { data, error: detailsError } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);
      if (detailsError || !data) throw detailsError || new Error("No se pudo cargar la solicitud.");
      if (!active) return;
      if ("redirect_url" in data) { window.location.assign(data.redirect_url); return; }
      setDetails(data);
      setState("consent");
    }
    void load().catch(cause => {
      if (!active) return;
      setError(cause instanceof Error ? cause.message : "No se pudo verificar el acceso.");
      setState("error");
    });
    return () => { active = false; };
  }, [authorizationId]);

  async function sendLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setState("working");
    setError("");
    const next = `/oauth/consent?authorization_id=${encodeURIComponent(authorizationId)}`;
    const callback = new URL("/auth/callback", window.location.origin);
    callback.searchParams.set("next", next);
    const { error: linkError } = await supabase.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { emailRedirectTo: callback.toString() } });
    if (linkError) { setError(linkError.message); setState("login"); return; }
    setState("sent");
  }

  async function decide(approved: boolean) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !details) return;
    setState("working");
    setError("");
    const { data, error: decisionError } = approved
      ? await supabase.auth.oauth.approveAuthorization(authorizationId, { skipBrowserRedirect: true })
      : await supabase.auth.oauth.denyAuthorization(authorizationId, { skipBrowserRedirect: true });
    if (decisionError || !data) {
      setError(decisionError?.message || "No se pudo completar la decisión.");
      setState("consent");
      return;
    }
    window.location.assign(data.redirect_url);
  }

  return <main className={styles.page}>
    <section className={styles.card} aria-labelledby="consent-title">
      <div className={styles.brand} aria-hidden="true">‹ET›</div>
      <div className={styles.body}>
        <p className={styles.eyebrow}>Operaciones</p>
        <h1 id="consent-title">Conectar un asistente</h1>
        {state === "loading" && <p>Verificando tu sesión…</p>}
        {state === "login" && <>
          <p>Ingresá con tu correo administrador para revisar esta solicitud.</p>
          <form onSubmit={sendLink} className={styles.form}>
            <label htmlFor="oauth-admin-email">Correo</label>
            <input id="oauth-admin-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} />
            <button type="submit">Enviar enlace de acceso</button>
          </form>
        </>}
        {state === "sent" && <p>Te enviamos un enlace. Abrilo desde este dispositivo para continuar.</p>}
        {state === "consent" && details && <>
          <p><strong>{details.client.name || "Un asistente"}</strong> solicita acceso a tus datos de Operaciones.</p>
          <div className={styles.permissions}>
            <p>Podrá consultar clientes, proyectos, etapas, documentos, facturas y calendario. También podrá crear eventos nuevos.</p>
            <p>No podrá editar ni borrar datos, registrar pagos ni enviar comunicaciones.</p>
            {details.scope && <p className={styles.scopes}>Permisos solicitados: {details.scope}</p>}
          </div>
          <div className={styles.actions}>
            <button type="button" onClick={() => void decide(true)}>Autorizar</button>
            <button type="button" className={styles.secondary} onClick={() => void decide(false)}>Cancelar</button>
          </div>
        </>}
        {state === "working" && <p>Procesando…</p>}
        {state === "error" && <p role="alert" className={styles.error}>{error}</p>}
        {error && state !== "error" && <p role="alert" className={styles.error}>{error}</p>}
      </div>
    </section>
  </main>;
}
