export interface PlanSection {
  id: string;
  title: string;
  completed: boolean;
  fields: Array<{
    id: string;
    label: string;
    type: "text" | "textarea";
    placeholder: string;
    tooltip: {
      title: string;
      description: string;
      explanation?: string;
      justification?: string;
    };
  }>;
}

export const planSections: PlanSection[] = [
  {
    id: "executive",
    title: "Executive Summary",
    completed: false,
    fields: [
      {
        id: "executive-summary",
        label: "Executive Summary",
        type: "textarea",
        placeholder:
          "Compelling overview of your business, market opportunity, and financial projections...wwwwww",
        tooltip: {
          title: "Executive Summary",
          description: "A concise overview of your entire business plan",
          explanation:
            "Should capture the essence of your business in 1-2 pages",
          justification:
            "Often the only section investors read first - must be compelling",
        },
      },
    ],
  },
  {
    id: "vision-mission",
    title: "Vision, Mission & Objectives",
    completed: false,
    fields: [
      {
        id: "vision",
        label: "Vision Statement",
        type: "textarea",
        placeholder: "Your long-term aspirational goal and impact...",
        tooltip: {
          title: "Vision Statement",
          description: "Your long-term aspirational goal for the company",
          explanation: "Should inspire and provide direction for 5-10 years",
          justification: "Aligns stakeholders and guides strategic decisions",
        },
      },
      {
        id: "mission",
        label: "Mission Statement",
        type: "textarea",
        placeholder: "Your company purpose and how you create value...",
        tooltip: {
          title: "Mission Statement",
          description: "Defines your company's purpose and core activities",
          explanation:
            "Should answer: What do you do? Who do you serve? How do you create value?",
          justification:
            "Provides focus and communicates purpose to all stakeholders",
        },
      },
      {
        id: "objectives",
        label: "Strategic Objectives",
        type: "textarea",
        placeholder: "SMART objectives for the next 1-3 years...",
        tooltip: {
          title: "Strategic Objectives",
          description: "Specific, measurable goals that support your mission",
          explanation:
            "Should be SMART: Specific, Measurable, Achievable, Relevant, Time-bound",
          justification:
            "Translates vision into actionable goals for execution",
        },
      },
    ],
  },
];
