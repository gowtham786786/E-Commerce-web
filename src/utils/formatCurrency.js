export const USD_TO_INR = 1;

export const convertUsdToInr = (usdPrice) => {
  if (usdPrice === undefined || usdPrice === null) return 0;
  return usdPrice * USD_TO_INR;
};

export const formatCurrency = (price) => {
  if (price === undefined || price === null) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};
