import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  reviews: number;
  image?: string;
  onPurchase: (id: string) => void;
}

export function ProductCard({ 
  id, 
  name, 
  description, 
  price, 
  category, 
  rating, 
  reviews, 
  image, 
  onPurchase 
}: ProductCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        {image && (
          <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
            <span className="text-gray-400">Template Preview</span>
          </div>
        )}
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{name}</CardTitle>
            <Badge variant="secondary" className="mt-1">{category}</Badge>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold">€{price}</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{rating}</span>
              <span>({reviews})</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => onPurchase(id)}
        >
          Purchase Template
        </Button>
      </CardFooter>
    </Card>
  );
}