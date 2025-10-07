import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, Star, Share2, CreditCard, FileText, Heart, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { CurrencySelector } from './CurrencySelector';
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
  features?: string[];
  details?: string;
  reviews?: Array<{
    id: string;
    user: string;
    rating: number;
    comment: string;
    date: string;
  }>;
}

interface EnhancedTemplateDetailProps {
  template: Template;
  onBack: () => void;
}

export const EnhancedTemplateDetail: React.FC<EnhancedTemplateDetailProps> = ({
  template,
  onBack
}) => {
  const { user } = useAuth();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR'>('EUR');

  const formatPrice = (cents: number, currency: 'USD' | 'EUR' = 'EUR') => {
    if (cents === 0) return 'Free';
    const convertedCents = currency === 'EUR' ? Math.round(cents * 0.92) : cents;
    const amount = convertedCents / 100;
    const symbol = currency === 'EUR' ? '€' : '$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase templates",
        variant: "destructive"
      });
      return;
    }

    if (template.price_cents === 0) {
      toast({
        title: "Template Added",
        description: "Free template has been added to your collection",
      });
      return;
    }

    setIsProcessingPayment(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('template-purchase', {
        body: { 
          templateId: template.id,
          userId: user.id,
          priceInCents: template.price_cents
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Purchase Successful",
          description: "Template has been added to your collection",
        });
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: "Failed to process purchase. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const mockReviews = [
    {
      id: '1',
      user: 'Sarah Chen',
      rating: 5,
      comment: 'Excellent template! Saved me hours of work and the structure is perfect.',
      date: '2024-01-15'
    },
    {
      id: '2', 
      user: 'Mike Johnson',
      rating: 4,
      comment: 'Great quality template with comprehensive sections. Highly recommend.',
      date: '2024-01-10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Currency Selector */}
      <CurrencySelector
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
      />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{template.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="secondary">{template.category}</Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{template.rating} rating</span>
                <Download className="h-4 w-4 ml-2" />
                <span>{template.downloads} downloads</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600">
            {formatPrice(template.price_cents, selectedCurrency)}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFavorited(!isFavorited)}
            className="mt-2"
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center mb-4">
                    {template.preview_image_url ? (
                      <img
                        src={template.preview_image_url}
                        alt={template.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">Template Preview</p>
                      </div>
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    {template.description}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Template Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-muted-foreground">{template.description}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Category</h4>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {template.tags.map((tag) => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Created</h4>
                      <p className="text-muted-foreground">
                        {new Date(template.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>What's Included</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span>Complete project blueprint</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span>Pre-filled sections and examples</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span>Professional formatting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span>Export-ready structure</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span>Customizable content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span>Instant download and use</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span>Compatible with all modules</span>
                    </li>
                    {template.price_cents > 0 && (
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <span>Secure payment processing</span>
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockReviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="font-semibold">{review.user}</div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Button
            onClick={handlePurchase}
            disabled={isProcessingPayment}
            className="w-full"
            size="lg"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            {isProcessingPayment ? 'Processing...' : `Purchase ${formatPrice(template.price_cents, selectedCurrency)}`}
          </Button>

          <Button variant="outline" className="w-full" size="lg">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>• Instant download and use</p>
            <p>• Compatible with all modules</p>
            <p>• Professional design</p>
            <p>• Secure payment processing</p>
          </div>
        </div>
      </div>
    </div>
  );
};