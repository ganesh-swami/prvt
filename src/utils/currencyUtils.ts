export type Currency = 'EUR' | 'USD' | 'GBP';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£'
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  EUR: 'Euro',
  USD: 'US Dollar',
  GBP: 'British Pound'
};

// Exchange rates from EUR (base currency)
export const EXCHANGE_RATES: Record<Currency, number> = {
  EUR: 1,      // Base currency
  USD: 1.15,   // 1 EUR = 1.15 USD
  GBP: 0.85    // 1 EUR = 0.85 GBP
};

export const convertFromEUR = (eurAmount: number, targetCurrency: Currency): number => {
  return eurAmount * EXCHANGE_RATES[targetCurrency];
};

export const formatCurrency = (amount: number, currency: Currency): string => {
  const convertedAmount = convertFromEUR(amount, currency);
  const symbol = CURRENCY_SYMBOLS[currency];
  
  return `${symbol}${convertedAmount.toFixed(2)}`;
};

export const formatCurrencyWithCode = (amount: number, currency: Currency): string => {
  const convertedAmount = convertFromEUR(amount, currency);
  const symbol = CURRENCY_SYMBOLS[currency];
  
  return `${symbol}${convertedAmount.toFixed(2)} ${currency}`;
};