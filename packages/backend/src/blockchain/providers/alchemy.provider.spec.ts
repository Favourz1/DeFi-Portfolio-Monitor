import { Test, TestingModule } from "@nestjs/testing";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { AlchemyProvider } from "./alchemy.provider";
import { of, throwError } from "rxjs";
import { HttpException } from "@nestjs/common";

import { AxiosResponse, InternalAxiosRequestConfig } from "axios";

// Helper to create mock AxiosResponse
const createMockAxiosResponse = <T>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: "OK",
  headers: {},
  config: {} as InternalAxiosRequestConfig,
});

describe("AlchemyProvider", () => {
  let provider: AlchemyProvider;
  let mockPost: jest.Mock;
  let mockGet: jest.Mock;

  beforeEach(async () => {
    mockPost = jest.fn();
    const mockHttpService = {
      post: mockPost,
    };

    mockGet = jest.fn((key: string) => {
      if (key === "alchemy.mainnet") return "test_mainnet_key";
      if (key === "alchemy.sepolia") return "test_sepolia_key";
      return null;
    });
    const mockConfigService = {
      get: mockGet,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlchemyProvider,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    provider = module.get<AlchemyProvider>(AlchemyProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getTokenBalances", () => {
    const mockAddress = "0x1234567890123456789012345678901234567890";
    const mockNetwork = "mainnet" as const;

    it("should return token balances successfully", async () => {
      const mockResponseData = {
        result: {
          tokenBalances: [
            {
              contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
              tokenBalance: "1000000000",
            },
            {
              contractAddress: "0xAnotherToken",
              tokenBalance: "0x0", // Should be filtered out
            },
          ],
        },
      };

      const mockResponse = createMockAxiosResponse(mockResponseData);
      mockPost.mockReturnValue(of(mockResponse));

      const result = await provider.getTokenBalances(mockAddress, mockNetwork);

      expect(result).toHaveLength(1);
      expect(result[0].contractAddress).toBe(
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
      );
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining("alchemy.com"),
        expect.objectContaining({
          jsonrpc: "2.0",
          method: "alchemy_getTokenBalances",
          params: [mockAddress],
          id: 1,
        })
      );
    });

    it("should filter out zero balances", async () => {
      const mockResponseData = {
        result: {
          tokenBalances: [
            {
              contractAddress: "0xToken1",
              tokenBalance: "0x0",
            },
            {
              contractAddress: "0xToken2",
              tokenBalance: "0x",
            },
            {
              contractAddress: "0xToken3",
              tokenBalance: "0x1234",
            },
          ],
        },
      };

      const mockResponse = createMockAxiosResponse(mockResponseData);
      mockPost.mockReturnValue(of(mockResponse));

      const result = await provider.getTokenBalances(mockAddress, mockNetwork);

      expect(result).toHaveLength(1);
      expect(result[0].contractAddress).toBe("0xToken3");
    });

    it("should throw HttpException on API error", async () => {
      const mockResponseData = {
        error: {
          message: "Invalid API key",
        },
      };

      const mockResponse = createMockAxiosResponse(mockResponseData);
      mockPost.mockReturnValue(of(mockResponse));

      await expect(
        provider.getTokenBalances(mockAddress, mockNetwork)
      ).rejects.toThrow(HttpException);
    });

    it("should throw HttpException on network error", async () => {
      mockPost.mockReturnValue(throwError(() => new Error("Network error")));

      await expect(
        provider.getTokenBalances(mockAddress, mockNetwork)
      ).rejects.toThrow(HttpException);
    });
  });

  describe("getTokenMetadata", () => {
    const mockContractAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const mockNetwork = "mainnet" as const;

    it("should return token metadata successfully", async () => {
      const mockResponseData = {
        result: {
          symbol: "USDC",
          name: "USD Coin",
          decimals: 6,
          logo: "https://example.com/usdc.png",
        },
      };

      const mockResponse = createMockAxiosResponse(mockResponseData);
      mockPost.mockReturnValue(of(mockResponse));

      const result = await provider.getTokenMetadata(
        mockContractAddress,
        mockNetwork
      );

      expect(result).toEqual({
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
        logo: "https://example.com/usdc.png",
      });
    });

    it("should return default metadata on error", async () => {
      mockPost.mockReturnValue(throwError(() => new Error("API Error")));

      const result = await provider.getTokenMetadata(
        mockContractAddress,
        mockNetwork
      );

      expect(result).toEqual({
        symbol: "UNKNOWN",
        name: "Unknown Token",
        decimals: 18,
      });
    });

    it("should handle API error response", async () => {
      const mockResponseData = {
        error: {
          message: "Invalid contract address",
        },
      };

      const mockResponse = createMockAxiosResponse(mockResponseData);
      mockPost.mockReturnValue(of(mockResponse));

      const result = await provider.getTokenMetadata(
        mockContractAddress,
        mockNetwork
      );

      expect(result).toEqual({
        symbol: "UNKNOWN",
        name: "Unknown Token",
        decimals: 18,
      });
    });
  });

  describe("getEthBalance", () => {
    const mockAddress = "0x1234567890123456789012345678901234567890";
    const mockNetwork = "mainnet" as const;

    it("should return ETH balance successfully", async () => {
      const mockResponseData = {
        result: "0xde0b6b3a7640000", // 1 ETH in hex
      };

      const mockResponse = createMockAxiosResponse(mockResponseData);
      mockPost.mockReturnValue(of(mockResponse));

      const result = await provider.getEthBalance(mockAddress, mockNetwork);

      expect(result).toBe("1000000000000000000");
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining("alchemy.com"),
        expect.objectContaining({
          jsonrpc: "2.0",
          method: "eth_getBalance",
          params: [mockAddress, "latest"],
          id: 1,
        })
      );
    });

    it("should throw HttpException on API error", async () => {
      const mockResponseData = {
        error: {
          message: "Invalid address",
        },
      };

      const mockResponse = createMockAxiosResponse(mockResponseData);
      mockPost.mockReturnValue(of(mockResponse));

      await expect(
        provider.getEthBalance(mockAddress, mockNetwork)
      ).rejects.toThrow(HttpException);
    });

    it("should throw HttpException on network error", async () => {
      mockPost.mockReturnValue(throwError(() => new Error("Network error")));

      await expect(
        provider.getEthBalance(mockAddress, mockNetwork)
      ).rejects.toThrow(HttpException);
    });
  });
});
