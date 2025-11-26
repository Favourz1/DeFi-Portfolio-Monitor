import { Test, TestingModule } from "@nestjs/testing";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { WalletService } from "./wallet.service";
import { AlchemyProvider } from "@/blockchain/providers/alchemy.provider";
import { EtherscanProvider } from "@/blockchain/providers/etherscan.provider";
import { CoingeckoProvider } from "@/blockchain/providers/coingecko.provider";
import { Cache } from "cache-manager";

describe("WalletService", () => {
  let service: WalletService;
  let mockGetTokenBalances: jest.Mock;
  let mockGetEthBalance: jest.Mock;
  let mockGetTokenMetadata: jest.Mock;
  let mockGetNormalTransactions: jest.Mock;
  let mockGetTokenTransfers: jest.Mock;
  let mockGetEthPrice: jest.Mock;
  let mockGetTokenPrices: jest.Mock;
  let mockGetBatchHistoricalPrices: jest.Mock;
  let mockCacheGet: jest.Mock;
  let mockCacheSet: jest.Mock;
  let alchemyProvider: AlchemyProvider;
  let etherscanProvider: EtherscanProvider;
  let coingeckoProvider: CoingeckoProvider;
  let cacheManager: Cache;

  beforeEach(async () => {
    mockGetTokenBalances = jest.fn();
    mockGetEthBalance = jest.fn();
    mockGetTokenMetadata = jest.fn();
    const mockAlchemyProvider = {
      getTokenBalances: mockGetTokenBalances,
      getEthBalance: mockGetEthBalance,
      getTokenMetadata: mockGetTokenMetadata,
    };

    mockGetNormalTransactions = jest.fn();
    mockGetTokenTransfers = jest.fn();
    const mockEtherscanProvider = {
      getNormalTransactions: mockGetNormalTransactions,
      getTokenTransfers: mockGetTokenTransfers,
    };

    mockGetEthPrice = jest.fn();
    mockGetTokenPrices = jest.fn();
    mockGetBatchHistoricalPrices = jest.fn();
    const mockCoingeckoProvider = {
      getEthPrice: mockGetEthPrice,
      getTokenPrices: mockGetTokenPrices,
      getBatchHistoricalPrices: mockGetBatchHistoricalPrices,
    };

    mockCacheGet = jest.fn();
    mockCacheSet = jest.fn();
    const mockCacheManager = {
      get: mockCacheGet,
      set: mockCacheSet,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: AlchemyProvider,
          useValue: mockAlchemyProvider,
        },
        {
          provide: EtherscanProvider,
          useValue: mockEtherscanProvider,
        },
        {
          provide: CoingeckoProvider,
          useValue: mockCoingeckoProvider,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    alchemyProvider = module.get(AlchemyProvider);
    etherscanProvider = module.get(EtherscanProvider);
    coingeckoProvider = module.get(CoingeckoProvider);
    cacheManager = module.get(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getTokenBalances", () => {
    const mockAddress = "0x1234567890123456789012345678901234567890";
    const mockNetwork = "mainnet" as const;

    it("should return cached token balances if available", async () => {
      const cachedResponse = {
        address: mockAddress,
        network: mockNetwork,
        tokens: [],
        ethBalance: { balance: "1.0", usdValue: "2000.00" },
        totalValue: "2000.00",
        lastUpdated: new Date().toISOString(),
      };

      mockCacheGet.mockResolvedValue(cachedResponse);

      const result = await service.getTokenBalances(mockAddress, mockNetwork);

      expect(result).toEqual(cachedResponse);
      expect(cacheManager.get).toHaveBeenCalledWith(
        `token_balances_${mockAddress}_${mockNetwork}`
      );
      expect(alchemyProvider.getTokenBalances).not.toHaveBeenCalled();
    });

    it("should fetch and return token balances with USD values", async () => {
      const mockTokenBalances = [
        {
          contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          tokenBalance: "1000000000", // 1000 USDC (6 decimals)
        },
      ];

      const mockEthBalance = "1000000000000000000"; // 1 ETH

      const mockTokenMetadata = {
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
        logo: "https://example.com/usdc.png",
      };

      const mockEthPrice = 2000;
      const mockTokenPrices = new Map([
        ["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", 1.0],
      ]);

      mockCacheGet.mockResolvedValue(null);
      mockGetTokenBalances.mockResolvedValue(mockTokenBalances);
      mockGetEthBalance.mockResolvedValue(mockEthBalance);
      mockGetTokenMetadata.mockResolvedValue(mockTokenMetadata);
      mockGetEthPrice.mockResolvedValue(mockEthPrice);
      mockGetTokenPrices.mockResolvedValue(mockTokenPrices);
      mockCacheSet.mockResolvedValue(undefined);

      const result = await service.getTokenBalances(mockAddress, mockNetwork);

      expect(result).toHaveProperty("address", mockAddress);
      expect(result).toHaveProperty("network", mockNetwork);
      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0]).toMatchObject({
        contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        symbol: "USDC",
        name: "USD Coin",
        balance: "1000.0",
        decimals: 6,
        usdValue: "1000.00",
      });
      expect(result.ethBalance.balance).toBe("1.0");
      expect(result.ethBalance.usdValue).toBe("2000.00");
      expect(result.totalValue).toBe("3000.00");
      expect(mockCacheSet).toHaveBeenCalled();
    });

    it("should sort tokens by USD value descending", async () => {
      const mockTokenBalances = [
        {
          contractAddress: "0xToken1",
          tokenBalance: "1000000000000000000", // 1 token
        },
        {
          contractAddress: "0xToken2",
          tokenBalance: "2000000000000000000", // 2 tokens
        },
      ];

      const mockTokenPrices = new Map([
        ["0xtoken1", 100], // $100 per token = $100 total
        ["0xtoken2", 50], // $50 per token = $100 total
      ]);

      mockCacheGet.mockResolvedValue(null);
      mockGetTokenBalances.mockResolvedValue(mockTokenBalances);
      mockGetEthBalance.mockResolvedValue("0");
      mockGetTokenMetadata.mockResolvedValue({
        symbol: "TOKEN",
        name: "Token",
        decimals: 18,
      });
      mockGetEthPrice.mockResolvedValue(2000);
      mockGetTokenPrices.mockResolvedValue(mockTokenPrices);
      mockCacheSet.mockResolvedValue(undefined);

      const result = await service.getTokenBalances(mockAddress, mockNetwork);

      expect(parseFloat(result.tokens[0].usdValue)).toBeGreaterThanOrEqual(
        parseFloat(result.tokens[1].usdValue)
      );
    });

    it("should handle errors and throw them", async () => {
      mockCacheGet.mockResolvedValue(null);
      mockGetTokenBalances.mockRejectedValue(new Error("API Error"));

      await expect(
        service.getTokenBalances(mockAddress, mockNetwork)
      ).rejects.toThrow("API Error");
    });
  });

  describe("getTransactions", () => {
    const mockAddress = "0x1234567890123456789012345678901234567890";
    const mockNetwork = "mainnet" as const;

    it("should return cached transactions if available", async () => {
      const cachedResponse = {
        address: mockAddress,
        network: mockNetwork,
        transactions: [],
        pagination: {
          total: 0,
          limit: 20,
          offset: 0,
          hasMore: false,
        },
      };

      mockCacheGet.mockResolvedValue(cachedResponse);

      const result = await service.getTransactions(
        mockAddress,
        mockNetwork,
        20,
        0,
        "all"
      );

      expect(result).toEqual(cachedResponse);
      expect(mockCacheGet).toHaveBeenCalled();
      expect(mockGetNormalTransactions).not.toHaveBeenCalled();
    });

    it("should fetch and transform transactions correctly", async () => {
      const mockNormalTxs = [
        {
          hash: "0xHash1",
          from: mockAddress,
          to: "0xRecipient",
          value: "1000000000000000000", // 1 ETH
          timeStamp: "1609459200",
          isError: "0",
          blockNumber: "12345678",
          gasUsed: "21000",
          gasPrice: "20000000000",
        },
      ];

      const mockTokenTxs = [
        {
          hash: "0xHash2",
          from: mockAddress,
          to: "0xRecipient",
          value: "1000000", // 1 USDC (6 decimals)
          contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          tokenSymbol: "USDC",
          tokenName: "USD Coin",
          tokenDecimal: "6",
          timeStamp: "1609459300",
          blockNumber: "12345679",
          gasUsed: "65000",
          gasPrice: "20000000000",
        },
      ];

      const mockHistoricalPrices = new Map([
        ["0xHash1", 2000], // $2000 for 1 ETH
        ["0xHash2", 1], // $1 for 1 USDC
      ]);

      mockCacheGet.mockResolvedValue(null);
      mockGetNormalTransactions.mockResolvedValue(mockNormalTxs);
      mockGetTokenTransfers.mockResolvedValue(mockTokenTxs);
      mockGetBatchHistoricalPrices.mockResolvedValue(mockHistoricalPrices);
      mockCacheSet.mockResolvedValue(undefined);

      const result = await service.getTransactions(
        mockAddress,
        mockNetwork,
        20,
        0,
        "all"
      );

      expect(result.transactions).toHaveLength(2);
      expect(result.transactions[0].type).toBe("erc20_transfer");
      expect(result.transactions[1].type).toBe("eth_transfer");
      expect(result.transactions[0].usdValue).toBe("1.00");
      expect(result.transactions[1].usdValue).toBe("2000.00");
      expect(result.pagination.total).toBe(2);
    });

    it("should filter transactions by type 'sent'", async () => {
      const mockNormalTxs = [
        {
          hash: "0xHash1",
          from: mockAddress,
          to: "0xRecipient",
          value: "1000000000000000000",
          timeStamp: "1609459200",
          isError: "0",
          blockNumber: "12345678",
          gasUsed: "21000",
          gasPrice: "20000000000",
        },
        {
          hash: "0xHash2",
          from: "0xSender",
          to: mockAddress,
          value: "2000000000000000000",
          timeStamp: "1609459300",
          isError: "0",
          blockNumber: "12345679",
          gasUsed: "21000",
          gasPrice: "20000000000",
        },
      ];

      const mockHistoricalPrices = new Map([
        ["0xHash1", 2000],
        ["0xHash2", 4000],
      ]);

      mockCacheGet.mockResolvedValue(null);
      mockGetNormalTransactions.mockResolvedValue(mockNormalTxs);
      mockGetTokenTransfers.mockResolvedValue([]);
      mockGetBatchHistoricalPrices.mockResolvedValue(mockHistoricalPrices);
      mockCacheSet.mockResolvedValue(undefined);

      const result = await service.getTransactions(
        mockAddress,
        mockNetwork,
        20,
        0,
        "sent"
      );

      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].from.toLowerCase()).toBe(
        mockAddress.toLowerCase()
      );
    });

    it("should filter transactions by type 'received'", async () => {
      const mockNormalTxs = [
        {
          hash: "0xHash1",
          from: mockAddress,
          to: "0xRecipient",
          value: "1000000000000000000",
          timeStamp: "1609459200",
          isError: "0",
          blockNumber: "12345678",
          gasUsed: "21000",
          gasPrice: "20000000000",
        },
        {
          hash: "0xHash2",
          from: "0xSender",
          to: mockAddress,
          value: "2000000000000000000",
          timeStamp: "1609459300",
          isError: "0",
          blockNumber: "12345679",
          gasUsed: "21000",
          gasPrice: "20000000000",
        },
      ];

      const mockHistoricalPrices = new Map([
        ["0xHash1", 2000],
        ["0xHash2", 4000],
      ]);

      mockCacheGet.mockResolvedValue(null);
      mockGetNormalTransactions.mockResolvedValue(mockNormalTxs);
      mockGetTokenTransfers.mockResolvedValue([]);
      mockGetBatchHistoricalPrices.mockResolvedValue(mockHistoricalPrices);
      mockCacheSet.mockResolvedValue(undefined);

      const result = await service.getTransactions(
        mockAddress,
        mockNetwork,
        20,
        0,
        "received"
      );

      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].to.toLowerCase()).toBe(
        mockAddress.toLowerCase()
      );
    });

    it("should filter transactions by search term", async () => {
      const mockNormalTxs = [
        {
          hash: "0xHash1",
          from: mockAddress,
          to: "0xRecipient",
          value: "1000000000000000000",
          timeStamp: "1609459200",
          isError: "0",
          blockNumber: "12345678",
          gasUsed: "21000",
          gasPrice: "20000000000",
        },
      ];

      const mockTokenTxs = [
        {
          hash: "0xHash2",
          from: mockAddress,
          to: "0xRecipient",
          value: "1000000",
          contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          tokenSymbol: "USDC",
          tokenName: "USD Coin",
          tokenDecimal: "6",
          timeStamp: "1609459300",
          blockNumber: "12345679",
          gasUsed: "65000",
          gasPrice: "20000000000",
        },
      ];

      const mockHistoricalPrices = new Map([
        ["0xHash1", 2000],
        ["0xHash2", 1],
      ]);

      mockCacheGet.mockResolvedValue(null);
      mockGetNormalTransactions.mockResolvedValue(mockNormalTxs);
      mockGetTokenTransfers.mockResolvedValue(mockTokenTxs);
      mockGetBatchHistoricalPrices.mockResolvedValue(mockHistoricalPrices);
      mockCacheSet.mockResolvedValue(undefined);

      const result = await service.getTransactions(
        mockAddress,
        mockNetwork,
        20,
        0,
        "all",
        "USDC"
      );

      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].tokenSymbol).toBe("USDC");
    });

    it("should handle pagination correctly", async () => {
      const mockNormalTxs = Array.from({ length: 30 }, (_, i) => ({
        hash: `0xHash${i}`,
        from: mockAddress,
        to: "0xRecipient",
        value: "1000000000000000000",
        timeStamp: (1609459200 + i).toString(),
        isError: "0",
        blockNumber: (12345678 + i).toString(),
        gasUsed: "21000",
        gasPrice: "20000000000",
      }));

      const mockHistoricalPrices = new Map(
        mockNormalTxs.map((tx) => [tx.hash, 2000])
      );

      mockCacheGet.mockResolvedValue(null);
      mockGetNormalTransactions.mockResolvedValue(mockNormalTxs);
      mockGetTokenTransfers.mockResolvedValue([]);
      mockGetBatchHistoricalPrices.mockResolvedValue(mockHistoricalPrices);
      mockCacheSet.mockResolvedValue(undefined);

      const result = await service.getTransactions(
        mockAddress,
        mockNetwork,
        10,
        0,
        "all"
      );

      expect(result.transactions).toHaveLength(10);
      expect(result.pagination.total).toBe(30);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.offset).toBe(0);
      expect(result.pagination.hasMore).toBe(true);
    });

    it("should handle errors gracefully", async () => {
      mockCacheGet.mockResolvedValue(null);
      mockGetNormalTransactions.mockRejectedValue(new Error("API Error"));
      mockGetTokenTransfers.mockResolvedValue([]);
      mockGetBatchHistoricalPrices.mockResolvedValue(new Map());
      mockCacheSet.mockResolvedValue(undefined);

      const result = await service.getTransactions(
        mockAddress,
        mockNetwork,
        20,
        0,
        "all"
      );

      // Service handles errors gracefully and returns empty transactions array
      expect(result.transactions).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe("getPortfolio", () => {
    const mockAddress = "0x1234567890123456789012345678901234567890";
    const mockNetwork = "mainnet" as const;

    it("should return portfolio data (same as token balances)", async () => {
      const mockTokenBalances = [];
      const mockEthBalance = "1000000000000000000";

      mockCacheGet.mockResolvedValue(null);
      mockGetTokenBalances.mockResolvedValue(mockTokenBalances);
      mockGetEthBalance.mockResolvedValue(mockEthBalance);
      mockGetEthPrice.mockResolvedValue(2000);
      mockGetTokenPrices.mockResolvedValue(new Map());
      mockCacheSet.mockResolvedValue(undefined);

      const result = await service.getPortfolio(mockAddress, mockNetwork);

      expect(result).toHaveProperty("address", mockAddress);
      expect(result).toHaveProperty("network", mockNetwork);
      expect(result).toHaveProperty("totalValue");
    });
  });
});
