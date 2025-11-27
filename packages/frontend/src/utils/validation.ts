import { ethers } from "ethers";

/**
 * Validate Ethereum address format using ethers.js for robust validation
 *
 * @param address - Address to validate
 * @returns True if valid Ethereum address
 */
export function isValidEthereumAddress(address: string): boolean {
  if (!address || typeof address !== "string") return false;

  try {
    // Use ethers.js for robust address validation (handles checksums, etc.)
    return ethers.utils.isAddress(address);
  } catch {
    // Fallback to regex if ethers fails
    const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/i;
    return ethereumAddressRegex.test(address.trim());
  }
}

/**
 * Validate and normalize Ethereum address using ethers.js
 *
 * @param address - Address to validate and normalize
 * @returns Normalized address (checksummed) or null if invalid
 */
export function normalizeEthereumAddress(address: string): string | null {
  if (!address || typeof address !== "string") return null;

  try {
    // Use ethers.js to get checksummed address (more robust)
    const normalized = ethers.utils.getAddress(address.trim());
    return normalized;
  } catch {
    // If ethers fails, try basic normalization
    const trimmed = address.trim();
    if (isValidEthereumAddress(trimmed)) {
      // Return lowercase for consistency if ethers validation passes but getAddress fails
      return trimmed.toLowerCase();
    }
    return null;
  }
}

/**
 * Get address validation error message with detailed feedback
 *
 * @param address - Address to validate
 * @returns Error message or null if valid
 */
export function getAddressValidationError(address: string): string | null {
  if (!address || typeof address !== "string") {
    return "Address is required";
  }

  const trimmed = address.trim();

  if (trimmed.length === 0) {
    return "Address cannot be empty";
  }

  if (!trimmed.startsWith("0x")) {
    return "Address must start with 0x";
  }

  if (trimmed.length < 42) {
    return `Address is too short (${trimmed.length} characters, expected 42)`;
  }

  if (trimmed.length > 42) {
    return `Address is too long (${trimmed.length} characters, expected 42)`;
  }

  // Use ethers.js for final validation
  if (!isValidEthereumAddress(trimmed)) {
    if (!/^0x[a-fA-F0-9]+$/i.test(trimmed)) {
      return "Address contains invalid characters (only 0-9, a-f, A-F allowed)";
    }
    return "Invalid Ethereum address format";
  }

  return null;
}
