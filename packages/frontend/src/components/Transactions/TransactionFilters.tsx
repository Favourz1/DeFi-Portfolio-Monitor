import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionFilterType } from "@/types/transaction.types";

interface TransactionFiltersProps {
  onSearchChange: (search: string) => void;
  onFilterChange: (type: TransactionFilterType) => void;
  isLoading: boolean;
}

/**
 * Transaction filters component with search and type filtering
 *
 * @remarks
 * Provides search input with debouncing and transaction type filtering.
 * Disables inputs during loading states to prevent conflicting requests.
 */
export function TransactionFilters({
  onSearchChange,
  onFilterChange,
  isLoading,
}: TransactionFiltersProps) {
  const [searchValue, setSearchValue] = useState("");

  // Debounce search input (500ms delay)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearchChange(searchValue);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchValue, onSearchChange]);

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchValue(event.target.value);
  };

  const handleFilterChange = (value: string) => {
    onFilterChange(value as TransactionFilterType);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by hash, address, or token..."
          value={searchValue}
          onChange={handleSearchInputChange}
          disabled={isLoading}
          className="pl-10"
        />
      </div>

      {/* Filter Dropdown */}
      <div className="w-full sm:w-48">
        <Select
          onValueChange={handleFilterChange}
          defaultValue="all"
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter transactions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Transactions</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="received">Received</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
