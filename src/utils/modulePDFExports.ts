/**
 * Module PDF Export Functions
 * Each function accepts an existing jsPDF instance and data, then returns the updated instance
 * This allows chaining multiple modules together for comprehensive exports
 *
 * Usage:
 * - Individual export: createPDFInstance() → addTitlePage → addPlanBuilderContent → downloadPDF
 * - Comprehensive export: createPDFInstance() → addModule1 → addModule2 → addModule3 → downloadPDF
 */

import jsPDF from "jspdf";
import { PlanSection } from "@/components/modules/enhanced/PlanBuilderSectionsComplete";

/**
 * Add Business Plan content to PDF
 * @param doc - Existing jsPDF instance
 * @param sections - Plan sections configuration
 * @param planData - Plan data object
 * @param startOnNewPage - Whether to start on a new page (default: false for chaining)
 * @returns Updated jsPDF instance
 */
export const addPlanBuilderContent = (
  doc: jsPDF,
  sections: PlanSection[],
  planData: Record<string, Record<string, string | boolean>>,
  startOnNewPage: boolean = false
): jsPDF => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;

  // // If starting on new page, add the page first
  // if (startOnNewPage) {
  //   doc.addPage();
  // }

  let yPos = startOnNewPage ? 20 : 80; // Start at 40 to avoid overlap with separator

  // Helper function to add section header
  const addSectionHeader = (
    title: string,
    color: number[] = [59, 130, 246]
  ) => {
    // Check if need new page
    if (yPos > pageHeight - 90) {
      doc.addPage();
      yPos = 20;
    }

    // Add extra space before section (except first)
    if (yPos > 40) {
      yPos += 8;
    }
    // Section header with colored background
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(margin, yPos, contentWidth, 14, 3, 3, "F");

    // Add decorative circle
    doc.setFillColor(255, 255, 255);
    doc.circle(margin + 5, yPos + 7, 2.5, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin + 10, yPos + 9.5);

    yPos += 20;
  };

  // Helper function to add field (subsection)
  const addField = (label: string, content: string) => {
    // Check if need new page
    if (yPos > pageHeight - 55) {
      doc.addPage();
      yPos = 20;
    }

    // Field label with bullet
    doc.setFillColor(100, 116, 139);
    doc.circle(margin + 2, yPos + 2, 1.2, "F");

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(label, margin + 5, yPos + 3);

    yPos += 7;

    // Content box
    doc.setTextColor(55, 65, 81);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    const text = content || "";
    if (!text.trim()) {
      return; // Skip empty fields
    }

    const lines = doc.splitTextToSize(text, contentWidth - 10);

    // Calculate box height
    const lineHeight = 5;
    const minBoxHeight = 12;
    const calculatedHeight = lines.length * lineHeight + 8;
    const boxHeight = Math.min(Math.max(calculatedHeight, minBoxHeight), 60);

    // Draw content box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin + 2, yPos, contentWidth - 4, boxHeight, 2, 2, "F");

    // Add left accent border
    doc.setFillColor(59, 130, 246);
    doc.rect(margin + 2, yPos, 2, boxHeight, "F");

    // Border
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin + 2, yPos, contentWidth - 4, boxHeight, 2, 2, "S");

    // Add text
    const displayLines = lines.slice(0, 12);
    doc.text(displayLines, margin + 7, yPos + 6);

    yPos += boxHeight + 6;
  };

  // Process all sections
  sections.forEach((section) => {
    const sectionData = planData[section.id] || {};
    const sectionHasContent = section.fields.some((field) => {
      const value = sectionData[field.id];
      return typeof value === "string" && value.trim().length > 0;
    });

    // Skip empty sections
    if (!sectionHasContent) {
      return;
    }

    // Add section header
    addSectionHeader(section.title);

    // Add all fields in the section
    section.fields.forEach((field) => {
      const value = sectionData[field.id];
      if (typeof value === "string" && value.trim()) {
        addField(field.label, value);
      }
    });
  });

  return doc;
};

/**
 * Add Social Canvas content to PDF
 * @param doc - Existing jsPDF instance
 * @param canvasData - Canvas data object
 * @param startOnNewPage - Whether to start on a new page
 * @returns Updated jsPDF instance
 */
export const addSocialCanvasContent = (
  doc: jsPDF,
  canvasData: Record<string, string>,
  startOnNewPage: boolean = false
): jsPDF => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;

  // If starting on new page, add the page first
  if (startOnNewPage) {
    doc.addPage();
  }

  let yPos = startOnNewPage ? 20 : 40;

  const fieldGroups = [
    {
      title: "Core Purpose & Value",
      color: [244, 63, 94],
      fields: [
        { key: "socialMission", label: "Social Mission" },
        { key: "socialValueProposition", label: "Social Value Proposition" },
        { key: "relationships", label: "Relationships" },
      ],
    },
    {
      title: "Operations & Resources",
      color: [59, 130, 246],
      fields: [
        { key: "keyDeliveryPartners", label: "Key Delivery Partners" },
        { key: "keyActivities", label: "Key Activities" },
        { key: "keyResources", label: "Key Resources" },
      ],
    },
    {
      title: "Financial Model",
      color: [34, 197, 94],
      fields: [
        { key: "costStructure", label: "Cost Structure" },
        { key: "revenueStreams", label: "Revenue Streams" },
      ],
    },
    {
      title: "Stakeholders & Impact",
      color: [168, 85, 247],
      fields: [
        { key: "targetSegment", label: "Target Segment" },
        { key: "socialImpact", label: "Social Impact" },
        { key: "impactMeasurement", label: "Impact Measurement" },
        { key: "channels", label: "Channels" },
      ],
    },
  ];

  fieldGroups.forEach((group) => {
    // Group header
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFillColor(group.color[0], group.color[1], group.color[2]);
    doc.roundedRect(margin, yPos, contentWidth, 12, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(group.title, margin + contentWidth / 2, yPos + 8, {
      align: "center",
    });
    yPos += 16;

    // Fields
    group.fields.forEach((field) => {
      const value = canvasData[field.key];
      if (value && value.trim()) {
        if (yPos > pageHeight - 35) {
          doc.addPage();
          yPos = 20;
        }

        // Field label
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(51, 65, 85);
        doc.text(field.label, margin, yPos);
        yPos += 5;

        // Field value box
        const lines = doc.splitTextToSize(value, contentWidth - 6);
        const boxHeight = Math.min(lines.length * 4 + 6, 40);

        doc.setFillColor(249, 250, 251);
        doc.roundedRect(margin, yPos, contentWidth, boxHeight, 2, 2, "F");
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, yPos, contentWidth, boxHeight, 2, 2, "S");

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(75, 85, 99);
        doc.text(lines.slice(0, 8), margin + 3, yPos + 4);

        yPos += boxHeight + 6;
      }
    });

    yPos += 6;
  });

  return doc;
};

