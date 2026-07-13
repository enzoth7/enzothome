"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import LanguageToggle from "@/src/components/LanguageToggle";
import {
  ONBOARDING_CATEGORY_ORDER,
  ONBOARDING_QUESTION_TEMPLATES,
} from "@/src/constants/onboarding";
import type { ServiceId } from "@/src/constants/services";
import { LanguageProvider, useLanguage } from "@/src/context/LanguageContext";
import Background from "@/src/components/sections/Background";
import SystemMap from "@/src/components/sections/SystemMap";

const ANALYSIS_DURATION_MS = 3000;
const ANALYSIS_MESSAGE_MS = 1000;

type FunnelStage = "intro" | "questions" | "analysis" | "result";

type AnswerOption = {
  label: string;
  value: string;
  scores: Partial<Record<ServiceId, number>>;
};

type Question = {
  id: string;
  prompt: string;
  options: AnswerOption[];
};

function LoadingSpinner() {
  return (
    <motion.div
      aria-hidden="true"
      className="h-14 w-14 rounded-full border border-slate-300 border-t-[#0f172a]"
      animate={{ rotate: 360 }}
      transition={{ repeat: Number.POSITIVE_INFINITY, ease: "linear", duration: 1.05 }}
    />
  );
}

function AnswerOptionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.01, boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.12)" }}
      whileTap={{ scale: 0.99 }}
      className="w-full rounded-none border border-neutral-200 bg-white px-8 py-5 text-left text-lg font-semibold text-slate-900 shadow-[0_12px_28px_rgba(15,23,42,0.06)] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900"
    >
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <div className="flex h-6 w-6 items-center justify-center rounded-none border border-slate-900/15 bg-stone-50">
          <div className="h-2 w-2 rounded-none bg-slate-900/10" />
        </div>
      </div>
    </motion.button>
  );
}

