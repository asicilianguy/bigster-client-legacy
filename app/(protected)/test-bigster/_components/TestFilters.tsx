"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import {
    X,
    ChevronDown,
    Shield,
    AlertTriangle,
} from "lucide-react";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { StandardSelect } from "@/components/ui/StandardSelect";
import { BigsterTestStatus, BigsterTestFilterOptionsResponse } from "@/types/bigster";
import { VALIDITY_THRESHOLDS } from "@/types/bigster";
import { AttestatoAsoStatus } from "@/types/application";
import { SelectionListItem } from "@/types/selection";

export interface TestFiltersState {

    status: string;
    completed: string;
    eligible: string;
    suspect: string;
    unreliable: string;
    read: string;
    is_shortlisted: string;

    selection_id: string;
    company_id: string;
    profile_id: string;

    candidate_sex: string;
    candidate_regione: string;
    candidate_provincia: string;
    candidate_citta: string;
    domicilio_regione: string;
    domicilio_provincia: string;
    domicilio_citta: string;

    automunito: string;
    disponibilita_trasferte: string;
    partita_iva: string;
    attestato_aso: string;
    disponibilita_immediata: string;

    char_k_min: string;
    char_k_max: string;
    char_l_min: string;
    char_l_max: string;
    char_egl_min: string;
    char_egl_max: string;
    char_etl_min: string;
    char_etl_max: string;
    char_m_min: string;
    char_m_max: string;

    three_lies_critical: string;
    high_defensiveness: string;

    sent_from: string;
    sent_to: string;
    completed_from: string;
    completed_to: string;
}

export const INITIAL_TEST_FILTERS_STATE: TestFiltersState = {
    status: "all",
    completed: "all",
    eligible: "all",
    suspect: "all",
    unreliable: "all",
    read: "all",
    is_shortlisted: "all",
    selection_id: "all",
    company_id: "all",
    profile_id: "all",
    candidate_sex: "all",
    candidate_regione: "all",
    candidate_provincia: "all",
    candidate_citta: "all",
    domicilio_regione: "all",
    domicilio_provincia: "all",
    domicilio_citta: "all",
    automunito: "all",
    disponibilita_trasferte: "all",
    partita_iva: "all",
    attestato_aso: "all",
    disponibilita_immediata: "all",
    char_k_min: "",
    char_k_max: "",
    char_l_min: "",
    char_l_max: "",
    char_egl_min: "",
    char_egl_max: "",
    char_etl_min: "",
    char_etl_max: "",
    char_m_min: "",
    char_m_max: "",
    three_lies_critical: "all",
    high_defensiveness: "all",
    sent_from: "",
    sent_to: "",
    completed_from: "",
    completed_to: "",
};

const inputBase =
    "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors appearance-none";

const STATUS_OPTIONS = [
    { value: BigsterTestStatus.PENDING, label: "In Attesa" },
    { value: BigsterTestStatus.IN_PROGRESS, label: "In Corso" },
    { value: BigsterTestStatus.COMPLETED, label: "Completato" },
    { value: BigsterTestStatus.EXPIRED, label: "Scaduto" },
    { value: BigsterTestStatus.CANCELLED, label: "Annullato" },
];

const YES_NO_OPTIONS = [
    { value: "yes", label: "Sì" },
    { value: "no", label: "No" },
];

const SEX_OPTIONS = [
    { value: "MALE", label: "Maschio" },
    { value: "FEMALE", label: "Femmina" },
];

const ATTESTATO_ASO_OPTIONS = [
    { value: AttestatoAsoStatus.SI, label: "Sì" },
    { value: AttestatoAsoStatus.NO, label: "No" },
    { value: AttestatoAsoStatus.IN_CORSO, label: "In corso" },
];

interface BigsterProfile {
    id: number;
    name: string;
}

interface TestFiltersProps {
    isOpen: boolean;
    onClose: () => void;
    filters: TestFiltersState;
    onFiltersChange: (filters: TestFiltersState) => void;
    selections: SelectionListItem[];
    profiles: BigsterProfile[];
    filterOptions?: BigsterTestFilterOptionsResponse;
}

