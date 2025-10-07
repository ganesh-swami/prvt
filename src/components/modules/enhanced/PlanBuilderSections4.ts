import { PlanSection } from './PlanBuilderSectionsComplete';

// Sections 8-14
export const planSections4: PlanSection[] = [
  {
    id: 'market-analysis',
    title: 'Market Analysis',
    completed: false,
    fields: [
      {
        id: 'market-size',
        label: 'Market Size & Growth',
        type: 'textarea',
        placeholder: 'TAM, SAM, SOM and growth projections...',
        tooltip: {
          title: 'Market Size & Growth',
          description: 'Quantify your market opportunity',
          explanation: 'Total Addressable Market (TAM), Serviceable Available Market (SAM), Serviceable Obtainable Market (SOM)',
          justification: 'Demonstrates market opportunity size to investors and guides strategy'
        }
      },
      {
        id: 'market-trends',
        label: 'Market Trends',
        type: 'textarea',
        placeholder: 'Key trends driving market growth and change...',
        tooltip: {
          title: 'Market Trends',
          description: 'Key trends shaping your market',
          explanation: 'Technology trends, consumer behavior changes, regulatory shifts',
          justification: 'Understanding trends helps position for future opportunities'
        }
      }
    ]
  },
  {
    id: 'competitive-landscape',
    title: 'Competitive Landscape & Differentiation',
    completed: false,
    fields: [
      {
        id: 'competitors',
        label: 'Key Competitors',
        type: 'textarea',
        placeholder: 'Direct and indirect competitors, their strengths and weaknesses...',
        tooltip: {
          title: 'Key Competitors',
          description: 'Analysis of your main competitors',
          explanation: 'Include direct competitors, indirect competitors, and substitutes',
          justification: 'Understanding competition helps identify opportunities and threats'
        }
      },
      {
        id: 'competitive-advantage',
        label: 'Competitive Advantage',
        type: 'textarea',
        placeholder: 'What makes you unique and defensible...',
        tooltip: {
          title: 'Competitive Advantage',
          description: 'Your unique positioning vs competitors',
          explanation: 'Sustainable advantages that are hard to replicate',
          justification: 'Competitive moats protect market position and profitability'
        }
      },
      {
        id: 'positioning',
        label: 'Market Positioning',
        type: 'textarea',
        placeholder: 'How you position yourself in the market...',
        tooltip: {
          title: 'Market Positioning',
          description: 'Your strategic position in the competitive landscape',
          explanation: 'How customers perceive you relative to alternatives',
          justification: 'Clear positioning drives customer choice and premium pricing'
        }
      }
    ]
  },
  {
    id: 'swot',
    title: 'SWOT Analysis',
    completed: false,
    fields: [
      {
        id: 'strengths',
        label: 'Strengths',
        type: 'textarea',
        placeholder: 'Internal advantages and capabilities...',
        tooltip: {
          title: 'Strengths',
          description: 'Internal factors that give you an advantage',
          explanation: 'Resources, capabilities, assets that competitors lack',
          justification: 'Leverage strengths for competitive advantage'
        }
      },
      {
        id: 'weaknesses',
        label: 'Weaknesses',
        type: 'textarea',
        placeholder: 'Internal limitations and areas for improvement...',
        tooltip: {
          title: 'Weaknesses',
          description: 'Internal factors that put you at a disadvantage',
          explanation: 'Resource gaps, capability limitations, areas needing improvement',
          justification: 'Address weaknesses to reduce vulnerabilities'
        }
      },
      {
        id: 'opportunities',
        label: 'Opportunities',
        type: 'textarea',
        placeholder: 'External factors that could benefit your business...',
        tooltip: {
          title: 'Opportunities',
          description: 'External factors that could provide advantages',
          explanation: 'Market trends, regulatory changes, technology advances',
          justification: 'Capitalize on opportunities for growth'
        }
      },
      {
        id: 'threats',
        label: 'Threats',
        type: 'textarea',
        placeholder: 'External factors that could harm your business...',
        tooltip: {
          title: 'Threats',
          description: 'External factors that could cause problems',
          explanation: 'Competition, market changes, regulatory risks',
          justification: 'Mitigate threats to protect business'
        }
      }
    ]
  }
];