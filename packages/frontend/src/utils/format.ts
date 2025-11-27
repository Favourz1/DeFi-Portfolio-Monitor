import Decimal from "decimal.js";

/**
 * Format Ethereum address for display (0x1234...5678)
 *
 * @param address - Ethereum address
 * @param chars - Number of characters to show on each side (default: 4)
 * @returns Formatted address string
 */
export function formatAddress(address: string, chars: number = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format token balance with appropriate decimals using Decimal.js for precision
 *
 * @param balance - Token balance as string
 * @param decimals - Number of decimal places to show (default: 4)
 * @returns Formatted balance string
 */
export function formatTokenBalance(
  balance: string,
  decimals: number = 4
): string {
  // Use Decimal.js for precision
  let num: Decimal;
  try {
    num = new Decimal(balance);
  } catch {
    return "0";
  }

  // Handle edge cases with Decimal
  if (num.isNaN() || !num.isFinite()) return "0";
  if (num.lte(0)) return "0"; // Negative balances shouldn't exist, but handle gracefully
  if (num.eq(0)) return "0";
  if (num.lt(0.0001)) return "< 0.0001";
  if (num.lt(1)) return num.toFixed(decimals);
  if (num.lt(1000)) return num.toFixed(2);
  if (num.lt(1000000)) {
    return `${num.div(1000).toFixed(2)}K`;
  }

  return `${num.div(1000000).toFixed(2)}M`;
}

/**
 * Format USD value with $ sign and commas using Decimal.js for precision
 *
 * @param value - USD value as string or number
 * @returns Formatted USD string
 */
export function formatUSD(value: string | number): string {
  // Use Decimal.js for precision
  let num: Decimal;
  try {
    num = typeof value === "string" ? new Decimal(value) : new Decimal(value);
  } catch {
    return "$0.00";
  }

  // Handle edge cases with Decimal
  if (num.isNaN() || !num.isFinite()) return "$0.00";
  if (num.lte(0)) return "$0.00"; // Negative values shouldn't exist, but handle gracefully

  // Convert to number only for Intl.NumberFormat (which handles display precision)
  const displayValue = num.toNumber();

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(displayValue);
}

/**
 * Format timestamp to relative time (2 hours ago)
 *
 * @param timestamp - Unix timestamp in seconds
 * @returns Relative time string
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp * 1000; // Convert to ms

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;

  return "Just now";
}

/**
 * Format timestamp to readable date
 *
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted date string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format transaction hash for display
 *
 * @param hash - Transaction hash
 * @param chars - Number of characters to show on each side (default: 6)
 * @returns Formatted hash string
 */
export function formatTransactionHash(hash: string, chars: number = 6): string {
  if (!hash) return "";
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

/**
 * Format large numbers with appropriate suffixes (K, M, B) using Decimal.js for precision
 *
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatLargeNumber(value: number, decimals: number = 2): string {
  const num = new Decimal(value);

  if (num.eq(0)) return "0";
  if (num.lt(1000)) return num.toFixed(decimals);
  if (num.lt(1000000)) return `${num.div(1000).toFixed(decimals)}K`;
  if (num.lt(1000000000)) return `${num.div(1000000).toFixed(decimals)}M`;

  return `${num.div(1000000000).toFixed(decimals)}B`;
}

/**
 * Format percentage with % sign
 *
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  // Handle edge cases
  if (isNaN(value) || !isFinite(value)) return "0.00%";
  // Clamp percentage to 0-100 range
  const clampedValue = Math.max(0, Math.min(100, value));
  return `${clampedValue.toFixed(decimals)}%`;
}
