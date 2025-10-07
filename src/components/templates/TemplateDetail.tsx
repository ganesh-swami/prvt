import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Star, Share2, CreditCard, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedTemplateDetail } from './EnhancedTemplatePreview';

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

interface TemplateDetailProps {
  template: Template;
  onBack: () => void;
  onUse: () => void;
}

export const TemplateDetail: React.FC<TemplateDetailProps> = ({
  template,
  onBack,
  onUse
}) => {
  const { user } = useAuth();
  const [showEnhancedPreview, setShowEnhancedPreview] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const formatPrice = (cents: number) => {
    if (cents === 0) return 'Free';
    // Convert cents to EUR (base currency) then format with EUR
    const priceInEur = cents / 100;
    return `€${priceInEur.toFixed(2)}`;
  };

  const handlePurchase = async (templateId: string) => {
    if (!user) {
      alert('Please sign in to purchase templates');
      return;
    }

    if (template.price_cents === 0) {
      // Free template - direct use
      handleUseTemplate();
      return;
    }

    setIsProcessingPayment(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('template-purchase', {
        body: { 
          templateId,
          userId: user.id,
          priceInCents: template.price_cents
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        // Payment successful, enable template use
        handleUseTemplate();
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to process purchase. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };
  const handleUseTemplate = () => {
    // For free templates or after successful payment
    onUse();
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{template.title}</h1>
            <p className="text-muted-foreground">{template.category}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
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
                <p className="text-sm text-muted-foreground mb-4">
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Template Info & Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">
                      {formatPrice(template.price_cents)}
                    </CardTitle>
                    {template.is_featured && (
                      <Badge variant="secondary" className="mt-2">
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{template.rating.toFixed(1)} rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    <span>{template.downloads} downloads</span>
                  </div>
                </div>

                <Button
                  onClick={() => setShowEnhancedPreview(true)}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Enhanced Preview
                </Button>

                {template.price_cents === 0 ? (
                  <Button
                    onClick={handleUseTemplate}
                    className="w-full"
                    size="lg"
                  >
                    Use Template
                  </Button>
                ) : (
                  <Button
                    onClick={() => handlePurchase(template.id)}
                    disabled={isProcessingPayment}
                    className="w-full"
                    size="lg"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {isProcessingPayment ? 'Processing...' : `Purchase ${formatPrice(template.price_cents)}`}
                  </Button>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>• Instant download and use</p>
                  <p>• Compatible with all modules</p>
                  <p>• Professional design</p>
                  {template.price_cents > 0 && (
                    <p>• Secure payment processing</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Complete project blueprint</li>
                  <li>✓ Pre-filled sections and examples</li>
                  <li>✓ Professional formatting</li>
                  <li>✓ Export-ready structure</li>
                  <li>✓ Customizable content</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showEnhancedPreview && (
        <EnhancedTemplateDetail
          template={{
            id: template.id,
            name: template.title,
            description: template.description,
            category: template.category,
            price: template.price_cents / 100,
            rating: template.rating,
            downloads: template.downloads,
            author: 'Synergize Team',
            tags: template.tags
          }}
          onBack={() => setShowEnhancedPreview(false)}
          selectedCurrency="EUR"
        />
      )}
    </>
  );
};