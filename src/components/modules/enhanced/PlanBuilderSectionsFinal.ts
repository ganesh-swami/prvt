import { PlanSection } from './PlanBuilderSectionsComplete';

// Final sections 20-22
export const planSectionsFinal: PlanSection[] = [
  {
    id: 'kpis-impact',
    title: 'KPIs & Impact Measurement',
    completed: false,
    fields: [
      {
        id: 'key-metrics',
        label: 'Key Performance Indicators',
        type: 'textarea',
        placeholder: 'Financial, operational, and impact metrics you will track...',
        tooltip: {
          title: 'Key Performance Indicators',
          description: 'Metrics to measure business performance',
          explanation: 'Financial KPIs, operational metrics, customer metrics, impact indicators',
          justification: 'KPIs enable performance monitoring and data-driven decision making'
        }
      },
      {
        id: 'impact-measurement',
        label: 'Impact Measurement',
        type: 'textarea',
        placeholder: 'How you measure social and environmental impact...',
        tooltip: {
          title: 'Impact Measurement',
          description: 'Methods to measure your social and environmental impact',
          explanation: 'Impact metrics, measurement frameworks, reporting standards',
          justification: 'Impact measurement demonstrates value creation beyond profit'
        }
      }
    ]
  },
  {
    id: 'esg-compliance',
    title: 'ESG & Compliance',
    completed: false,
    fields: [
      {
        id: 'esg-strategy',
        label: 'ESG Strategy',
        type: 'textarea',
        placeholder: 'Environmental, Social, and Governance commitments...',
        tooltip: {
          title: 'ESG Strategy',
          description: 'Your Environmental, Social, and Governance approach',
          explanation: 'Environmental impact, social responsibility, governance practices',
          justification: 'ESG considerations are increasingly important for stakeholders and investors'
        }
      },
      {
        id: 'compliance-framework',
        label: 'Compliance Framework',
        type: 'textarea',
        placeholder: 'Regulatory compliance and governance structures...',
        tooltip: {
          title: 'Compliance Framework',
          description: 'How you ensure regulatory and ethical compliance',
          explanation: 'Regulatory requirements, compliance processes, governance structures',
          justification: 'Strong compliance framework reduces legal and reputational risks'
        }
      }
    ]
  },
  {
    id: 'change-management',
    title: 'Change Management & Scalability Plan',
    completed: false,
    fields: [
      {
        id: 'scalability-plan',
        label: 'Scalability Plan',
        type: 'textarea',
        placeholder: 'How you will scale operations, team, and systems...',
        tooltip: {
          title: 'Scalability Plan',
          description: 'How you will scale your business as it grows',
          explanation: 'Scaling operations, team, technology, processes, and culture',
          justification: 'Scalability planning ensures sustainable growth without breaking systems'
        }
      }
    ]
  },
  {
    id: 'exit-strategy',
    title: 'Exit Strategy (if for investors)',
    completed: false,
    fields: [
      {
        id: 'exit-options',
        label: 'Exit Options',
        type: 'textarea',
        placeholder: 'IPO, acquisition, management buyout scenarios...',
        tooltip: {
          title: 'Exit Strategy',
          description: 'Potential exit scenarios for investors',
          explanation: 'IPO, strategic acquisition, financial buyer, management buyout',
          justification: 'Exit strategy shows investors how they can realize returns on investment'
        }
      }
    ]
  }
];