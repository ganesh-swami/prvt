import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CustomTooltip } from "@/components/common/CustomTooltip";
import { Network, Grid3X3 } from "lucide-react";

interface EnhancedStakeholder {
  id: string;
  name: string;
  type: string;
  influence: "High" | "Medium" | "Low";
  interest: "High" | "Medium" | "Low";
  relationship: "Supportive" | "Neutral" | "Opposing";
  relationshipStrength: number;
  engagementLevel: "Active" | "Moderate" | "Minimal" | "None";
  riskLevel: "High" | "Medium" | "Low";
  description: string;
}

interface NetworkVisualizationProps {
  stakeholders: EnhancedStakeholder[];
}

const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({
  stakeholders,
}) => {
  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case "Supportive":
        return "bg-green-500";
      case "Neutral":
        return "bg-yellow-500";
      case "Opposing":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getInfluenceSize = (influence: string) => {
    switch (influence) {
      case "High":
        return "w-16 h-16 text-xs";
      case "Medium":
        return "w-12 h-12 text-xs";
      case "Low":
        return "w-8 h-8 text-xs";
      default:
        return "w-10 h-10 text-xs";
    }
  };

  const getPositionByInfluenceInterest = (
    influence: string,
    interest: string
  ) => {
    const influenceMap = { High: 2, Medium: 1, Low: 0 };
    const interestMap = { High: 2, Medium: 1, Low: 0 };
    return {
      x: interestMap[interest] * 33.33,
      y: (2 - influenceMap[influence]) * 33.33,
    };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-blue-600" />
            <CardTitle>Ecosystem Network Map</CardTitle>
            <CustomTooltip content="Visual representation of stakeholder relationships. Size indicates influence level, color shows relationship stance. Supportive (green) stakeholders are allies, opposing (red) need careful management." />
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gray-50 rounded-lg p-8 h-96 overflow-hidden">
            <div className="absolute inset-4">
              {stakeholders.map((stakeholder) => {
                const position = getPositionByInfluenceInterest(
                  stakeholder.influence,
                  stakeholder.interest
                );
                return (
                  <div
                    key={stakeholder.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                    }}
                  >
                    <div
                      className={`${getInfluenceSize(
                        stakeholder.influence
                      )} ${getRelationshipColor(
                        stakeholder.relationship
                      )} rounded-full flex items-center justify-center text-white font-medium shadow-lg cursor-pointer hover:scale-110 transition-transform`}
                      title={`${stakeholder.name} - ${stakeholder.relationship} - ${stakeholder.influence} Influence`}
                    >
                      {stakeholder.name
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="text-xs text-center mt-1 font-medium max-w-20 truncate">
                      {stakeholder.name}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Grid lines and labels */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 -rotate-90 text-sm font-medium text-gray-600">
                High Influence
              </div>
              <div className="absolute left-2 bottom-12 transform -rotate-90 text-sm font-medium text-gray-600">
                Low Influence
              </div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-600">
                High Interest
              </div>
              <div className="absolute bottom-2 left-20 text-sm font-medium text-gray-600">
                Low Interest
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm">Supportive</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Neutral</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm">Opposing</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-purple-600" />
            <CardTitle>Power-Interest Grid</CardTitle>
            <CustomTooltip content="Strategic stakeholder positioning matrix. Manage Closely (high power/interest), Keep Satisfied (high power/low interest), Keep Informed (low power/high interest), Monitor (low power/interest)." />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 h-80">
            {/* High Influence, Low Interest */}
            <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg bg-orange-50">
              <h4 className="font-medium text-orange-800 mb-2">
                Keep Satisfied
              </h4>
              <p className="text-xs text-orange-600 mb-2">
                High Influence, Low Interest
              </p>
              <div className="space-y-2">
                {stakeholders
                  .filter((s) => s.influence === "High" && s.interest === "Low")
                  .map((stakeholder) => (
                    <div
                      key={stakeholder.id}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={`w-3 h-3 ${getRelationshipColor(
                          stakeholder.relationship
                        )} rounded-full`}
                      ></div>
                      <span className="text-sm">{stakeholder.name}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* High Influence, High Interest */}
            <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg bg-red-50">
              <h4 className="font-medium text-red-800 mb-2">Manage Closely</h4>
              <p className="text-xs text-red-600 mb-2">
                High Influence, High Interest
              </p>
              <div className="space-y-2">
                {stakeholders
                  .filter(
                    (s) => s.influence === "High" && s.interest === "High"
                  )
                  .map((stakeholder) => (
                    <div
                      key={stakeholder.id}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={`w-3 h-3 ${getRelationshipColor(
                          stakeholder.relationship
                        )} rounded-full`}
                      ></div>
                      <span className="text-sm">{stakeholder.name}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Low Influence, Low Interest */}
            <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg bg-gray-50">
              <h4 className="font-medium text-gray-800 mb-2">Monitor</h4>
              <p className="text-xs text-gray-600 mb-2">
                Low Influence, Low Interest
              </p>
              <div className="space-y-2">
                {stakeholders
                  .filter((s) => s.influence === "Low" && s.interest === "Low")
                  .map((stakeholder) => (
                    <div
                      key={stakeholder.id}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={`w-3 h-3 ${getRelationshipColor(
                          stakeholder.relationship
                        )} rounded-full`}
                      ></div>
                      <span className="text-sm">{stakeholder.name}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Low Influence, High Interest */}
            <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg bg-blue-50">
              <h4 className="font-medium text-blue-800 mb-2">Keep Informed</h4>
              <p className="text-xs text-blue-600 mb-2">
                Low Influence, High Interest
              </p>
              <div className="space-y-2">
                {stakeholders
                  .filter((s) => s.influence === "Low" && s.interest === "High")
                  .map((stakeholder) => (
                    <div
                      key={stakeholder.id}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={`w-3 h-3 ${getRelationshipColor(
                          stakeholder.relationship
                        )} rounded-full`}
                      ></div>
                      <span className="text-sm">{stakeholder.name}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkVisualization;
