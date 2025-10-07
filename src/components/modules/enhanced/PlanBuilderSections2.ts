import { PlanSection } from './PlanBuilderSectionsComplete';

// Sections 4-12
export const planSections2: PlanSection[] = [
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
        id: 'primary-stakeholders',
        label: 'Primary Stakeholders',
        type: 'textarea',
        placeholder: 'Customers, investors, employees, partners...',
        tooltip: {
          title: 'Primary Stakeholders',
          description: 'Key groups directly impacted by your business',
          explanation: 'Include customers, investors, employees, key partners',
          justification: 'Understanding stakeholder needs drives strategic decisions'
        }
      },
      {
        id: 'stakeholder-needs',
        label: 'Stakeholder Needs & Expectations',
        type: 'textarea',
        placeholder: 'What each stakeholder group expects from your business...',
        tooltip: {
          title: 'Stakeholder Needs',
          description: 'Specific needs and expectations of each stakeholder group',
          explanation: 'Map what each group wants and how you will deliver',
          justification: 'Ensures balanced approach to value creation for all parties'
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
        id: 'target-segments',
        label: 'Target Customer Segments',
        type: 'textarea',
        placeholder: 'Define your primary and secondary customer segments...',
        tooltip: {
          title: 'Customer Segments',
          description: 'Distinct groups of customers with similar needs',
          explanation: 'Segment by demographics, behavior, needs, or value',
          justification: 'Enables targeted marketing and product development'
        }
      }
    ]
  }
];