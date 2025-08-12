import { useAuth } from '@/hooks/useAuth';
import { getCurrencySymbol } from '@shared/currency';

export const useCurrency = () => {
  const { user } = useAuth();
  
  const formatAmount = (amount: number): string => {
    const symbol = getCurrencySymbol(user?.currency || 'USD');
    return `${symbol}${amount.toLocaleString()}`;
  };

  const getCurrency = (): string => {
    return user?.currency || 'USD';
  };

  const getCurrencySymbol_ = (): string => {
    return getCurrencySymbol(user?.currency || 'USD');
  };

  return {
    formatAmount,
    getCurrency,
    getCurrencySymbol: getCurrencySymbol_,
  };
};