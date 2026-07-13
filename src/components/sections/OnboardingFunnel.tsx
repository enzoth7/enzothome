"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ONBOARDING_CATEGORY_ORDER,
  ONBOARDING_SCORE_MAP,
} from "@/src/constants/onboarding";
import type { ServiceId } from "@/src/constants/services";
import { useLanguage } from "@/src/context/LanguageContext";

const ANALYSIS_DURATION_MS = 4200;
const ANALYSIS_MESSAGE_MS = 1400;

type FunnelStage = "questions" | "analysis" | "result";

function LoadingSpinner() {
  return (
    <motion.div
      aria-hidden="true"
      className="h-12 w-12 rounded-full border border-slate-200 border-t-neutral-950"
      animate={{ rotate: 360 }}
      transition={{ repeat: Number.POSITIVE_INFINITY, ease: "linear", duration: 1.2 }}
    />
  );
}

function IntroBlock({
  subtitle,
  title,
  description,
}: {
  subtitle: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-8 lg:sticky lg:top-28">
      <div className="flex items-center gap-4">
        <span className="h-px w-10 bg-[#064e3b]/28" />
        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
          {subtitle}
        </span>
      </div>
      <h2 className="font-sans text-4xl font-black tracking-tighter text-neutral-900 sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      <p className="max-w-2xl text-lg leading-relaxed text-neutral-600">{description}</p>
    </div>
  );
}

