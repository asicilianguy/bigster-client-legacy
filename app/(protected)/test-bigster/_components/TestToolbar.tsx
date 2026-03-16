"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { StandardSelect } from "@/components/ui/StandardSelect";
import { Spinner } from "@/components/ui/spinner";
import {
    Search,
    SlidersHorizontal,
    ArrowUpDown,
    RefreshCw,
    X,
    Bookmark,
    BookmarkPlus,
    Trash2,
    ChevronDown,
    Check,
    Info,
    EyeOff,
    Eye,
} from "lucide-react";

export interface SavedPreset {
    name: string;
    filters: Record<string, string>;
    createdAt: string;
}

interface TestToolbarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    sortBy: string;
    onSortChange: (value: string) => void;
    activeFiltersCount: number;
    onOpenFilters: () => void;
    onRefresh: () => void;
    onClearFilters?: () => void;
    isLoading?: boolean;

    readFilter: "all" | "yes" | "no";
    onReadFilterChange: (value: "all" | "yes" | "no") => void;

    savedPresets: SavedPreset[];
    onSavePreset: (name: string) => void;
    onLoadPreset: (preset: SavedPreset) => void;
    onDeletePreset: (index: number) => void;
    activePresetName?: string | null;
}

const inputBase =
    "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors";

const SORT_OPTIONS = [
    { value: "recent", label: "Più recenti" },
    { value: "oldest", label: "Meno recenti" },
    { value: "name_asc", label: "Nome (A-Z)" },
    { value: "name_desc", label: "Nome (Z-A)" },
    { value: "status", label: "Stato" },
    { value: "completion", label: "Completamento" },
    { value: "eligible", label: "Idoneità" },
];

