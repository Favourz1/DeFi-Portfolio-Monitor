import { renderHook, act } from "@testing-library/react";
import { useWallet } from "../useWallet";
import { WalletService } from "@/services/web3/wallet.service";

// Mock the WalletService
jest.mock("@/services/web3/wallet.service");

// Mock the wallet store
jest.mock("@/store/wallet.store", () => ({
  useWalletStore: () => ({
    address: null,
    chainId: null,
    network: "mainnet",
    isConnecting: false,
    error: null,
    isMetaMaskInstalled: false,
    setAddress: jest.fn(),
    setChainId: jest.fn(),
    setNetwork: jest.fn(),
    setConnecting: jest.fn(),
    setError: jest.fn(),
    setMetaMaskInstalled: jest.fn(),
    disconnect: jest.fn(),
  }),
}));

const mockWalletService = WalletService as jest.Mocked<typeof WalletService>;

describe("useWallet", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should check MetaMask installation on mount", () => {
    mockWalletService.isMetaMaskInstalled.mockReturnValue(true);
    mockWalletService.getCurrentAccount.mockResolvedValue(null);

    renderHook(() => useWallet());

    expect(mockWalletService.isMetaMaskInstalled).toHaveBeenCalled();
  });

  it("should return correct initial state", () => {
    mockWalletService.isMetaMaskInstalled.mockReturnValue(false);

    const { result } = renderHook(() => useWallet());

    expect(result.current.isConnected).toBe(false);
    expect(result.current.address).toBe(null);
    expect(result.current.isMetaMaskInstalled).toBe(false);
  });

  it("should handle connect function", async () => {
    mockWalletService.isMetaMaskInstalled.mockReturnValue(true);
    mockWalletService.connect.mockResolvedValue({
      address: "0x123...",
      chainId: 1,
    });

    const { result } = renderHook(() => useWallet());

    await act(async () => {
      await result.current.connect();
    });

    expect(mockWalletService.connect).toHaveBeenCalled();
  });
});