function OnboardingContent() {
  const { t } = useLanguage();
  const [answers, setAnswers] = useState<string[]>([]);
  const [stage, setStage] = useState<FunnelStage>("intro");
  const [messageIndex, setMessageIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sentStatus, setSentStatus] = useState<"idle" | "success" | "error">("idle");

  const CATEGORY_LABELS = useMemo<Record<ServiceId, string>>(
    () => ({
      process_automation: t.onboarding.categories.process_automation,
      data_bi: t.onboarding.categories.data_bi,
      ai_solutions: t.onboarding.categories.ai_solutions,
    }),
    [t]
  );

  const ANALYSIS_MESSAGES = useMemo(() => t.onboarding.analysisMessages, [t]);

  const QUESTIONS = useMemo<Question[]>(() => {
    const translatedQuestions = new Map(
      t.onboarding.questions.map((question) => [question.id, question])
    );

    return ONBOARDING_QUESTION_TEMPLATES.map((question) => {
      const translatedQuestion = translatedQuestions.get(question.id);

      if (!translatedQuestion) {
        throw new Error(`Missing onboarding question translation for ${question.id}`);
      }

      const translatedOptions = new Map(
        translatedQuestion.options.map((option) => [option.value, option])
      );

      return {
        id: question.id,
        prompt: translatedQuestion.prompt,
        options: question.options.map((option) => {
          const translatedOption = translatedOptions.get(option.value);

          if (!translatedOption) {
            throw new Error(`Missing onboarding option translation for ${option.value}`);
          }

          return {
            value: option.value,
            scores: option.scores,
            label: translatedOption.label,
          };
        }),
      };
    });
  }, [t]);

  const activeQuestion = stage === "questions" ? QUESTIONS[answers.length] : null;
  const isEmailValid = /\S+@\S+\.\S+/.test(email.trim());

  useEffect(() => {
    if (stage !== "analysis") {
      return;
    }

    const intervalId = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % ANALYSIS_MESSAGES.length);
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
  }, [ANALYSIS_MESSAGES.length, stage]);

  const category = useMemo(() => {
    const scores: Record<ServiceId, number> = {
      process_automation: 0,
      data_bi: 0,
      ai_solutions: 0,
    };

    answers.forEach((answer) => {
      for (const question of QUESTIONS) {
        const option = question.options.find((item) => item.value === answer);
        if (!option) {
          continue;
        }

        for (const key of ONBOARDING_CATEGORY_ORDER) {
          scores[key] += option.scores[key] ?? 0;
        }
        break;
      }
    });

    return ONBOARDING_CATEGORY_ORDER.reduce((best, current) =>
      scores[current] > scores[best] ? current : best
    );
  }, [QUESTIONS, answers]);

  const sendEmail = async () => {
    if (!isEmailValid || isSending) return;

    setIsSending(true);
    setSentStatus("idle");

    const formattedAnswers = QUESTIONS.map((question, index) => ({
      question: question.prompt,
      answer:
        question.options.find((option) => option.value === answers[index])?.label ??
        t.onboarding.unanswered,
    }));

    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          category: CATEGORY_LABELS[category],
          answers: formattedAnswers,
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

  const startFlow = () => {
    setAnswers([]);
    setEmail("");
    setStage("questions");
    setSentStatus("idle");
    setMessageIndex(0);
  };

  const selectOption = (value: string) => {
    const nextAnswers = [...answers, value];
    setAnswers(nextAnswers);

    if (nextAnswers.length === QUESTIONS.length) {
      setStage("analysis");
    }
  };

  const restart = () => {
    setAnswers([]);
    setEmail("");
    setStage("intro");
    setSentStatus("idle");
    setMessageIndex(0);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08111f] text-slate-100">
      <div className="absolute top-8 right-8 z-50">
        <LanguageToggle inline dark />
      </div>

      <div className="absolute inset-0 z-0">
        <Background variant="wallpaper" />
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none">
        <SystemMap />
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_50%_12%,rgba(255,255,255,0.12),transparent_28%),linear-gradient(180deg,rgba(8,17,31,0.16)_0%,rgba(8,17,31,0.02)_22%,rgba(8,17,31,0.28)_100%)]"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <main className="relative z-20 flex min-h-screen items-center justify-center px-6 py-20 sm:px-10">
        <div className="relative w-full max-w-3xl overflow-hidden rounded-none border border-neutral-200/50 bg-[#fdfcfb] shadow-2xl">
          <div className="relative px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
            <div className="mx-auto flex min-h-[620px] w-full max-w-2xl items-center justify-center">
              <AnimatePresence mode="wait">
                {stage === "intro" ? (
                  <motion.section
                    key="intro"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="flex w-full flex-col items-center justify-center space-y-8 text-center"
                  >
                    <div className="space-y-4">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-500">
                        {t.onboarding.subtitle}
                      </span>
                      <h1 className="font-sans text-4xl font-black leading-[1.05] tracking-tighter text-slate-950 sm:text-5xl lg:text-6xl">
                        {t.onboarding.title}
                      </h1>
                      <p className="mx-auto max-w-xl text-lg font-light leading-relaxed text-slate-600">
                        {t.onboarding.description}
                      </p>
                    </div>
                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={startFlow}
                        className="inline-flex h-14 items-center rounded-none bg-[#0f172a] px-10 font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#16253d] active:translate-y-0"
                      >
                        {t.onboarding.startCta}
                      </button>
                    </div>
                  </motion.section>
                ) : null}

                {stage === "questions" && activeQuestion ? (
                  <motion.section
                    key={activeQuestion.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex w-full flex-col items-center justify-center space-y-12 text-center"
                  >
                    <div className="space-y-5">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                        {t.onboarding.progressLabel} {answers.length + 1} {t.onboarding.progressConnector}{" "}
                        {QUESTIONS.length}
                      </span>
                      <h2 className="max-w-2xl font-sans text-3xl font-black tracking-tighter text-slate-950 sm:text-4xl md:text-5xl">
                        {activeQuestion.prompt}
                      </h2>
                    </div>

                    <div className="grid w-full max-w-xl gap-4">
                      {activeQuestion.options.map((option) => (
                        <AnswerOptionButton
                          key={option.value}
                          label={option.label}
                          onClick={() => selectOption(option.value)}
                        />
                      ))}
                    </div>
                  </motion.section>
                ) : null}

                {stage === "analysis" ? (
                  <motion.section
                    key="analysis"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex w-full flex-col items-center justify-center space-y-8 text-center"
                  >
                    <LoadingSpinner />
                    <h2 className="font-sans text-3xl font-black tracking-tighter text-slate-950 sm:text-4xl">
                      {t.onboarding.analysisTitle}
                    </h2>
                    <motion.p
                      key={messageIndex}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500"
                    >
                      {ANALYSIS_MESSAGES[messageIndex]}
                    </motion.p>
                  </motion.section>
                ) : null}

                {stage === "result" ? (
                  <motion.section
                    key="result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex w-full flex-col items-center justify-center space-y-10 text-center"
                  >
                    <div className="space-y-4">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-500">
                        {t.onboarding.matchLabel}
                      </span>
                      <h2 className="font-sans text-4xl font-black leading-[1.05] tracking-tighter text-slate-950 sm:text-5xl lg:text-6xl">
                        {t.onboarding.resultPrefix} <br />
                        <span className="text-emerald-700">{CATEGORY_LABELS[category]}</span>.
                      </h2>
                      <p className="mx-auto max-w-xl text-lg font-light leading-relaxed text-slate-600">
                        {t.onboarding.resultSuffix}
                      </p>
                    </div>

                    <div className="w-full max-w-xl space-y-4">
                      {sentStatus === "success" ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="rounded-none border border-emerald-200 bg-emerald-50 p-8 font-semibold text-slate-900 shadow-[0_12px_28px_rgba(6,78,59,0.08)]"
                        >
                          {t.onboarding.successMessage}
                        </motion.div>
                      ) : (
                        <>
                          <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder={t.onboarding.emailPlaceholder}
                            className="h-14 w-full rounded-none border border-neutral-200 bg-white px-6 text-center text-lg font-medium text-slate-900 outline-none shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition-all placeholder:text-slate-400 focus:border-slate-300 focus:bg-stone-50"
                          />

                          <button
                            type="button"
                            disabled={!isEmailValid || isSending}
                            onClick={sendEmail}
                            className={[
                              "h-14 w-full rounded-none font-semibold transition-all shadow-[0_16px_40px_rgba(15,23,42,0.18)] active:scale-95",
                              isEmailValid && !isSending
                                ? "bg-[#0f172a] text-white hover:-translate-y-0.5 hover:bg-[#16253d]"
                                : "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none",
                            ].join(" ")}
                          >
                            {isSending ? t.onboarding.sendingCta : t.onboarding.finalCta}
                          </button>
                        </>
                      )}

                      <div className="grid grid-cols-2 items-center gap-12 border-t border-neutral-200/80 pt-10">
                        <button
                          type="button"
                          onClick={restart}
                          className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 transition-colors hover:text-slate-900"
                        >
                          {t.onboarding.restart}
                        </button>
                        <Link
                          href="/"
                          className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 transition-colors hover:text-slate-900"
                        >
                          {t.onboarding.backHome}
                        </Link>
                      </div>
                    </div>
                  </motion.section>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <LanguageProvider>
      <OnboardingContent />
    </LanguageProvider>
  );
}