export function TestToolbar({
    searchQuery,
    onSearchChange,
    sortBy,
    onSortChange,
    activeFiltersCount,
    onOpenFilters,
    onRefresh,
    onClearFilters,
    isLoading,
    readFilter,
    onReadFilterChange,
    savedPresets,
    onSavePreset,
    onLoadPreset,
    onDeletePreset,
    activePresetName,
}: TestToolbarProps) {
    const [isPresetOpen, setIsPresetOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [presetName, setPresetName] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsPresetOpen(false);
                setIsSaving(false);
                setPresetName("");
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isSaving && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isSaving]);

    const handleSave = () => {
        if (!presetName.trim()) return;
        onSavePreset(presetName.trim());
        setPresetName("");
        setIsSaving(false);
    };

    const hasPresets = savedPresets.length > 0;

    return (
        <div className="flex flex-wrap items-center gap-3">

            {isLoading && <Spinner className="h-4 w-4" />}

            <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bigster-text-muted" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Cerca per nome, email, azienda..."
                    className={`${inputBase} pl-10`}
                />
                {searchQuery && (
                    <button
                        onClick={() => onSearchChange("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-bigster-text-muted hover:text-bigster-text"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            <Button
                variant="outline"
                onClick={onOpenFilters}
                className="relative rounded-none border border-bigster-border bg-bigster-surface text-bigster-text px-4 py-2 hover:bg-bigster-muted-bg"
            >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtri
                {activeFiltersCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-bigster-primary text-bigster-primary-text text-xs flex items-center justify-center font-bold">
                        {activeFiltersCount}
                    </span>
                )}
            </Button>

            <div className="flex items-center border border-bigster-border flex-shrink-0">
                {(
                    [
                        { value: "all", label: "Tutti", icon: null },
                        { value: "no", label: "Da leggere", icon: EyeOff },
                        { value: "yes", label: "Letti", icon: Eye },
                    ] as { value: "all" | "yes" | "no"; label: string; icon: React.ElementType | null }[]
                ).map(({ value, label, icon: Icon }) => (
                    <button
                        key={value}
                        onClick={() => onReadFilterChange(value)}
                        className={`h-10 px-3 text-xs font-semibold flex items-center gap-1.5 border-r last:border-r-0 border-bigster-border transition-colors ${readFilter === value
                            ? "bg-bigster-primary text-bigster-primary-text"
                            : "bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                            }`}
                    >
                        {Icon && <Icon className="h-3.5 w-3.5" />}
                        {label}
                    </button>
                ))}
            </div>

            <div className="relative" ref={dropdownRef}>
                <Button
                    variant="outline"
                    onClick={() => {
                        setIsPresetOpen(!isPresetOpen);
                        setIsSaving(false);
                        setPresetName("");
                    }}
                    className={`relative rounded-none border px-3 py-2 transition-all ${activePresetName
                        ? "border-bigster-primary bg-yellow-50 text-bigster-text"
                        : "border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                        }`}
                    title="Preset filtri salvati"
                >
                    <Bookmark
                        className={`h-4 w-4 mr-1.5 ${activePresetName ? "fill-bigster-primary text-bigster-primary" : ""
                            }`}
                    />
                    {activePresetName ? (
                        <span className="text-sm font-medium max-w-[120px] truncate">
                            {activePresetName}
                        </span>
                    ) : (
                        <span className="text-sm hidden sm:inline">Preset</span>
                    )}
                    <ChevronDown
                        className={`h-3.5 w-3.5 ml-1 transition-transform ${isPresetOpen ? "rotate-180" : ""
                            }`}
                    />
                    {hasPresets && !activePresetName && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-bigster-text text-white text-[10px] flex items-center justify-center font-bold">
                            {savedPresets.length}
                        </span>
                    )}
                </Button>

                {isPresetOpen && (
                    <div className="absolute right-0 top-full mt-1 w-80 bg-bigster-surface border border-bigster-border shadow-lg z-50">

                        <div className="px-4 py-3 border-b border-bigster-border bg-bigster-card-bg">
                            <p className="text-sm font-semibold text-bigster-text">
                                Preset Filtri
                            </p>
                            <p className="text-[11px] text-bigster-text-muted mt-0.5">
                                Salva e ricarica combinazioni di filtri
                            </p>
                        </div>

                        <div className="max-h-[320px] overflow-y-auto">

                            {hasPresets ? (
                                <div className="py-1">
                                    {savedPresets.map((preset, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-center gap-2 px-4 py-2.5 hover:bg-bigster-muted-bg transition-colors group ${activePresetName === preset.name
                                                ? "bg-yellow-50"
                                                : ""
                                                }`}
                                        >
                                            <button
                                                onClick={() => {
                                                    onLoadPreset(preset);
                                                    setIsPresetOpen(false);
                                                }}
                                                className="flex-1 text-left min-w-0"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {activePresetName === preset.name && (
                                                        <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                                                    )}
                                                    <p className="text-sm font-medium text-bigster-text truncate">
                                                        {preset.name}
                                                    </p>
                                                </div>
                                                <p className="text-[10px] text-bigster-text-muted mt-0.5">
                                                    Salvato il{" "}
                                                    {new Date(preset.createdAt).toLocaleDateString(
                                                        "it-IT",
                                                        {
                                                            day: "2-digit",
                                                            month: "short",
                                                        }
                                                    )}
                                                </p>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeletePreset(index);
                                                }}
                                                className="p-1.5 text-bigster-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                                title="Elimina preset"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (

                                <div className="px-4 py-5 text-center">
                                    <Bookmark className="h-8 w-8 text-bigster-text-muted mx-auto mb-2 opacity-40" />
                                    <p className="text-xs font-medium text-bigster-text-muted mb-3">
                                        Nessun preset salvato
                                    </p>
                                    <div className="text-[11px] text-bigster-text-muted text-left bg-bigster-card-bg border border-bigster-border p-3">
                                        <div className="flex items-start gap-2">
                                            <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-blue-500" />
                                            <div>
                                                <p className="font-semibold text-bigster-text mb-1">
                                                    Come funziona:
                                                </p>
                                                <ol className="space-y-0.5 list-decimal list-inside">
                                                    <li>Imposta i filtri con il pulsante &quot;Filtri&quot;</li>
                                                    <li>Torna qui e clicca &quot;Salva filtri correnti&quot;</li>
                                                    <li>Dai un nome (es. &quot;Solo idonei Lombardia&quot;)</li>
                                                    <li>La prossima volta selezionalo da questa lista</li>
                                                </ol>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-bigster-border p-3">
                            {isSaving ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={presetName}
                                        onChange={(e) => setPresetName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleSave();
                                            if (e.key === "Escape") {
                                                setIsSaving(false);
                                                setPresetName("");
                                            }
                                        }}
                                        placeholder="Nome del preset..."
                                        className="flex-1 rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-3 py-1.5 text-sm"
                                        maxLength={40}
                                    />
                                    <Button
                                        onClick={handleSave}
                                        disabled={!presetName.trim()}
                                        className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 px-3 py-1.5 text-sm"
                                    >
                                        Salva
                                    </Button>
                                    <button
                                        onClick={() => {
                                            setIsSaving(false);
                                            setPresetName("");
                                        }}
                                        className="text-bigster-text-muted hover:text-bigster-text p-1"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        if (activeFiltersCount === 0) return;
                                        setIsSaving(true);
                                    }}
                                    disabled={activeFiltersCount === 0}
                                    className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium border transition-colors ${activeFiltersCount > 0
                                        ? "border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg cursor-pointer"
                                        : "border-bigster-border bg-bigster-muted-bg text-bigster-text-muted cursor-not-allowed opacity-50"
                                        }`}
                                >
                                    <BookmarkPlus className="h-4 w-4" />
                                    {activeFiltersCount > 0
                                        ? `Salva filtri correnti (${activeFiltersCount} attivi)`
                                        : "Imposta dei filtri per salvarli"}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-bigster-text-muted flex-shrink-0" />
                <div className="w-[180px]">
                    <StandardSelect
                        value={sortBy}
                        onChange={(value) => onSortChange(value || "recent")}
                        options={SORT_OPTIONS}
                        emptyLabel="Ordina per..."
                    />
                </div>
            </div>

            {onClearFilters && (
                <Button
                    variant="outline"
                    onClick={onClearFilters}
                    className="rounded-none border-2 border-red-400 text-red-600 hover:bg-red-50 px-4 py-2"
                >
                    <X className="h-4 w-4 mr-2" />
                    Pulisci
                </Button>
            )}

            <Button
                variant="outline"
                onClick={onRefresh}
                disabled={isLoading}
                className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg px-3"
            >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
        </div>
    );
}

export default TestToolbar;
