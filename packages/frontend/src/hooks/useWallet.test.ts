import { renderHook } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import * as wagmi from "wagmi";
import { useWallet } from "./useWallet";
import type { UseAccountReturnType } from "wagmi";

// Mock the store
const mockUseWalletStore = vi.fn();
vi.mock("@/store/wallet.store", () => ({
  useWalletStore: () => mockUseWalletStore(),
}));

// Helper types for partial mocks
type PartialUseSwitchChainReturnType = {
  switchChain: ReturnType<typeof vi.fn>;
  isPending: boolean;
};

type PartialUseDisconnectReturnType = {
  disconnect: ReturnType<typeof vi.fn>;
};

// Type assertions for Wagmi hooks
const asUseSwitchChainReturnType = (
  value: PartialUseSwitchChainReturnType
): wagmi.UseSwitchChainReturnType =>
  value as unknown as wagmi.UseSwitchChainReturnType;

const asUseDisconnectReturnType = (
  value: PartialUseDisconnectReturnType
): wagmi.UseDisconnectReturnType =>
  value as unknown as wagmi.UseDisconnectReturnType;

describe("useWallet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return wallet state from Wagmi hooks when connected", () => {
    const mockAddress = "0x1234567890123456789012345678901234567890";
    const mockSwitchChain = vi.fn();
    const mockDisconnect = vi.fn();

    vi.spyOn(wagmi, "useAccount").mockReturnValue({
      address: mockAddress as `0x${string}`,
      isConnected: true,
    } as UseAccountReturnType);

    vi.spyOn(wagmi, "useChainId").mockReturnValue(1);
    vi.spyOn(wagmi, "useSwitchChain").mockReturnValue(
      asUseSwitchChainReturnType({
        switchChain: mockSwitchChain,
        isPending: false,
      })
    );
    vi.spyOn(wagmi, "useDisconnect").mockReturnValue(
      asUseDisconnectReturnType({
        disconnect: mockDisconnect,
      })
    );

    mockUseWalletStore.mockReturnValue({
      address: null,
      isManualMode: false,
      network: "mainnet",
      setManualAddress: vi.fn(),
      clearManualAddress: vi.fn(),
      setNetwork: vi.fn(),
    });

    const { result } = renderHook(() => useWallet());

    expect(result.current.address).toBe(mockAddress);
    expect(result.current.isConnected).toBe(true);
    expect(result.current.isWalletConnected).toBe(true);
    expect(result.current.network).toBe("mainnet");
    expect(result.current.chainId).toBe(1);
  });

  it("should return manual address mode when not connected via wallet", () => {
    const mockManualAddress = "0x9876543210987654321098765432109876543210";
    const mockSwitchChain = vi.fn();
    const mockDisconnect = vi.fn();

    vi.spyOn(wagmi, "useAccount").mockReturnValue({
      address: undefined,
      isConnected: false,
    } as UseAccountReturnType);

    vi.spyOn(wagmi, "useChainId").mockReturnValue(1);
    vi.spyOn(wagmi, "useSwitchChain").mockReturnValue(
      asUseSwitchChainReturnType({
        switchChain: mockSwitchChain,
        isPending: false,
      })
    );
    vi.spyOn(wagmi, "useDisconnect").mockReturnValue(
      asUseDisconnectReturnType({
        disconnect: mockDisconnect,
      })
    );

    mockUseWalletStore.mockReturnValue({
      address: mockManualAddress,
      isManualMode: true,
      network: "mainnet",
      setManualAddress: vi.fn(),
      clearManualAddress: vi.fn(),
      setNetwork: vi.fn(),
    });

    const { result } = renderHook(() => useWallet());

    expect(result.current.address).toBe(mockManualAddress);
    expect(result.current.isConnected).toBe(true);
    expect(result.current.isManualMode).toBe(true);
    expect(result.current.isWalletConnected).toBe(false);
  });

  it("should map chainId to network correctly", () => {
    const mockSwitchChain = vi.fn();
    const mockDisconnect = vi.fn();

    vi.spyOn(wagmi, "useAccount").mockReturnValue({
      address: "0x123" as `0x${string}`,
      isConnected: true,
    } as UseAccountReturnType);

    vi.spyOn(wagmi, "useChainId").mockReturnValue(11155111); // Sepolia
    vi.spyOn(wagmi, "useSwitchChain").mockReturnValue(
      asUseSwitchChainReturnType({
        switchChain: mockSwitchChain,
        isPending: false,
      })
    );
    vi.spyOn(wagmi, "useDisconnect").mockReturnValue(
      asUseDisconnectReturnType({
        disconnect: mockDisconnect,
      })
    );

    mockUseWalletStore.mockReturnValue({
      address: null,
      isManualMode: false,
      network: "mainnet",
      setManualAddress: vi.fn(),
      clearManualAddress: vi.fn(),
      setNetwork: vi.fn(),
    });

    const { result } = renderHook(() => useWallet());

    expect(result.current.network).toBe("sepolia");
  });

  it("should call switchChain when switchNetwork is called", async () => {
    const mockSwitchChain = vi.fn().mockResolvedValue(undefined);
    const mockDisconnect = vi.fn();

    vi.spyOn(wagmi, "useAccount").mockReturnValue({
      address: "0x123" as `0x${string}`,
      isConnected: true,
    } as UseAccountReturnType);

    vi.spyOn(wagmi, "useChainId").mockReturnValue(1);
    vi.spyOn(wagmi, "useSwitchChain").mockReturnValue(
      asUseSwitchChainReturnType({
        switchChain: mockSwitchChain,
        isPending: false,
      })
    );
    vi.spyOn(wagmi, "useDisconnect").mockReturnValue(
      asUseDisconnectReturnType({
        disconnect: mockDisconnect,
      })
    );

    mockUseWalletStore.mockReturnValue({
      address: null,
      isManualMode: false,
      network: "mainnet",
      setManualAddress: vi.fn(),
      clearManualAddress: vi.fn(),
      setNetwork: vi.fn(),
    });

    const { result } = renderHook(() => useWallet());

    await result.current.switchNetwork(11155111);

    expect(mockSwitchChain).toHaveBeenCalledWith({ chainId: 11155111 });
  });

  it("should throw error when switchNetwork called without wallet connection", async () => {
    const mockSwitchChain = vi.fn();
    const mockDisconnect = vi.fn();

    vi.spyOn(wagmi, "useAccount").mockReturnValue({
      address: undefined,
      isConnected: false,
    } as UseAccountReturnType);

    vi.spyOn(wagmi, "useChainId").mockReturnValue(1);
    vi.spyOn(wagmi, "useSwitchChain").mockReturnValue(
      asUseSwitchChainReturnType({
        switchChain: mockSwitchChain,
        isPending: false,
      })
    );
    vi.spyOn(wagmi, "useDisconnect").mockReturnValue(
      asUseDisconnectReturnType({
        disconnect: mockDisconnect,
      })
    );

    mockUseWalletStore.mockReturnValue({
      address: null,
      isManualMode: false,
      network: "mainnet",
      setManualAddress: vi.fn(),
      clearManualAddress: vi.fn(),
      setNetwork: vi.fn(),
    });

    const { result } = renderHook(() => useWallet());

    await expect(result.current.switchNetwork(11155111)).rejects.toThrow(
      "Wallet not connected"
    );
  });

  it("should call disconnect from Wagmi when wallet is connected", () => {
    const mockDisconnect = vi.fn();
    const mockSwitchChain = vi.fn();

    vi.spyOn(wagmi, "useAccount").mockReturnValue({
      address: "0x123" as `0x${string}`,
      isConnected: true,
    } as UseAccountReturnType);

    vi.spyOn(wagmi, "useChainId").mockReturnValue(1);
    vi.spyOn(wagmi, "useSwitchChain").mockReturnValue(
      asUseSwitchChainReturnType({
        switchChain: mockSwitchChain,
        isPending: false,
      })
    );
    vi.spyOn(wagmi, "useDisconnect").mockReturnValue(
      asUseDisconnectReturnType({
        disconnect: mockDisconnect,
      })
    );

    mockUseWalletStore.mockReturnValue({
      address: null,
      isManualMode: false,
      network: "mainnet",
      setManualAddress: vi.fn(),
      clearManualAddress: vi.fn(),
      setNetwork: vi.fn(),
    });

    const { result } = renderHook(() => useWallet());

    result.current.disconnect();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("should clear manual address when in manual mode", () => {
    const mockClearManual = vi.fn();
    const mockSwitchChain = vi.fn();
    const mockDisconnect = vi.fn();

    vi.spyOn(wagmi, "useAccount").mockReturnValue({
      address: undefined,
      isConnected: false,
    } as UseAccountReturnType);

    vi.spyOn(wagmi, "useChainId").mockReturnValue(1);
    vi.spyOn(wagmi, "useSwitchChain").mockReturnValue(
      asUseSwitchChainReturnType({
        switchChain: mockSwitchChain,
        isPending: false,
      })
    );
    vi.spyOn(wagmi, "useDisconnect").mockReturnValue(
      asUseDisconnectReturnType({
        disconnect: mockDisconnect,
      })
    );

    mockUseWalletStore.mockReturnValue({
      address: "0x123",
      isManualMode: true,
      network: "mainnet",
      setManualAddress: vi.fn(),
      clearManualAddress: mockClearManual,
      setNetwork: vi.fn(),
    });

    const { result } = renderHook(() => useWallet());

    result.current.disconnect();

    expect(mockClearManual).toHaveBeenCalled();
  });
});
