"use client";

import { FormEvent, useEffect, useState } from "react";
import { useLanguage } from "@/src/context/LanguageContext";
import { trackEvent } from "@/src/lib/analytics";
import SiteFooter from "@/src/components/sections/SiteFooter";

type FormState = "idle" | "sending" | "success" | "error";
type FieldName = "name" | "company" | "email" | "challenge";

const INITIAL_VALUES = {
  name: "",
  company: "",
  email: "",
  challenge: "",
  website: "",
};

export default function ContactoSection() {
  const { t, language } = useLanguage();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [status, setStatus] = useState<FormState>("idle");
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    setErrors({});
    setStatus("idle");
  }, [language]);

  const validateField = (name: FieldName, value: string) => {
    const trimmed = value.trim();
    if (name === "company") return "";
    if (!trimmed) return t.contact.required;
    if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return t.contact.invalidEmail;
    }
    if (name === "challenge" && trimmed.length < 20) return t.contact.challengeTooShort;
    return "";
  };

  const updateValue = (name: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    if (!hasStarted && name !== "website") {
      setHasStarted(true);
      trackEvent("contact_form_start", { location: "contact_section" });
    }
  };

  const handleBlur = (name: FieldName) => {
    setErrors((current) => ({ ...current, [name]: validateField(name, values[name]) }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fieldNames: FieldName[] = ["name", "email", "challenge"];
    const nextErrors = fieldNames.reduce<Partial<Record<FieldName, string>>>((result, name) => {
      const message = validateField(name, values[name]);
      if (message) result[name] = message;
      return result;
    }, {});

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstInvalid = fieldNames.find((name) => nextErrors[name]);
      if (firstInvalid) document.getElementById(`contact-${firstInvalid}`)?.focus();
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Request failed");
      setStatus("success");
      setValues(INITIAL_VALUES);
      setHasStarted(false);
      trackEvent("contact_form_submit", { location: "contact_section" });
    } catch {
      setStatus("error");
    }
  };

  const fields: Array<{ name: FieldName; type: string; label: string; autoComplete: string }> = [
    { name: "name", type: "text", label: t.contact.nameLabel, autoComplete: "name" },
    { name: "company", type: "text", label: t.contact.companyLabel, autoComplete: "organization" },
    { name: "email", type: "email", label: t.contact.emailLabel, autoComplete: "email" },
  ];

  return (
    <section id="contacto" className="scroll-mt-28 py-16 sm:py-24">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <h2 className="max-w-xl font-sans text-4xl font-semibold tracking-tighter text-[#FAF9F6] sm:text-5xl">
            {t.contact.title}
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
            {t.contact.description}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="border border-white/15 bg-[#0F172A]/70 p-6 sm:p-9">
          <div className="grid gap-6 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.name} className={field.name === "email" ? "sm:col-span-2" : ""}>
                <label htmlFor={`contact-${field.name}`} className="mb-2 block text-sm font-semibold text-[#FAF9F6]">
                  {field.label}
                </label>
                <input
                  id={`contact-${field.name}`}
                  name={field.name}
                  type={field.type}
                  required={field.name !== "company"}
                  autoComplete={field.autoComplete}
                  value={values[field.name]}
                  onChange={(event) => updateValue(field.name, event.target.value)}
                  onBlur={() => handleBlur(field.name)}
                  aria-invalid={Boolean(errors[field.name])}
                  aria-describedby={errors[field.name] ? `contact-${field.name}-error` : undefined}
                  className="min-h-12 w-full border border-white/25 bg-transparent px-4 py-3 text-[#FAF9F6] outline-none transition placeholder:text-slate-500 focus:border-white focus:ring-1 focus:ring-white"
                />
                {errors[field.name] ? (
                  <p id={`contact-${field.name}-error`} role="alert" className="mt-2 text-sm text-[#FAF9F6]">
                    {errors[field.name]}
                  </p>
                ) : null}
              </div>
            ))}

            <div className="sm:col-span-2">
              <label htmlFor="contact-challenge" className="mb-2 block text-sm font-semibold text-[#FAF9F6]">
                {t.contact.challengeLabel}
              </label>
              <textarea
                id="contact-challenge"
                name="challenge"
                rows={5}
                required
                maxLength={2000}
                value={values.challenge}
                onChange={(event) => updateValue("challenge", event.target.value)}
                onBlur={() => handleBlur("challenge")}
                aria-invalid={Boolean(errors.challenge)}
                aria-describedby={errors.challenge ? "contact-challenge-error" : undefined}
                className="w-full resize-y border border-white/25 bg-transparent px-4 py-3 text-[#FAF9F6] outline-none transition placeholder:text-slate-500 focus:border-white focus:ring-1 focus:ring-white"
              />
              {errors.challenge ? (
                <p id="contact-challenge-error" role="alert" className="mt-2 text-sm text-[#FAF9F6]">
                  {errors.challenge}
                </p>
              ) : null}
            </div>
          </div>

          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label htmlFor="contact-website">Website</label>
            <input
              id="contact-website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={values.website}
              onChange={(event) => updateValue("website", event.target.value)}
            />
          </div>

          <div className="mt-7 flex items-center">
            <button
              type="submit"
              disabled={status === "sending"}
              className="min-h-12 cursor-pointer bg-[#FAF9F6] px-7 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#0F172A] transition hover:bg-white disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {status === "sending" ? t.contact.sending : t.contact.submit}
            </button>
          </div>

          <div className="mt-5 min-h-6" aria-live="polite">
            {status === "success" ? <p className="text-sm font-semibold text-[#FAF9F6]">{t.contact.success}</p> : null}
            {status === "error" ? <p role="alert" className="text-sm font-semibold text-[#FAF9F6]">{t.contact.error}</p> : null}
          </div>
        </form>
      </div>

      <SiteFooter className="mt-16 sm:mt-20" />
    </section>
  );
}
