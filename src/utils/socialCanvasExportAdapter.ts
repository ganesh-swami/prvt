import type { CanvasExportData, CanvasSection } from "./canvasExportUtils";

interface SocialCanvasData {
  [key: string]: string;
}

interface CanvasSectionConfig {
  id: string;
  title: string;
  description?: string;
  fields: Array<{
    id: string;
    label: string;
  }>;
}

/**
 * Transform Social Business Canvas data into structured export format
 */
export const transformSocialCanvasData = (
  canvasData: SocialCanvasData,
  projectName: string,
  completionPercentage: number,
  sectionConfigs: CanvasSectionConfig[]
): CanvasExportData => {
  const sections: CanvasSection[] = sectionConfigs.map((config) => ({
    id: config.id,
    title: config.title,
    description: config.description,
    fields: config.fields.map((field) => ({
      id: field.id,
      label: field.label,
      value: canvasData[field.id] || "",
    })),
  }));

  return {
    projectName,
    canvasName: "Social Business Model Canvas",
    exportDate: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    completionPercentage,
    sections,
    metadata: {
      lastUpdated: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      version: "1.0",
      canvasType: "Social Business Model Canvas",
    },
  };
};

/**
 * Section configurations for Social Business Canvas
 */
export const socialCanvasSectionConfigs: CanvasSectionConfig[] = [
  {
    id: "core",
    title: "Core Business Model",
    description: "The foundation of your social business",
    fields: [
      { id: "problem", label: "Social/Environmental Problem" },
      { id: "solution", label: "Product/Service Solution" },
      { id: "valueProposition", label: "Unique Value Proposition" },
      { id: "mission", label: "Social Mission Statement" },
    ],
  },
  {
    id: "impact",
    title: "Impact & Beneficiaries",
    description: "Who you help and how you measure impact",
    fields: [
      { id: "socialImpact", label: "Social Impact Indicators" },
      { id: "environmentalImpact", label: "Environmental Impact" },
      { id: "beneficiaries", label: "Primary Beneficiaries" },
      { id: "theoryOfChange", label: "Theory of Change" },
    ],
  },
  {
    id: "operations",
    title: "Operations & Delivery",
    description: "How you deliver your solution",
    fields: [
      { id: "keyActivities", label: "Key Activities" },
      { id: "keyResources", label: "Key Resources" },
      { id: "keyPartners", label: "Key Partners" },
      { id: "governance", label: "Governance Model" },
    ],
  },
  {
    id: "market",
    title: "Market & Competition",
    description: "Your market positioning",
    fields: [
      { id: "customerSegments", label: "Customer Segments" },
      { id: "channels", label: "Distribution Channels" },
      { id: "customerRelationships", label: "Customer Relationships" },
      { id: "competitors", label: "Key Competitors" },
    ],
  },
  {
    id: "pestel",
    title: "Macro-Environmental Analysis",
    description: "External factors affecting your business",
    fields: [
      { id: "pestelAnalysis", label: "PESTEL Analysis (Political, Economic, Social, Technological, Environmental, Legal)" },
    ],
  },
  {
    id: "financial",
    title: "Financial Model",
    description: "Your financial sustainability",
    fields: [
      { id: "costs", label: "Cost Structure" },
      { id: "revenue", label: "Revenue Streams" },
      { id: "surplus", label: "Surplus/Profit Allocation" },
    ],
  },
];
