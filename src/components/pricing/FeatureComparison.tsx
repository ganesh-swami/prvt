import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";

interface Feature {
  name: string;
  starter: boolean | string;
  solo: boolean | string;
  pro: boolean | string;
  business: boolean | string;
}

const features: Feature[] = [
  { name: "Core Modules", starter: true, solo: true, pro: true, business: true },
  { name: "Projects", starter: "1", solo: "3", pro: "Unlimited", business: "Unlimited" },
  { name: "PDF Export", starter: true, solo: true, pro: true, business: true },
  { name: "PPT Export", starter: false, solo: true, pro: true, business: true },
  { name: "Team Collaboration", starter: false, solo: false, pro: true, business: true },
  { name: "AI Analyst", starter: false, solo: false, pro: "1M credits", business: "3M credits" },
  { name: "Investor Room", starter: false, solo: false, pro: true, business: true },
  { name: "ESG Compliance", starter: false, solo: false, pro: true, business: true },
  { name: "Advanced Integrations", starter: false, solo: false, pro: false, business: true },
];

export function FeatureComparison() {
  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
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
                <tr key={index} className="border-b">
                  <td className="p-2 font-medium">{feature.name}</td>
                  <td className="p-2 text-center">{renderFeatureValue(feature.starter)}</td>
                  <td className="p-2 text-center">{renderFeatureValue(feature.solo)}</td>
                  <td className="p-2 text-center">{renderFeatureValue(feature.pro)}</td>
                  <td className="p-2 text-center">{renderFeatureValue(feature.business)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}