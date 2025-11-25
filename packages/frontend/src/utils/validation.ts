/**
 * Validate Ethereum address format
 *
 * @param address - Address to validate
 * @returns True if valid Ethereum address
 */
export function isValidEthereumAddress(address: string): boolean {
  if (!address) return false;

  // Check if it starts with 0x and has 40 hex characters after
  const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethereumAddressRegex.test(address);
}

/**
 * Validate and normalize Ethereum address
 *
 * @param address - Address to validate and normalize
 * @returns Normalized address or null if invalid
 */
export function normalizeEthereumAddress(address: string): string | null {
  if (!address) return null;

  // Remove whitespace and convert to lowercase
  const normalized = address.trim().toLowerCase();

  if (!isValidEthereumAddress(normalized)) {
    return null;
  }

  return normalized;
}

/**
 * Get address validation error message
 *
 * @param address - Address to validate
 * @returns Error message or null if valid
 */
export function getAddressValidationError(address: string): string | null {
  if (!address) {
    return "Address is required";
  }

  if (!address.startsWith("0x")) {
    return "Address must start with 0x";
  }

  if (address.length !== 42) {
    return "Address must be 42 characters long";
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return "Address contains invalid characters";
  }

  return null;
}
