import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTooltip } from "@/components/common/CustomTooltip";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";

const ProblemTreeAnalytics: React.FC = () => {
  const severityLevels = [
    {
      level: "Critical",
      percentage: 25,
      color: "bg-red-500",
      description: "Immediate intervention required",
    },
    {
      level: "High",
      percentage: 35,
      color: "bg-orange-500",
      description: "Priority for next phase",
    },
    {
      level: "Medium",
      percentage: 30,
      color: "bg-yellow-500",
      description: "Address when resources allow",
    },
    {
      level: "Low",
      percentage: 10,
      color: "bg-green-500",
      description: "Monitor and maintain",
    },
  ];

  const interventionReadiness = [
    {
      category: "Ready to Implement",
      count: 3,
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      category: "Needs Planning",
      count: 5,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      category: "Requires Research",
      count: 2,
      icon: AlertCircle,
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Problem Severity Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <CardTitle>Problem Severity Analysis</CardTitle>
            <CustomTooltip
              title=""
              description="Quantifies the severity of different problem aspects to guide resource allocation. Critical issues need immediate attention, while lower severity problems can be addressed in later phases. This analysis ensures systematic problem-solving approach."
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {severityLevels.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{item.level}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.percentage}%
                  </span>
                </div>
                <Progress value={item.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Intervention Readiness Dashboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-purple-600" />
            <CardTitle>Intervention Readiness</CardTitle>
            <CustomTooltip
              title=""
              description="Assesses how ready different interventions are for implementation. This helps sequence your actions and identify where additional preparation is needed. Essential for project planning and timeline development."
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {interventionReadiness.map((item, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <item.icon className={`h-8 w-8 mx-auto mb-2 ${item.color}`} />
                <div className="text-2xl font-bold">{item.count}</div>
                <div className="text-sm text-muted-foreground">
                  {item.category}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stakeholder Impact Assessment */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <CardTitle>Stakeholder Impact Assessment</CardTitle>
            <CustomTooltip
              title=""
              description="Maps how different stakeholders are affected by the problem and potential solutions. Understanding stakeholder impact is crucial for building support, managing resistance, and ensuring sustainable implementation of interventions."
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              "Direct Beneficiaries",
              "Community Leaders",
              "Government Agencies",
              "Partner Organizations",
              "Investors/Funders",
            ].map((stakeholder, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <span className="font-medium">{stakeholder}</span>
                <div className="flex gap-2">
                  <Badge
                    variant={
                      index < 2
                        ? "destructive"
                        : index < 4
                        ? "secondary"
                        : "default"
                    }
                  >
                    {index < 2
                      ? "High Impact"
                      : index < 4
                      ? "Medium Impact"
                      : "Low Impact"}
                  </Badge>
                  <Badge variant="outline">
                    {index % 2 === 0 ? "Supporter" : "Neutral"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Solution Pathway Indicators */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <CardTitle>Solution Pathway Indicators</CardTitle>
            <CustomTooltip
              title=""
              description="Key metrics to track progress in addressing root causes. These indicators help measure whether interventions are working and guide course corrections. Essential for impact measurement and continuous improvement."
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Leading Indicators</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Resource Mobilization</span>
                  <Badge variant="secondary">75%</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Stakeholder Engagement</span>
                  <Badge variant="secondary">60%</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Capacity Building</span>
                  <Badge variant="secondary">45%</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Lagging Indicators</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Problem Reduction</span>
                  <Badge variant="outline">30%</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Beneficiary Outcomes</span>
                  <Badge variant="outline">25%</Badge>
                </div>
                <div className="flex justify-between">
                  <span>System Change</span>
                  <Badge variant="outline">15%</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProblemTreeAnalytics;
