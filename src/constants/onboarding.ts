import type { ServiceId } from "@/src/constants/services";

export type OnboardingQuestionTemplate = {
  id: string;
  options: Array<{
    value: string;
    scores: Partial<Record<ServiceId, number>>;
  }>;
};

export const ONBOARDING_CATEGORY_ORDER = [
  "process_automation",
  "data_bi",
  "ai_solutions",
] as const satisfies readonly ServiceId[];

export const ONBOARDING_QUESTION_TEMPLATES: OnboardingQuestionTemplate[] = [
  {
    id: "current-bottleneck",
    options: [
      {
        value: "many_whatsapps",
        scores: { ai_solutions: 3, process_automation: 1 },
      },
      {
        value: "messy_data",
        scores: { data_bi: 3 },
      },
      {
        value: "manual_tasks",
        scores: { process_automation: 3, data_bi: 1 },
      },
    ],
  },
  {
    id: "people-affected",
    options: [
      {
        value: "one_to_two_people",
        scores: { process_automation: 2, data_bi: 1 },
      },
      {
        value: "three_to_five_people",
        scores: { process_automation: 2, ai_solutions: 2 },
      },
      {
        value: "whole_team",
        scores: { process_automation: 3, data_bi: 3, ai_solutions: 3 },
      },
    ],
  },
  {
    id: "stress-point",
    options: [
      {
        value: "sales_follow_up",
        scores: { ai_solutions: 3, process_automation: 1 },
      },
      {
        value: "reporting_profitability",
        scores: { data_bi: 3 },
      },
      {
        value: "internal_operations",
        scores: { process_automation: 3, data_bi: 1, ai_solutions: 1 },
      },
    ],
  },
  {
    id: "integration-level",
    options: [
      {
        value: "everything_isolated",
        scores: { process_automation: 3, data_bi: 2 },
      },
      {
        value: "manual_patches",
        scores: { process_automation: 2, ai_solutions: 1 },
      },
      {
        value: "partial_integration",
        scores: { data_bi: 2, ai_solutions: 1 },
      },
    ],
  },
  {
    id: "priority-quarter",
    options: [
      {
        value: "better_capture_close",
        scores: { ai_solutions: 3, process_automation: 1 },
      },
      {
        value: "real_business_control",
        scores: { data_bi: 3 },
      },
      {
        value: "remove_manual_work",
        scores: { process_automation: 3 },
      },
    ],
  },
];

export const ONBOARDING_SCORE_MAP = ONBOARDING_QUESTION_TEMPLATES.reduce<
  Record<string, Partial<Record<ServiceId, number>>>
>((scoreMap, question) => {
  question.options.forEach((option) => {
    scoreMap[option.value] = option.scores;
  });

  return scoreMap;
}, {});

