// utils/formatAmount.ts
export const formatAmount = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(num)) return '0,00 €';

  return (
    num
      .toFixed(2)            // 2 décimales
      .replace('.', ',')     // séparateur décimal français
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €'
  );
};