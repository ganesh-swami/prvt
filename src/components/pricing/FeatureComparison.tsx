import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";

interface Feature {
  name: string;
  starter: boolean | string;
  solo: boolean | string;
  pro: boolean | string;
  business: boolean | string;
  coreModules?: {
    name: string;
    starter: boolean | string;
    solo: boolean | string;
    pro: boolean | string;
    business: boolean | string;
  }[];
}

// "Ecosystem Map",
//       "Market Sizing",
//       "Pricing Lab",
//       "Unit Economics",
//       "Financial Model",
//       "GTM Planner",
//       "Competitive Analysis",
//       "Risk Center",
const features: Feature[] = [
  {
    name: "Core Modules",
    starter: true,
    solo: true,
    pro: true,
    business: true,
    coreModules: [
      {
        name: "Plan Builder",
        starter: true,
        solo: true,
        pro: true,
        business: true,
      },
      {
        name: "Social Canvas",
        starter: true,
        solo: true,
        pro: true,
        business: true,
      },
      {
        name: "Problem Tree",
        starter: true,
        solo: true,
        pro: true,
        business: true,
      },
    ],
  },
  {
    name: "Projects",
    starter: "1",
    solo: "3",
    pro: "Unlimited",
    business: "Unlimited",
  },
  { name: "PDF Export", starter: true, solo: true, pro: true, business: true },
  { name: "PPT Export", starter: false, solo: true, pro: true, business: true },
  {
    name: "Team Collaboration",
    starter: false,
    solo: false,
    pro: true,
    business: true,
  },
  {
    name: "AI Analyst (upcoming)",
    starter: false,
    solo: false,
    pro: "1M credits",
    business: "3M credits",
  },
  {
    name: "Investor Room",
    starter: false,
    solo: false,
    pro: true,
    business: true,
  },
  {
    name: "ESG Compliance (upcoming)",
    starter: false,
    solo: false,
    pro: true,
    business: true,
  },
  {
    name: "Advanced Integrations (upcoming)",
    starter: false,
    solo: false,
    pro: false,
    business: true,
  },
];

export function FeatureComparison() {
  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="h-4 w-4 text-green-500 mx-auto" />
      ) : (
        <X className="h-4 w-4 text-gray-300 mx-auto" />
      );
    }
    return <span className="text-sm text-center">{value}</span>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Feature</th>
                <th className="text-center p-2">Starter</th>
                <th className="text-center p-2">Solo</th>
                <th className="text-center p-2">Pro Team</th>
                <th className="text-center p-2">Business</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <React.Fragment key={index}>
                  <tr className={feature.coreModules ? "" : "border-b"}>
                    <td className="p-2 font-medium">{feature.name}</td>
                    <td className="p-2 text-center">
                      {renderFeatureValue(feature.starter)}
                    </td>
                    <td className="p-2 text-center">
                      {renderFeatureValue(feature.solo)}
                    </td>
                    <td className="p-2 text-center">
                      {renderFeatureValue(feature.pro)}
                    </td>
                    <td className="p-2 text-center">
                      {renderFeatureValue(feature.business)}
                    </td>
                  </tr>
                  
                  {/* Render core modules as sub-rows without dividers */}
                  {feature.coreModules && feature.coreModules.map((module, moduleIndex) => (
                    <tr 
                      key={`${index}-module-${moduleIndex}`} 
                      className={`bg-gray-50 ${moduleIndex === feature.coreModules.length - 1 ? "border-b" : ""}`}
                    >
                      <td className="p-2 pl-6 text-sm text-gray-700">
                        • {module.name}
                      </td>
                      <td className="p-2 text-center">
                        {renderFeatureValue(module.starter)}
                      </td>
                      <td className="p-2 text-center">
                        {renderFeatureValue(module.solo)}
                      </td>
                      <td className="p-2 text-center">
                        {renderFeatureValue(module.pro)}
                      </td>
                      <td className="p-2 text-center">
                        {renderFeatureValue(module.business)}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
