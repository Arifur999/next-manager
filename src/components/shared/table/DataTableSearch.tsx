"use client";

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { Search, X } from "lucide-react";
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
  // The term this box last sent, until the URL echoes it back.
  const [sentValue, setSentValue] = useState<string | null>(null);

  const debounced = useDebouncedCallback((next: string) => {
    const term = next.trim();
    setSentValue(term);
    onDebouncedChange(term);
  }, debounceMs);

  // Follow a change made elsewhere (a reset, Back, a link) without remounting
  // the input, which would drop focus mid-typing. The box's own term coming back
  // is consumed instead: it must not overwrite newer keystrokes.
  if (value !== syncedValue) {
    setSyncedValue(value);
    if (value === sentValue) setSentValue(null);
    else setInputValue(value);
  }

  // Applied at once, and the pending debounce dropped, so clearing fires one query.
  const clear = () => {
    debounced.cancel();
    setInputValue("");
    setSentValue("");
    onDebouncedChange("");
  };

  return (
    <InputGroup className="w-full sm:w-64">
      <InputGroupAddon>
        <Search aria-hidden="true" />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        value={inputValue}
        onChange={(event) => {
          setInputValue(event.target.value);
          debounced.run(event.target.value);
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        // The clear button below replaces the browser's own, which would double it.
        className="[&::-webkit-search-cancel-button]:appearance-none"
      />
      {inputValue && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="Clear search" onClick={clear}>
            <X aria-hidden="true" />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
};

export default DataTableSearch;
