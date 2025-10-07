import { PlanSection } from './PlanBuilderSectionsComplete';

// Final sections 17-22
export const planSections7: PlanSection[] = [
  {
    id: 'financial-projections',
    title: 'Financial Projections & Funding Strategy',
    completed: false,
    fields: [
      {
        id: 'financial-projections',
        label: 'Financial Projections',
        type: 'textarea',
        placeholder: '3-5 year revenue, costs, and profitability projections...',
        tooltip: {
          title: 'Financial Projections',
          description: 'Detailed financial forecasts for your business',
          explanation: '3-5 year projections of revenue, costs, cash flow, and profitability',
          justification: 'Financial projections demonstrate business viability and funding needs'
        }
      },
      {
        id: 'funding-strategy',
        label: 'Funding Strategy',
        type: 'textarea',
        placeholder: 'Funding requirements, sources, and timeline...',
        tooltip: {
          title: 'Funding Strategy',
          description: 'How you will finance business growth',
          explanation: 'Funding requirements, sources (equity, debt, grants), timeline, use of funds',
          justification: 'Clear funding strategy shows how you will finance growth and operations'
        }
      }
    ]
  },
  {
    id: 'product-strategy',
    title: 'Product Strategy & Roadmap',
    completed: false,
    fields: [
      {
        id: 'product-roadmap',
        label: 'Product Roadmap',
        type: 'textarea',
        placeholder: 'Product development timeline and key milestones...',
        tooltip: {
          title: 'Product Roadmap',
          description: 'Timeline for product development and enhancement',
          explanation: 'Key features, development phases, release timeline, resource requirements',
          justification: 'Product roadmap guides development priorities and resource allocation'
        }
      }
    ]
  },
  {
    id: 'risk-register',
    title: 'Risk Register & Mitigations',
    completed: false,
    fields: [
      {
        id: 'key-risks',
        label: 'Key Risks',
        type: 'textarea',
        placeholder: 'Market, operational, financial, and regulatory risks...',
        tooltip: {
          title: 'Key Risks',
          description: 'Major risks that could impact your business',
          explanation: 'Market risks, operational risks, financial risks, regulatory risks',
          justification: 'Risk identification enables proactive management and mitigation'
        }
      },
      {
        id: 'mitigation-strategies',
        label: 'Mitigation Strategies',
        type: 'textarea',
        placeholder: 'How you will address and mitigate each risk...',
        tooltip: {
          title: 'Mitigation Strategies',
          description: 'Plans to address identified risks',
          explanation: 'Specific actions to reduce probability or impact of each risk',
          justification: 'Risk mitigation strategies demonstrate preparedness and resilience'
        }
      }
    ]
  }
];