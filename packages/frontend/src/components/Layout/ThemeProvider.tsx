import React, { useEffect, useState } from "react";
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor } from "lucide-react";

/**
 * Type for "attribute" prop for next-themes
 * - "class"
 * - any string starting with "data-"
 */
type Attribute = "class" | `data-${string}`;

/**
 * Props for ThemeProvider component
 */
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
  attribute?: Attribute | Attribute[];
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

/**
 * Theme provider component that wraps next-themes with additional functionality
 *
 * @remarks
 * Provides dark/light mode support with system preference detection
 * and smooth theme transitions
 */
export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "defi-tracker-theme",
  attribute = "class",
  enableSystem = true,
  disableTransitionOnChange = true,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      storageKey={storageKey}
      disableTransitionOnChange={disableTransitionOnChange}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

/**
 * Hook to use theme context
 *
 * @returns Theme context value
 * @throws Error if used outside ThemeProvider
 */
export function useTheme() {
  return useNextTheme();
}

/**
 * Theme toggle button component
 *
 * @remarks
 * Cycles through light, dark, and system themes with appropriate icons
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const cycleTheme = () => {
    switch (theme) {
      case "light":
        setTheme("dark");
        break;
      case "dark":
        setTheme("system");
        break;
      case "system":
      default:
        setTheme("light");
        break;
    }
  };

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      case "system":
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case "light":
        return "Switch to dark mode";
      case "dark":
        return "Switch to system mode";
      case "system":
      default:
        return "Switch to light mode";
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={cycleTheme}
      title={getLabel()}
      className="relative cursor-pointer"
    >
      {getIcon()}
      <span className="sr-only">{getLabel()}</span>
    </Button>
  );
}

/**
 * Theme selector dropdown component
 *
 * @remarks
 * Provides a dropdown interface for theme selection
 */
export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">Theme:</span>
      <div className="flex rounded-md border">
        {themes.map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            variant={theme === value ? "default" : "ghost"}
            size="sm"
            onClick={() => setTheme(value)}
            className="rounded-none first:rounded-l-md last:rounded-r-md cursor-pointer"
          >
            <Icon className="h-4 w-4 mr-1" />
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}

/**
 * Theme status indicator component
 *
 * @remarks
 * Shows current theme status with system preference information
 */
export function ThemeStatus() {
  const { theme, systemTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="text-xs text-muted-foreground space-y-1">
      <div>
        Current theme: <span className="font-mono">{theme}</span>
      </div>
      <div>
        Resolved theme: <span className="font-mono">{resolvedTheme}</span>
      </div>
      {systemTheme && (
        <div>
          System theme: <span className="font-mono">{systemTheme}</span>
        </div>
      )}
    </div>
  );
}
