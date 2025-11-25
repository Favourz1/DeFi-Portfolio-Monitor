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
 * Format token balance with appropriate decimals
 *
 * @param balance - Token balance as string
 * @param decimals - Number of decimal places to show (default: 4)
 * @returns Formatted balance string
 */
export function formatTokenBalance(
  balance: string,
  decimals: number = 4
): string {
  const num = parseFloat(balance);

  if (num === 0) return "0";
  if (num < 0.0001) return "< 0.0001";
  if (num < 1) return num.toFixed(decimals);
  if (num < 1000) return num.toFixed(2);
  if (num < 1000000) return `${(num / 1000).toFixed(2)}K`;

  return `${(num / 1000000).toFixed(2)}M`;
}

/**
 * Format USD value with $ sign and commas
 *
 * @param value - USD value as string or number
 * @returns Formatted USD string
 */
export function formatUSD(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) return "$0.00";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
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
 * Format large numbers with appropriate suffixes (K, M, B)
 *
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatLargeNumber(value: number, decimals: number = 2): string {
  if (value === 0) return "0";
  if (value < 1000) return value.toFixed(decimals);
  if (value < 1000000) return `${(value / 1000).toFixed(decimals)}K`;
  if (value < 1000000000) return `${(value / 1000000).toFixed(decimals)}M`;

  return `${(value / 1000000000).toFixed(decimals)}B`;
}

/**
 * Format percentage with % sign
 *
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}
