import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";

/**
 * Utility function to merge Tailwind CSS classes with clsx
 * Handles conflicts and duplicates properly
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency values with proper locale formatting
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format numbers with proper locale formatting
 */
export function formatNumber(
  value: number,
  locale: string = "en-US",
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Debounce function to limit the rate of function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Generate a random string of specified length
 */
export function generateRandomString(length: number): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Sleep function for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Capitalize first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert snake_case to Title Case
 */
export function snakeToTitle(str: string): string {
  return str
    .split("_")
    .map((word) => capitalize(word))
    .join(" ");
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Generate a SKU from product name
 */
export function generateSku(productName: string, category?: string): string {
  const cleanName = productName
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(" ")
    .map((word) => word.slice(0, 3).toUpperCase())
    .join("");

  const categoryPrefix = category ? category.slice(0, 2).toUpperCase() : "";
  const randomSuffix = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return `${categoryPrefix}${cleanName}${randomSuffix}`;
}

/**
 * Format date values with proper locale formatting
 */
export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
  locale: string = "en-US",
): string {
  const dateObj = new Date(date);
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  }).format(dateObj);
}

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale: string = "en-US",
): string {
  const now = new Date();
  const dateObj = new Date(date);
  const diffInMs = now.getTime() - dateObj.getTime();

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  const minute = 60 * 1000;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;

  if (diffInMs < minute) {
    return rtf.format(-Math.floor(diffInMs / 1000), "second");
  } else if (diffInMs < hour) {
    return rtf.format(-Math.floor(diffInMs / minute), "minute");
  } else if (diffInMs < day) {
    return rtf.format(-Math.floor(diffInMs / hour), "hour");
  } else if (diffInMs < week) {
    return rtf.format(-Math.floor(diffInMs / day), "day");
  } else if (diffInMs < month) {
    return rtf.format(-Math.floor(diffInMs / week), "week");
  } else if (diffInMs < year) {
    return rtf.format(-Math.floor(diffInMs / month), "month");
  } else {
    return rtf.format(-Math.floor(diffInMs / year), "year");
  }
}
