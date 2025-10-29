// New GTM PDF Export - Clean table-based design matching web UI
// This will replace the existing exportToPDF function

import jsPDF from 'jspdf';

export const generateGTMPDF = (gtmPlanner: any, sonnerToast: any) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = 20;

  // Yellow color for table headers (matching web UI)
  const yellowHeader = [252, 211, 77]; // #FCD34D
  const tealHeader = [13, 148, 136]; // #0D9488
  
  // Helper to check if content exists
  const hasContent = (value: any): boolean => {
    if (!value) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0 && value.some((item: any) => hasContent(item));
    if (typeof value === 'object') return Object.values(value).some((v: any) => hasContent(v));
    return true;
  };

  // Helper to draw table header
  const drawTableHeader = (headers: string[], y: number, color: number[] = yellowHeader) => {
    const colWidth = contentWidth / headers.length;
    
    // Header background
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(margin, y, contentWidth, 10, "F");
    
    // Header text
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    
    headers.forEach((header, i) => {
      const x = margin + (i * colWidth);
      doc.text(header, x + 2, y + 6.5);
    });
    
    return y + 10;
  };

  // Helper to draw table row
  const drawTableRow = (values: string[], y: number, rowHeight: number = 15) => {
    const colWidth = contentWidth / values.length;
    
    // Row borders
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    
    values.forEach((value, i) => {
      const x = margin + (i * colWidth);
      doc.rect(x, y, colWidth, rowHeight);
      
      // Cell text
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      
      if (value) {
        const lines = doc.splitTextToSize(value, colWidth - 4);
        doc.text(lines, x + 2, y + 5);
      }
    });
    
    return y + rowHeight;
  };

  // Title Page
  doc.setFillColor(13, 148, 136); // Teal
  doc.rect(0, 0, pageWidth, 70, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text("Go-To-Market Strategy", pageWidth / 2, 30, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${gtmPlanner.productRoadmap.businessName} • ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    50,
    { align: "center" }
  );

  // SECTION 1: Product Roadmap
  const roadmapStages = gtmPlanner.productRoadmap.stages;
  const hasRoadmapContent = hasContent(roadmapStages);
  
  if (hasRoadmapContent) {
    doc.addPage();
    yPos = 20;
    
    // Section title
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Product Roadmap", margin, yPos);
    yPos += 12;
    
    // Business metadata
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99);
    
    const metaData = [
      `Business name: ${gtmPlanner.productRoadmap.businessName}`,
      `Year: ${gtmPlanner.productRoadmap.year}`,
      `Team: ${gtmPlanner.productRoadmap.team}`
    ];
    
    metaData.forEach((text) => {
      doc.text(text, margin, yPos);
      yPos += 6;
    });
    
    yPos += 8;
    
    // Roadmap table
    const quarters = ["Q1", "Q2", "Q3", "Q4"];
    yPos = drawTableHeader(["Stage", ...quarters], yPos, tealHeader);
    
    Object.keys(roadmapStages).forEach((stage) => {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
        yPos = drawTableHeader(["Stage", ...quarters], yPos, tealHeader);
      }
      
      const stageData = roadmapStages[stage];
      const rowValues = [
        stage,
        stageData["Q1"] || "",
        stageData["Q2"] || "",
        stageData["Q3"] || "",
        stageData["Q4"] || ""
      ];
      
      yPos = drawTableRow(rowValues, yPos, 20);
    });
  }

  // SECTION 2: Customer Pain Points
  const painPoints = gtmPlanner.customerPainPoints;
  const hasPainPoints = hasContent(painPoints);
  
  if (hasPainPoints) {
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = 20;
    } else {
      yPos += 15;
    }
    
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Customer Pain Points Analysis", margin, yPos);
    yPos += 12;
    
    // Pain points table
    yPos = drawTableHeader(["Category", "Customer pain points"], yPos);
    
    const painCategories = [
      { label: "Productivity", value: painPoints.productivity },
      { label: "Financial", value: painPoints.financial },
      { label: "Process", value: painPoints.process },
      { label: "Support", value: painPoints.support }
    ];
    
    painCategories.forEach(({ label, value }) => {
      if (hasContent(value)) {
        if (yPos > pageHeight - 25) {
          doc.addPage();
          yPos = 20;
          yPos = drawTableHeader(["Category", "Customer pain points"], yPos);
        }
        yPos = drawTableRow([label, value], yPos, 20);
      }
    });
  }

  // SECTION 3: Competitor Analysis
  const compAnalysis = gtmPlanner.competitorAnalysis;
  const hasCompetitors = hasContent(compAnalysis.yourBusiness) || compAnalysis.competitors.length > 0;
  
  if (hasCompetitors) {
    doc.addPage();
    yPos = 20;
    
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Competitor Analysis", margin, yPos);
    yPos += 12;
    
    // Your Business section
    if (hasContent(compAnalysis.yourBusiness)) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(13, 148, 136);
      doc.text("Your Business", margin, yPos);
      yPos += 8;
      
      yPos = drawTableHeader(["Target Market", "Product Offerings", "What Works", "What Doesn't Work"], yPos);
      
      const yourBiz = compAnalysis.yourBusiness;
      yPos = drawTableRow([
        yourBiz.targetMarket || "",
        yourBiz.productOfferings || "",
        yourBiz.whatWorks || "",
        yourBiz.whatDoesntWork || ""
      ], yPos, 25);
      
      yPos += 10;
    }
    
    // Competitors
    compAnalysis.competitors.forEach((comp: any, index: number) => {
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(59, 130, 246);
      doc.text(`Competitor ${index + 1}: ${comp.name}`, margin, yPos);
      yPos += 8;
      
      yPos = drawTableHeader(["Target Market", "Product Offerings", "What Works", "What Doesn't Work"], yPos);
      yPos = drawTableRow([
        comp.targetMarket || "",
        comp.productOfferings || "",
        comp.whatWorks || "",
        comp.whatDoesntWork || ""
      ], yPos, 25);
      
      yPos += 10;
    });
  }

  // SECTION 4: SWOT Analysis
  const swot = gtmPlanner.swotAnalysis;
  const hasSwot = hasContent(swot.strengths.notes) || hasContent(swot.weaknesses.notes) || 
                  hasContent(swot.opportunities.notes) || hasContent(swot.threats.notes);
  
  if (hasSwot) {
    doc.addPage();
    yPos = 20;
    
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("SWOT Analysis", margin, yPos);
    yPos += 12;
    
    // 2x2 Grid
    const halfWidth = (contentWidth - 4) / 2;
    const boxHeight = 50;
    
    // Strengths
    if (hasContent(swot.strengths.notes)) {
      doc.setFillColor(yellowHeader[0], yellowHeader[1], yellowHeader[2]);
      doc.rect(margin, yPos, halfWidth, 10, "F");
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Strengths", margin + 2, yPos + 6.5);
      
      doc.setDrawColor(200, 200, 200);
      doc.rect(margin, yPos + 10, halfWidth, boxHeight);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(31, 41, 55);
      const strengthLines = doc.splitTextToSize(swot.strengths.notes, halfWidth - 4);
      doc.text(strengthLines, margin + 2, yPos + 15);
    }
    
    // Weaknesses
    if (hasContent(swot.weaknesses.notes)) {
      doc.setFillColor(yellowHeader[0], yellowHeader[1], yellowHeader[2]);
      doc.rect(margin + halfWidth + 4, yPos, halfWidth, 10, "F");
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Weaknesses", margin + halfWidth + 6, yPos + 6.5);
      
      doc.setDrawColor(200, 200, 200);
      doc.rect(margin + halfWidth + 4, yPos + 10, halfWidth, boxHeight);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(31, 41, 55);
      const weaknessLines = doc.splitTextToSize(swot.weaknesses.notes, halfWidth - 4);
      doc.text(weaknessLines, margin + halfWidth + 6, yPos + 15);
    }
    
    yPos += boxHeight + 15;
    
    // Opportunities
    if (hasContent(swot.opportunities.notes)) {
      doc.setFillColor(yellowHeader[0], yellowHeader[1], yellowHeader[2]);
      doc.rect(margin, yPos, halfWidth, 10, "F");
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Opportunities", margin + 2, yPos + 6.5);
      
      doc.setDrawColor(200, 200, 200);
      doc.rect(margin, yPos + 10, halfWidth, boxHeight);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(31, 41, 55);
      const oppLines = doc.splitTextToSize(swot.opportunities.notes, halfWidth - 4);
      doc.text(oppLines, margin + 2, yPos + 15);
    }
    
    // Threats
    if (hasContent(swot.threats.notes)) {
      doc.setFillColor(yellowHeader[0], yellowHeader[1], yellowHeader[2]);
      doc.rect(margin + halfWidth + 4, yPos, halfWidth, 10, "F");
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Threats", margin + halfWidth + 6, yPos + 6.5);
      
      doc.setDrawColor(200, 200, 200);
      doc.rect(margin + halfWidth + 4, yPos + 10, halfWidth, boxHeight);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(31, 41, 55);
      const threatLines = doc.splitTextToSize(swot.threats.notes, halfWidth - 4);
      doc.text(threatLines, margin + halfWidth + 6, yPos + 15);
    }
  }

  // SECTION 5: Product Concepts
  const ideas = gtmPlanner.productConcept.ideas.filter((idea: any) => hasContent(idea.productName));
  
  if (ideas.length > 0) {
    doc.addPage();
    yPos = 20;
    
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Product Concept", margin, yPos);
    yPos += 12;
    
    // Product concepts table
    yPos = drawTableHeader([
      "Product name",
      "Description",
      "Pain point/Solution",
      "Important features",
      "USP"
    ], yPos);
    
    ideas.forEach((idea: any) => {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
        yPos = drawTableHeader([
          "Product name",
          "Description",
          "Pain point/Solution",
          "Important features",
          "USP"
        ], yPos);
      }
      
      yPos = drawTableRow([
        idea.productName || "",
        idea.description || "",
        idea.painPointSolution || "",
        idea.importantFeatures || "",
        idea.usp || ""
      ], yPos, 25);
    });
  }

  // SECTION 6: Key Audience Pitches
  const pitches = gtmPlanner.keyAudiencePitches;
  const hasPitches = hasContent(pitches.leadership) || hasContent(pitches.donorsFinance) || hasContent(pitches.targetAudience);
  
  if (hasPitches) {
    doc.addPage();
    yPos = 20;
    
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Key Audience Pitches", margin, yPos);
    yPos += 12;
    
    // Three columns
    yPos = drawTableHeader([
      "Appeal to leadership",
      "Appeal to donors/finance",
      "Appeal to target audience"
    ], yPos);
    
    yPos = drawTableRow([
      pitches.leadership || "",
      pitches.donorsFinance || "",
      pitches.targetAudience || ""
    ], yPos, 60);
  }

  // SECTION 7: Launch Goals & KPIs
  const goals = gtmPlanner.launchGoalsKPIs.goals.filter((goal: any) => hasContent(goal.name));
  
  if (goals.length > 0) {
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    } else {
      yPos += 15;
    }
    
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Launch Goals and KPIs", margin, yPos);
    yPos += 12;
    
    // Goals table
    yPos = drawTableHeader(["Goal", "KPI #1", "KPI #2"], yPos);
    
    goals.forEach((goal: any) => {
      if (yPos > pageHeight - 25) {
        doc.addPage();
        yPos = 20;
        yPos = drawTableHeader(["Goal", "KPI #1", "KPI #2"], yPos);
      }
      
      yPos = drawTableRow([
        goal.name || "",
        goal.kpi1 || "",
        goal.kpi2 || ""
      ], yPos, 15);
    });
  }

  // SECTION 8: Status Log
  const statusEntries = gtmPlanner.statusLog.entries.filter((entry: any) => hasContent(entry.tasks));
  
  if (statusEntries.length > 0) {
    doc.addPage();
    yPos = 20;
    
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Status Log", margin, yPos);
    yPos += 12;
    
    // Status log table
    yPos = drawTableHeader([
      "Team lead",
      "Team",
      "Department",
      "Tasks",
      "Deadline",
      "Status"
    ], yPos);
    
    statusEntries.forEach((entry: any) => {
      if (yPos > pageHeight - 25) {
        doc.addPage();
        yPos = 20;
        yPos = drawTableHeader([
          "Team lead",
          "Team",
          "Department",
          "Tasks",
          "Deadline",
          "Status"
        ], yPos);
      }
      
      yPos = drawTableRow([
        entry.teamLead || "",
        entry.team || "",
        entry.department || "",
        entry.tasks || "",
        entry.deadline || "",
        entry.status ? "✓" : "○"
      ], yPos, 15);
    });
  }

  // SECTION 9: Customer Journey Map
  const journey = gtmPlanner.customerJourneyMap;
  const hasJourney = hasContent(journey.touchpoints) || hasContent(journey.departments);
  
  if (hasJourney) {
    doc.addPage();
    yPos = 20;
    
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Customer Journey Map", margin, yPos);
    yPos += 12;
    
    // Journey stages
    const stages = ["Awareness", "Consideration", "Purchase", "Retention", "Advocacy"];
    
    // Journey table
    const rows = [
      { label: "Touchpoints", data: journey.touchpoints },
      { label: "Departments", data: journey.departments },
      { label: "Customer Feelings", data: journey.customerFeelings },
      { label: "Pain Points", data: journey.painPoints },
      { label: "Opportunities", data: journey.opportunities }
    ];
    
    yPos = drawTableHeader(["Stage", ...stages], yPos);
    
    rows.forEach((row) => {
      if (yPos > pageHeight - 25) {
        doc.addPage();
        yPos = 20;
        yPos = drawTableHeader(["Stage", ...stages], yPos);
      }
      
      const rowValues = [
        row.label,
        row.data[stages[0]] || "",
        row.data[stages[1]] || "",
        row.data[stages[2]] || "",
        row.data[stages[3]] || "",
        row.data[stages[4]] || ""
      ];
      
      yPos = drawTableRow(rowValues, yPos, 15);
    });
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.setFont("helvetica", "normal");
    doc.text(`Page ${i} of ${pageCount}`, margin, pageHeight - 8);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(13, 148, 136);
    doc.text("GTM Strategy", pageWidth / 2, pageHeight - 8, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(
      new Date().toLocaleDateString(),
      pageWidth - margin,
      pageHeight - 8,
      { align: "right" }
    );
  }

  return doc;
};
