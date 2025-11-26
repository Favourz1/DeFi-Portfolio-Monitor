import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import * as wagmi from "wagmi";
import { NetworkSelector } from "./NetworkSelector";
import { toast } from "sonner";
import { mainnet, sepolia } from "wagmi/chains";
import type { UseAccountReturnType } from "wagmi";

// Helper types for partial mocks
type PartialUseSwitchChainReturnType = {
  switchChain: ReturnType<typeof vi.fn>;
  isPending: boolean;
};

// Type assertion helper
const asUseSwitchChainReturnType = (
  value: PartialUseSwitchChainReturnType
): wagmi.UseSwitchChainReturnType =>
  value as unknown as wagmi.UseSwitchChainReturnType;

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("NetworkSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when wallet is not connected", () => {
    vi.spyOn(wagmi, "useAccount").mockReturnValue({
      isConnected: false,
    } as UseAccountReturnType);

    vi.spyOn(wagmi, "useChainId").mockReturnValue(1);
    vi.spyOn(wagmi, "useSwitchChain").mockReturnValue(
      asUseSwitchChainReturnType({
        switchChain: vi.fn(),
        isPending: false,
      })
    );

    const { container } = render(<NetworkSelector />);

    expect(container.firstChild).toBeNull();
  });

  it("should render network selector when wallet is connected", () => {
    vi.spyOn(wagmi, "useAccount").mockReturnValue({
      isConnected: true,
    } as UseAccountReturnType);

    vi.spyOn(wagmi, "useChainId").mockReturnValue(mainnet.id);
    vi.spyOn(wagmi, "useSwitchChain").mockReturnValue(
      asUseSwitchChainReturnType({
        switchChain: vi.fn(),
        isPending: false,
      })
    );

    render(<NetworkSelector />);

    expect(screen.getByText("Mainnet")).toBeInTheDocument();
  });

  it("should show Sepolia when chainId is Sepolia", () => {
    vi.spyOn(wagmi, "useAccount").mockReturnValue({
      isConnected: true,
    } as UseAccountReturnType);

    vi.spyOn(wagmi, "useChainId").mockReturnValue(sepolia.id);
    vi.spyOn(wagmi, "useSwitchChain").mockReturnValue(
      asUseSwitchChainReturnType({
        switchChain: vi.fn(),
        isPending: false,
      })
    );

    render(<NetworkSelector />);

    expect(screen.getByText("Sepolia")).toBeInTheDocument();
  });

  it("should call switchChain when network is changed", async () => {
    const mockSwitchChain = vi.fn().mockResolvedValue(undefined);

    vi.spyOn(wagmi, "useAccount").mockReturnValue({
      isConnected: true,
    } as UseAccountReturnType);

    vi.spyOn(wagmi, "useChainId").mockReturnValue(mainnet.id);
    vi.spyOn(wagmi, "useSwitchChain").mockReturnValue(
      asUseSwitchChainReturnType({
        switchChain: mockSwitchChain,
        isPending: false,
      })
    );

    render(<NetworkSelector />);

    // Find and click the select trigger
    const selectTrigger = screen.getByRole("combobox");
    fireEvent.click(selectTrigger);

    // Wait for select content to appear and click Sepolia
    await waitFor(() => {
      const sepoliaOption = screen.getByText("Sepolia");
      expect(sepoliaOption).toBeInTheDocument();
    });

    const sepoliaOption = screen.getByText("Sepolia");
    fireEvent.click(sepoliaOption);

    await waitFor(() => {
      expect(mockSwitchChain).toHaveBeenCalledWith({ chainId: sepolia.id });
    });
  });

  it("should show loading state when switching network", () => {
    vi.spyOn(wagmi, "useAccount").mockReturnValue({
      isConnected: true,
    } as UseAccountReturnType);

    vi.spyOn(wagmi, "useChainId").mockReturnValue(mainnet.id);
    vi.spyOn(wagmi, "useSwitchChain").mockReturnValue(
      asUseSwitchChainReturnType({
        switchChain: vi.fn(),
        isPending: true,
      })
    );

    render(<NetworkSelector />);

    expect(screen.getByText("Switching...")).toBeInTheDocument();
  });

  it("should show error toast when network switch fails", async () => {
    const mockSwitchChain = vi
      .fn()
      .mockRejectedValue(new Error("User rejected"));

    vi.spyOn(wagmi, "useAccount").mockReturnValue({
      isConnected: true,
    } as UseAccountReturnType);

    vi.spyOn(wagmi, "useChainId").mockReturnValue(mainnet.id);
    vi.spyOn(wagmi, "useSwitchChain").mockReturnValue(
      asUseSwitchChainReturnType({
        switchChain: mockSwitchChain,
        isPending: false,
      })
    );

    render(<NetworkSelector />);

    const selectTrigger = screen.getByRole("combobox");
    fireEvent.click(selectTrigger);

    await waitFor(() => {
      const sepoliaOption = screen.getByText("Sepolia");
      expect(sepoliaOption).toBeInTheDocument();
    });

    const sepoliaOption = screen.getByText("Sepolia");
    fireEvent.click(sepoliaOption);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it("should show unsupported network warning when chainId is not supported", () => {
    vi.spyOn(wagmi, "useAccount").mockReturnValue({
      isConnected: true,
    } as UseAccountReturnType);

    vi.spyOn(wagmi, "useChainId").mockReturnValue(137); // Polygon (unsupported)
    vi.spyOn(wagmi, "useSwitchChain").mockReturnValue(
      asUseSwitchChainReturnType({
        switchChain: vi.fn(),
        isPending: false,
      })
    );

    render(<NetworkSelector />);

    expect(screen.getByText("Unsupported Network")).toBeInTheDocument();
    expect(
      screen.getByText("Please switch to Ethereum Mainnet or Sepolia Testnet")
    ).toBeInTheDocument();
  });
});
