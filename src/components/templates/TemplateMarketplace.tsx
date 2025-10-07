import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Star, Download, DollarSign, Plus, Edit, Trash2, MoreVertical } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { TemplateDetail } from './TemplateDetail';
import { CustomTemplateBuilder } from './CustomTemplateBuilderSimple';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CurrencySelector } from '@/components/pricing/CurrencySelector';
import { formatCurrency, Currency } from '@/utils/currencyUtils';

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  preview_image_url?: string;
  price_cents: number;
  creator_id: string;
  is_featured: boolean;
  downloads: number;
  rating: number;
  created_at: string;
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

// Featured templates to show initially
const featuredTemplates: Template[] = [
  {
    id: 'startup-business-plan',
    title: 'Startup Business Plan Template',
    description: 'Complete business plan template for startups with executive summary, market analysis, financial projections, and funding requirements.',
    category: 'Business Plan',
    tags: ['Startup', 'Business Plan', 'Funding', 'Strategy'],
    price_cents: 3900,
    creator_id: 'synergize',
    is_featured: true,
    downloads: 1856,
    rating: 4.8,
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'financial-projection-template',
    title: 'Financial Projection Template',
    description: '5-year financial projection template with revenue forecasting, expense planning, cash flow analysis, and scenario modeling.',
    category: 'Financial Model',
    tags: ['Financial Projections', 'Revenue', 'Cash Flow', 'Forecasting'],
    price_cents: 2900,
    creator_id: 'synergize',
    is_featured: true,
    downloads: 1423,
    rating: 4.9,
    created_at: '2024-01-12T00:00:00Z'
  },
  {
    id: 'investors-pitch-template',
    title: 'Investors Pitch Template',
    description: 'Professional investor pitch template with compelling storytelling, market opportunity, traction slides, and funding ask.',
    category: 'Pitch Deck',
    tags: ['Investors', 'Pitch Deck', 'Fundraising', 'Presentation'],
    price_cents: 3500,
    creator_id: 'synergize',
    is_featured: true,
    downloads: 2341,
    rating: 4.7,
    created_at: '2024-01-18T00:00:00Z'
  },
  {
    id: 'market-sizing-template',
    title: 'Market Sizing Template',
    description: 'Comprehensive market sizing template with TAM, SAM, SOM analysis, market research frameworks, and competitive landscape.',
    category: 'Market Analysis',
    tags: ['Market Sizing', 'TAM', 'SAM', 'Market Research'],
    price_cents: 2500,
    creator_id: 'synergize',
    is_featured: true,
    downloads: 987,
    rating: 4.6,
    created_at: '2024-01-14T00:00:00Z'
  },
  {
    id: 'problem-tree-template',
    title: 'Problem Tree Template',
    description: 'Problem tree analysis template for identifying root causes, effects, and solutions with visual mapping and prioritization framework.',
    category: 'Business Plan',
    tags: ['Problem Analysis', 'Root Cause', 'Solutions', 'Framework'],
    price_cents: 1900,
    creator_id: 'synergize',
    is_featured: true,
    downloads: 756,
    rating: 4.5,
    created_at: '2024-01-16T00:00:00Z'
  },
  {
    id: 'unit-economics-template',
    title: 'Unit Economics Template',
    description: 'Unit economics template with customer acquisition cost, lifetime value, payback period, and profitability analysis.',
    category: 'Financial Model',
    tags: ['Unit Economics', 'CAC', 'LTV', 'Profitability'],
    price_cents: 2200,
    creator_id: 'synergize',
    is_featured: true,
    downloads: 1134,
    rating: 4.8,
    created_at: '2024-01-13T00:00:00Z'
  },
  {
    id: 'saas-business-plan',
    title: 'SaaS Business Plan Template',
    description: 'Comprehensive business plan template specifically designed for SaaS startups, including market analysis, financial projections, and growth strategies.',
    category: 'Business Plan',
    tags: ['SaaS', 'Business Plan', 'Startup', 'Strategy'],
    price_cents: 4900,
    creator_id: 'synergize',
    is_featured: true,
    downloads: 1247,
    rating: 4.8,
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'ecommerce-financial-model',
    title: 'E-commerce Financial Model Template',
    description: 'Advanced financial modeling template for e-commerce businesses with customer acquisition costs, lifetime value calculations, and inventory management.',
    category: 'Financial Model',
    tags: ['E-commerce', 'Financial Model', 'Revenue', 'CAC', 'LTV'],
    price_cents: 3900,
    creator_id: 'synergize',
    is_featured: true,
    downloads: 892,
    rating: 4.9,
    created_at: '2024-01-10T00:00:00Z'
  },
  {
    id: 'series-a-pitch-deck',
    title: 'Pitch Deck Template - Series A',
    description: 'Professional pitch deck template optimized for Series A fundraising, including all essential slides and investor-focused messaging.',
    category: 'Pitch Deck',
    tags: ['Series A', 'Fundraising', 'Pitch Deck', 'Investors'],
    price_cents: 2900,
    creator_id: 'synergize',
    is_featured: true,
    downloads: 2156,
    rating: 4.7,
    created_at: '2024-01-20T00:00:00Z'
  },
  {
    id: 'operations-playbook',
    title: 'Operations Playbook Template',
    description: 'Comprehensive operations playbook covering processes, workflows, team management, and operational excellence frameworks.',
    category: 'Operations',
    tags: ['Operations', 'Processes', 'Workflows', 'Management'],
    price_cents: 3200,
    creator_id: 'synergize',
    is_featured: true,
    downloads: 643,
    rating: 4.6,
    created_at: '2024-01-22T00:00:00Z'
  },
  {
    id: 'hr-onboarding-template',
    title: 'HR Onboarding Template',
    description: 'Complete employee onboarding template with checklists, training schedules, and performance tracking systems.',
    category: 'HR & People',
    tags: ['HR', 'Onboarding', 'Training', 'Performance'],
    price_cents: 2700,
    creator_id: 'synergize',
    is_featured: true,
    downloads: 834,
    rating: 4.7,
    created_at: '2024-01-25T00:00:00Z'
  },
  {
    id: 'marketing-campaign-template',
    title: 'Marketing Campaign Template',
    description: 'Multi-channel marketing campaign template with strategy, execution plans, budget allocation, and ROI tracking.',
    category: 'Marketing',
    tags: ['Marketing', 'Campaigns', 'ROI', 'Strategy'],
    price_cents: 3100,
    creator_id: 'synergize',
    is_featured: true,
    downloads: 1567,
    rating: 4.8,
    created_at: '2024-01-28T00:00:00Z'
  },
  {
    id: 'product-roadmap-template',
    title: 'Product Roadmap Template',
    description: 'Strategic product roadmap template with feature prioritization, timeline planning, and stakeholder communication.',
    category: 'Product Strategy',
    tags: ['Product', 'Roadmap', 'Strategy', 'Planning'],
    price_cents: 2800,
    creator_id: 'synergize',
    is_featured: true,
    downloads: 1289,
    rating: 4.9,
    created_at: '2024-01-30T00:00:00Z'
  },
  {
    id: 'risk-assessment-template',
    title: 'Risk Assessment Template',
    description: 'Comprehensive risk assessment template with identification, analysis, mitigation strategies, and monitoring frameworks.',
    category: 'Risk Management',
    tags: ['Risk', 'Assessment', 'Mitigation', 'Compliance'],
    price_cents: 2600,
    creator_id: 'synergize',
    is_featured: true,
    downloads: 723,
    rating: 4.5,
    created_at: '2024-02-01T00:00:00Z'
  },
  {
    id: 'legal-compliance-template',
    title: 'Legal Compliance Template',
    description: 'Legal compliance checklist and documentation template covering regulatory requirements and audit preparation.',
    category: 'Legal & Compliance',
    tags: ['Legal', 'Compliance', 'Regulatory', 'Audit'],
    price_cents: 3400,
    creator_id: 'synergize',
    is_featured: true,
    downloads: 456,
    rating: 4.4,
    created_at: '2024-02-03T00:00:00Z'
  },
  {
    id: 'sales-strategy-template',
    title: 'Sales Strategy Template',
    description: 'Complete sales strategy template with target market analysis, sales process, pipeline management, and performance metrics.',
    category: 'Sales Strategy',
    tags: ['Sales', 'Strategy', 'Pipeline', 'Performance'],
    price_cents: 2900,
    creator_id: 'synergize',
    is_featured: true,
    downloads: 1345,
    rating: 4.7,
    created_at: '2024-02-05T00:00:00Z'
  },
  // GTM Strategy Templates
  {
    id: 'gtm-launch-template',
    title: 'GTM Launch Strategy Template',
    description: 'Complete go-to-market strategy template with customer segmentation, positioning, pricing, and launch planning.',
    category: 'GTM Strategy',
    tags: ['GTM', 'Launch', 'Strategy', 'Market Entry'],
    price_cents: 3500,
    creator_id: 'synergize',
    is_featured: true,
    downloads: 1876,
    rating: 4.8,
    created_at: '2024-02-07T00:00:00Z'
  },
  {
    id: 'b2b-gtm-template',
    title: 'B2B GTM Strategy Template',
    description: 'Specialized B2B go-to-market template with enterprise sales processes, channel partnerships, and account-based marketing.',
    category: 'GTM Strategy',
    tags: ['B2B', 'Enterprise', 'Sales', 'Partnerships'],
    price_cents: 4200,
    creator_id: 'synergize',
    is_featured: false,
    downloads: 934,
    rating: 4.7,
    created_at: '2024-02-08T00:00:00Z'
  },
  // Investor Update Templates
  {
    id: 'monthly-investor-update',
    title: 'Monthly Investor Update Template',
    description: 'Professional monthly investor update template with KPIs, milestones, challenges, and funding runway.',
    category: 'Investor Update',
    tags: ['Investor', 'Monthly', 'KPIs', 'Updates'],
    price_cents: 1900,
    creator_id: 'synergize',
    is_featured: true,
    downloads: 2341,
    rating: 4.9,
    created_at: '2024-02-10T00:00:00Z'
  },
  {
    id: 'quarterly-board-deck',
    title: 'Quarterly Board Deck Template',
    description: 'Comprehensive quarterly board presentation template with financial performance, strategic initiatives, and outlook.',
    category: 'Investor Update',
    tags: ['Board', 'Quarterly', 'Performance', 'Strategy'],
    price_cents: 2800,
    creator_id: 'synergize',
    is_featured: false,
    downloads: 1456,
    rating: 4.6,
    created_at: '2024-02-12T00:00:00Z'
  }
];
export const TemplateMarketplace: React.FC = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>(featuredTemplates);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>(featuredTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('EUR');
  const [loading, setLoading] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, selectedCategory]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('status', 'approved')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch custom templates from localStorage for now
      const savedCustomTemplates = JSON.parse(localStorage.getItem('customTemplates') || '[]');
      
      // Combine all templates
      const allTemplates = [...featuredTemplates, ...savedCustomTemplates, ...(data || [])];
      setTemplates(allTemplates);
      setCustomTemplates(savedCustomTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    setFilteredTemplates(filtered);
  };

  const formatTemplatePrice = (cents: number) => {
    if (cents === 0) return 'Free';
    // Convert cents to EUR (base currency) then format with selected currency
    const priceInEur = cents / 100;
    return formatCurrency(priceInEur, selectedCurrency);
  };
  const handleCustomTemplateSave = (templateData: any) => {
    const isEditing = editingTemplate !== null;
    
    if (isEditing) {
      // Update existing template
      const updatedTemplate: Template = {
        ...editingTemplate!,
        title: templateData.name,
        description: templateData.description || 'Custom template created by user',
        category: templateData.category || 'Business Plan',
      };

      const existingCustomTemplates = JSON.parse(localStorage.getItem('customTemplates') || '[]');
      const updatedCustomTemplates = existingCustomTemplates.map((t: Template) => 
        t.id === editingTemplate!.id ? updatedTemplate : t
      );
      localStorage.setItem('customTemplates', JSON.stringify(updatedCustomTemplates));
      
      setCustomTemplates(updatedCustomTemplates);
      setTemplates([...featuredTemplates, ...updatedCustomTemplates]);
      setEditingTemplate(null);
    } else {
      // Create new template
      const newTemplate: Template = {
        id: `custom-${Date.now()}`,
        title: templateData.name,
        description: templateData.description || 'Custom template created by user',
        category: templateData.category || 'Business Plan',
        tags: ['Custom', 'User Created'],
        price_cents: 0,
        creator_id: user?.id || 'anonymous',
        is_featured: false,
        downloads: 0,
        rating: 5.0,
        created_at: new Date().toISOString()
      };

      const existingCustomTemplates = JSON.parse(localStorage.getItem('customTemplates') || '[]');
      const updatedCustomTemplates = [...existingCustomTemplates, newTemplate];
      localStorage.setItem('customTemplates', JSON.stringify(updatedCustomTemplates));

      setCustomTemplates(updatedCustomTemplates);
      setTemplates([...featuredTemplates, ...updatedCustomTemplates]);
    }
    
    setShowCustomBuilder(false);
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setShowCustomBuilder(true);
  };

  const handleDeleteTemplate = (templateId: string) => {
    const existingCustomTemplates = JSON.parse(localStorage.getItem('customTemplates') || '[]');
    const updatedCustomTemplates = existingCustomTemplates.filter((t: Template) => t.id !== templateId);
    localStorage.setItem('customTemplates', JSON.stringify(updatedCustomTemplates));
    
    setCustomTemplates(updatedCustomTemplates);
    setTemplates([...featuredTemplates, ...updatedCustomTemplates]);
  };

  if (showCustomBuilder) {
    return (
      <CustomTemplateBuilder
        onSave={handleCustomTemplateSave}
        onCancel={() => {
          setShowCustomBuilder(false);
          setEditingTemplate(null);
        }}
        editingTemplate={editingTemplate}
      />
    );
  }

  if (selectedTemplate) {
    return (
      <TemplateDetail
        template={selectedTemplate}
        onBack={() => setSelectedTemplate(null)}
        onUse={() => {
          setSelectedTemplate(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Template Marketplace</h1>
          <p className="text-muted-foreground">
            Accelerate your projects with professional templates
          </p>
        </div>
        <Button onClick={() => setShowCustomBuilder(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Custom Template
        </Button>
      </div>

      {/* Search and Filters */}
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
        <div className="flex flex-col sm:flex-row gap-2">
          <CurrencySelector
            selectedCurrency={selectedCurrency}
            onCurrencyChange={setSelectedCurrency}
          />
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
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg"></div>
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-lg transition-shadow relative"
            >
              <div 
                className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 rounded-t-lg flex items-center justify-center relative"
                onClick={() => setSelectedTemplate(template)}
              >
                {template.preview_image_url ? (
                  <img
                    src={template.preview_image_url}
                    alt={template.title}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                ) : (
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
                     template.category === 'Sales Strategy' ? '💼' : '📄'}
                  </div>
                )}
                {template.creator_id === (user?.id || 'anonymous') && template.tags.includes('Custom') && (
                  <>
                    <Badge className="absolute top-2 left-2 bg-green-500 text-white">My Template</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditTemplate(template); }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Template
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(template.id); }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Template
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
              <div onClick={() => setSelectedTemplate(template)}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">{template.title}</CardTitle>
                  {template.is_featured && (
                    <Badge variant="secondary">Featured</Badge>
                  )}
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
                  <div className="flex items-center gap-1 font-semibold">
                    <DollarSign className="h-4 w-4" />
                     <span>{formatTemplatePrice(template.price_cents)}</span>
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
               </div>
             </Card>
          ))}
        </div>
      )}

      {filteredTemplates.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No templates found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};