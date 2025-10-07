import { PlanSection } from './PlanBuilderSectionsComplete';

// Sections 7-12
export const planSections3: PlanSection[] = [
  {
    id: 'pestel',
    title: 'PESTEL Analysis',
    completed: false,
    fields: [
      {
        id: 'political',
        label: 'Political Factors',
        type: 'textarea',
        placeholder: 'Government policies, regulations, political stability...',
        tooltip: {
          title: 'Political Factors',
          description: 'Political environment affecting your business',
          explanation: 'Government policies, regulations, tax policies, political stability',
          justification: 'Identifies external political risks and opportunities'
        }
      },
      {
        id: 'economic',
        label: 'Economic Factors',
        type: 'textarea',
        placeholder: 'Economic growth, inflation, interest rates, exchange rates...',
        tooltip: {
          title: 'Economic Factors',
          description: 'Economic conditions impacting your business',
          explanation: 'GDP growth, inflation, interest rates, unemployment, exchange rates',
          justification: 'Understanding economic context helps predict market conditions'
        }
      },
      {
        id: 'social',
        label: 'Social Factors',
        type: 'textarea',
        placeholder: 'Demographics, lifestyle changes, cultural trends...',
        tooltip: {
          title: 'Social Factors',
          description: 'Social and cultural factors affecting demand',
          explanation: 'Demographics, lifestyle changes, cultural attitudes, education levels',
          justification: 'Social trends drive customer behavior and market demand'
        }
      },
      {
        id: 'technological',
        label: 'Technological Factors',
        type: 'textarea',
        placeholder: 'Technology trends, R&D activity, automation, innovation...',
        tooltip: {
          title: 'Technological Factors',
          description: 'Technology trends impacting your industry',
          explanation: 'Innovation rate, technology adoption, R&D spending, automation',
          justification: 'Technology changes can create opportunities or threats'
        }
      },
      {
        id: 'environmental',
        label: 'Environmental Factors',
        type: 'textarea',
        placeholder: 'Climate change, sustainability, environmental regulations...',
        tooltip: {
          title: 'Environmental Factors',
          description: 'Environmental considerations affecting business',
          explanation: 'Climate change, sustainability requirements, environmental regulations',
          justification: 'Growing importance of environmental responsibility in business'
        }
      },
      {
        id: 'legal',
        label: 'Legal Factors',
        type: 'textarea',
        placeholder: 'Laws, regulations, compliance requirements...',
        tooltip: {
          title: 'Legal Factors',
          description: 'Legal framework governing your business',
          explanation: 'Industry regulations, employment law, health & safety, data protection',
          justification: 'Legal compliance is essential for business operations'
        }
      }
    ]
  }
];