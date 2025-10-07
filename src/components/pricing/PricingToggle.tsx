import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PricingToggleProps {
  isAnnual: boolean;
  onToggle: (isAnnual: boolean) => void;
}

export function PricingToggle({ isAnnual, onToggle }: PricingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      <Label htmlFor="billing-toggle" className={`text-sm font-medium ${!isAnnual ? 'text-primary' : 'text-muted-foreground'}`}>
        Monthly
      </Label>
      <Switch
        id="billing-toggle"
        checked={isAnnual}
        onCheckedChange={onToggle}
      />
      <Label htmlFor="billing-toggle" className={`text-sm font-medium ${isAnnual ? 'text-primary' : 'text-muted-foreground'}`}>
        Annual
        <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
          Save 20%
        </span>
      </Label>
    </div>
  );
}