import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Info } from "lucide-react";

interface CustomTooltipProps {
  title: string;
  description: string;
  explanation?: string;
  justification?: string;
  children?: React.ReactNode;
  variant?: "info" | "help";
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  title,
  description,
  explanation,
  justification,
  children,
  variant = "help",
}) => {
  const Icon = variant === "info" ? Info : HelpCircle;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || (
            <Icon className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
          )}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">{title}</h4>
            <p className="text-xs text-gray-600">{description}</p>
            {explanation && (
              <div>
                <p className="text-xs font-medium text-blue-600 mb-1">
                  Explanation:
                </p>
                <p className="text-xs text-gray-600">{explanation}</p>
              </div>
            )}
            {justification && (
              <div>
                <p className="text-xs font-medium text-green-600 mb-1">
                  Why it matters:
                </p>
                <p className="text-xs text-gray-600">{justification}</p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
