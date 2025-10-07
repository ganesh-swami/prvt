import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Calculator, BookOpen, TrendingUp } from 'lucide-react';

const CalculationMethods: React.FC = () => {
  const calculationSections = [
    {
      title: "Revenue & Growth Calculations",
      icon: <TrendingUp className="h-5 w-5" />,
      methods: [
        {
          name: "Monthly Revenue Growth",
          formula: "Revenue(month) = Initial Revenue × (1 + Growth Rate)^(month-1)",
          description: "Compound growth calculation for each month",
          example: "Month 3 with 5% growth: $10,000 × (1.05)^2 = $11,025",
          justification: "Uses compound growth model reflecting realistic business scaling"
        },
        {
          name: "Total Revenue",
          formula: "Sum of all monthly revenues over projection period",
          description: "Cumulative revenue across all months",
          example: "12 months of growing revenue summed together",
          justification: "Provides total revenue for profitability analysis"
        }
      ]
    },
    {
      title: "Cost Calculations",
      icon: <Calculator className="h-5 w-5" />,
      methods: [
        {
          name: "Cost of Goods Sold (COGS)",
          formula: "COGS = Revenue × COGS Percentage",
          description: "Variable costs directly tied to revenue",
          example: "Revenue $10,000 × 30% COGS = $3,000",
          justification: "Scales with revenue, reflecting direct production costs"
        },
        {
          name: "Operating Expenses",
          formula: "OpEx = Staff Costs + Marketing + Admin (monthly)",
          description: "Fixed monthly operational expenses",
          example: "$5,000 staff + $2,000 marketing + $1,000 admin = $8,000",
          justification: "Fixed costs remain constant regardless of revenue"
        }
      ]
    },
    {
      title: "Profitability Metrics",
      icon: <BookOpen className="h-5 w-5" />,
      methods: [
        {
          name: "Gross Profit",
          formula: "Gross Profit = Revenue - COGS",
          description: "Profit before operating expenses",
          example: "$10,000 revenue - $3,000 COGS = $7,000",
          justification: "Shows profitability of core business model"
        },
        {
          name: "EBITDA",
          formula: "EBITDA = Gross Profit - Operating Expenses",
          description: "Earnings before interest, taxes, depreciation, amortization",
          example: "$7,000 gross profit - $8,000 OpEx = -$1,000",
          justification: "Operating performance excluding financing and accounting decisions"
        },
        {
          name: "Net Profit",
          formula: "Net Profit = EBITDA - Taxes",
          description: "Final profit after all expenses and taxes",
          example: "$2,000 EBITDA - $500 taxes = $1,500",
          justification: "Bottom line profitability for shareholders"
        }
      ]
    },
    {
      title: "Cash Flow Analysis",
      icon: <TrendingUp className="h-5 w-5" />,
      methods: [
        {
          name: "Operating Cash Flow",
          formula: "OCF = Net Profit + Non-cash expenses + Investment amortization",
          description: "Cash generated from operations",
          example: "$1,500 net profit + $500 investment portion = $2,000",
          justification: "Shows actual cash generation from business operations"
        },
        {
          name: "Free Cash Flow",
          formula: "FCF = Operating Cash Flow - Capital Investments",
          description: "Cash available after necessary investments",
          example: "$2,000 OCF - $500 monthly investment = $1,500",
          justification: "Cash available for growth, dividends, or debt repayment"
        }
      ]
    },
    {
      title: "Advanced Ratios",
      icon: <Calculator className="h-5 w-5" />,
      methods: [
        {
          name: "Gross Margin",
          formula: "Gross Margin = (Gross Profit ÷ Revenue) × 100",
          description: "Percentage of revenue retained after COGS",
          example: "($7,000 ÷ $10,000) × 100 = 70%",
          justification: "Indicates pricing power and production efficiency"
        },
        {
          name: "Return on Investment (ROI)",
          formula: "ROI = (Net Profit ÷ Total Investment) × 100",
          description: "Investment efficiency measurement",
          example: "($18,000 profit ÷ $50,000 investment) × 100 = 36%",
          justification: "Compares profit generated to capital invested"
        },
        {
          name: "Break-Even Analysis",
          formula: "Break-Even Month = First month where Net Profit > 0",
          description: "When business becomes profitable",
          example: "Month 6 when revenue exceeds all costs",
          justification: "Critical milestone for business viability"
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-blue-600" />
        <h3 className="text-xl font-semibold">Calculation Methods & Formulas</h3>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Financial Model Methodology</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Our financial model uses industry-standard calculations with compound growth projections, 
            variable cost modeling, and comprehensive cash flow analysis. All metrics follow GAAP 
            principles where applicable.
          </p>
          <div className="flex gap-2">
            <Badge variant="outline">GAAP Compliant</Badge>
            <Badge variant="outline">Industry Standard</Badge>
            <Badge variant="outline">Compound Growth</Badge>
          </div>
        </CardContent>
      </Card>

      <Accordion type="single" collapsible className="space-y-2">
        {calculationSections.map((section, index) => (
          <AccordionItem key={index} value={`section-${index}`}>
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                {section.icon}
                <span className="font-semibold">{section.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {section.methods.map((method, methodIndex) => (
                  <Card key={methodIndex} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-lg">{method.name}</h4>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-mono text-sm font-semibold text-blue-700">
                            {method.formula}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm"><strong>Example:</strong> {method.example}</p>
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Justification:</strong> {method.justification}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default CalculationMethods;