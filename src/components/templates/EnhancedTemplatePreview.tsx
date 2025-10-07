import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Star, Download, ShoppingCart, Eye, FileText, Users, MessageSquare, CheckCircle } from 'lucide-react';
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
interface EnhancedTemplateDetailProps {
  template: Template;
  onBack: () => void;
  selectedCurrency: Currency;
}

export const EnhancedTemplateDetail: React.FC<EnhancedTemplateDetailProps> = ({
  template,
  onBack,
  selectedCurrency
}) => {
  const [activeTab, setActiveTab] = useState('preview');
  const [isLiked, setIsLiked] = useState(false);

  const mockSections = [
    { name: 'Executive Summary', completed: true },
    { name: 'Market Analysis', completed: true },
    { name: 'Financial Projections', completed: false },
    { name: 'Marketing Strategy', completed: false },
    { name: 'Operations Plan', completed: false }
  ];

  const mockFeatures = [
    'Professional formatting',
    'Interactive charts',
    'Export to PDF/PowerPoint',
    'Collaboration tools',
    'Real-time updates'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Templates
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-8xl text-muted-foreground mb-4">
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
              <p className="text-muted-foreground">Template Preview</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Template Structure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {mockSections.map((section, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{section.name}</span>
                          <Badge variant={section.completed ? 'default' : 'secondary'} className="text-xs">
                            {section.completed ? 'Included' : 'Template'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Est. completion: 2-4 hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Collaboration ready</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">AI-powered insights</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{template.description}</p>
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>What's Included</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {mockFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <div className="space-y-4">
                {[1, 2, 3].map((review) => (
                  <Card key={review}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold">U{review}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">User {review}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Great template! Very comprehensive and easy to use. 
                            Saved me hours of work.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{template.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">by {template.author}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Star className={`h-4 w-4 ${isLiked ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{template.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Download className="h-4 w-4" />
                  <span>{template.downloads} downloads</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {formatCurrency(template.price, selectedCurrency)}
                </div>
                <Button className="w-full" size="lg">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Purchase Template
                </Button>
                <Button variant="outline" className="w-full mt-2">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Template
                </Button>
              </div>

              <div className="pt-4 border-t">
                <Badge className="mb-2">{template.category}</Badge>
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 4).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};