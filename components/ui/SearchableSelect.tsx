"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, ChevronDown } from "lucide-react";

const inputBase =
  "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors";

interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  emptyLabel?: string;
  label?: string;
  disabled?: boolean;

  useEmptyStringForAll?: boolean;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Cerca...",
  emptyLabel = "Tutti",
  label,
  disabled = false,
  useEmptyStringForAll = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const emptyValue = useEmptyStringForAll ? "" : "all";

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  const selectedOption = options.find((opt) => opt.value === value);

  const isEmptySelected =
    value === "all" || value === "" || value === undefined;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {

      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 10);
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (isOpen) {
        setSearchQuery("");
      }
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="text-sm font-semibold text-bigster-text block mb-2">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`${inputBase} flex items-center justify-between cursor-pointer ${disabled
          ? "opacity-60 cursor-not-allowed bg-bigster-muted-bg"
          : "hover:border-bigster-text"
          }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={
            selectedOption ? "text-bigster-text" : "text-bigster-text-muted"
          }
        >
          {selectedOption ? selectedOption.label : emptyLabel}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-bigster-text-muted transition-transform flex-shrink-0 ml-2 ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-bigster-surface border border-bigster-border shadow-lg max-h-80 overflow-hidden flex flex-col"
          style={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)" }}
          role="listbox"
        >

          <div className="p-2 border-b border-bigster-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bigster-text-muted" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                className={`${inputBase} pl-10 pr-8`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-bigster-text-muted hover:text-bigster-text"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto flex-1">

            <button
              type="button"
              onClick={() => handleSelect(emptyValue)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${isEmptySelected
                ? "bg-bigster-primary text-bigster-primary-text font-semibold"
                : "text-bigster-text hover:bg-bigster-muted-bg"
                }`}
              role="option"
              aria-selected={isEmptySelected}
            >
              {emptyLabel}
            </button>

            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-bigster-text-muted">
                Nessun risultato trovato
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = value === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${isSelected
                      ? "bg-bigster-primary text-bigster-primary-text font-semibold"
                      : "text-bigster-text hover:bg-bigster-muted-bg"
                      }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    {option.label}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
