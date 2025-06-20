/**
 * Format currency amounts in TND (Tunisian Dinar)
 * @param amount - The amount to format
 * @param locale - The locale to use (default: 'fr-TN' for Tunisia)
 * @returns Formatted currency string
 */
export function formatTND(amount: number, locale: string = 'fr-TN'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'TND',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format currency amounts in TND without the currency symbol
 * @param amount - The amount to format
 * @param locale - The locale to use (default: 'fr-TN' for Tunisia)
 * @returns Formatted number string
 */
export function formatTNDNumber(amount: number, locale: string = 'fr-TN'): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get the TND currency symbol
 * @returns TND currency symbol
 */
export function getTNDSymbol(): string {
  return 'TND';
}

/**
 * Format currency amounts (alias for formatTND)
 * @param amount - The amount to format
 * @param locale - The locale to use (default: 'fr-TN' for Tunisia)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, locale: string = 'fr-TN'): string {
  return formatTND(amount, locale);
} 