function ValidityRangeInput({
    label,
    minValue,
    maxValue,
    onMinChange,
    onMaxChange,
    thresholdHint,
}: {
    label: string;
    minValue: string;
    maxValue: string;
    onMinChange: (value: string) => void;
    onMaxChange: (value: string) => void;
    thresholdHint?: string;
}) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-bigster-text">
                    {label}
                </label>
                {thresholdHint && (
                    <span className="text-[10px] text-bigster-text-muted">
                        {thresholdHint}
                    </span>
                )}
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <span className="text-[10px] text-bigster-text-muted block mb-0.5">Min</span>
                    <input
                        type="number"
                        min={-100}
                        max={100}
                        value={minValue}
                        onChange={(e) => onMinChange(e.target.value)}
                        placeholder="—"
                        className={`${inputBase} text-center`}
                    />
                </div>
                <div>
                    <span className="text-[10px] text-bigster-text-muted block mb-0.5">Max</span>
                    <input
                        type="number"
                        min={-100}
                        max={100}
                        value={maxValue}
                        onChange={(e) => onMaxChange(e.target.value)}
                        placeholder="—"
                        className={`${inputBase} text-center`}
                    />
                </div>
            </div>
        </div>
    );
}

export function TestFilters({
    isOpen,
    onClose,
    filters,
    onFiltersChange,
    selections,
    profiles,
    filterOptions,
}: TestFiltersProps) {
    const [expandedSections, setExpandedSections] = useState({
        status: true,
        relations: false,
        candidate: false,
        geography: false,
        professionale: false,
        validity: false,
        dates: false,
    });

    const companies = useMemo(() => {
        const map = new Map<number, { id: number; nome: string }>();
        selections.forEach((s) => {
            if (s.company) {
                map.set(s.company.id, { id: s.company.id, nome: s.company.nome });
            }
        });
        return Array.from(map.values());
    }, [selections]);

    const companyOptions = useMemo(
        () => companies.map((c) => ({ value: c.id.toString(), label: c.nome })),
        [companies]
    );

    const selectionOptions = useMemo(
        () =>
            selections.map((s) => ({
                value: s.id.toString(),
                label: s.company ? `${s.titolo} - ${s.company.nome}` : s.titolo,
            })),
        [selections]
    );

    const profileOptions = useMemo(
        () => profiles.map((p) => ({ value: p.id.toString(), label: p.name })),
        [profiles]
    );

    const regioniOptions = useMemo(
        () =>
            (filterOptions?.regioni || []).map((r) => ({
                value: r,
                label: r,
            })),
        [filterOptions?.regioni]
    );

    const provinceOptions = useMemo(
        () =>
            (filterOptions?.province || []).map((p) => ({
                value: p,
                label: p,
            })),
        [filterOptions?.province]
    );

    const cittaOptions = useMemo(
        () =>
            (filterOptions?.citta || []).map((c) => ({
                value: c,
                label: c,
            })),
        [filterOptions?.citta]
    );

    const domicilioRegioniOptions = useMemo(
        () =>
            (filterOptions?.domicilio_regioni || []).map((r) => ({
                value: r,
                label: r,
            })),
        [filterOptions?.domicilio_regioni]
    );

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.status !== "all") count++;
        if (filters.completed !== "all") count++;
        if (filters.eligible !== "all") count++;
        if (filters.suspect !== "all") count++;
        if (filters.unreliable !== "all") count++;
        if (filters.read !== "all") count++;
        if (filters.is_shortlisted !== "all") count++;
        if (filters.selection_id !== "all") count++;
        if (filters.company_id !== "all") count++;
        if (filters.profile_id !== "all") count++;
        if (filters.candidate_sex !== "all") count++;
        if (filters.candidate_regione !== "all") count++;
        if (filters.candidate_provincia !== "all") count++;
        if (filters.candidate_citta !== "all") count++;
        if (filters.domicilio_regione !== "all") count++;
        if (filters.domicilio_provincia !== "all") count++;
        if (filters.domicilio_citta !== "all") count++;
        if (filters.automunito !== "all") count++;
        if (filters.disponibilita_trasferte !== "all") count++;
        if (filters.partita_iva !== "all") count++;
        if (filters.attestato_aso !== "all") count++;
        if (filters.disponibilita_immediata !== "all") count++;
        if (filters.char_k_min) count++;
        if (filters.char_k_max) count++;
        if (filters.char_l_min) count++;
        if (filters.char_l_max) count++;
        if (filters.char_egl_min) count++;
        if (filters.char_egl_max) count++;
        if (filters.char_etl_min) count++;
        if (filters.char_etl_max) count++;
        if (filters.char_m_min) count++;
        if (filters.char_m_max) count++;
        if (filters.three_lies_critical !== "all") count++;
        if (filters.high_defensiveness !== "all") count++;
        if (filters.sent_from) count++;
        if (filters.sent_to) count++;
        if (filters.completed_from) count++;
        if (filters.completed_to) count++;
        return count;
    }, [filters]);

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    const updateFilter = <K extends keyof TestFiltersState>(key: K, value: string) => {
        onFiltersChange({ ...filters, [key]: value || "all" });
    };

    const updateRangeFilter = (key: keyof TestFiltersState, value: string) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const clearAllFilters = () => {
        onFiltersChange(INITIAL_TEST_FILTERS_STATE);
        onClose();
    };

    const applyPresetHighDefensiveness = useCallback(() => {
        const isActive = filters.high_defensiveness === "yes";
        if (isActive) {
            onFiltersChange({ ...filters, high_defensiveness: "all" });
        } else {
            onFiltersChange({ ...filters, high_defensiveness: "yes" });
        }
    }, [filters, onFiltersChange]);

    const applyPresetThreeLies = useCallback(() => {
        const isActive = filters.three_lies_critical === "yes";
        if (isActive) {
            onFiltersChange({ ...filters, three_lies_critical: "all" });
        } else {
            onFiltersChange({ ...filters, three_lies_critical: "yes" });
        }
    }, [filters, onFiltersChange]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="rounded-none bg-bigster-surface border border-bigster-border max-w-2xl max-h-[80vh] overflow-y-auto shadow-lg">
                <DialogHeader title="Filtra Test BigsTer" onClose={onClose} />

                <div className="space-y-4 p-5 pt-0">

                    <div className="border border-bigster-border">
                        <button
                            onClick={() => toggleSection("status")}
                            className="w-full flex items-center justify-between p-4 bg-bigster-card-bg hover:bg-bigster-muted-bg transition-colors"
                        >
                            <span className="font-semibold text-bigster-text">
                                Stato e Esito
                            </span>
                            <ChevronDown
                                className={`h-5 w-5 text-bigster-text transition-transform ${expandedSections.status ? "rotate-180" : ""
                                    }`}
                            />
                        </button>
                        {expandedSections.status && (
                            <div className="p-4 space-y-4">
                                <StandardSelect
                                    label="Stato Test"
                                    value={filters.status === "all" ? "" : filters.status}
                                    onChange={(value) => updateFilter("status", value)}
                                    options={STATUS_OPTIONS}
                                    emptyLabel="Tutti gli stati"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <StandardSelect
                                        label="Completato"
                                        value={filters.completed === "all" ? "" : filters.completed}
                                        onChange={(value) => updateFilter("completed", value)}
                                        options={YES_NO_OPTIONS}
                                        emptyLabel="Tutti"
                                    />
                                    <StandardSelect
                                        label="Idoneo"
                                        value={filters.eligible === "all" ? "" : filters.eligible}
                                        onChange={(value) => updateFilter("eligible", value)}
                                        options={YES_NO_OPTIONS}
                                        emptyLabel="Tutti"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <StandardSelect
                                        label="Sospetto"
                                        value={filters.suspect === "all" ? "" : filters.suspect}
                                        onChange={(value) => updateFilter("suspect", value)}
                                        options={YES_NO_OPTIONS}
                                        emptyLabel="Tutti"
                                    />
                                    <StandardSelect
                                        label="Non Affidabile"
                                        value={filters.unreliable === "all" ? "" : filters.unreliable}
                                        onChange={(value) => updateFilter("unreliable", value)}
                                        options={YES_NO_OPTIONS}
                                        emptyLabel="Tutti"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <StandardSelect
                                        label="Report Visionato"
                                        value={filters.read === "all" ? "" : filters.read}
                                        onChange={(value) => updateFilter("read", value)}
                                        options={YES_NO_OPTIONS}
                                        emptyLabel="Tutti"
                                    />
                                    <StandardSelect
                                        label="Nella Rosa"
                                        value={filters.is_shortlisted === "all" ? "" : filters.is_shortlisted}
                                        onChange={(value) => updateFilter("is_shortlisted", value)}
                                        options={YES_NO_OPTIONS}
                                        emptyLabel="Tutti"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border border-bigster-border">
                        <button
                            onClick={() => toggleSection("validity")}
                            className="w-full flex items-center justify-between p-4 bg-bigster-card-bg hover:bg-bigster-muted-bg transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-bigster-text" />
                                <span className="font-semibold text-bigster-text">
                                    Scale di Validità
                                </span>
                            </div>
                            <ChevronDown
                                className={`h-5 w-5 text-bigster-text transition-transform ${expandedSections.validity ? "rotate-180" : ""
                                    }`}
                            />
                        </button>
                        {expandedSections.validity && (
                            <div className="p-4 space-y-5">

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide">
                                        Preset Rapidi
                                    </label>
                                    <div className="space-y-2">
                                        <button
                                            onClick={applyPresetHighDefensiveness}
                                            className={`w-full flex items-center gap-3 p-3 border text-left transition-all ${filters.high_defensiveness === "yes"
                                                    ? "bg-bigster-primary text-bigster-primary-text border-2 border-yellow-200"
                                                    : "bg-bigster-surface text-bigster-text border-bigster-border hover:bg-bigster-muted-bg"
                                                }`}
                                        >
                                            <Shield className="h-4 w-4 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    Difesa Alta (K ≥ {VALIDITY_THRESHOLDS.HIGH_DEFENSIVENESS_K})
                                                </p>
                                                <p className="text-xs opacity-75">
                                                    Test con scala di Difesa elevata → non idoneo
                                                </p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={applyPresetThreeLies}
                                            className={`w-full flex items-center gap-3 p-3 border text-left transition-all ${filters.three_lies_critical === "yes"
                                                    ? "bg-bigster-primary text-bigster-primary-text border-2 border-yellow-200"
                                                    : "bg-bigster-surface text-bigster-text border-bigster-border hover:bg-bigster-muted-bg"
                                                }`}
                                        >
                                            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    3 LIE Critiche (L, EGL, ETL ≥ {VALIDITY_THRESHOLDS.THREE_LIES_L})
                                                </p>
                                                <p className="text-xs opacity-75">
                                                    Tutte e 3 le scale di menzogna sopra soglia → non idoneo
                                                </p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div className="border-t border-bigster-border" />

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide">
                                        Filtri Avanzati (range punteggi)
                                    </label>
                                    <p className="text-[10px] text-bigster-text-muted mb-2">
                                        Intervallo punteggi da -100 a +100. Lascia vuoto per non filtrare.
                                    </p>
                                    <div className="space-y-3">
                                        <ValidityRangeInput
                                            label="K — Difesa"
                                            minValue={filters.char_k_min}
                                            maxValue={filters.char_k_max}
                                            onMinChange={(v) => updateRangeFilter("char_k_min", v)}
                                            onMaxChange={(v) => updateRangeFilter("char_k_max", v)}
                                            thresholdHint={`Soglia critica: ≥ ${VALIDITY_THRESHOLDS.HIGH_DEFENSIVENESS_K}`}
                                        />
                                        <ValidityRangeInput
                                            label="L — Lie"
                                            minValue={filters.char_l_min}
                                            maxValue={filters.char_l_max}
                                            onMinChange={(v) => updateRangeFilter("char_l_min", v)}
                                            onMaxChange={(v) => updateRangeFilter("char_l_max", v)}
                                            thresholdHint={`Soglia critica: ≥ ${VALIDITY_THRESHOLDS.THREE_LIES_L}`}
                                        />
                                        <ValidityRangeInput
                                            label="EGL — Egoic Lie"
                                            minValue={filters.char_egl_min}
                                            maxValue={filters.char_egl_max}
                                            onMinChange={(v) => updateRangeFilter("char_egl_min", v)}
                                            onMaxChange={(v) => updateRangeFilter("char_egl_max", v)}
                                            thresholdHint={`Soglia critica: ≥ ${VALIDITY_THRESHOLDS.THREE_LIES_EGL}`}
                                        />
                                        <ValidityRangeInput
                                            label="ETL — Ethic Lie"
                                            minValue={filters.char_etl_min}
                                            maxValue={filters.char_etl_max}
                                            onMinChange={(v) => updateRangeFilter("char_etl_min", v)}
                                            onMaxChange={(v) => updateRangeFilter("char_etl_max", v)}
                                            thresholdHint={`Soglia critica: ≥ ${VALIDITY_THRESHOLDS.THREE_LIES_ETL}`}
                                        />
                                        <ValidityRangeInput
                                            label="M — Inconsapevolezza"
                                            minValue={filters.char_m_min}
                                            maxValue={filters.char_m_max}
                                            onMinChange={(v) => updateRangeFilter("char_m_min", v)}
                                            onMaxChange={(v) => updateRangeFilter("char_m_max", v)}
                                            thresholdHint={`Soglia sospetto: ≥ ${VALIDITY_THRESHOLDS.SUSPECT_M}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border border-bigster-border">
                        <button
                            onClick={() => toggleSection("relations")}
                            className="w-full flex items-center justify-between p-4 bg-bigster-card-bg hover:bg-bigster-muted-bg transition-colors"
                        >
                            <span className="font-semibold text-bigster-text">
                                Azienda, Selezione e Profilo
                            </span>
                            <ChevronDown
                                className={`h-5 w-5 text-bigster-text transition-transform ${expandedSections.relations ? "rotate-180" : ""
                                    }`}
                            />
                        </button>
                        {expandedSections.relations && (
                            <div className="p-4 space-y-4">
                                <SearchableSelect
                                    label="Azienda"
                                    value={filters.company_id === "all" ? "" : filters.company_id}
                                    onChange={(value) => updateFilter("company_id", value)}
                                    options={companyOptions}
                                    placeholder="Cerca azienda..."
                                    emptyLabel="Tutte le aziende"
                                />
                                <SearchableSelect
                                    label="Selezione"
                                    value={filters.selection_id === "all" ? "" : filters.selection_id}
                                    onChange={(value) => updateFilter("selection_id", value)}
                                    options={selectionOptions}
                                    placeholder="Cerca selezione..."
                                    emptyLabel="Tutte le selezioni"
                                />
                                <StandardSelect
                                    label="Profilo BigsTer"
                                    value={filters.profile_id === "all" ? "" : filters.profile_id}
                                    onChange={(value) => updateFilter("profile_id", value)}
                                    options={profileOptions}
                                    emptyLabel="Tutti i profili"
                                />
                            </div>
                        )}
                    </div>

                    <div className="border border-bigster-border">
                        <button
                            onClick={() => toggleSection("candidate")}
                            className="w-full flex items-center justify-between p-4 bg-bigster-card-bg hover:bg-bigster-muted-bg transition-colors"
                        >
                            <span className="font-semibold text-bigster-text">
                                Dati Candidato
                            </span>
                            <ChevronDown
                                className={`h-5 w-5 text-bigster-text transition-transform ${expandedSections.candidate ? "rotate-180" : ""
                                    }`}
                            />
                        </button>
                        {expandedSections.candidate && (
                            <div className="p-4 space-y-4">
                                <StandardSelect
                                    label="Sesso"
                                    value={filters.candidate_sex === "all" ? "" : filters.candidate_sex}
                                    onChange={(value) => updateFilter("candidate_sex", value)}
                                    options={SEX_OPTIONS}
                                    emptyLabel="Tutti"
                                />
                            </div>
                        )}
                    </div>

                    <div className="border border-bigster-border">
                        <button
                            onClick={() => toggleSection("geography")}
                            className="w-full flex items-center justify-between p-4 bg-bigster-card-bg hover:bg-bigster-muted-bg transition-colors"
                        >
                            <span className="font-semibold text-bigster-text">
                                Residenza e Domicilio
                            </span>
                            <ChevronDown
                                className={`h-5 w-5 text-bigster-text transition-transform ${expandedSections.geography ? "rotate-180" : ""
                                    }`}
                            />
                        </button>
                        {expandedSections.geography && (
                            <div className="p-4 space-y-5">

                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide">
                                        Residenza
                                    </label>
                                    <SearchableSelect
                                        label="Regione"
                                        value={filters.candidate_regione === "all" ? "" : filters.candidate_regione}
                                        onChange={(value) => updateFilter("candidate_regione", value)}
                                        options={regioniOptions}
                                        placeholder="Cerca regione..."
                                        emptyLabel="Tutte le regioni"
                                    />
                                    <SearchableSelect
                                        label="Provincia"
                                        value={filters.candidate_provincia === "all" ? "" : filters.candidate_provincia}
                                        onChange={(value) => updateFilter("candidate_provincia", value)}
                                        options={provinceOptions}
                                        placeholder="Cerca provincia..."
                                        emptyLabel="Tutte le province"
                                    />
                                    <SearchableSelect
                                        label="Città"
                                        value={filters.candidate_citta === "all" ? "" : filters.candidate_citta}
                                        onChange={(value) => updateFilter("candidate_citta", value)}
                                        options={cittaOptions}
                                        placeholder="Cerca città..."
                                        emptyLabel="Tutte le città"
                                    />
                                </div>

                                <div className="border-t border-bigster-border" />

                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide">
                                        Domicilio
                                    </label>
                                    <SearchableSelect
                                        label="Regione Domicilio"
                                        value={filters.domicilio_regione === "all" ? "" : filters.domicilio_regione}
                                        onChange={(value) => updateFilter("domicilio_regione", value)}
                                        options={domicilioRegioniOptions}
                                        placeholder="Cerca regione domicilio..."
                                        emptyLabel="Tutte le regioni"
                                    />
                                    <SearchableSelect
                                        label="Provincia Domicilio"
                                        value={filters.domicilio_provincia === "all" ? "" : filters.domicilio_provincia}
                                        onChange={(value) => updateFilter("domicilio_provincia", value)}
                                        options={provinceOptions}
                                        placeholder="Cerca provincia domicilio..."
                                        emptyLabel="Tutte le province"
                                    />
                                    <SearchableSelect
                                        label="Città Domicilio"
                                        value={filters.domicilio_citta === "all" ? "" : filters.domicilio_citta}
                                        onChange={(value) => updateFilter("domicilio_citta", value)}
                                        options={cittaOptions}
                                        placeholder="Cerca città domicilio..."
                                        emptyLabel="Tutte le città"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border border-bigster-border">
                        <button
                            onClick={() => toggleSection("professionale")}
                            className="w-full flex items-center justify-between p-4 bg-bigster-card-bg hover:bg-bigster-muted-bg transition-colors"
                        >
                            <span className="font-semibold text-bigster-text">
                                Informazioni Professionali
                            </span>
                            <ChevronDown
                                className={`h-5 w-5 text-bigster-text transition-transform ${expandedSections.professionale ? "rotate-180" : ""
                                    }`}
                            />
                        </button>
                        {expandedSections.professionale && (
                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <StandardSelect
                                        label="Automunito"
                                        value={filters.automunito === "all" ? "" : filters.automunito}
                                        onChange={(value) => updateFilter("automunito", value)}
                                        options={YES_NO_OPTIONS}
                                        emptyLabel="Tutti"
                                    />
                                    <StandardSelect
                                        label="Disponibilità Trasferte"
                                        value={
                                            filters.disponibilita_trasferte === "all"
                                                ? ""
                                                : filters.disponibilita_trasferte
                                        }
                                        onChange={(value) => updateFilter("disponibilita_trasferte", value)}
                                        options={YES_NO_OPTIONS}
                                        emptyLabel="Tutti"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <StandardSelect
                                        label="Partita IVA"
                                        value={filters.partita_iva === "all" ? "" : filters.partita_iva}
                                        onChange={(value) => updateFilter("partita_iva", value)}
                                        options={YES_NO_OPTIONS}
                                        emptyLabel="Tutti"
                                    />
                                    <StandardSelect
                                        label="Disponibilità Immediata"
                                        value={
                                            filters.disponibilita_immediata === "all"
                                                ? ""
                                                : filters.disponibilita_immediata
                                        }
                                        onChange={(value) => updateFilter("disponibilita_immediata", value)}
                                        options={YES_NO_OPTIONS}
                                        emptyLabel="Tutti"
                                    />
                                </div>
                                <StandardSelect
                                    label="Attestato ASO"
                                    value={filters.attestato_aso === "all" ? "" : filters.attestato_aso}
                                    onChange={(value) => updateFilter("attestato_aso", value)}
                                    options={ATTESTATO_ASO_OPTIONS}
                                    emptyLabel="Tutti"
                                />
                            </div>
                        )}
                    </div>

                    <div className="border border-bigster-border">
                        <button
                            onClick={() => toggleSection("dates")}
                            className="w-full flex items-center justify-between p-4 bg-bigster-card-bg hover:bg-bigster-muted-bg transition-colors"
                        >
                            <span className="font-semibold text-bigster-text">
                                Filtri per Data
                            </span>
                            <ChevronDown
                                className={`h-5 w-5 text-bigster-text transition-transform ${expandedSections.dates ? "rotate-180" : ""
                                    }`}
                            />
                        </button>
                        {expandedSections.dates && (
                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="text-sm font-semibold text-bigster-text block mb-2">
                                        Data Invio
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <span className="text-xs text-bigster-text-muted block mb-1">Da</span>
                                            <input
                                                type="date"
                                                value={filters.sent_from}
                                                onChange={(e) =>
                                                    onFiltersChange({ ...filters, sent_from: e.target.value })
                                                }
                                                className={inputBase}
                                            />
                                        </div>
                                        <div>
                                            <span className="text-xs text-bigster-text-muted block mb-1">A</span>
                                            <input
                                                type="date"
                                                value={filters.sent_to}
                                                onChange={(e) =>
                                                    onFiltersChange({ ...filters, sent_to: e.target.value })
                                                }
                                                className={inputBase}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-bigster-text block mb-2">
                                        Data Completamento
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <span className="text-xs text-bigster-text-muted block mb-1">Da</span>
                                            <input
                                                type="date"
                                                value={filters.completed_from}
                                                onChange={(e) =>
                                                    onFiltersChange({ ...filters, completed_from: e.target.value })
                                                }
                                                className={inputBase}
                                            />
                                        </div>
                                        <div>
                                            <span className="text-xs text-bigster-text-muted block mb-1">A</span>
                                            <input
                                                type="date"
                                                value={filters.completed_to}
                                                onChange={(e) =>
                                                    onFiltersChange({ ...filters, completed_to: e.target.value })
                                                }
                                                className={inputBase}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {activeFiltersCount > 0 && (
                    <div className="p-5 pt-0">
                        <Button
                            variant="outline"
                            onClick={clearAllFilters}
                            className="w-full rounded-none border font-semibold"
                            style={{
                                borderColor: "#ef4444",
                                color: "#ef4444",
                                backgroundColor: "rgba(239,68,68,0.05)",
                            }}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancella tutti i filtri ({activeFiltersCount})
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default TestFilters;
