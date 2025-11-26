import React from "react";
import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { useTheme } from "next-themes";

/**
 * RainbowKit wrapper with theme integration
 *
 * @remarks
 * Needs to be inside ThemeProvider (next-themes) to access theme context.
 * Applies appropriate RainbowKit theme based on app's current theme.
 * Must be inside WagmiProvider for RainbowKit to work properly.
 */
export function RainbowKitWithTheme({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <RainbowKitProvider
      theme={
        resolvedTheme === "dark"
          ? darkTheme({
              accentColor: "#0E76FD",
              accentColorForeground: "white",
              borderRadius: "medium",
            })
          : lightTheme({
              accentColor: "#0E76FD",
              accentColorForeground: "white",
              borderRadius: "medium",
            })
      }
    >
      {children}
    </RainbowKitProvider>
  );
}
