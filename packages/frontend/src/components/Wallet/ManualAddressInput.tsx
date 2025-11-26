import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, X, AlertCircle } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { getAddressValidationError } from "@/utils/validation";
import { toast } from "sonner";

interface ManualAddressInputProps {
  onAddressSet?: (address: string) => void;
  onCancel?: () => void;
}

/**
 * Manual address input component for viewing portfolios without connecting wallet
 *
 * @remarks
 * Allows users to input an Ethereum address manually to view portfolio data
 * without connecting their MetaMask wallet
 */
export function ManualAddressInput({
  onAddressSet,
  onCancel,
}: ManualAddressInputProps) {
  const { setManualAddress, isConnecting } = useWallet();
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  /**
   * Handle address input change with validation
   */
  const handleAddressChange = (value: string) => {
    setAddress(value);
    setError(null);

    // Clear error when user starts typing
    if (value.length > 0) {
      const validationError = getAddressValidationError(value);
      if (validationError && value.length >= 42) {
        setError(validationError);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address.trim()) {
      setError("Please enter an Ethereum address");
      return;
    }

    const validationError = getAddressValidationError(address.trim());
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      setManualAddress(address.trim());
      toast.success("Address set successfully");
      onAddressSet?.(address.trim());
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to set address";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  const handleCancel = () => {
    setAddress("");
    setError(null);
    onCancel?.();
  };

  const handleExampleClick = (exampleAddress: string) => {
    setAddress(exampleAddress);
    setError(null);
  };

  const isLoading = isConnecting || isValidating;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          View Any Wallet
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter an Ethereum address to view its portfolio without connecting
          your wallet
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium">
              Ethereum Address
            </label>
            <Input
              id="address"
              type="text"
              placeholder="0x1234567890123456789012345678901234567890"
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              disabled={isLoading}
              className={error ? "border-red-500 focus:border-red-500" : ""}
            />
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>

          {/* Example addresses */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  handleExampleClick(
                    "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503"
                  )
                }
                disabled={isLoading}
                className="text-xs cursor-pointer"
              >
                Example Wallet
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading || !address.trim()}
              className="flex-1 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isValidating ? "Setting..." : "Loading..."}
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  View Portfolio
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * Compact manual address input for inline use
 */
export function ManualAddressInputCompact({
  onAddressSet,
}: {
  onAddressSet?: (address: string) => void;
}) {
  const { setManualAddress } = useWallet();
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address.trim()) return;

    const validationError = getAddressValidationError(address.trim());
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      setManualAddress(address.trim());
      toast.success("Address set successfully");
      onAddressSet?.(address.trim());
      setAddress("");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to set address";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        placeholder="Enter Ethereum address..."
        value={address}
        onChange={(e) => {
          setAddress(e.target.value);
          setError(null);
        }}
        disabled={isValidating}
        className={`flex-1 ${error ? "border-red-500" : ""}`}
      />
      <Button
        type="submit"
        disabled={isValidating || !address.trim()}
        size="sm"
        className="cursor-pointer"
      >
        {isValidating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
}