/**
 * Add Market Sizing content to PDF
 * @param doc - Existing jsPDF instance
 * @param results - Market sizing results
 * @param marketData - Market data with penetration rate
 * @param valueUnit - Unit for displaying values (millions/billions)
 * @param startOnNewPage - Whether to start on a new page
 * @returns Updated jsPDF instance
 */
export const addMarketSizingContent = (
  doc: jsPDF,
  results: {
    tam: number;
    sam: number;
    som: number;
    revenueOpportunity: number;
  },
  marketData: { penetrationRate: number },
  valueUnit: "millions" | "billions" = "millions",
  startOnNewPage: boolean = false
): jsPDF => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;

  let yPos = startOnNewPage ? 20 : 80;

  const formatValue = (value: number) => {
    // const unit = valueUnit === "billions" ? "B" : "M";
    // return "$" + value.toFixed(2) + unit;

    const divisor = valueUnit === "billions" ? 1000000000 : 1000000;
    const unit = valueUnit === "billions" ? "B" : "M";
    return `$${(value / divisor).toFixed(2)}${unit}`;
  };

  const getMarketAttractiveness = () => {
    if (results.tam >= 1000)
      return { level: "High", description: "strong growth potential" };
    if (results.tam >= 100)
      return { level: "Medium", description: "moderate growth potential" };
    return { level: "Low", description: "limited growth potential" };
  };

  const getCompetitivePosition = () => {
    if (marketData.penetrationRate <= 3)
      return {
        level: "Conservative",
        description: "conservative market entry approach",
      };
    if (marketData.penetrationRate <= 10)
      return {
        level: "Moderate",
        description: "moderate market entry strategy",
      };
    return {
      level: "Aggressive",
      description: "aggressive market capture strategy",
    };
  };

  // Three metric cards in one row
  const cardWidth = (contentWidth - 8) / 3;
  const cardHeight = 40;

  const metrics = [
    {
      label: "TAM",
      value: formatValue(results.tam),
      description: "Total Addressable Market",
      color: [59, 130, 246],
      bgColor: [239, 246, 255],
    },
    {
      label: "SAM",
      value: formatValue(results.sam),
      description: "Serviceable Addressable Market",
      color: [168, 85, 247],
      bgColor: [250, 245, 255],
    },
    {
      label: "SOM",
      value: formatValue(results.som),
      description: "Serviceable Obtainable Market",
      color: [34, 197, 94],
      bgColor: [240, 253, 244],
    },
  ];

  metrics.forEach((metric, index) => {
    const xPos = margin + (cardWidth + 4) * index;

    doc.setFillColor(metric.bgColor[0], metric.bgColor[1], metric.bgColor[2]);
    doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 3, 3, "F");
    doc.setDrawColor(metric.color[0], metric.color[1], metric.color[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 3, 3, "S");

    doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
    doc.circle(xPos + cardWidth / 2, yPos + 8, 3.5, "F");

    doc.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(metric.label, xPos + cardWidth / 2, yPos + 17, {
      align: "center",
    });

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(metric.value, xPos + cardWidth / 2, yPos + 26, {
      align: "center",
    });

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    const descLines = doc.splitTextToSize(metric.description, cardWidth - 4);
    doc.text(descLines, xPos + cardWidth / 2, yPos + 32, { align: "center" });
  });

  yPos += cardHeight + 10;

  const attractiveness = getMarketAttractiveness();
  const competitive = getCompetitivePosition();

  // Market Attractiveness Section
  if (yPos > pageHeight - 50) {
    doc.addPage();
    yPos = 20;
  }

  yPos += 5;
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, yPos, contentWidth, 25, 2, 2, "F");
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, yPos, contentWidth, 25, 2, 2, "S");

  doc.setTextColor(31, 41, 55);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Market Attractiveness", margin + 3, yPos + 6);

  const attractColor =
    attractiveness.level === "High"
      ? [34, 197, 94]
      : attractiveness.level === "Medium"
      ? [234, 179, 8]
      : [239, 68, 68];
  doc.setFillColor(attractColor[0], attractColor[1], attractColor[2]);
  doc.roundedRect(pageWidth - margin - 25, yPos + 2, 23, 6, 1, 1, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(attractiveness.level, pageWidth - margin - 13.5, yPos + 5.5, {
    align: "center",
  });

  doc.setTextColor(75, 85, 99);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const attractText = doc.splitTextToSize(
    `Based on TAM size of ${formatValue(results.tam)}, this market shows ${
      attractiveness.description
    }.`,
    contentWidth - 6
  );
  doc.text(attractText, margin + 3, yPos + 13);

  yPos += 30;

  // Competitive Strategy Section
  if (yPos > pageHeight - 50) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, yPos, contentWidth, 25, 2, 2, "F");
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, yPos, contentWidth, 25, 2, 2, "S");

  doc.setTextColor(31, 41, 55);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Competitive Strategy", margin + 3, yPos + 6);

  const compColor =
    competitive.level === "Conservative"
      ? [34, 197, 94]
      : competitive.level === "Moderate"
      ? [234, 179, 8]
      : [239, 68, 68];
  doc.setFillColor(compColor[0], compColor[1], compColor[2]);
  doc.roundedRect(pageWidth - margin - 32, yPos + 2, 30, 6, 1, 1, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(competitive.level, pageWidth - margin - 17, yPos + 5.5, {
    align: "center",
  });

  doc.setTextColor(75, 85, 99);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const compText = doc.splitTextToSize(
    `With ${marketData.penetrationRate}% market penetration target, this represents a ${competitive.description}.`,
    contentWidth - 6
  );
  doc.text(compText, margin + 3, yPos + 13);

  yPos += 30;

  // Revenue Opportunity Section
  if (yPos > pageHeight - 50) {
    doc.addPage();
    yPos = 20;
  }

  yPos += 5;
  const revCardHeight = 45;

  doc.setFillColor(255, 247, 237);
  doc.roundedRect(margin, yPos, contentWidth, revCardHeight, 3, 3, "F");
  doc.setDrawColor(249, 115, 22);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, yPos, contentWidth, revCardHeight, 3, 3, "S");

  doc.setFillColor(249, 115, 22);
  doc.circle(margin + 8, yPos + 12, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("$", margin + 8, yPos + 14, { align: "center" });

  doc.setTextColor(249, 115, 22);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Revenue Opportunity", margin + 18, yPos + 13);

  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text(
    `$${results.revenueOpportunity.toLocaleString()}`,
    pageWidth / 2,
    yPos + 28,
    { align: "center" }
  );

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text("Potential Annual Revenue", pageWidth / 2, yPos + 37, {
    align: "center",
  });

  return doc;
};

/**
 * Add Pricing Lab content to PDF
 * @param doc - Existing jsPDF instance
 * @param results - Pricing results
 * @param pricingData - Pricing input data
 * @param strategy - Selected pricing strategy
 * @param startOnNewPage - Whether to start on a new page
 * @returns Updated jsPDF instance
 */
