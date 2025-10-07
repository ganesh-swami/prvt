import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Currency, CURRENCY_SYMBOLS, CURRENCY_NAMES } from '@/utils/currencyUtils';

interface CurrencySelectorProps {
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selectedCurrency,
  onCurrencyChange,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-600">Currency:</span>
      <Select value={selectedCurrency} onValueChange={onCurrencyChange}>
        <SelectTrigger className="w-32">
          <SelectValue>
            <span className="flex items-center gap-2">
              {CURRENCY_SYMBOLS[selectedCurrency]} {selectedCurrency}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="EUR">
            <span className="flex items-center gap-2">
              € EUR - {CURRENCY_NAMES.EUR}
            </span>
          </SelectItem>
          <SelectItem value="USD">
            <span className="flex items-center gap-2">
              $ USD - {CURRENCY_NAMES.USD}
            </span>
          </SelectItem>
          <SelectItem value="GBP">
            <span className="flex items-center gap-2">
              £ GBP - {CURRENCY_NAMES.GBP}
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};