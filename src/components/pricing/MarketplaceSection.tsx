import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, Download, Search, Filter, FileText, BarChart3, Users, Target, DollarSign, TrendingUp, Shield, Lightbulb, Building, Zap, Globe, Heart, Briefcase } from 'lucide-react';
import { EnhancedTemplateDetail } from '@/components/templates/EnhancedTemplatePreview';
import { CurrencySelector } from './CurrencySelector';
import { formatCurrency, Currency } from '@/utils/currencyUtils';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number; // Price in EUR (base currency)
  rating: number;
  downloads: number;
  author: string;
  tags: string[];
  preview?: string;
  features?: string[];
}
const categories = [
  'All',
  'Pitch Deck',
  'GTM Strategy', 
  'Financial Model',
  'Business Plan',
  'Investor Update',
  'Market Analysis',
  'Operations',
  'HR & People',
  'Marketing',
  'Product Strategy',
  'Risk Management',
  'Legal & Compliance',
  'Sales Strategy'
];

// Complete template collection with prices in EUR (base currency)
const allTemplates: Template[] = [
  {
    id: 'startup-business-plan',
    name: 'Startup Business Plan Template',
    description: 'Complete business plan template for startups with executive summary, market analysis, financial projections, and funding requirements.',
    category: 'Business Plan',
    tags: ['Startup', 'Business Plan', 'Funding', 'Strategy'],
    price: 39, // EUR
    author: 'Synergize Team',
    downloads: 1856,
    rating: 4.8
  },
  {
    id: 'financial-projection-template',
    name: 'Financial Projection Template',
    description: '5-year financial projection template with revenue forecasting, expense planning, cash flow analysis, and scenario modeling.',
    category: 'Financial Model',
    tags: ['Financial Projections', 'Revenue', 'Cash Flow', 'Forecasting'],
    price: 29, // EUR
    author: 'Synergize Team',
    downloads: 1423,
    rating: 4.9
  },
  {
    id: 'investors-pitch-template',
    name: 'Investors Pitch Template',
    description: 'Professional investor pitch template with compelling storytelling, market opportunity, traction slides, and funding ask.',
    category: 'Pitch Deck',
    tags: ['Investors', 'Pitch Deck', 'Fundraising', 'Presentation'],
    price: 35, // EUR
    author: 'Synergize Team',
    downloads: 2341,
    rating: 4.7
  },
  {
    id: 'market-sizing-template',
    name: 'Market Sizing Template',
    description: 'Comprehensive market sizing template with TAM, SAM, SOM analysis, market research frameworks, and competitive landscape.',
    category: 'Market Analysis',
    tags: ['Market Sizing', 'TAM', 'SAM', 'Market Research'],
    price: 25, // EUR
    author: 'Synergize Team',
    downloads: 987,
    rating: 4.6
  },
  {
    id: 'quarterly-board-deck',
    name: 'Quarterly Board Deck Template',
    description: 'Comprehensive quarterly board presentation template with financial performance, strategic initiatives, and outlook.',
    category: 'Investor Update',
    tags: ['Board', 'Quarterly', 'Performance', 'Strategy'],
    price: 28, // EUR
    author: 'Synergize Team',
    downloads: 1456,
    rating: 4.6
  },
  {
    id: 'saas-business-plan',
    name: 'SaaS Business Plan Template',
    description: 'Comprehensive business plan template specifically designed for SaaS startups, including market analysis, financial projections, and growth strategies.',
    category: 'Business Plan',
    tags: ['SaaS', 'Business Plan', 'Startup', 'Strategy'],
    price: 49, // EUR
    author: 'Synergize Team',
    downloads: 1247,
    rating: 4.8
  },
  {
    id: 'gtm-launch-template',
    name: 'GTM Launch Strategy Template',
    description: 'Complete go-to-market strategy template with customer segmentation, positioning, pricing, and launch planning.',
    category: 'GTM Strategy',
    tags: ['GTM', 'Launch', 'Strategy', 'Market Entry'],
    price: 35, // EUR
    author: 'Synergize Team',
    downloads: 1876,
    rating: 4.8
  },
  {
    id: 'unit-economics-template',
    name: 'Unit Economics Template',
    description: 'Unit economics template with customer acquisition cost, lifetime value, payback period, and profitability analysis.',
    category: 'Financial Model',
    tags: ['Unit Economics', 'CAC', 'LTV', 'Profitability'],
    price: 22, // EUR
    author: 'Synergize Team',
    downloads: 1134,
    rating: 4.8
  },
  {
    id: 'monthly-investor-update',
    name: 'Monthly Investor Update Template',
    description: 'Professional monthly investor update template with KPIs, milestones, challenges, and funding runway.',
    category: 'Investor Update',
    tags: ['Investor', 'Monthly', 'KPIs', 'Updates'],
    price: 19, // EUR
    author: 'Synergize Team',
    downloads: 2341,
    rating: 4.9
  },
  {
    id: 'marketing-campaign-template',
    name: 'Marketing Campaign Template',
    description: 'Multi-channel marketing campaign template with strategy, execution plans, budget allocation, and ROI tracking.',
    category: 'Marketing',
    tags: ['Marketing', 'Campaigns', 'ROI', 'Strategy'],
    price: 31, // EUR
    author: 'Synergize Team',
    downloads: 1567,
    rating: 4.8
  },
  {
    id: 'product-roadmap-template',
    name: 'Product Roadmap Template',
    description: 'Strategic product roadmap template with feature prioritization, timeline planning, and stakeholder communication.',
    category: 'Product Strategy',
    tags: ['Product', 'Roadmap', 'Strategy', 'Planning'],
    price: 28, // EUR
    author: 'Synergize Team',
    downloads: 1289,
    rating: 4.9
  },
  {
    id: 'risk-assessment-template',
    name: 'Risk Assessment Template',
    description: 'Comprehensive risk assessment template with identification, analysis, mitigation strategies, and monitoring frameworks.',
    category: 'Risk Management',
    tags: ['Risk', 'Assessment', 'Mitigation', 'Compliance'],
    price: 26, // EUR
    author: 'Synergize Team',
    downloads: 723,
    rating: 4.5
  },
  {
    id: 'operations-playbook',
    name: 'Operations Playbook Template',
    description: 'Comprehensive operations playbook covering processes, workflows, team management, and operational excellence frameworks.',
    category: 'Operations',
    tags: ['Operations', 'Processes', 'Workflows', 'Management'],
    price: 32, // EUR
    author: 'Synergize Team',
    downloads: 643,
    rating: 4.6
  },
  {
    id: 'hr-onboarding-template',
    name: 'HR Onboarding Template',
    description: 'Complete employee onboarding template with checklists, training schedules, and performance tracking systems.',
    category: 'HR & People',
    tags: ['HR', 'Onboarding', 'Training', 'Performance'],
    price: 27, // EUR
    author: 'Synergize Team',
    downloads: 834,
    rating: 4.7
  },
  {
    id: 'legal-compliance-template',
    name: 'Legal Compliance Template',
    description: 'Legal compliance checklist and documentation template covering regulatory requirements and audit preparation.',
    category: 'Legal & Compliance',
    tags: ['Legal', 'Compliance', 'Regulatory', 'Audit'],
    price: 34, // EUR
    author: 'Synergize Team',
    downloads: 456,
    rating: 4.4
  },
  {
    id: 'sales-strategy-template',
    name: 'Sales Strategy Template',
    description: 'Complete sales strategy template with target market analysis, sales process, pipeline management, and performance metrics.',
    category: 'Sales Strategy',
    tags: ['Sales', 'Strategy', 'Pipeline', 'Performance'],
    price: 29, // EUR
    author: 'Synergize Team',
    downloads: 1345,
    rating: 4.7
  }
];

