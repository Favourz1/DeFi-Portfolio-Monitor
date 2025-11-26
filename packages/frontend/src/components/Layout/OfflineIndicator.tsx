import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { isOnline } from "@/utils/error";
import { cn } from "@/lib/utils";

/**
 * Offline indicator component
 *
 * @remarks
 * Shows a banner when the user goes offline and hides it when back online.
 * Uses browser's online/offline events for detection.
 */
export function OfflineIndicator() {
  const [online, setOnline] = useState(isOnline());

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      toast.success("Connection restored", {
        duration: 3000,
      });
    };

    const handleOffline = () => {
      setOnline(false);
      toast.error("You are offline", {
        duration: 5000,
        description: "Some features may not work until connection is restored.",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (online) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "bg-destructive text-destructive-foreground",
        "px-4 py-2 text-center text-sm font-medium",
        "flex items-center justify-center gap-2",
        "animate-in slide-in-from-top"
      )}
      role="alert"
      aria-live="polite"
    >
      <WifiOff className="h-4 w-4" />
      <span>You are offline. Some features may not be available.</span>
    </div>
  );
}
