import { Test, TestingModule } from "@nestjs/testing";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { EtherscanProvider } from "./etherscan.provider";
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

describe("EtherscanProvider", () => {
  let provider: EtherscanProvider;
  let mockGet: jest.Mock;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    mockGet = jest.fn();
    const mockHttpService = {
      get: mockGet,
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === "etherscan.apiKey") return "test_api_key";
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EtherscanProvider,
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

    provider = module.get<EtherscanProvider>(EtherscanProvider);
    httpService = module.get(HttpService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getNormalTransactions", () => {
    const mockAddress = "0x1234567890123456789012345678901234567890";
    const mockNetwork = "mainnet" as const;

    it("should return normal transactions successfully", async () => {
      const mockResponseData = {
        status: "1",
        result: [
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
        ],
      };

      const mockResponse = createMockAxiosResponse(mockResponseData);
      mockGet.mockReturnValue(of(mockResponse));

      const result = await provider.getNormalTransactions(
        mockAddress,
        mockNetwork,
        1,
        20
      );

      expect(result).toHaveLength(1);
      expect(result[0].hash).toBe("0xHash1");
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining("etherscan.io"),
        expect.objectContaining({
          params: expect.objectContaining({
            module: "account",
            action: "txlist",
            address: mockAddress.toLowerCase(),
          }),
        })
      );
    });

    it("should return empty array when no transactions found", async () => {
      const mockResponseData = {
        status: "0",
        message: "No transactions found",
        result: [],
      };

      const mockResponse = createMockAxiosResponse(mockResponseData);
      mockGet.mockReturnValue(of(mockResponse));

      const result = await provider.getNormalTransactions(
        mockAddress,
        mockNetwork,
        1,
        20
      );

      expect(result).toEqual([]);
    });

    it("should throw error on API error", async () => {
      const mockResponseData = {
        status: "0",
        message: "NOTOK",
        result: "Invalid API Key",
      };

      const mockResponse = createMockAxiosResponse(mockResponseData);
      mockGet.mockReturnValue(of(mockResponse));

      await expect(
        provider.getNormalTransactions(mockAddress, mockNetwork, 1, 20)
      ).rejects.toThrow("Etherscan API V2 error");
    });

    it("should throw HttpException on network error", async () => {
      mockGet.mockReturnValue(throwError(() => new Error("Network error")));

      await expect(
        provider.getNormalTransactions(mockAddress, mockNetwork, 1, 20)
      ).rejects.toThrow(HttpException);
    });
  });

  describe("getTokenTransfers", () => {
    const mockAddress = "0x1234567890123456789012345678901234567890";
    const mockNetwork = "mainnet" as const;

    it("should return token transfers successfully", async () => {
      const mockResponseData = {
        status: "1",
        result: [
          {
            hash: "0xHash1",
            from: mockAddress,
            to: "0xRecipient",
            value: "1000000",
            contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            tokenSymbol: "USDC",
            tokenName: "USD Coin",
            tokenDecimal: "6",
            timeStamp: "1609459200",
            blockNumber: "12345678",
            gasUsed: "65000",
            gasPrice: "20000000000",
          },
        ],
      };

      const mockResponse = createMockAxiosResponse(mockResponseData);
      mockGet.mockReturnValue(of(mockResponse));

      const result = await provider.getTokenTransfers(
        mockAddress,
        mockNetwork,
        1,
        20
      );

      expect(result).toHaveLength(1);
      expect(result[0].hash).toBe("0xHash1");
      expect(result[0].tokenSymbol).toBe("USDC");
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining("etherscan.io"),
        expect.objectContaining({
          params: expect.objectContaining({
            module: "account",
            action: "tokentx",
            address: mockAddress.toLowerCase(),
          }),
        })
      );
    });

    it("should return empty array when no token transfers found", async () => {
      const mockResponseData = {
        status: "0",
        message: "No transactions found",
        result: [],
      };

      const mockResponse = createMockAxiosResponse(mockResponseData);
      mockGet.mockReturnValue(of(mockResponse));

      const result = await provider.getTokenTransfers(
        mockAddress,
        mockNetwork,
        1,
        20
      );

      expect(result).toEqual([]);
    });

    it("should throw error on API error", async () => {
      const mockResponseData = {
        status: "0",
        message: "NOTOK",
        result: "Invalid API Key",
      };

      const mockResponse = createMockAxiosResponse(mockResponseData);
      mockGet.mockReturnValue(of(mockResponse));

      await expect(
        provider.getTokenTransfers(mockAddress, mockNetwork, 1, 20)
      ).rejects.toThrow("Etherscan API V2 error");
    });

    it("should throw HttpException on network error", async () => {
      mockGet.mockReturnValue(throwError(() => new Error("Network error")));

      await expect(
        provider.getTokenTransfers(mockAddress, mockNetwork, 1, 20)
      ).rejects.toThrow(HttpException);
    });
  });
});
