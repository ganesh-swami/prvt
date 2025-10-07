import { PlanSection } from './PlanBuilderSectionsComplete';

// Final sections 15-22
export const planSections5: PlanSection[] = [
  {
    id: 'business-model',
    title: 'Business Model & Pricing Strategy',
    completed: false,
    fields: [
      {
        id: 'business-model',
        label: 'Business Model',
        type: 'textarea',
        placeholder: 'How you create, deliver and capture value...',
        tooltip: {
          title: 'Business Model',
          description: 'How your business creates and captures value',
          explanation: 'Revenue streams, cost structure, key activities, resources, partnerships',
          justification: 'Defines how you make money and create sustainable value'
        }
      },
      {
        id: 'pricing-strategy',
        label: 'Pricing Strategy',
        type: 'textarea',
        placeholder: 'Pricing model, rationale, and competitive positioning...',
        tooltip: {
          title: 'Pricing Strategy',
          description: 'How you price your products/services',
          explanation: 'Pricing model, price points, value-based vs cost-based pricing',
          justification: 'Pricing directly impacts revenue, profitability, and market positioning'
        }
      }
    ]
  },
  {
    id: 'marketing-branding',
    title: 'Marketing & Branding Strategy',
    completed: false,
    fields: [
      {
        id: 'brand-strategy',
        label: 'Brand Strategy',
        type: 'textarea',
        placeholder: 'Brand positioning, values, and differentiation...',
        tooltip: {
          title: 'Brand Strategy',
          description: 'How you build and position your brand',
          explanation: 'Brand values, personality, positioning, messaging strategy',
          justification: 'Strong brands command premium pricing and customer loyalty'
        }
      },
      {
        id: 'marketing-channels',
        label: 'Marketing Channels',
        type: 'textarea',
        placeholder: 'Digital marketing, partnerships, events, PR...',
        tooltip: {
          title: 'Marketing Channels',
          description: 'How you reach and acquire customers',
          explanation: 'Digital marketing, content marketing, partnerships, events, PR',
          justification: 'Effective marketing channels drive customer acquisition and growth'
        }
      }
    ]
  },
  {
    id: 'technology-innovation',
    title: 'Technology & Innovation',
    completed: false,
    fields: [
      {
        id: 'technology-stack',
        label: 'Technology Stack',
        type: 'textarea',
        placeholder: 'Core technologies, platforms, and infrastructure...',
        tooltip: {
          title: 'Technology Stack',
          description: 'Technology foundation of your business',
          explanation: 'Core technologies, platforms, infrastructure, development approach',
          justification: 'Technology choices impact scalability, costs, and competitive advantage'
        }
      }
    ]
  }
];