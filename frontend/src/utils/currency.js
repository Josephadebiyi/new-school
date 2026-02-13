// Currency utility for formatting amounts
export const getCurrencySymbol = (currency = 'EUR') => {
  const symbols = {
    'EUR': '€',
    'USD': '$',
    'GBP': '£',
    'NGN': '₦'
  };
  return symbols[currency] || '€';
};

export const formatCurrency = (amount, currency = 'EUR') => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`;
};

export const formatAmount = (amount, currency = 'EUR') => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount?.toLocaleString() || '0'}`;
};