export const addPricingLabContent = (
  doc: jsPDF,
  results: {
    costPlusPrice: number;
    competitivePrice: number;
    valueBasedPrice: number;
    recommendedPrice: number;
    demandForecast: number;
  },
  pricingData: {
    costBasis: string;
    priceElasticity: number[];
  },
  strategy: string,
  startOnNewPage: boolean = false
): jsPDF => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = startOnNewPage ? 20 : 80;

  // Four pricing cards in a 2x2 grid
  const cardWidth = (contentWidth - 4) / 2;
  const cardHeight = 35;

  const pricingCards = [
    {
      number: "1",
      title: "Cost-Plus Price",
      price: results.costPlusPrice,
      description: "Based on cost + margin",
      color: [59, 130, 246],
      bgColor: [239, 246, 255],
    },
    {
      number: "2",
      title: "Competitive Price",
      price: results.competitivePrice,
      description: "5% below competitor",
      color: [168, 85, 247],
      bgColor: [250, 245, 255],
    },
    {
      number: "3",
      title: "Value-Based Price",
      price: results.valueBasedPrice,
      description: "30% of value delivered",
      color: [34, 197, 94],
      bgColor: [240, 253, 244],
    },
    {
      number: "★",
      title: "Recommended Price",
      price: results.recommendedPrice,
      description: `${Math.round(results.demandForecast)} units`,
      color: [249, 115, 22],
      bgColor: [255, 247, 237],
    },
  ];

  pricingCards.forEach((card, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    const xPos = margin + (cardWidth + 4) * col;
    const cardYPos = yPos + (cardHeight + 4) * row;

    doc.setFillColor(card.bgColor[0], card.bgColor[1], card.bgColor[2]);
    doc.roundedRect(xPos, cardYPos, cardWidth, cardHeight, 3, 3, "F");
    doc.setDrawColor(card.color[0], card.color[1], card.color[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(xPos, cardYPos, cardWidth, cardHeight, 3, 3, "S");

    doc.setFillColor(card.color[0], card.color[1], card.color[2]);
    doc.circle(xPos + 8, cardYPos + 8, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(card.number, xPos + 8, cardYPos + 10, { align: "center" });

    doc.setTextColor(card.color[0], card.color[1], card.color[2]);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(card.title, xPos + 14, cardYPos + 9);

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`$${card.price.toFixed(2)}`, xPos + cardWidth / 2, cardYPos + 22, {
      align: "center",
    });

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(card.description, xPos + cardWidth / 2, cardYPos + 29, {
      align: "center",
    });
  });

  yPos += cardHeight * 2 + 12;

  if (yPos > pageHeight - 80) {
    doc.addPage();
    yPos = 20;
  }

  const cost = parseFloat(pricingData.costBasis) || 0;
  const profitMargin = ((results.recommendedPrice - cost) / cost) * 100;
  const revenueProjection = results.recommendedPrice * results.demandForecast;
  const prices = [
    results.costPlusPrice,
    results.competitivePrice,
    results.valueBasedPrice,
  ];
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  let positioning = "Competitive";
  if (results.recommendedPrice > avgPrice * 1.2) positioning = "Premium";
  if (results.recommendedPrice < avgPrice * 0.8) positioning = "Budget";

  const metricCardWidth = (contentWidth - 8) / 3;
  const metricCardHeight = 30;

  const metrics = [
    {
      icon: "$",
      label: "Recommended Price",
      value: `$${results.recommendedPrice.toFixed(2)}`,
      badge: `${positioning} Positioning`,
      color: [34, 197, 94],
    },
    {
      icon: "%",
      label: "Profit Margin",
      value: `${profitMargin.toFixed(1)}%`,
      badge: profitMargin > 30 ? "Healthy" : "Monitor",
      color: [59, 130, 246],
    },
    {
      icon: "#",
      label: "Demand Forecast",
      value: `${Math.round(results.demandForecast)}`,
      badge: "Units/Month",
      color: [168, 85, 247],
    },
  ];

  metrics.forEach((metric, index) => {
    const xPos = margin + (metricCardWidth + 4) * index;

    doc.setFillColor(249, 250, 251);
    doc.roundedRect(xPos, yPos, metricCardWidth, metricCardHeight, 2, 2, "F");
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.roundedRect(xPos, yPos, metricCardWidth, metricCardHeight, 2, 2, "S");

    doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
    doc.circle(xPos + metricCardWidth / 2, yPos + 7, 2.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(metric.icon, xPos + metricCardWidth / 2, yPos + 8.5, {
      align: "center",
    });

    doc.setTextColor(107, 114, 128);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(metric.label, xPos + metricCardWidth / 2, yPos + 14, {
      align: "center",
    });

    doc.setTextColor(31, 41, 55);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(metric.value, xPos + metricCardWidth / 2, yPos + 21, {
      align: "center",
    });

    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(metric.badge, xPos + metricCardWidth / 2, yPos + 26, {
      align: "center",
    });
  });

  yPos += metricCardHeight + 8;

  if (yPos > pageHeight - 35) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, yPos, contentWidth, 28, 2, 2, "F");
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, yPos, contentWidth, 28, 2, 2, "S");

  doc.setTextColor(31, 41, 55);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Strategy Assessment", margin + 3, yPos + 7);

  const elasticity = pricingData.priceElasticity[0];
  let riskLevel = "Low";
  if (elasticity > 70) riskLevel = "High";
  else if (elasticity > 40) riskLevel = "Medium";

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);

  const strategyText = [
    `Selected Strategy: ${strategy.replace("-", " ").toUpperCase()}`,
    `Price Sensitivity Risk: ${riskLevel}`,
    `Revenue Projection: $${revenueProjection.toLocaleString()}`,
  ];

  strategyText.forEach((text, index) => {
    doc.text(text, margin + 3, yPos + 14 + index * 4);
  });

  yPos += 33;

  if (yPos > pageHeight - 45) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, yPos, contentWidth, 38, 2, 2, "F");
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, yPos, contentWidth, 38, 2, 2, "S");

  doc.setTextColor(22, 163, 74);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Strategic Recommendations", margin + 3, yPos + 7);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(21, 128, 61);

  const recommendations = [];
  if (profitMargin > 50)
    recommendations.push(
      "• Consider value-based positioning with premium features"
    );
  if (profitMargin < 20)
    recommendations.push("• Review cost structure to improve profitability");
  if (elasticity > 60)
    recommendations.push(
      "• High price sensitivity - consider competitive pricing"
    );
  if (results.recommendedPrice > results.competitivePrice * 1.2) {
    recommendations.push(
      "• Ensure clear value differentiation for premium pricing"
    );
  }
  recommendations.push("• Monitor competitor pricing changes regularly");
  recommendations.push(
    "• Test pricing with small customer segments before full rollout"
  );

  recommendations.forEach((rec, index) => {
    doc.text(rec, margin + 3, yPos + 13 + index * 4);
  });

  return doc;
};