export function MarketplaceSection() {
  const [templates, setTemplates] = useState<Template[]>(allTemplates);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>(allTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('EUR');
  React.useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, selectedCategory]);

  const filterTemplates = () => {
    let filtered = templates;

    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    setFilteredTemplates(filtered);
  };

  if (selectedTemplate) {
    return (
      <EnhancedTemplateDetail
        template={selectedTemplate}
        onBack={() => setSelectedTemplate(null)}
        selectedCurrency={selectedCurrency}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Template Marketplace</h2>
          <p className="text-muted-foreground">Professional templates to accelerate your projects</p>
        </div>
      </div>

      <CurrencySelector
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedTemplate(template)}
          >
            <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 rounded-t-lg flex items-center justify-center">
              <div className="text-6xl text-muted-foreground">
                {template.category === 'Business Plan' ? '📋' : 
                 template.category === 'Financial Model' ? '📊' : 
                 template.category === 'Pitch Deck' ? '🎯' : 
                 template.category === 'Market Analysis' ? '📈' : 
                 template.category === 'Operations' ? '⚙️' :
                 template.category === 'HR & People' ? '👥' :
                 template.category === 'Marketing' ? '📢' :
                 template.category === 'Product Strategy' ? '🎯' :
                 template.category === 'Risk Management' ? '🛡️' :
                 template.category === 'Legal & Compliance' ? '⚖️' :
                 template.category === 'Sales Strategy' ? '💼' :
                 template.category === 'GTM Strategy' ? '🚀' :
                 template.category === 'Investor Update' ? '📊' : '📄'}
              </div>
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{template.name}</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.description}
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{template.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    <span>{template.downloads}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 font-semibold text-blue-600">
                  <span>{formatCurrency(template.price, selectedCurrency)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {template.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}