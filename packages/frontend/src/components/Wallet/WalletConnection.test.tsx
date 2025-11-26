import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { WalletConnection } from "./WalletConnection";
import * as rainbowkit from "@rainbow-me/rainbowkit";

// Mock RainbowKit ConnectButton
vi.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: vi.fn(({ children, ...props }) => (
    <button data-testid="connect-button" {...props}>
      {children || "Connect Wallet"}
    </button>
  )),
}));

describe("WalletConnection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render RainbowKit ConnectButton", () => {
    render(<WalletConnection />);

    const connectButton = screen.getByTestId("connect-button");
    expect(connectButton).toBeInTheDocument();
  });

  it("should use default ConnectButton from RainbowKit", () => {
    const { ConnectButton } = rainbowkit;
    render(<WalletConnection />);

    expect(ConnectButton).toHaveBeenCalled();
  });
});
