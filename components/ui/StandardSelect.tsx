"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const inputBase =
  "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors";

interface StandardSelectOption {
  value: string;
  label: string;
}

interface StandardSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: StandardSelectOption[];
  emptyLabel?: string;
  label?: string;
  disabled?: boolean;

  useEmptyStringForAll?: boolean;
}

export function StandardSelect({
  value,
  onChange,
  options,
  emptyLabel = "Tutti",
  label,
  disabled = false,
  useEmptyStringForAll = false,
}: StandardSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const emptyValue = useEmptyStringForAll ? "" : "all";

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
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
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
        className={`${inputBase} flex items-center justify-between cursor-pointer appearance-none ${disabled
          ? "opacity-60 cursor-not-allowed bg-bigster-muted-bg"
          : "hover:border-bigster-text"
          }`}
        style={{
          textAlign: "left",
        }}
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
          className="absolute z-50 w-full mt-1 bg-bigster-surface border border-bigster-border shadow-lg max-h-80 overflow-y-auto"
          style={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)" }}
          role="listbox"
        >

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

          {options.map((option) => {
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
          })}
        </div>
      )}
    </div>
  );
}
