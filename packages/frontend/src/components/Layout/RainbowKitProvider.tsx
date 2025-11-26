import React from "react";
import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { useTheme } from "./ThemeProvider";

/**
 * RainbowKit wrapper with theme integration
 *
 * @remarks
 * Needs to be inside ThemeProvider to access theme context.
 * Applies appropriate RainbowKit theme based on app's current theme.
 */
export function RainbowKitWithTheme({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

  return (
    <RainbowKitProvider
      theme={
        theme === "dark"
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
