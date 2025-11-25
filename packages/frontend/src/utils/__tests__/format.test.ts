import {
  formatAddress,
  formatTokenBalance,
  formatUSD,
  formatRelativeTime,
  formatDate,
  formatTransactionHash,
  formatLargeNumber,
  formatPercentage,
} from "../format";

describe("Format Utilities", () => {
  describe("formatAddress", () => {
    it("should format Ethereum address correctly", () => {
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      expect(formatAddress(address)).toBe("0x1234...5678");
    });

    it("should handle custom character count", () => {
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      expect(formatAddress(address, 6)).toBe("0x123456...345678");
    });

    it("should handle empty address", () => {
      expect(formatAddress("")).toBe("");
    });
  });

  describe("formatTokenBalance", () => {
    it("should format zero balance", () => {
      expect(formatTokenBalance("0")).toBe("0");
    });

    it("should format very small balance", () => {
      expect(formatTokenBalance("0.00001")).toBe("< 0.0001");
    });

    it("should format small balance", () => {
      expect(formatTokenBalance("0.1234")).toBe("0.1234");
    });

    it("should format medium balance", () => {
      expect(formatTokenBalance("123.456")).toBe("123.46");
    });

    it("should format large balance with K suffix", () => {
      expect(formatTokenBalance("12345")).toBe("12.35K");
    });

    it("should format very large balance with M suffix", () => {
      expect(formatTokenBalance("1234567")).toBe("1.23M");
    });
  });

  describe("formatUSD", () => {
    it("should format USD value correctly", () => {
      expect(formatUSD(1234.56)).toBe("$1,234.56");
    });

    it("should format string USD value", () => {
      expect(formatUSD("1234.56")).toBe("$1,234.56");
    });

    it("should handle invalid values", () => {
      expect(formatUSD("invalid")).toBe("$0.00");
    });

    it("should handle zero", () => {
      expect(formatUSD(0)).toBe("$0.00");
    });
  });

  describe("formatRelativeTime", () => {
    const now = Date.now();
    const secondsAgo = Math.floor(now / 1000);

    it("should format seconds ago", () => {
      const timestamp = secondsAgo - 30;
      expect(formatRelativeTime(timestamp)).toBe("Just now");
    });

    it("should format minutes ago", () => {
      const timestamp = secondsAgo - 300; // 5 minutes ago
      expect(formatRelativeTime(timestamp)).toBe("5 minutes ago");
    });

    it("should format hours ago", () => {
      const timestamp = secondsAgo - 7200; // 2 hours ago
      expect(formatRelativeTime(timestamp)).toBe("2 hours ago");
    });

    it("should format days ago", () => {
      const timestamp = secondsAgo - 172800; // 2 days ago
      expect(formatRelativeTime(timestamp)).toBe("2 days ago");
    });
  });

  describe("formatDate", () => {
    it("should format timestamp to readable date", () => {
      const timestamp = 1640995200; // Jan 1, 2022 00:00:00 UTC
      const result = formatDate(timestamp);
      expect(result).toMatch(/Jan 1, 2022/);
    });
  });

  describe("formatTransactionHash", () => {
    it("should format transaction hash correctly", () => {
      const hash =
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      expect(formatTransactionHash(hash)).toBe("0x123456...abcdef");
    });

    it("should handle empty hash", () => {
      expect(formatTransactionHash("")).toBe("");
    });
  });

  describe("formatLargeNumber", () => {
    it("should format small numbers", () => {
      expect(formatLargeNumber(123)).toBe("123.00");
    });

    it("should format thousands with K", () => {
      expect(formatLargeNumber(12345)).toBe("12.35K");
    });

    it("should format millions with M", () => {
      expect(formatLargeNumber(12345678)).toBe("12.35M");
    });

    it("should format billions with B", () => {
      expect(formatLargeNumber(12345678901)).toBe("12.35B");
    });
  });

  describe("formatPercentage", () => {
    it("should format percentage correctly", () => {
      expect(formatPercentage(12.34)).toBe("12.34%");
    });

    it("should handle custom decimals", () => {
      expect(formatPercentage(12.3456, 1)).toBe("12.3%");
    });
  });
});
