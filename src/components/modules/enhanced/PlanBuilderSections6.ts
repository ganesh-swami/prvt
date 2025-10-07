import { PlanSection } from './PlanBuilderSectionsComplete';

// Remaining sections 14-22
export const planSections6: PlanSection[] = [
  {
    id: 'partnerships',
    title: 'Partnerships & Ecosystem Development',
    completed: false,
    fields: [
      {
        id: 'key-partnerships',
        label: 'Key Partnerships',
        type: 'textarea',
        placeholder: 'Strategic partners, suppliers, distribution partners...',
        tooltip: {
          title: 'Key Partnerships',
          description: 'Strategic relationships that enhance your business',
          explanation: 'Suppliers, distributors, technology partners, strategic alliances',
          justification: 'Partnerships extend capabilities and accelerate growth'
        }
      },
      {
        id: 'ecosystem-strategy',
        label: 'Ecosystem Strategy',
        type: 'textarea',
        placeholder: 'How you build and leverage your business ecosystem...',
        tooltip: {
          title: 'Ecosystem Strategy',
          description: 'Your approach to building a business ecosystem',
          explanation: 'Network of partners, platforms, and stakeholders that create value together',
          justification: 'Strong ecosystems create competitive moats and network effects'
        }
      }
    ]
  },
  {
    id: 'go-to-market',
    title: 'Go-To-Market & Business Development Strategy',
    completed: false,
    fields: [
      {
        id: 'gtm-strategy',
        label: 'Go-To-Market Strategy',
        type: 'textarea',
        placeholder: 'Launch strategy, customer acquisition, sales process...',
        tooltip: {
          title: 'Go-To-Market Strategy',
          description: 'How you bring your product to market',
          explanation: 'Launch plan, customer acquisition strategy, sales process, distribution',
          justification: 'Effective GTM strategy determines market entry success'
        }
      },
      {
        id: 'business-development',
        label: 'Business Development',
        type: 'textarea',
        placeholder: 'Partnership development, strategic initiatives...',
        tooltip: {
          title: 'Business Development',
          description: 'Strategic initiatives to grow the business',
          explanation: 'Partnership development, new market entry, strategic initiatives',
          justification: 'Business development creates new growth opportunities'
        }
      }
    ]
  },
  {
    id: 'operations',
    title: 'Operations, Delivery, and Organization',
    completed: false,
    fields: [
      {
        id: 'operations-model',
        label: 'Operations Model',
        type: 'textarea',
        placeholder: 'How you deliver your product/service...',
        tooltip: {
          title: 'Operations Model',
          description: 'How you deliver your products or services',
          explanation: 'Production, delivery, quality control, supply chain management',
          justification: 'Efficient operations ensure quality delivery and profitability'
        }
      }
    ]
  }
];