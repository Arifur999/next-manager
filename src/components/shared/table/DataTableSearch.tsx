"use client";

import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { Search } from "lucide-react";
import { useState } from "react";

type DataTableSearchProps = {
  value: string;
  onDebouncedChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
};

const DataTableSearch = ({ value, onDebouncedChange, placeholder = "Search...", debounceMs = 400 }: DataTableSearchProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);
  const [sentValue, setSentValue] = useState(value);

  const debounced = useDebouncedCallback((next: string) => {
    const term = next.trim();
    setSentValue(term);
    onDebouncedChange(term);
  }, debounceMs);

  // Follow a change made elsewhere (a reset, a link) without remounting the
  // input, which would drop focus mid-typing. Our own debounced value coming
  // back is not such a change and must not overwrite newer keystrokes.
  if (value !== syncedValue) {
    setSyncedValue(value);
    if (value !== sentValue) setInputValue(value);
  }

  return (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={inputValue}
        onChange={(event) => {
          setInputValue(event.target.value);
          debounced.run(event.target.value);
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-9"
      />
    </div>
  );
};

export default DataTableSearch;
