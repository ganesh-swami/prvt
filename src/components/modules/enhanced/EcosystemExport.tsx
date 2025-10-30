import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomTooltip } from "@/components/common/CustomTooltip";
import {
  Download,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  createPDFInstance,
  addTitlePage,
  addFooterToAllPages,
  downloadPDF,
} from "@/utils/pdfUtils";
import { addEcosystemMappingContent } from "@/utils/modulePDFExports";

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
      // Create PDF using shared utilities
      let doc = createPDFInstance();
      doc = addTitlePage(
        doc,
        "Ecosystem Mapping Analysis",
        "Stakeholder Analysis Export",
        [34, 197, 94]
      );
      doc = addEcosystemMappingContent(doc, stakeholders, false);
      doc = addFooterToAllPages(doc, "Ecosystem Mapping Analysis");
      downloadPDF(doc, "ecosystem-mapping");
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
