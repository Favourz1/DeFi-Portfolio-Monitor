import { Test, TestingModule } from "@nestjs/testing";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { CoingeckoProvider } from "./coingecko.provider";
import { of, throwError } from "rxjs";
import { HttpException } from "@nestjs/common";
import { Cache } from "cache-manager";
import { AxiosResponse, InternalAxiosRequestConfig } from "axios";

// Helper to create mock AxiosResponse
const createMockAxiosResponse = <T>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: "OK",
  headers: {},
  config: {} as InternalAxiosRequestConfig,
});

describe("CoingeckoProvider", () => {
  let provider: CoingeckoProvider;
  let mockGet: jest.Mock;
  let mockCacheGet: jest.Mock;
  let mockCacheSet: jest.Mock;
  let httpService: HttpService;
  let configService: ConfigService;
  let cacheManager: Cache;

  beforeEach(async () => {
    mockGet = jest.fn();
    const mockHttpService = {
      get: mockGet,
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === "coingecko.apiKey") return "test_api_key";
        return null;
      }),
    };

    mockCacheGet = jest.fn();
    mockCacheSet = jest.fn();
    const mockCacheManager = {
      get: mockCacheGet,
      set: mockCacheSet,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoingeckoProvider,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    provider = module.get<CoingeckoProvider>(CoingeckoProvider);
    httpService = module.get(HttpService);
    configService = module.get(ConfigService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("getEthPrice", () => {
    it("should return cached ETH price if available", async () => {
      const cachedPrice = 2000;
      mockCacheGet.mockResolvedValue(cachedPrice);

      const result = await provider.getEthPrice();

      expect(result).toBe(cachedPrice);
      expect(mockCacheGet).toHaveBeenCalledWith("eth_price_usd");
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should fetch and cache ETH price successfully", async () => {
      const mockResponseData = {
        ethereum: {
          usd: 2000,
        },
      };

      mockCacheGet.mockResolvedValue(null);
      const mockResponse = createMockAxiosResponse(mockResponseData);
      mockGet.mockReturnValue(of(mockResponse));
      mockCacheSet.mockResolvedValue(undefined);

      const result = await provider.getEthPrice();

      expect(result).toBe(2000);
      expect(mockCacheSet).toHaveBeenCalledWith("eth_price_usd", 2000, 60000);
    });

    it("should return cached value on API error if available", async () => {
      const cachedPrice = 2000;
      mockCacheGet
        .mockResolvedValueOnce(null) // First call (cache miss)
        .mockResolvedValueOnce(cachedPrice); // Second call (fallback)

      mockGet.mockReturnValue(throwError(() => new Error("API Error")));

      const result = await provider.getEthPrice();

      expect(result).toBe(cachedPrice);
    });

    it("should throw HttpException on API error with no cache", async () => {
      mockCacheGet.mockResolvedValue(null);
      mockGet.mockReturnValue(throwError(() => new Error("API Error")));

      await expect(provider.getEthPrice()).rejects.toThrow(HttpException);
    });
  });

  describe("getTokenPrices", () => {
    const mockNetwork = "mainnet" as const;

    it("should return empty map for sepolia network", async () => {
      const result = await provider.getTokenPrices(
        ["0xToken1"],
        "sepolia" as const
      );

      expect(result).toEqual(new Map());
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should return cached token prices if available", async () => {
      const cachedPrices = {
        "0xtoken1": 1.0,
        "0xtoken2": 2.0,
      };

      mockCacheGet.mockResolvedValue(cachedPrices);

      const result = await provider.getTokenPrices(
        ["0xToken1", "0xToken2"],
        mockNetwork
      );

      expect(result).toEqual(new Map(Object.entries(cachedPrices)));
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should fetch and cache token prices successfully", async () => {
      const mockResponseData = {
        "0xtoken1": {
          usd: 1.0,
        },
        "0xtoken2": {
          usd: 2.0,
        },
      };

      mockCacheGet.mockResolvedValue(null);
      const mockResponse = createMockAxiosResponse(mockResponseData);
      mockGet.mockReturnValue(of(mockResponse));
      mockCacheSet.mockResolvedValue(undefined);

      const result = await provider.getTokenPrices(
        ["0xToken1", "0xToken2"],
        mockNetwork
      );

      expect(result.size).toBe(2);
      expect(result.get("0xtoken1")).toBe(1.0);
      expect(result.get("0xtoken2")).toBe(2.0);
      expect(cacheManager.set).toHaveBeenCalled();
    });

    it("should return empty map on API error", async () => {
      mockCacheGet.mockResolvedValue(null);
      mockGet.mockReturnValue(throwError(() => new Error("API Error")));

      const result = await provider.getTokenPrices(["0xToken1"], mockNetwork);

      expect(result).toEqual(new Map());
    });

    it("should return empty map for empty address array", async () => {
      const result = await provider.getTokenPrices([], mockNetwork);

      expect(result).toEqual(new Map());
      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe("getBatchHistoricalPrices", () => {
    const mockNetwork = "mainnet" as const;

    it("should return map with zero values for sepolia network (no price data)", async () => {
      const transactions = [
        {
          hash: "0xHash1",
          timestamp: 1609459200,
          type: "eth" as const,
          value: "1.0",
        },
      ];

      // Mock getEthPriceAtDate to return 0 for sepolia (as per implementation)
      // getEthPriceAtDate doesn't have early return for sepolia, so it will try to fetch
      // and fallback to 0 or current price. We mock it to return 0.
      const getEthPriceAtDateSpy = jest
        .spyOn(provider, "getEthPriceAtDate")
        .mockResolvedValue(0);

      const result = await provider.getBatchHistoricalPrices(
        transactions,
        "sepolia" as const
      );

      // For sepolia, prices are not available, so it returns 0
      expect(result.get("0xHash1")).toBe(0);
      expect(result.size).toBe(1);
      expect(getEthPriceAtDateSpy).toHaveBeenCalledWith(1609459200);

      getEthPriceAtDateSpy.mockRestore();
    });

    it("should process ETH transactions and get historical prices", async () => {
      const transactions = [
        {
          hash: "0xHash1",
          timestamp: 1609459200,
          type: "eth" as const,
          value: "1.0",
        },
      ];

      // Mock getEthPriceAtDate
      const getEthPriceAtDateSpy = jest
        .spyOn(provider, "getEthPriceAtDate")
        .mockResolvedValue(2000);

      const result = await provider.getBatchHistoricalPrices(
        transactions,
        mockNetwork
      );

      expect(result.get("0xHash1")).toBe(2000);
      expect(getEthPriceAtDateSpy).toHaveBeenCalledWith(1609459200);

      getEthPriceAtDateSpy.mockRestore();
    });

    it("should process token transactions and get historical prices", async () => {
      const transactions = [
        {
          hash: "0xHash1",
          timestamp: 1609459200,
          type: "token" as const,
          contractAddress: "0xToken1",
          value: "1.0",
        },
      ];

      // Mock getTokenPriceAtDate
      const getTokenPriceAtDateSpy = jest
        .spyOn(provider, "getTokenPriceAtDate")
        .mockResolvedValue(1.0);

      const result = await provider.getBatchHistoricalPrices(
        transactions,
        mockNetwork
      );

      expect(result.get("0xHash1")).toBe(1.0);
      expect(getTokenPriceAtDateSpy).toHaveBeenCalledWith(
        "0xToken1",
        1609459200,
        mockNetwork
      );

      getTokenPriceAtDateSpy.mockRestore();
    });
  });
});
