import { PlanSection } from './PlanBuilderSections';

export const additionalPlanSections: PlanSection[] = [
  {
    id: 'problem',
    title: 'Problem & Value Proposition',
    completed: false,
    fields: [
      {
        id: 'problem',
        label: 'Problem Statement',
        type: 'textarea',
        placeholder: 'Describe the core problem your solution addresses...',
        tooltip: {
          title: 'Problem Statement',
          description: 'Clear articulation of the problem you\'re solving',
          explanation: 'Should be specific, measurable, and resonate with your target market',
          justification: 'Foundation for your entire business - everything else builds from here'
        }
      },
      {
        id: 'solution',
        label: 'Solution Overview',
        type: 'textarea',
        placeholder: 'How does your solution address this problem...',
        tooltip: {
          title: 'Solution Overview',
          description: 'High-level description of your solution',
          explanation: 'Focus on benefits and outcomes, not just features',
          justification: 'Demonstrates clear connection between problem and solution'
        }
      },
      {
        id: 'value-prop',
        label: 'Value Proposition',
        type: 'textarea',
        placeholder: 'What unique value do you provide...',
        tooltip: {
          title: 'Value Proposition',
          description: 'The unique value you deliver to customers',
          explanation: 'Should differentiate you from alternatives and quantify benefits',
          justification: 'Core message that drives customer acquisition and retention'
        }
      }
    ]
  },
  {
    id: 'stakeholders',
    title: 'Key Stakeholders',
    completed: false,
    fields: [
      {
        id: 'internal-stakeholders',
        label: 'Internal Stakeholders',
        type: 'textarea',
        placeholder: 'Founders, employees, investors, board members...',
        tooltip: {
          title: 'Internal Stakeholders',
          description: 'People within your organization who have a vested interest',
          explanation: 'Include roles, responsibilities, and influence levels',
          justification: 'Understanding internal dynamics is crucial for execution'
        }
      },
      {
        id: 'external-stakeholders',
        label: 'External Stakeholders',
        type: 'textarea',
        placeholder: 'Customers, suppliers, partners, regulators...',
        tooltip: {
          title: 'External Stakeholders',
          description: 'External parties who affect or are affected by your business',
          explanation: 'Map influence vs. interest to prioritize engagement strategies',
          justification: 'External support is critical for sustainable success'
        }
      }
    ]
  },
  {
    id: 'customer-segmentation',
    title: 'Customer Segmentation & Personas',
    completed: false,
    fields: [
      {
        id: 'customer-segments',
        label: 'Customer Segments',
        type: 'textarea',
        placeholder: 'Primary and secondary customer segments...',
        tooltip: {
          title: 'Customer Segments',
          description: 'Distinct groups of customers with similar needs',
          explanation: 'Segment by demographics, psychographics, behavior, or needs',
          justification: 'Enables targeted marketing and product development'
        }
      },
      {
        id: 'buyer-personas',
        label: 'Buyer Personas',
        type: 'textarea',
        placeholder: 'Detailed profiles of ideal customers...',
        tooltip: {
          title: 'Buyer Personas',
          description: 'Detailed profiles representing your ideal customers',
          explanation: 'Include demographics, pain points, goals, and buying behavior',
          justification: 'Guides product development, marketing, and sales strategies'
        }
      },
      {
        id: 'customer-needs',
        label: 'Customer Needs & Pain Points',
        type: 'textarea',
        placeholder: 'What needs do you address? What pains do you solve?...',
        tooltip: {
          title: 'Customer Needs & Pain Points',
          description: 'Specific needs and problems your customers experience',
          explanation: 'Prioritize by severity, frequency, and willingness to pay',
          justification: 'Ensures product-market fit and value proposition alignment'
        }
      },
      {
        id: 'buying-behavior',
        label: 'Buying Behavior',
        type: 'textarea',
        placeholder: 'How do customers research, evaluate, and purchase?...',
        tooltip: {
          title: 'Buying Behavior',
          description: 'How your customers make purchasing decisions',
          explanation: 'Map the customer journey from awareness to purchase',
          justification: 'Optimizes sales process and marketing touchpoints'
        }
      }
    ]
  }
];