"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Loader2, MapPin } from "lucide-react";
import { useLazySearchComuniQuery } from "@/lib/redux/features/geography/geographyApiSlice";

export interface CityAutocompleteValue {
    citta: string;
    provincia: string;
    regione: string;
}

interface CityAutocompleteProps {

    label?: string;

    value: string;

    provincia: string;

    regione?: string;

    onChange: (value: CityAutocompleteValue) => void;

    onClear?: () => void;

    placeholder?: string;

    showContext?: boolean;

    disabled?: boolean;
}

const inputBase =
    "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors";

export function CityAutocomplete({
    label,
    value,
    provincia,
    regione,
    onChange,
    onClear,
    placeholder = "Digita il nome del comune...",
    showContext = true,
    disabled = false,
}: CityAutocompleteProps) {
    const [inputValue, setInputValue] = useState(value || "");
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [triggerSearch, { data: searchData, isFetching }] = useLazySearchComuniQuery();

    const isDisabled = disabled || !provincia;

    useEffect(() => {
        setInputValue(value || "");
    }, [value]);

    useEffect(() => {
        if (!value) {
            setInputValue("");
        }
    }, [provincia]);

    const doSearch = useCallback(
        (query: string) => {
            if (query.length >= 2 && provincia) {
                triggerSearch({ q: query, provincia, limit: 15 });
                setIsOpen(true);
                setHighlightedIndex(-1);
            } else {
                setIsOpen(false);
            }
        },
        [triggerSearch, provincia]
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (val.trim().length >= 2) {
            debounceRef.current = setTimeout(() => doSearch(val.trim()), 300);
        } else {
            setIsOpen(false);
        }
    };

    const handleSelect = (comune: { nome: string; provincia: string; provinciaName: string; regione: string }) => {
        setInputValue(comune.nome);
        setIsOpen(false);
        setHighlightedIndex(-1);

        onChange({
            citta: comune.nome,
            provincia: comune.provinciaName,
            regione: comune.regione,
        });
    };

    const handleClear = () => {
        setInputValue("");
        setIsOpen(false);
        setHighlightedIndex(-1);
        onClear?.();
        inputRef.current?.focus();
    };

    const results = searchData?.results || [];

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || results.length === 0) {
            if (e.key === "Escape") {
                setIsOpen(false);
                setInputValue(value || "");
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < results.length - 1 ? prev + 1 : 0
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev > 0 ? prev - 1 : results.length - 1
                );
                break;
            case "Enter":
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < results.length) {
                    handleSelect(results[highlightedIndex]);
                }
                break;
            case "Escape":
                setIsOpen(false);
                setInputValue(value || "");
                break;
            case "Tab":
                setIsOpen(false);
                if (!value) setInputValue("");
                break;
        }
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
                if (!value) setInputValue("");
                else setInputValue(value);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [value]);

    useEffect(() => {
        if (highlightedIndex >= 0 && dropdownRef.current) {
            const items = dropdownRef.current.querySelectorAll('[role="option"]');
            items[highlightedIndex]?.scrollIntoView({ block: "nearest" });
        }
    }, [highlightedIndex]);

    const highlightMatch = (text: string, query: string) => {
        if (!query) return text;
        const idx = text.toLowerCase().indexOf(query.toLowerCase());
        if (idx === -1) return text;

        return (
            <>
                {text.slice(0, idx)}
                <span className="font-bold text-bigster-text">
                    {text.slice(idx, idx + query.length)}
                </span>
                {text.slice(idx + query.length)}
            </>
        );
    };

    return (
        <div className="space-y-1.5">
            {label && (
                <label className="block text-sm font-semibold text-bigster-text">
                    {label}
                </label>
            )}

            <div className="relative">

                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bigster-text-muted" />

                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (inputValue.length >= 2 && results.length > 0 && provincia) {
                            setIsOpen(true);
                        }
                    }}
                    placeholder={isDisabled ? "Prima seleziona una provincia" : placeholder}
                    disabled={isDisabled}
                    className={`${inputBase} pl-10 pr-10 ${isDisabled ? "opacity-60 cursor-not-allowed bg-bigster-muted-bg" : ""}`}
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    autoComplete="off"
                />

                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isFetching ? (
                        <Loader2 className="h-4 w-4 animate-spin text-bigster-text-muted" />
                    ) : value && !isDisabled ? (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-bigster-text-muted hover:text-bigster-text transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    ) : null}
                </div>

                {isOpen && !isDisabled && (
                    <div
                        ref={dropdownRef}
                        className="absolute z-50 w-full mt-1 bg-bigster-surface border border-bigster-border shadow-lg max-h-60 overflow-auto"
                        role="listbox"
                    >
                        {isFetching && results.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-bigster-text-muted flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Ricerca comuni...
                            </div>
                        ) : results.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-bigster-text-muted">
                                Nessun comune trovato in provincia di {provincia}
                            </div>
                        ) : (
                            <>

                                <div className="px-3 py-1.5 bg-bigster-card-bg border-b border-bigster-border">
                                    <p className="text-xs text-bigster-text-muted">
                                        {searchData!.total} comun{searchData!.total === 1 ? "e" : "i"} trovat{searchData!.total === 1 ? "o" : "i"}
                                    </p>
                                </div>

                                {results.map((comune, index) => (
                                    <div
                                        key={`${comune.nome}-${comune.provincia}`}
                                        role="option"
                                        aria-selected={highlightedIndex === index}
                                        className={`px-4 py-2.5 cursor-pointer transition-colors ${highlightedIndex === index
                                            ? "bg-bigster-primary/20"
                                            : "hover:bg-bigster-muted-bg"
                                            }`}
                                        onClick={() => handleSelect(comune)}
                                        onMouseEnter={() => setHighlightedIndex(index)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-bigster-text">
                                                {highlightMatch(comune.nome, inputValue)}
                                            </span>
                                            <span className="text-xs font-semibold text-bigster-text-muted bg-bigster-card-bg px-1.5 py-0.5 border border-bigster-border ml-2 flex-shrink-0">
                                                {comune.provincia}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                {searchData && searchData.total > results.length && (
                                    <div className="px-3 py-1.5 bg-bigster-card-bg border-t border-bigster-border">
                                        <p className="text-xs text-bigster-text-muted">
                                            Mostrando {results.length} di {searchData.total} — digita per affinare
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {showContext && value && regione && (
                <div className="flex items-center gap-1.5 text-xs text-bigster-text-muted">
                    <MapPin className="h-3 w-3" />
                    <span>
                        {provincia}, {regione}
                    </span>
                </div>
            )}
        </div>
    );
}
