import { Test, TestingModule } from "@nestjs/testing";
import { WalletController } from "./wallet.controller";
import { WalletService } from "./wallet.service";
import { ThrottlerGuard } from "@nestjs/throttler";

describe("WalletController", () => {
  let controller: WalletController;
  let walletService: jest.Mocked<WalletService>;

  beforeEach(async () => {
    const mockWalletService = {
      getTokenBalances: jest.fn(),
      getTransactions: jest.fn(),
      getPortfolio: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: WalletService,
          useValue: mockWalletService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WalletController>(WalletController);
    walletService = module.get(WalletService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getTokenBalances", () => {
    const mockAddress = "0x1234567890123456789012345678901234567890";
    const mockNetwork = "mainnet" as const;

    it("should return standardized API response with token balances", async () => {
      const mockData = {
        address: mockAddress,
        network: mockNetwork,
        tokens: [],
        ethBalance: {
          balance: "1.0",
          usdValue: "2000.00",
        },
        totalValue: "2000.00",
        lastUpdated: new Date().toISOString(),
      };

      walletService.getTokenBalances.mockResolvedValue(mockData);

      const result = await controller.getTokenBalances(
        { address: mockAddress },
        { network: mockNetwork }
      );

      expect(result).toHaveProperty("error", false);
      expect(result).toHaveProperty(
        "message",
        "Token balances retrieved successfully"
      );
      expect(result).toHaveProperty("statusCode", 200);
      expect(result).toHaveProperty("data", mockData);
      expect(result).toHaveProperty("timestamp");
      expect(walletService.getTokenBalances).toHaveBeenCalledWith(
        mockAddress,
        mockNetwork
      );
    });
  });

  describe("getTransactions", () => {
    const mockAddress = "0x1234567890123456789012345678901234567890";
    const mockNetwork = "mainnet" as const;

    it("should return standardized API response with transactions", async () => {
      const mockData = {
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

      walletService.getTransactions.mockResolvedValue(mockData);

      const result = await controller.getTransactions(
        { address: mockAddress },
        {
          network: mockNetwork,
          limit: 20,
          offset: 0,
          type: "all",
        }
      );

      expect(result).toHaveProperty("error", false);
      expect(result).toHaveProperty(
        "message",
        "Transactions retrieved successfully"
      );
      expect(result).toHaveProperty("statusCode", 200);
      expect(result).toHaveProperty("data", mockData);
      expect(result).toHaveProperty("timestamp");
      expect(walletService.getTransactions).toHaveBeenCalledWith(
        mockAddress,
        mockNetwork,
        20,
        0,
        "all",
        undefined
      );
    });

    it("should pass search parameter to service", async () => {
      const mockData = {
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

      walletService.getTransactions.mockResolvedValue(mockData);

      await controller.getTransactions(
        { address: mockAddress },
        {
          network: mockNetwork,
          limit: 20,
          offset: 0,
          type: "all",
          search: "USDC",
        }
      );

      expect(walletService.getTransactions).toHaveBeenCalledWith(
        mockAddress,
        mockNetwork,
        20,
        0,
        "all",
        "USDC"
      );
    });
  });

  describe("getPortfolio", () => {
    const mockAddress = "0x1234567890123456789012345678901234567890";
    const mockNetwork = "mainnet" as const;

    it("should return standardized API response with portfolio data", async () => {
      const mockData = {
        address: mockAddress,
        network: mockNetwork,
        tokens: [],
        ethBalance: {
          balance: "1.0",
          usdValue: "2000.00",
        },
        totalValue: "2000.00",
        lastUpdated: new Date().toISOString(),
      };

      walletService.getPortfolio.mockResolvedValue(mockData);

      const result = await controller.getPortfolio(
        { address: mockAddress },
        { network: mockNetwork }
      );

      expect(result).toHaveProperty("error", false);
      expect(result).toHaveProperty(
        "message",
        "Portfolio data retrieved successfully"
      );
      expect(result).toHaveProperty("statusCode", 200);
      expect(result).toHaveProperty("data", mockData);
      expect(result).toHaveProperty("timestamp");
      expect(walletService.getPortfolio).toHaveBeenCalledWith(
        mockAddress,
        mockNetwork
      );
    });
  });
});
