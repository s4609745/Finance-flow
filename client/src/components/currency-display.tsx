import { useCurrency } from '@/hooks/useCurrency';

export const CurrencyDisplay = ({ amount }: { amount: number }) => {
  const { formatAmount } = useCurrency();
  return <span>{formatAmount(amount)}</span>;
};