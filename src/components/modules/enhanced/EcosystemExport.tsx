import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomTooltip } from "@/components/common/CustomTooltip";
import {
  Download,
  FileText,
  Image,
  BarChart3,
  Share2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

interface EnhancedStakeholder {
  id: string;
  name: string;
  type: string;
  influence: "High" | "Medium" | "Low";
  interest: "High" | "Medium" | "Low";
  relationship: "Supportive" | "Neutral" | "Opposing";
  relationshipStrength: number;
  engagementLevel: "Active" | "Moderate" | "Minimal" | "None";
  lastContact: string;
  nextAction: string;
  riskLevel: "High" | "Medium" | "Low";
  description: string;
  contactInfo?: string;
}

interface EcosystemExportProps {
  stakeholders: EnhancedStakeholder[];
}

const EcosystemExport: React.FC<EcosystemExportProps> = ({ stakeholders }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  // Calculate summary metrics
  const totalStakeholders = stakeholders.length;
  const avgRelationship =
    stakeholders.length > 0
      ? (
          stakeholders.reduce((sum, s) => sum + s.relationshipStrength, 0) /
          stakeholders.length
        ).toFixed(1)
      : "0";
  const activeEngagement = stakeholders.filter(
    (s) => s.engagementLevel === "Active"
  ).length;
  const highRisk = stakeholders.filter((s) => s.riskLevel === "High").length;

  const exportToCSV = () => {
    // Summary section
    const summary = [
      "EXPORT SUMMARY",
      `Total Stakeholders,${totalStakeholders}`,
      `Average Relationship,${avgRelationship}/10`,
      `Active Engagement,${activeEngagement}`,
      `High Risk,${highRisk}`,
      "",
      "STAKEHOLDER DATA",
    ];

    const headers = [
      "Name",
      "Type",
      "Influence",
      "Interest",
      "Relationship",
      "Strength",
      "Engagement",
      "Last Contact",
      "Next Action",
      "Risk Level",
      "Description",
    ];

    const csvContent = [
      ...summary,
      headers.join(","),
      ...stakeholders.map((s) =>
        [
          s.name,
          s.type,
          s.influence,
          s.interest,
          s.relationship,
          s.relationshipStrength,
          s.engagementLevel,
          s.lastContact,
          s.nextAction,
          s.riskLevel,
          `"${s.description}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    a.download = `ecosystem-mapping-${timestamp}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const data = {
      meta: {
        exportDate: new Date().toISOString(),
        exportDateFormatted: new Date().toLocaleDateString(),
        moduleType: "Ecosystem Mapping",
        version: "1.0",
      },
      exportSummary: {
        totalStakeholders: totalStakeholders,
        averageRelationship: avgRelationship,
        activeEngagement: activeEngagement,
        highRisk: highRisk,
      },
      detailedAnalytics: {
        engagementBreakdown: {
          active: stakeholders.filter((s) => s.engagementLevel === "Active")
            .length,
          moderate: stakeholders.filter((s) => s.engagementLevel === "Moderate")
            .length,
          minimal: stakeholders.filter((s) => s.engagementLevel === "Minimal")
            .length,
          none: stakeholders.filter((s) => s.engagementLevel === "None").length,
        },
        riskBreakdown: {
          high: stakeholders.filter((s) => s.riskLevel === "High").length,
          medium: stakeholders.filter((s) => s.riskLevel === "Medium").length,
          low: stakeholders.filter((s) => s.riskLevel === "Low").length,
        },
      },
      stakeholders: stakeholders,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    a.download = `ecosystem-mapping-${timestamp}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateReport = () => {
    const report = `
ECOSYSTEM MAPPING REPORT
Generated: ${new Date().toLocaleDateString()}

========================================
EXPORT SUMMARY
========================================
Total Stakeholders: ${totalStakeholders}
Average Relationship: ${avgRelationship}/10
Active Engagement: ${activeEngagement}
High Risk: ${highRisk}

========================================
DETAILED ENGAGEMENT OVERVIEW
========================================

ENGAGEMENT OVERVIEW
Active: ${stakeholders.filter((s) => s.engagementLevel === "Active").length}
Moderate: ${stakeholders.filter((s) => s.engagementLevel === "Moderate").length}
Minimal: ${stakeholders.filter((s) => s.engagementLevel === "Minimal").length}
None: ${stakeholders.filter((s) => s.engagementLevel === "None").length}

RISK ASSESSMENT
High Risk: ${stakeholders.filter((s) => s.riskLevel === "High").length}
Medium Risk: ${stakeholders.filter((s) => s.riskLevel === "Medium").length}
Low Risk: ${stakeholders.filter((s) => s.riskLevel === "Low").length}

STAKEHOLDER DETAILS
${stakeholders
  .map(
    (s) => `
${s.name} (${s.type})
- Influence: ${s.influence} | Interest: ${s.interest}
- Relationship: ${s.relationship} (Strength: ${s.relationshipStrength}/10)
- Engagement: ${s.engagementLevel} | Risk: ${s.riskLevel}
- Last Contact: ${s.lastContact}
- Next Action: ${s.nextAction}
- Description: ${s.description}
`
  )
  .join("")}

RECOMMENDATIONS
${
  stakeholders.filter((s) => s.relationshipStrength <= 4).length > 0
    ? `- Immediate attention needed for ${
        stakeholders.filter((s) => s.relationshipStrength <= 4).length
      } weak relationships`
    : "- No immediate relationship concerns identified"
}
${
  stakeholders.filter((s) => s.riskLevel === "High").length > 0
    ? `- Address ${
        stakeholders.filter((s) => s.riskLevel === "High").length
      } high-risk stakeholders`
    : "- Risk levels are manageable"
}
${
  stakeholders.filter((s) => s.engagementLevel === "None").length > 0
    ? `- Re-engage ${
        stakeholders.filter((s) => s.engagementLevel === "None").length
      } inactive stakeholders`
    : "- Engagement levels are healthy"
}
    `;

    const blob = new Blob([report], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    a.download = `ecosystem-mapping-report-${timestamp}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    setExportingFormat("PDF");

    try {
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

      // Title Page with gradient effect
      doc.setFillColor(34, 197, 94); // Green
      doc.rect(0, 0, pageWidth, 70, "F");

      // Add decorative line
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.5);
      doc.line(margin, 60, pageWidth - margin, 60);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.setFont("helvetica", "bold");
      doc.text("Ecosystem Mapping Analysis", pageWidth / 2, 25, {
        align: "center",
      });

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Stakeholder Analysis Export • ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        50,
        { align: "center" }
      );

      yPos = 85;

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
      const addStakeholderCard = (stakeholder: EnhancedStakeholder) => {
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

      stakeholders.forEach((stakeholder) => {
        addStakeholderCard(stakeholder);
      });

      // Footer on all pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Footer line
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

        // Page number (left)
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.setFont("helvetica", "normal");
        doc.text(`Page ${i} of ${pageCount}`, margin, pageHeight - 8);

        // Branding (center)
        doc.setFont("helvetica", "bold");
        doc.setTextColor(34, 197, 94);
        doc.text("Strategize+", pageWidth / 2, pageHeight - 8, {
          align: "center",
        });

        // Date (right)
        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        doc.text(
          new Date().toLocaleDateString(),
          pageWidth - margin,
          pageHeight - 8,
          { align: "right" }
        );
      }

      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      doc.save(`ecosystem-mapping-${timestamp}.pdf`);
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  const shareData = async () => {
    const shareText = `Ecosystem Mapping Analysis - ${totalStakeholders} stakeholders | Avg. Relationship: ${avgRelationship}/10 | Active Engagement: ${activeEngagement} | High Risk: ${highRisk}`;
    const shareDataObj = {
      title: "Ecosystem Mapping Analysis",
      text: shareText,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareDataObj);
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(
        `${shareDataObj.title}\n${shareDataObj.text}\n${shareDataObj.url}`
      );
      alert("Share data copied to clipboard!");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-blue-600" />
          <CardTitle>Export & Share</CardTitle>
          <CustomTooltip
            title=""
            description="Export your ecosystem mapping data for external analysis, reporting, or sharing with stakeholders"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={exportToPDF}
            variant="outline"
            className="flex items-center gap-2"
            disabled={isExporting}
          >
            {isExporting && exportingFormat === "PDF" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 text-red-600" />
                Export PDF
                <Badge variant="secondary" className="ml-auto">
                  PDF
                </Badge>
              </>
            )}
          </Button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Export Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Stakeholders:</span>
              <span className="ml-2 font-medium">{totalStakeholders}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Avg. Relationship:</span>
              <span className="ml-2 font-medium">{avgRelationship}/10</span>
            </div>
            <div>
              <span className="text-muted-foreground">Active Engagement:</span>
              <span className="ml-2 font-medium">{activeEngagement}</span>
            </div>
            <div>
              <span className="text-muted-foreground">High Risk:</span>
              <span className="ml-2 font-medium">{highRisk}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EcosystemExport;