/**
 * Add Unit Economics content to PDF
 * @param doc - Existing jsPDF instance
 * @param results - Unit economics results
 * @param startOnNewPage - Whether to start on a new page
 * @returns Updated jsPDF instance
 */
export const addUnitEconomicsContent = (
  doc: jsPDF,
  results: any,
  startOnNewPage: boolean = false
): jsPDF => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = startOnNewPage ? 20 : 85;

  // Helper functions for health indicators
  const getLTVCACHealth = () => {
    const ratio = results.ltvCacRatio;
    if (ratio >= 3) return { level: "Excellent", color: [34, 197, 94] };
    if (ratio >= 1) return { level: "Good", color: [234, 179, 8] };
    return { level: "Poor", color: [239, 68, 68] };
  };

  const getRetentionScore = () => {
    const retention = results.retentionRate;
    if (retention >= 80) return { level: "Excellent", color: [34, 197, 94] };
    if (retention >= 60) return { level: "Good", color: [234, 179, 8] };
    return { level: "Needs Improvement", color: [239, 68, 68] };
  };

  const getPaybackEfficiency = () => {
    const payback = results.paybackPeriod;
    if (payback <= 12) return { level: "Excellent", color: [34, 197, 94] };
    if (payback <= 24) return { level: "Good", color: [234, 179, 8] };
    return { level: "High", color: [239, 68, 68] };
  };

  // Three key metrics in one row
  const metricWidth = (contentWidth - 8) / 3;
  const metricHeight = 35;

  const health = getLTVCACHealth();
  const retention = getRetentionScore();
  const payback = getPaybackEfficiency();

  const keyMetrics = [
    {
      icon: "✓",
      label: "LTV:CAC Health",
      value: `${results.ltvCacRatio.toFixed(1)}:1`,
      status: health.level,
      color: health.color,
      bgColor: [240, 253, 244],
    },
    {
      icon: "↻",
      label: "Retention Score",
      value: `${results.retentionRate.toFixed(1)}%`,
      status: retention.level,
      color: retention.color,
      bgColor: [255, 247, 237],
    },
    {
      icon: "⏱",
      label: "Payback Efficiency",
      value: `${results.paybackPeriod.toFixed(1)}m`,
      status: payback.level,
      color: payback.color,
      bgColor: [239, 246, 255],
    },
  ];

  keyMetrics.forEach((metric, index) => {
    const xPos = margin + (metricWidth + 4) * index;

    // Card background
    doc.setFillColor(metric.bgColor[0], metric.bgColor[1], metric.bgColor[2]);
    doc.roundedRect(xPos, yPos, metricWidth, metricHeight, 3, 3, "F");
    doc.setDrawColor(metric.color[0], metric.color[1], metric.color[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(xPos, yPos, metricWidth, metricHeight, 3, 3, "S");

    // Icon
    doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
    doc.circle(xPos + metricWidth / 2, yPos + 7, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(metric.icon, xPos + metricWidth / 2, yPos + 9, {
      align: "center",
    });

    // Label
    doc.setTextColor(75, 85, 99);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(metric.label, xPos + metricWidth / 2, yPos + 16, {
      align: "center",
    });

    // Value
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(metric.value, xPos + metricWidth / 2, yPos + 24, {
      align: "center",
    });

    // Status
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
    doc.text(metric.status, xPos + metricWidth / 2, yPos + 30, {
      align: "center",
    });
  });

  yPos += metricHeight + 10;

  // Revenue Metrics Section
  if (yPos > pageHeight - 50) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, yPos, contentWidth, 35, 2, 2, "F");
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, yPos, contentWidth, 35, 2, 2, "S");

  doc.setTextColor(31, 41, 55);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Revenue Metrics", margin + 3, yPos + 7);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);

  const revenueMetrics = [
    ["Annual Recurring Revenue", `$${results.arr.toLocaleString()}`],
    ["Total Revenue", `$${results.totalRevenue.toLocaleString()}`],
    ["Gross Profit", `$${results.grossProfit.toLocaleString()}`],
  ];

  revenueMetrics.forEach(([label, value], index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const xOffset = col * (contentWidth / 2);
    const yOffset = row * 10;

    doc.setTextColor(75, 85, 99);
    doc.text(label, margin + 3 + xOffset, yPos + 16 + yOffset);
    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "bold");
    doc.text(
      value,
      margin + contentWidth / 2 - 3 + xOffset,
      yPos + 16 + yOffset,
      { align: "right" }
    );
    doc.setFont("helvetica", "normal");
  });

  yPos += 40;

  // Profitability Analysis Section
  if (yPos > pageHeight - 50) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, yPos, contentWidth, 35, 2, 2, "F");
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, yPos, contentWidth, 35, 2, 2, "S");

  doc.setTextColor(31, 41, 55);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Profitability Analysis", margin + 3, yPos + 7);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

  const profitMetrics = [
    ["Unit Profitability", `$${results.unitProfitability.toFixed(2)}`],
    [
      "Gross Margin per Lifespan",
      `$${results.grossMarginPerLifespan.toFixed(2)}`,
    ],
    ["Customer LTV", `$${results.ltv.toFixed(2)}`],
  ];

  profitMetrics.forEach(([label, value], index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const xOffset = col * (contentWidth / 2);
    const yOffset = row * 10;

    doc.setTextColor(75, 85, 99);
    doc.text(label, margin + 3 + xOffset, yPos + 16 + yOffset);
    doc.setTextColor(34, 197, 94);
    doc.setFont("helvetica", "bold");
    doc.text(
      value,
      margin + contentWidth / 2 - 3 + xOffset,
      yPos + 16 + yOffset,
      { align: "right" }
    );
    doc.setFont("helvetica", "normal");
  });

  yPos += 40;

  // Financial Visualizations - New Page
  doc.addPage();
  yPos = 20;

  doc.setTextColor(22, 163, 74);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Financial Visualizations Summary", margin + 3, yPos + 7);

  yPos += 10;

  // Revenue Breakdown Bar Chart
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246);
  doc.text("Revenue Breakdown", margin, yPos);

  yPos += 8;

  const revenueChartData = [
    {
      label: "Total Revenue",
      value: results.totalRevenue,
      color: [59, 130, 246],
    },
    {
      label: "Gross Profit",
      value: results.grossProfit,
      color: [139, 92, 246],
    },
    { label: "ARR", value: results.arr, color: [34, 197, 94] },
    { label: "LTV", value: results.ltv, color: [251, 146, 60] },
  ];

  const chartWidth = contentWidth - 20;
  const chartHeight = 60;
  const chartX = margin + 10;
  const chartY = yPos;
  const barWidth = 30;
  const barSpacing = (chartWidth - barWidth * 4) / 3;

  // Find max value for scaling
  const maxValue = Math.max(...revenueChartData.map((d) => d.value));

  // Draw bars
  revenueChartData.forEach((item, index) => {
    const xPos = chartX + index * (barWidth + barSpacing);
    const barHeight = (item.value / maxValue) * chartHeight;
    const yStart = chartY + chartHeight - barHeight;

    // Bar
    doc.setFillColor(item.color[0], item.color[1], item.color[2]);
    doc.rect(xPos, yStart, barWidth, barHeight, "F");

    // Value on top
    doc.setFontSize(7);
    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "bold");
    const formattedValue =
      item.value > 1000
        ? `$${(item.value / 1000).toFixed(0)}K`
        : `$${item.value.toFixed(0)}`;
    doc.text(formattedValue, xPos + barWidth / 2, yStart - 2, {
      align: "center",
    });

    // Label below
    doc.setFontSize(7);
    doc.setTextColor(75, 85, 99);
    doc.setFont("helvetica", "normal");
    const words = item.label.split(" ");
    words.forEach((word, wIndex) => {
      doc.text(
        word,
        xPos + barWidth / 2,
        chartY + chartHeight + 5 + wIndex * 3,
        {
          align: "center",
        }
      );
    });
  });

  yPos += chartHeight + 20;

  // Revenue vs Costs Pie Chart
  if (yPos > pageHeight - 80) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246);
  doc.text("Revenue vs Costs", margin, yPos);

  yPos += 8;

  const costs = results.totalRevenue - results.grossProfit;
  const totalAmount = results.totalRevenue + costs;
  const revenuePercentage = (results.totalRevenue / totalAmount) * 100;
  const costsPercentage = (costs / totalAmount) * 100;

  // Pie chart center and radius
  const pieX = margin + contentWidth / 2;
  const pieY = yPos + 30;
  const pieRadius = 25;

  // Draw revenue slice (green)
  doc.setFillColor(16, 185, 129);
  doc.circle(pieX, pieY, pieRadius, "F");

  // Draw costs slice (red)
  doc.setFillColor(239, 68, 68);
  const startAngle = 0;
  const endAngle = (costsPercentage / 100) * 360;

  // Create wedge for costs
  const steps = 50;
  const angleStep = (endAngle - startAngle) / steps;
  for (let i = 0; i < steps; i++) {
    const angle1 = ((startAngle + i * angleStep) * Math.PI) / 180;
    const angle2 = ((startAngle + (i + 1) * angleStep) * Math.PI) / 180;

    doc.triangle(
      pieX,
      pieY,
      pieX + pieRadius * Math.cos(angle1),
      pieY + pieRadius * Math.sin(angle1),
      pieX + pieRadius * Math.cos(angle2),
      pieY + pieRadius * Math.sin(angle2),
      "F"
    );
  }

  // Legend
  yPos += 65;

  // Revenue legend
  doc.setFillColor(16, 185, 129);
  doc.rect(margin + 10, yPos, 5, 5, "F");
  doc.setFontSize(8);
  doc.setTextColor(31, 41, 55);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Revenue: $${results.totalRevenue.toLocaleString()} (${revenuePercentage.toFixed(
      1
    )}%)`,
    margin + 18,
    yPos + 4
  );

  yPos += 8;

  // Costs legend
  doc.setFillColor(239, 68, 68);
  doc.rect(margin + 10, yPos, 5, 5, "F");
  doc.text(
    `Costs: $${costs.toLocaleString()} (${costsPercentage.toFixed(1)}%)`,
    margin + 18,
    yPos + 4
  );

  return doc;
};

/**
 * Add Financial Modeler content to PDF
 * @param doc - Existing jsPDF instance
 * @param results - Financial results
 * @param startOnNewPage - Whether to start on a new page
 * @returns Updated jsPDF instance
 */
export const addFinancialModelerContent = (
  doc: jsPDF,
  results: any,
  startOnNewPage: boolean = false
): jsPDF => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = startOnNewPage ? 20 : 85;

  // Helper function for health status
  const getHealthStatus = (
    value: number,
    thresholds: { good: number; excellent: number }
  ) => {
    if (value >= thresholds.excellent)
      return { status: "Excellent", color: [34, 197, 94] };
    if (value >= thresholds.good)
      return { status: "Good", color: [59, 130, 246] };
    return { status: "Needs Improvement", color: [239, 68, 68] };
  };

  const cashFlowPct =
    results.totalRevenue > 0
      ? (results.operatingCashFlow / results.totalRevenue) * 100
      : 0;
  const grossMarginHealth = getHealthStatus(results.grossMargin, {
    good: 40,
    excellent: 60,
  });
  const netMarginHealth = getHealthStatus(results.netMargin, {
    good: 10,
    excellent: 20,
  });
  const cashFlowHealth = getHealthStatus(cashFlowPct, {
    good: 15,
    excellent: 25,
  });

  // Three Health Metrics in one row
  const metricWidth = (contentWidth - 8) / 3;
  const metricHeight = 35;

  const healthMetrics = [
    {
      title: "Gross Margin Health",
      value: `${results.grossMargin.toFixed(1)}%`,
      status: grossMarginHealth.status,
      color: grossMarginHealth.color,
    },
    {
      title: "Net Margin Health",
      value: `${results.netMargin.toFixed(1)}%`,
      status: netMarginHealth.status,
      color: netMarginHealth.color,
    },
    {
      title: "Cash Flow Health",
      value: `${cashFlowPct.toFixed(1)}%`,
      status: cashFlowHealth.status,
      color: cashFlowHealth.color,
    },
  ];

  healthMetrics.forEach((metric, index) => {
    const xPos = margin + (metricWidth + 4) * index;

    // Card background
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(xPos, yPos, metricWidth, metricHeight, 3, 3, "F");
    doc.setDrawColor(metric.color[0], metric.color[1], metric.color[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(xPos, yPos, metricWidth, metricHeight, 3, 3, "S");

    // Title
    doc.setTextColor(75, 85, 99);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(metric.title, xPos + metricWidth / 2, yPos + 7, {
      align: "center",
    });

    // Status badge
    doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
    const badgeWidth = 25;
    doc.roundedRect(
      xPos + (metricWidth - badgeWidth) / 2,
      yPos + 11,
      badgeWidth,
      5,
      1,
      1,
      "F"
    );
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.text(metric.status, xPos + metricWidth / 2, yPos + 14.5, {
      align: "center",
    });

    // Value
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(metric.value, xPos + metricWidth / 2, yPos + 26, {
      align: "center",
    });
  });

  yPos += metricHeight + 10;

  // Profitability Analysis Section
  if (yPos > pageHeight - 60) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, yPos, contentWidth / 2 - 2, 45, 2, 2, "F");
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, yPos, contentWidth / 2 - 2, 45, 2, 2, "S");

  doc.setTextColor(31, 41, 55);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Profitability Analysis", margin + 3, yPos + 7);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);

  const profitMetrics = [
    ["Gross Profit:", `$${results.grossProfit.toLocaleString()}`],
    ["EBITDA:", `$${results.ebitda.toLocaleString()}`],
    ["Net Profit:", `$${results.netProfit.toLocaleString()}`],
    ["Profitability Ratio:", `${results.profitabilityRatio.toFixed(2)}x`],
  ];

  profitMetrics.forEach(([label, value], index) => {
    const yOffset = yPos + 15 + index * 7;
    doc.setTextColor(75, 85, 99);
    doc.text(label, margin + 3, yOffset);
    doc.setTextColor(34, 197, 94);
    doc.setFont("helvetica", "bold");
    doc.text(value, margin + contentWidth / 2 - 5, yOffset, { align: "right" });
    doc.setFont("helvetica", "normal");
  });

  // Cash Flow Analysis Section
  const cashFlowX = margin + contentWidth / 2 + 2;
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(cashFlowX, yPos, contentWidth / 2 - 2, 45, 2, 2, "F");
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.roundedRect(cashFlowX, yPos, contentWidth / 2 - 2, 45, 2, 2, "S");

  doc.setTextColor(31, 41, 55);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Cash Flow Analysis", cashFlowX + 3, yPos + 7);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

  const cashFlowMetrics = [
    [
      "Operating Cash Flow:",
      `$${results.operatingCashFlow.toLocaleString()}`,
    ],
    ["Free Cash Flow:", `$${results.freeCashFlow.toLocaleString()}`],
    [
      "Break-Even Month:",
      results.breakEvenMonth > 0
        ? `Month ${results.breakEvenMonth}`
        : "Not reached",
    ],
    ["Revenue Growth:", `${results.revenueGrowthRate.toFixed(1)}%`],
  ];

  cashFlowMetrics.forEach(([label, value], index) => {
    const yOffset = yPos + 15 + index * 7;
    doc.setTextColor(75, 85, 99);
    doc.text(label, cashFlowX + 3, yOffset);
    doc.setTextColor(34, 197, 94);
    doc.setFont("helvetica", "bold");
    doc.text(value, pageWidth - margin - 3, yOffset, { align: "right" });
    doc.setFont("helvetica", "normal");
  });

  yPos += 50;

  // Financial Visualizations - New Page
  doc.addPage();
  yPos = 20;

  doc.setTextColor(31, 41, 55);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Financial Visualizations", margin, yPos);

  yPos += 10;

  // Revenue vs Profit Trend Line Chart
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246);
  doc.text("Revenue vs Profit Trend", margin, yPos);

  yPos += 8;

  const chartHeight = 60;
  const chartWidth = contentWidth - 10;
  const chartX = margin + 5;
  const chartY = yPos;

  // Draw axes
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(
    chartX,
    chartY + chartHeight,
    chartX + chartWidth,
    chartY + chartHeight
  ); // X-axis
  doc.line(chartX, chartY, chartX, chartY + chartHeight); // Y-axis

  // Get data for chart (max 12 months for visibility)
  const chartData = results.monthlyProjections.slice(0, 12);
  const maxValue = Math.max(
    ...chartData.map((m: any) =>
      Math.max(m.revenue, m.grossProfit, m.netProfit)
    )
  );

  if (chartData.length > 0 && maxValue > 0) {
    const stepX = chartWidth / (chartData.length - 1 || 1);

    // Draw lines
    const drawLine = (
      dataKey: "revenue" | "grossProfit" | "netProfit",
      color: number[]
    ) => {
      doc.setDrawColor(color[0], color[1], color[2]);
      doc.setLineWidth(1);
      for (let i = 0; i < chartData.length - 1; i++) {
        const x1 = chartX + i * stepX;
        const y1 =
          chartY +
          chartHeight -
          (chartData[i][dataKey] / maxValue) * chartHeight;
        const x2 = chartX + (i + 1) * stepX;
        const y2 =
          chartY +
          chartHeight -
          (chartData[i + 1][dataKey] / maxValue) * chartHeight;
        doc.line(x1, y1, x2, y2);
      }
    };

    drawLine("revenue", [59, 130, 246]); // Blue
    drawLine("grossProfit", [16, 185, 129]); // Green
    drawLine("netProfit", [139, 92, 246]); // Purple

    // Legend
    yPos += chartHeight + 5;
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");

    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1);
    doc.line(chartX, yPos, chartX + 5, yPos);
    doc.setTextColor(59, 130, 246);
    doc.text("Revenue", chartX + 7, yPos + 1);

    doc.setDrawColor(16, 185, 129);
    doc.line(chartX + 25, yPos, chartX + 30, yPos);
    doc.setTextColor(16, 185, 129);
    doc.text("Gross Profit", chartX + 32, yPos + 1);

    doc.setDrawColor(139, 92, 246);
    doc.line(chartX + 55, yPos, chartX + 60, yPos);
    doc.setTextColor(139, 92, 246);
    doc.text("Net Profit", chartX + 62, yPos + 1);

    yPos += 10;
  }

  // Revenue Breakdown Pie Chart
  if (yPos > pageHeight - 70) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246);
  doc.text("Revenue Breakdown", margin, yPos);

  yPos += 8;

  const pieX = margin + contentWidth / 2;
  const pieY = yPos + 30;
  const pieRadius = 25;

  const cogs = results.totalCogs;
  const opex = results.totalOperatingExpenses;
  const profit = results.netProfit;
  const total = cogs + opex + profit;

  if (total > 0) {
    const cogsAngle = (cogs / total) * 360;
    const opexAngle = (opex / total) * 360;
    const profitAngle = (profit / total) * 360;

    // Draw COGS slice (red)
    doc.setFillColor(239, 68, 68);
    let currentAngle = 0;
    const drawPieSlice = (angle: number) => {
      const steps = 50;
      const angleStep = angle / steps;
      for (let i = 0; i < steps; i++) {
        const angle1 =
          ((currentAngle + i * angleStep - 90) * Math.PI) / 180;
        const angle2 =
          ((currentAngle + (i + 1) * angleStep - 90) * Math.PI) / 180;
        doc.triangle(
          pieX,
          pieY,
          pieX + pieRadius * Math.cos(angle1),
          pieY + pieRadius * Math.sin(angle1),
          pieX + pieRadius * Math.cos(angle2),
          pieY + pieRadius * Math.sin(angle2),
          "F"
        );
      }
      currentAngle += angle;
    };

    drawPieSlice(cogsAngle);

    // Draw OpEx slice (orange)
    doc.setFillColor(251, 146, 60);
    drawPieSlice(opexAngle);

    // Draw Profit slice (green)
    doc.setFillColor(16, 185, 129);
    drawPieSlice(profitAngle);

    // Legend
    yPos += 65;

    doc.setFillColor(239, 68, 68);
    doc.rect(margin + 10, yPos, 5, 5, "F");
    doc.setFontSize(8);
    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "normal");
    doc.text(
      `COGS: ${((cogs / total) * 100).toFixed(0)}%`,
      margin + 18,
      yPos + 4
    );

    yPos += 8;

    doc.setFillColor(251, 146, 60);
    doc.rect(margin + 10, yPos, 5, 5, "F");
    doc.text(
      `Operating Expenses: ${((opex / total) * 100).toFixed(0)}%`,
      margin + 18,
      yPos + 4
    );

    yPos += 8;

    doc.setFillColor(16, 185, 129);
    doc.rect(margin + 10, yPos, 5, 5, "F");
    doc.text(
      `Net Profit: ${((profit / total) * 100).toFixed(0)}%`,
      margin + 18,
      yPos + 4
    );

    yPos += 12;
  }

  // Monthly Projections Table (first 12 months)
  if (yPos > pageHeight - 60 || results.monthlyProjections.length > 0) {
    doc.addPage();
    yPos = 20;

    doc.setTextColor(31, 41, 55);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Monthly Financial Projections", margin, yPos);

    yPos += 10;

    // Table header
    doc.setFillColor(249, 250, 251);
    doc.rect(margin, yPos, contentWidth, 8, "F");
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.rect(margin, yPos, contentWidth, 8, "S");

    doc.setTextColor(75, 85, 99);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");

    const colWidth = contentWidth / 6;
    doc.text("Month", margin + 2, yPos + 5);
    doc.text("Revenue", margin + colWidth + 2, yPos + 5);
    doc.text("Gross Profit", margin + colWidth * 2 + 2, yPos + 5);
    doc.text("OpEx", margin + colWidth * 3 + 2, yPos + 5);
    doc.text("Net Profit", margin + colWidth * 4 + 2, yPos + 5);
    doc.text("Cumulative", margin + colWidth * 5 + 2, yPos + 5);

    yPos += 8;

    // Table rows (max 12 months)
    const tableData = results.monthlyProjections.slice(0, 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    tableData.forEach((row: any, index: number) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }

      const rowColor =
        index % 2 === 0 ? [255, 255, 255] : [249, 250, 251];
      doc.setFillColor(rowColor[0], rowColor[1], rowColor[2]);
      doc.rect(margin, yPos, contentWidth, 6, "F");

      doc.setTextColor(31, 41, 55);
      doc.text(`M${row.month}`, margin + 2, yPos + 4);
      doc.text(
        `$${(row.revenue / 1000).toFixed(0)}K`,
        margin + colWidth + 2,
        yPos + 4
      );
      doc.text(
        `$${(row.grossProfit / 1000).toFixed(0)}K`,
        margin + colWidth * 2 + 2,
        yPos + 4
      );
      doc.text(
        `$${(row.operatingExpenses / 1000).toFixed(0)}K`,
        margin + colWidth * 3 + 2,
        yPos + 4
      );
      doc.text(
        `$${(row.netProfit / 1000).toFixed(0)}K`,
        margin + colWidth * 4 + 2,
        yPos + 4
      );
      doc.text(
        `$${(row.cumulativeProfit / 1000).toFixed(0)}K`,
        margin + colWidth * 5 + 2,
        yPos + 4
      );

      yPos += 6;
    });
  }

  return doc;
};

/**
 * Add Problem Tree content to PDF
 * @param doc - Existing jsPDF instance
 * @param treeData - Problem tree data
 * @param startOnNewPage - Whether to start on a new page
 * @returns Updated jsPDF instance
 */
export const addProblemTreeContent = (
  doc: jsPDF,
  treeData: any,
  startOnNewPage: boolean = false
): jsPDF => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = startOnNewPage ? 20 : 85;

  // Helper function to add section header
  const addSectionHeader = (
    title: string,
    color: number[],
    icon: string
  ) => {
    // Add extra space before section
    if (yPos > 85) {
      yPos += 8;
    }

    // Check if need new page
    if (yPos > pageHeight - 90) {
      doc.addPage();
      yPos = 20;
    }

    // Add shadow effect
    doc.setFillColor(200, 200, 200);
    doc.roundedRect(margin + 1, yPos + 1, contentWidth, 14, 3, 3, "F");

    // Section header with colored background
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(margin, yPos, contentWidth, 14, 3, 3, "F");

    // Add icon-like circle on left
    doc.setFillColor(255, 255, 255);
    doc.circle(margin + 5, yPos + 7, 2.5, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin + 10, yPos + 9.5);

    yPos += 20;
  };

  // Helper function to add field
  const addField = (label: string, content: string) => {
    // Check if need new page
    if (yPos > pageHeight - 55) {
      doc.addPage();
      yPos = 20;
    }

    // Field label with bullet
    doc.setFillColor(100, 116, 139);
    doc.circle(margin + 2, yPos + 2, 1.2, "F");

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(label, margin + 5, yPos + 3);

    yPos += 7;

    // Content box
    doc.setTextColor(55, 65, 81);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const text = content || "Not defined yet";
    const lines = doc.splitTextToSize(text, contentWidth - 10);

    // Calculate box height
    const lineHeight = 5;
    const minBoxHeight = 12;
    const calculatedHeight = lines.length * lineHeight + 8;
    const boxHeight = Math.min(
      Math.max(calculatedHeight, minBoxHeight),
      50
    );

    // Draw content box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(
      margin + 2,
      yPos,
      contentWidth - 4,
      boxHeight,
      2,
      2,
      "F"
    );

    // Add left accent border
    doc.setFillColor(203, 213, 225);
    doc.rect(margin + 2, yPos, 2, boxHeight, "F");

    // Border
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(
      margin + 2,
      yPos,
      contentWidth - 4,
      boxHeight,
      2,
      2,
      "S"
    );

    // Add text
    const displayLines = lines.slice(0, 9);
    if (text === "Not defined yet") {
      doc.setTextColor(156, 163, 175);
      doc.setFont("helvetica", "italic");
    }
    doc.text(displayLines, margin + 7, yPos + 6);

    yPos += boxHeight + 6;
  };

  // Effects & Consequences Section
  addSectionHeader("Effects & Consequences", [239, 68, 68], "↑");
  addField(
    "Problem Impact on Society",
    treeData.problemImpactSociety || ""
  );
  addField(
    "Harms on Direct Beneficiaries",
    treeData.harmsDirectBeneficiaries || ""
  );
  addField(
    "Effects on Involved Parties",
    treeData.effectsInvolvedParties || ""
  );

  // Add separator
  yPos += 3;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(margin + 20, yPos, pageWidth - margin - 20, yPos);
  yPos += 3;

  // Core Problem Section
  addSectionHeader("Core Problem", [245, 158, 11], "●");
  addField("Main Problem Statement", treeData.mainProblem || "");

  // Add separator
  yPos += 3;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(margin + 20, yPos, pageWidth - margin - 20, yPos);
  yPos += 3;

  // Root Causes Section
  addSectionHeader("Root Causes", [59, 130, 246], "↓");
  addField("Problem Position & Context", treeData.problemPosition || "");
  addField("Main Underlying Causes", treeData.mainCauses || "");

  // Add separator
  yPos += 3;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(margin + 20, yPos, pageWidth - margin - 20, yPos);
  yPos += 3;

  // Analysis Summary Section
  addSectionHeader("Analysis Summary", [34, 197, 94], "✓");
  addField("Key Insights", treeData.keyInsights || "");
  addField("Strategic Implications", treeData.strategicImplications || "");

  return doc;
};

/**
 * Add Ecosystem Mapping content to PDF
 * @param doc - Existing jsPDF instance
 * @param stakeholders - Stakeholder data array
 * @param startOnNewPage - Whether to start on a new page
 * @returns Updated jsPDF instance
 */
export const addEcosystemMappingContent = (
  doc: jsPDF,
  stakeholders: any[],
  startOnNewPage: boolean = false
): jsPDF => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = startOnNewPage ? 20 : 85;

  // Calculate summary metrics
  const totalStakeholders = stakeholders.length;
  const avgRelationship =
    stakeholders.length > 0
      ? (
          stakeholders.reduce((sum: number, s: any) => sum + s.relationshipStrength, 0) /
          stakeholders.length
        ).toFixed(1)
      : "0";
  const activeEngagement = stakeholders.filter(
    (s: any) => s.engagementLevel === "Active"
  ).length;
  const highRisk = stakeholders.filter((s: any) => s.riskLevel === "High").length;

  // Helper function to add section header
  const addSectionHeader = (title: string, color: number[]) => {
    // Add extra space before section
    if (yPos > 85) {
      yPos += 8;
    }

    // Check if need new page
    if (yPos > pageHeight - 90) {
      doc.addPage();
      yPos = 20;
    }

    // Add shadow effect
    doc.setFillColor(200, 200, 200);
    doc.roundedRect(margin + 1, yPos + 1, contentWidth, 14, 3, 3, "F");

    // Section header with colored background
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(margin, yPos, contentWidth, 14, 3, 3, "F");

    // Add icon-like circle on left
    doc.setFillColor(255, 255, 255);
    doc.circle(margin + 5, yPos + 7, 2.5, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin + 10, yPos + 9.5);

    yPos += 20;
  };

  // Helper function to add metric
  const addMetric = (label: string, value: string) => {
    // Check if need new page
    if (yPos > pageHeight - 25) {
      doc.addPage();
      yPos = 20;
    }

    // Metric row with light background
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, yPos, contentWidth, 10, 2, 2, "F");

    doc.setTextColor(75, 85, 99);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(label, margin + 3, yPos + 6.5);

    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "normal");
    doc.text(value, pageWidth - margin - 3, yPos + 6.5, { align: "right" });

    yPos += 12;
  };

  // Helper function to add stakeholder card
  const addStakeholderCard = (stakeholder: any) => {
    const cardHeight = 45;

    // Check if need new page
    if (yPos > pageHeight - cardHeight - 10) {
      doc.addPage();
      yPos = 20;
    }

    // Card background
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, yPos, contentWidth, cardHeight, 3, 3, "F");
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, yPos, contentWidth, cardHeight, 3, 3, "S");

    let cardYPos = yPos + 5;

    // Name and Type
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(stakeholder.name, margin + 3, cardYPos);

    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.setFont("helvetica", "normal");
    doc.text(`(${stakeholder.type})`, margin + 3, cardYPos + 4);

    // Relationship Strength Badge
    doc.setFillColor(59, 130, 246);
    doc.roundedRect(
      pageWidth - margin - 25,
      cardYPos - 2,
      22,
      6,
      1,
      1,
      "F"
    );
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(
      `${stakeholder.relationshipStrength}/10`,
      pageWidth - margin - 14,
      cardYPos + 2,
      { align: "center" }
    );

    cardYPos += 8;

    // Metrics row
    const metricsStartX = margin + 3;
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);

    // Influence
    doc.setFont("helvetica", "normal");
    doc.text("Influence:", metricsStartX, cardYPos);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 41, 55);
    doc.text(stakeholder.influence, metricsStartX + 17, cardYPos);

    // Interest
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text("Interest:", metricsStartX + 35, cardYPos);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 41, 55);
    doc.text(stakeholder.interest, metricsStartX + 50, cardYPos);

    // Relationship
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text("Relationship:", metricsStartX + 68, cardYPos);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 41, 55);
    doc.text(stakeholder.relationship, metricsStartX + 93, cardYPos);

    cardYPos += 5;

    // Engagement Level Badge
    const engagementColors: Record<string, number[]> = {
      Active: [34, 197, 94],
      Moderate: [234, 179, 8],
      Minimal: [249, 115, 22],
      None: [239, 68, 68],
    };
    const engColor = engagementColors[stakeholder.engagementLevel] || [
      156, 163, 175,
    ];

    doc.setFillColor(engColor[0], engColor[1], engColor[2]);
    doc.roundedRect(metricsStartX, cardYPos, 22, 5, 1, 1, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(
      stakeholder.engagementLevel,
      metricsStartX + 11,
      cardYPos + 3.5,
      { align: "center" }
    );

    // Risk Level Badge
    const riskColor =
      stakeholder.riskLevel === "High"
        ? [239, 68, 68]
        : stakeholder.riskLevel === "Medium"
        ? [234, 179, 8]
        : [34, 197, 94];
    doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
    doc.roundedRect(metricsStartX + 25, cardYPos, 20, 5, 1, 1, "F");
    doc.setTextColor(255, 255, 255);
    doc.text(
      `${stakeholder.riskLevel} Risk`,
      metricsStartX + 35,
      cardYPos + 3.5,
      { align: "center" }
    );

    cardYPos += 8;

    // Last Contact
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.setFont("helvetica", "normal");
    doc.text("Last Contact:", metricsStartX, cardYPos);
    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "bold");
    doc.text(stakeholder.lastContact, metricsStartX + 22, cardYPos);

    cardYPos += 4;

    // Next Action
    doc.setTextColor(107, 114, 128);
    doc.setFont("helvetica", "normal");
    doc.text("Next Action:", metricsStartX, cardYPos);
    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "normal");
    const actionText = doc.splitTextToSize(
      stakeholder.nextAction,
      contentWidth - 30
    );
    doc.text(actionText.slice(0, 2), metricsStartX + 20, cardYPos);

    yPos += cardHeight + 5;
  };

  // Export Summary Section
  addSectionHeader("Export Summary", [59, 130, 246]);
  addMetric("Total Stakeholders", totalStakeholders.toString());
  addMetric("Average Relationship", `${avgRelationship}/10`);
  addMetric("Active Engagement", activeEngagement.toString());
  addMetric("High Risk", highRisk.toString());

  // Add separator
  yPos += 3;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(margin + 20, yPos, pageWidth - margin - 20, yPos);
  yPos += 8;

  // Stakeholder Details Section
  addSectionHeader("Stakeholder Details", [34, 197, 94]);

  stakeholders.forEach((stakeholder: any) => {
    addStakeholderCard(stakeholder);
  });

  return doc;
};