export default function OnboardingFunnel() {
  const { t } = useLanguage();
  const questions = t.onboarding.questions;
  const [answers, setAnswers] = useState<string[]>([]);
  const [stage, setStage] = useState<FunnelStage>("questions");
  const [messageIndex, setMessageIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sentStatus, setSentStatus] = useState<"idle" | "success" | "error">("idle");

  const activeQuestion = stage === "questions" ? questions[answers.length] : null;
  const isEmailValid = /\S+@\S+\.\S+/.test(email.trim());

  useEffect(() => {
    if (stage !== "analysis") {
      return;
    }

    const intervalId = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % t.onboarding.analysisMessages.length);
    }, ANALYSIS_MESSAGE_MS);

    const timeoutId = window.setTimeout(() => {
      window.clearInterval(intervalId);
      setStage("result");
      setMessageIndex(0);
    }, ANALYSIS_DURATION_MS);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [stage, t.onboarding.analysisMessages.length]);

  const category = useMemo(() => {
    const scores: Record<ServiceId, number> = {
      process_automation: 0,
      data_bi: 0,
      ai_solutions: 0,
    };

    answers.forEach((answer) => {
      const weights = ONBOARDING_SCORE_MAP[answer];
      if (!weights) {
        return;
      }

      ONBOARDING_CATEGORY_ORDER.forEach((serviceId) => {
        scores[serviceId] += weights[serviceId] ?? 0;
      });
    });

    return ONBOARDING_CATEGORY_ORDER.reduce((best, current) =>
      scores[current] > scores[best] ? current : best
    );
  }, [answers]);

  const answerSummary = useMemo(
    () =>
      questions.map((question, index) => ({
        prompt: question.prompt,
        answer:
          question.options.find((option) => option.value === answers[index])?.label ??
          t.onboarding.unanswered,
      })),
    [answers, questions, t]
  );

  const handleSubmission = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isEmailValid || isSending) {
      return;
    }

    setIsSending(true);
    setSentStatus("idle");

    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          category: t.onboarding.categories[category],
          answers: answerSummary.map((item) => ({
            question: item.prompt,
            answer: item.answer,
          })),
        }),
      });

      if (response.ok) {
        setSentStatus("success");
      } else {
        const contentType = response.headers.get("content-type") ?? "";
        const payload = contentType.includes("application/json")
          ? await response.json().catch(() => null)
          : await response.text().catch(() => null);
        const payloadText = payload === null ? "Payload is null" : JSON.stringify(payload);

        console.error(
          `>>> RESEND ERROR: [${response.status}] ${response.statusText} | PAYLOAD: ${payloadText}`
        );
        setSentStatus("error");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setSentStatus("error");
    } finally {
      setIsSending(false);
    }
  };

  const handleOptionClick = (value: string) => {
    const nextAnswers = [...answers, value];
    setAnswers(nextAnswers);

    if (nextAnswers.length === questions.length) {
      setStage("analysis");
      return;
    }

    setStage("questions");
  };

  const resetFunnel = () => {
    setAnswers([]);
    setStage("questions");
    setMessageIndex(0);
    setEmail("");
    setSentStatus("idle");
  };

  return (
    <section id="onboarding-funnel" className="scroll-mt-28 border-t border-slate-200 py-24 sm:py-28">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <IntroBlock
          subtitle={t.onboarding.subtitle}
          title={t.onboarding.title}
          description={t.onboarding.description}
        />

        <div className="rounded-[32px] border border-slate-200 bg-white/92 p-6 shadow-sm sm:p-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              {t.onboarding.progressLabel} {Math.min(answers.length + 1, questions.length)}{" "}
              {t.onboarding.progressConnector} {questions.length}
            </span>
            <button
              type="button"
              onClick={resetFunnel}
              className="text-sm font-medium text-slate-500 transition hover:text-neutral-950"
            >
              {t.onboarding.restart}
            </button>
          </div>

          <div className="mb-8 flex gap-2">
            {questions.map((question, index) => (
              <span
                key={question.id}
                className={[
                  "h-1.5 flex-1 rounded-full transition-colors",
                  index < answers.length ? "bg-[#064e3b]" : "bg-slate-200",
                ].join(" ")}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {stage === "questions" && activeQuestion ? (
              <motion.div
                key={activeQuestion.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
                  {activeQuestion.prompt}
                </h3>

                <div className="grid gap-3">
                  {activeQuestion.options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleOptionClick(option.value)}
                      className="rounded-[22px] border border-slate-200 bg-slate-50/80 px-5 py-4 text-left text-base font-medium text-neutral-800 shadow-sm transition hover:border-slate-300 hover:bg-white"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : null}

            {stage === "analysis" ? (
              <motion.div
                key="analysis"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex min-h-[320px] flex-col items-center justify-center gap-6 text-center"
              >
                <LoadingSpinner />
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold tracking-tight text-neutral-950">
                    {t.onboarding.analysisTitle}
                  </h3>
                  <motion.p
                    key={messageIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="text-base text-neutral-600"
                  >
                    {t.onboarding.analysisMessages[messageIndex]}
                  </motion.p>
                </div>
              </motion.div>
            ) : null}

            {stage === "result" ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <span className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-[#064e3b]" />
                    {t.onboarding.matchLabel}
                  </span>
                  <h3 className="text-3xl font-semibold tracking-tight text-neutral-950">
                    {t.onboarding.resultPrefix}{" "}
                    <span className="text-[#064e3b]">{t.onboarding.categories[category]}</span>.
                  </h3>
                  <p className="text-base leading-relaxed text-neutral-600">
                    {t.onboarding.resultSuffix}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {answerSummary.map((item, index) => (
                    <div
                      key={item.prompt}
                      className="rounded-[20px] border border-slate-200 bg-slate-50/80 p-4 shadow-sm"
                    >
                      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                        0{index + 1}
                      </div>
                      <p className="mt-2 text-sm font-medium text-neutral-700">{item.prompt}</p>
                      <p className="mt-2 text-sm text-neutral-600">{item.answer}</p>
                    </div>
                  ))}
                </div>

                {sentStatus === "success" ? (
                  <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 p-5 text-center font-semibold text-emerald-700 shadow-sm">
                    {t.onboarding.successMessage}
                  </div>
                ) : (
                  <form onSubmit={handleSubmission} className="space-y-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={t.onboarding.emailPlaceholder}
                      className="h-14 w-full rounded-[20px] border border-slate-200 bg-slate-50/80 px-6 text-center text-base font-medium text-neutral-900 outline-none transition focus:border-slate-300 focus:bg-white"
                    />
                    <button
                      type="submit"
                      disabled={!isEmailValid || isSending}
                      className={[
                        "inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold shadow-sm transition",
                        isEmailValid && !isSending
                          ? "bg-neutral-950 text-white hover:bg-[#064e3b]"
                          : "cursor-not-allowed bg-slate-200 text-slate-400",
                      ].join(" ")}
                    >
                      {isSending ? t.onboarding.sendingCta : t.onboarding.finalCta}
                    </button>
                  </form>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
