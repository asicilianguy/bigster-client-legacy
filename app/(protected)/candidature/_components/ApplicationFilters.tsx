"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { X, ChevronDown, Lock } from "lucide-react";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { StandardSelect } from "@/components/ui/StandardSelect";
import { BigsterTestStatus } from "@/types/bigster";
import { AttestatoAsoStatus, InterviewType, InterviewOutcome } from "@/types/application";
import { useUserRole } from "@/hooks/use-user-role";

const inputBase =
    "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors appearance-none";

const STATUS_OPTIONS = [
    { value: "IN_CORSO", label: "In Corso" },
    { value: "IN_PROVA", label: "In Prova" },
    { value: "ASSUNTO", label: "Assunto" },
    { value: "SCARTATO", label: "Scartato" },
    { value: "RITIRATO", label: "Ritirato" },
];

const GENDER_OPTIONS = [
    { value: "M", label: "Maschio" },
    { value: "F", label: "Femmina" },
];

const YES_NO_OPTIONS = [
    { value: "yes", label: "Sì" },
    { value: "no", label: "No" },
];

const TEST_STATUS_OPTIONS = [
    { value: BigsterTestStatus.PENDING, label: "In attesa" },
    { value: BigsterTestStatus.IN_PROGRESS, label: "In corso" },
    { value: BigsterTestStatus.COMPLETED, label: "Completato" },
    { value: BigsterTestStatus.EXPIRED, label: "Scaduto" },
    { value: BigsterTestStatus.CANCELLED, label: "Annullato" },
];

const ATTESTATO_ASO_OPTIONS = [
    { value: AttestatoAsoStatus.SI, label: "Sì" },
    { value: AttestatoAsoStatus.NO, label: "No" },
    { value: AttestatoAsoStatus.IN_CORSO, label: "In corso" },
];

const TEST_EVALUATION_OPTIONS = [
    { value: "IDONEO", label: "Idoneo" },
    { value: "NON IDONEO", label: "Non Idoneo" },
];

const INTERVIEW_TYPE_OPTIONS = [
    { value: InterviewType.SCREENING_TELEFONICO, label: "Screening Telefonico" },
    { value: InterviewType.INCONTRO_HR, label: "Incontro HR" },
    { value: InterviewType.PROPOSTA_CLIENTE, label: "Proposta Cliente" },
];

const INTERVIEW_OUTCOME_OPTIONS = [
    { value: InterviewOutcome.POSITIVO, label: "Positivo" },
    { value: InterviewOutcome.NEGATIVO, label: "Negativo" },
];

export interface FilterState {
    stato: string;
    selezione_id: string;
    company_id: string;
    is_shortlisted: string;
    is_read: string;
    sesso: string;
    regione: string;
    provincia: string;
    citta: string;
    titolo_studio: string;
    eta_min: string;
    eta_max: string;
    domicilio_regione: string;
    domicilio_provincia: string;
    domicilio_citta: string;
    automunito: string;
    disponibilita_trasferte: string;
    partita_iva: string;
    attestato_aso: string;
    disponibilita_immediata: string;
    preavviso_min: string;
    preavviso_max: string;
    has_cv: string;
    has_note: string;
    has_colloqui: string;
    tipo_colloquio: string;
    esito_colloquio: string;
    has_colloqui_positivi: string;
    has_test: string;
    test_status: string;
    test_completed: string;
    test_eligible: string;
    test_suspect: string;
    test_unreliable: string;
    test_preferred: string;
    test_read: string;
    test_evaluation: string;
    test_profile_id: string;
    piattaforma: string;
    data_da: string;
    data_a: string;
    data_chiusura_da: string;
    data_chiusura_a: string;
}

interface Selection {
    id: number;
    titolo: string;
    company?: { id: number; nome: string };
}

interface FilterOptions {
    regioni: string[];
    province: string[];
    citta: string[];
    titoli_studio: string[];
}

interface ApplicationFiltersProps {
    isOpen: boolean;
    onClose: () => void;
    filters: FilterState;
    onFiltersChange: (filters: FilterState) => void;
    selections: Selection[];
    filterOptions: FilterOptions;
}

export function ApplicationFilters({
    isOpen,
    onClose,
    filters,
    onFiltersChange,
    selections,
    filterOptions,
}: ApplicationFiltersProps) {
    // Leggo il ruolo direttamente — nessun prop threading necessario
    const { isConsulente } = useUserRole();

    const [expandedSections, setExpandedSections] = useState({
        base: true,
        candidato: false,
        domicilio: false,
        professionale: false,
        documenti: false,
        colloqui: false,
        test: false,
        piattaforma: false,
        date: false,
    });

    const selectionOptions = useMemo(
        () =>
            selections.map((s) => ({
                value: s.id.toString(),
                label: s.company ? `${s.titolo} - ${s.company.nome}` : s.titolo,
            })),
        [selections]
    );

    const companyOptions = useMemo(() => {
        const companies = new Map<number, string>();
        selections.forEach((s) => {
            if (s.company) {
                companies.set(s.company.id, s.company.nome);
            }
        });
        return Array.from(companies.entries())
            .map(([id, nome]) => ({ value: id.toString(), label: nome }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [selections]);

    const regioniOptions = useMemo(
        () => filterOptions.regioni.map((r) => ({ value: r, label: r })),
        [filterOptions.regioni]
    );

    const provinceOptions = useMemo(
        () => (filterOptions.province || []).map((p) => ({ value: p, label: p })),
        [filterOptions.province]
    );

    const cittaOptions = useMemo(
        () => filterOptions.citta.map((c) => ({ value: c, label: c })),
        [filterOptions.citta]
    );

    const titoliOptions = useMemo(
        () => filterOptions.titoli_studio.map((t) => ({ value: t, label: t })),
        [filterOptions.titoli_studio]
    );

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.stato !== "all") count++;
        if (filters.selezione_id !== "all") count++;
        // company_id non viene conteggiato per il consulente (filtro non disponibile)
        if (!isConsulente && filters.company_id !== "all") count++;
        if (filters.is_shortlisted !== "all") count++;
        if (filters.sesso !== "all") count++;
        if (filters.regione !== "all") count++;
        if (filters.provincia !== "all") count++;
        if (filters.citta !== "all") count++;
        if (filters.titolo_studio !== "all") count++;
        if (filters.eta_min) count++;
        if (filters.eta_max) count++;
        if (filters.domicilio_regione !== "all") count++;
        if (filters.domicilio_provincia !== "all") count++;
        if (filters.domicilio_citta !== "all") count++;
        if (filters.automunito !== "all") count++;
        if (filters.disponibilita_trasferte !== "all") count++;
        if (filters.partita_iva !== "all") count++;
        if (filters.attestato_aso !== "all") count++;
        if (filters.disponibilita_immediata !== "all") count++;
        if (filters.preavviso_min) count++;
        if (filters.preavviso_max) count++;
        if (filters.has_cv !== "all") count++;
        if (filters.has_note !== "all") count++;
        if (filters.has_colloqui !== "all") count++;
        if (filters.tipo_colloquio !== "all") count++;
        if (filters.esito_colloquio !== "all") count++;
        if (filters.has_colloqui_positivi !== "all") count++;
        if (filters.has_test !== "all") count++;
        if (filters.test_status !== "all") count++;
        if (filters.test_completed !== "all") count++;
        if (filters.test_eligible !== "all") count++;
        if (filters.test_suspect !== "all") count++;
        if (filters.test_unreliable !== "all") count++;
        if (filters.test_preferred !== "all") count++;
        if (filters.test_read !== "all") count++;
        if (filters.test_evaluation !== "all") count++;
        if (filters.test_profile_id !== "all") count++;
        if (filters.piattaforma !== "all") count++;
        if (filters.data_da) count++;
        if (filters.data_a) count++;
        if (filters.data_chiusura_da) count++;
        if (filters.data_chiusura_a) count++;
        return count;
    }, [filters, isConsulente]);

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const updateFilter = <K extends keyof FilterState>(key: K, value: string) => {
        onFiltersChange({ ...filters, [key]: value || "all" });
    };

    const clearAllFilters = () => {
        onFiltersChange(INITIAL_FILTER_STATE);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="rounded-md bg-bigster-surface border border-bigster-border max-w-2xl max-h-[80vh] overflow-y-auto shadow-lg">
                <DialogHeader title="Filtra Candidature" onClose={onClose} />

                <div className="space-y-5 p-5 pt-0">

                    {/* ── FILTRI BASE ── */}
                    <div className="border border-bigster-border">
                        <button
                            onClick={() => toggleSection("base")}
                            className="w-full flex items-center justify-between p-4 bg-bigster-card-bg hover:bg-bigster-muted-bg transition-colors"
                        >
                            <span className="font-semibold text-bigster-text">Filtri Base</span>
                            <ChevronDown
                                className={`h-5 w-5 text-bigster-text transition-transform ${expandedSections.base ? "rotate-180" : ""}`}
                            />
                        </button>
                        {expandedSections.base && (
                            <div className="p-4 space-y-4">

                                <StandardSelect
                                    label="Stato Candidatura"
                                    value={filters.stato === "all" ? "" : filters.stato}
                                    onChange={(value) => updateFilter("stato", value)}
                                    options={STATUS_OPTIONS}
                                    emptyLabel="Tutti gli stati"
                                />

                                {/* Selezione — visibile a tutti. Per il consulente le opzioni
                                    sono già limitate alle sue selezioni dal backend. */}
                                <div>
                                    <SearchableSelect
                                        label="Selezione"
                                        value={filters.selezione_id === "all" ? "" : filters.selezione_id}
                                        onChange={(value) => updateFilter("selezione_id", value)}
                                        options={selectionOptions}
                                        placeholder="Cerca selezione..."
                                        emptyLabel="Tutte le selezioni"
                                    />
                                    {isConsulente && (
                                        <p className="text-[11px] text-bigster-text-muted mt-1 flex items-center gap-1">
                                            <Lock className="h-3 w-3 flex-shrink-0" />
                                            Vengono mostrate solo le selezioni associate alle tue aziende.
                                        </p>
                                    )}
                                </div>

                                {/* Azienda — nascosto per il consulente:
                                    lo scope è già forzato a livello di API. */}
                                {!isConsulente && (
                                    <SearchableSelect
                                        label="Azienda"
                                        value={filters.company_id === "all" ? "" : filters.company_id}
                                        onChange={(value) => updateFilter("company_id", value)}
                                        options={companyOptions}
                                        placeholder="Cerca azienda..."
                                        emptyLabel="Tutte le aziende"
                                    />
                                )}

                                {/* Info box per il consulente: spiega che il filtro azienda è già applicato */}
                                {isConsulente && (
                                    <div className="flex items-start gap-2.5 p-3 bg-bigster-card-bg border border-bigster-border">
                                        <Lock className="h-4 w-4 text-bigster-text-muted flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-semibold text-bigster-text">
                                                Filtro azienda applicato automaticamente
                                            </p>
                                            <p className="text-[11px] text-bigster-text-muted mt-0.5">
                                                Stai visualizzando solo le candidature relative alle aziende
                                                che hai venduto e stai seguendo. Questo filtro non può essere rimosso.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <StandardSelect
                                    label="Nella Rosa"
                                    value={filters.is_shortlisted === "all" ? "" : filters.is_shortlisted}
                                    onChange={(value) => updateFilter("is_shortlisted", value)}
                                    options={YES_NO_OPTIONS}
                                    emptyLabel="Tutti"
                                />
                            </div>
                        )}
                    </div>

                    {/* ── DATI CANDIDATO ── */}
                    <div className="border border-bigster-border">
                        <button
                            onClick={() => toggleSection("candidato")}
                            className="w-full flex items-center justify-between p-4 bg-bigster-card-bg hover:bg-bigster-muted-bg transition-colors"
                        >
                            <span className="font-semibold text-bigster-text">Dati Candidato</span>
                            <ChevronDown
                                className={`h-5 w-5 text-bigster-text transition-transform ${expandedSections.candidato ? "rotate-180" : ""}`}
                            />
                        </button>
                        {expandedSections.candidato && (
                            <div className="p-4 space-y-4">
                                <StandardSelect
                                    label="Sesso"
                                    value={filters.sesso === "all" ? "" : filters.sesso}
                                    onChange={(value) => updateFilter("sesso", value)}
                                    options={GENDER_OPTIONS}
                                    emptyLabel="Tutti"
                                />
                                <SearchableSelect
                                    label="Regione"
                                    value={filters.regione === "all" ? "" : filters.regione}
                                    onChange={(value) => updateFilter("regione", value)}
                                    options={regioniOptions}
                                    placeholder="Cerca regione..."
                                    emptyLabel="Tutte le regioni"
                                />
                                <SearchableSelect
                                    label="Provincia"
                                    value={filters.provincia === "all" ? "" : filters.provincia}
                                    onChange={(value) => updateFilter("provincia", value)}
                                    options={provinceOptions}
                                    placeholder="Cerca provincia..."
                                    emptyLabel="Tutte le province"
                                />
                                <SearchableSelect
                                    label="Città"
                                    value={filters.citta === "all" ? "" : filters.citta}
                                    onChange={(value) => updateFilter("citta", value)}
                                    options={cittaOptions}
                                    placeholder="Cerca città..."
                                    emptyLabel="Tutte le città"
                                />
                                <SearchableSelect
                                    label="Titolo di Studio"
                                    value={filters.titolo_studio === "all" ? "" : filters.titolo_studio}
                                    onChange={(value) => updateFilter("titolo_studio", value)}
                                    options={titoliOptions}
                                    placeholder="Cerca titolo..."
                                    emptyLabel="Tutti i titoli"
                                />
                                <div>
                                    <label className="text-sm font-semibold text-bigster-text block mb-2">
                                        Range Età
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <span className="text-xs text-bigster-text-muted block mb-1">Da</span>
                                            <input
                                                type="number"
                                                value={filters.eta_min}
                                                onChange={(e) =>
                                                    onFiltersChange({ ...filters, eta_min: e.target.value })
                                                }
                                                placeholder="Min"
                                                min={18}
                                                max={99}
                                                className={inputBase}
                                            />
                                        </div>
                                        <div>
                                            <span className="text-xs text-bigster-text-muted block mb-1">A</span>
                                            <input
                                                type="number"
                                                value={filters.eta_max}
                                                onChange={(e) =>
                                                    onFiltersChange({ ...filters, eta_max: e.target.value })
                                                }
                                                placeholder="Max"
                                                min={18}
                                                max={99}
                                                className={inputBase}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── DOMICILIO ── */}
                    <div className="border border-bigster-border">
                        <button
                            onClick={() => toggleSection("domicilio")}
                            className="w-full flex items-center justify-between p-4 bg-bigster-card-bg hover:bg-bigster-muted-bg transition-colors"
                        >
                            <span className="font-semibold text-bigster-text">Domicilio</span>
                            <ChevronDown
                                className={`h-5 w-5 text-bigster-text transition-transform ${expandedSections.domicilio ? "rotate-180" : ""}`}
                            />
                        </button>
                        {expandedSections.domicilio && (
                            <div className="p-4 space-y-4">
                                <SearchableSelect
                                    label="Regione Domicilio"
                                    value={filters.domicilio_regione === "all" ? "" : filters.domicilio_regione}
                                    onChange={(value) => updateFilter("domicilio_regione", value)}
                                    options={regioniOptions}
                                    placeholder="Cerca regione..."
                                    emptyLabel="Tutte le regioni"
                                />
                                <SearchableSelect
                                    label="Provincia Domicilio"
                                    value={filters.domicilio_provincia === "all" ? "" : filters.domicilio_provincia}
                                    onChange={(value) => updateFilter("domicilio_provincia", value)}
                                    options={provinceOptions}
                                    placeholder="Cerca provincia..."
                                    emptyLabel="Tutte le province"
                                />
                                <SearchableSelect
                                    label="Città Domicilio"
                                    value={filters.domicilio_citta === "all" ? "" : filters.domicilio_citta}
                                    onChange={(value) => updateFilter("domicilio_citta", value)}
                                    options={cittaOptions}
                                    placeholder="Cerca città..."
                                    emptyLabel="Tutte le città"
                                />
                            </div>
                        )}
                    </div>

                    {/* ── INFORMAZIONI PROFESSIONALI ── */}
                    <div className="border border-bigster-border">
                        <button
                            onClick={() => toggleSection("professionale")}
                            className="w-full flex items-center justify-between p-4 bg-bigster-card-bg hover:bg-bigster-muted-bg transition-colors"
                        >
                            <span className="font-semibold text-bigster-text">Informazioni Professionali</span>
                            <ChevronDown
                                className={`h-5 w-5 text-bigster-text transition-transform ${expandedSections.professionale ? "rotate-180" : ""}`}
                            />
                        </button>
                        {expandedSections.professionale && (
                            <div className="p-4 space-y-4">
                                <StandardSelect
                                    label="Automunito"
                                    value={filters.automunito === "all" ? "" : filters.automunito}
                                    onChange={(value) => updateFilter("automunito", value)}
                                    options={YES_NO_OPTIONS}
                                    emptyLabel="Tutti"
                                />
                                <StandardSelect
                                    label="Disponibilità Trasferte"
                                    value={filters.disponibilita_trasferte === "all" ? "" : filters.disponibilita_trasferte}
                                    onChange={(value) => updateFilter("disponibilita_trasferte", value)}
                                    options={YES_NO_OPTIONS}
                                    emptyLabel="Tutti"
                                />
                                <StandardSelect
                                    label="Partita IVA"
                                    value={filters.partita_iva === "all" ? "" : filters.partita_iva}
                                    onChange={(value) => updateFilter("partita_iva", value)}
                                    options={YES_NO_OPTIONS}
                                    emptyLabel="Tutti"
                                />
                                <StandardSelect
                                    label="Attestato ASO"
                                    value={filters.attestato_aso === "all" ? "" : filters.attestato_aso}
                                    onChange={(value) => updateFilter("attestato_aso", value)}
                                    options={ATTESTATO_ASO_OPTIONS}
                                    emptyLabel="Tutti"
                                />
                                <StandardSelect
                                    label="Disponibilità Immediata"
                                    value={filters.disponibilita_immediata === "all" ? "" : filters.disponibilita_immediata}
                                    onChange={(value) => updateFilter("disponibilita_immediata", value)}
                                    options={YES_NO_OPTIONS}
                                    emptyLabel="Tutti"
                                />
                                <div>
                                    <label className="text-sm font-semibold text-bigster-text block mb-2">
                                        Preavviso (settimane)
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <span className="text-xs text-bigster-text-muted block mb-1">Da</span>
                                            <input
                                                type="number"
                                                value={filters.preavviso_min}
                                                onChange={(e) =>
                                                    onFiltersChange({ ...filters, preavviso_min: e.target.value })
                                                }
                                                placeholder="Min"
                                                min={0}
                                                max={52}
                                                className={inputBase}
                                            />
                                        </div>
                                        <div>
                                            <span className="text-xs text-bigster-text-muted block mb-1">A</span>
                                            <input
                                                type="number"
                                                value={filters.preavviso_max}
                                                onChange={(e) =>
                                                    onFiltersChange({ ...filters, preavviso_max: e.target.value })
                                                }
                                                placeholder="Max"
                                                min={0}
                                                max={52}
                                                className={inputBase}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── DOCUMENTI ── */}
                    <div className="border border-bigster-border">
                        <button
                            onClick={() => toggleSection("documenti")}
                            className="w-full flex items-center justify-between p-4 bg-bigster-card-bg hover:bg-bigster-muted-bg transition-colors"
                        >
                            <span className="font-semibold text-bigster-text">Documenti</span>
                            <ChevronDown
                                className={`h-5 w-5 text-bigster-text transition-transform ${expandedSections.documenti ? "rotate-180" : ""}`}
                            />
                        </button>
                        {expandedSections.documenti && (
                            <div className="p-4 space-y-4">
                                <StandardSelect
                                    label="CV Caricato"
                                    value={filters.has_cv === "all" ? "" : filters.has_cv}
                                    onChange={(value) => updateFilter("has_cv", value)}
                                    options={YES_NO_OPTIONS}
                                    emptyLabel="Tutti"
                                />
                                <StandardSelect
                                    label="Ha Note"
                                    value={filters.has_note === "all" ? "" : filters.has_note}
                                    onChange={(value) => updateFilter("has_note", value)}
                                    options={YES_NO_OPTIONS}
                                    emptyLabel="Tutti"
                                />
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-bigster-text">
                                        Visualizzata dall'HR
                                    </label>
                                    <StandardSelect
                                        value={filters.is_read}
                                        onChange={(val) => onFiltersChange({ ...filters, is_read: val })}
                                        options={[
                                            { value: "yes", label: "Sì, visualizzata" },
                                            { value: "no", label: "No, non visualizzata" },
                                        ]}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── COLLOQUI ── */}
                    <div className="border border-bigster-border">
                        <button
                            onClick={() => toggleSection("colloqui")}
                            className="w-full flex items-center justify-between p-4 bg-bigster-card-bg hover:bg-bigster-muted-bg transition-colors"
                        >
                            <span className="font-semibold text-bigster-text">Colloqui</span>
                            <ChevronDown
                                className={`h-5 w-5 text-bigster-text transition-transform ${expandedSections.colloqui ? "rotate-180" : ""}`}
                            />
                        </button>
                        {expandedSections.colloqui && (
                            <div className="p-4 space-y-4">
                                <StandardSelect
                                    label="Colloqui Effettuati"
                                    value={filters.has_colloqui === "all" ? "" : filters.has_colloqui}
                                    onChange={(value) => updateFilter("has_colloqui", value)}
                                    options={YES_NO_OPTIONS}
                                    emptyLabel="Tutti"
                                />
                                <StandardSelect
                                    label="Tipo Colloquio"
                                    value={filters.tipo_colloquio === "all" ? "" : filters.tipo_colloquio}
                                    onChange={(value) => updateFilter("tipo_colloquio", value)}
                                    options={INTERVIEW_TYPE_OPTIONS}
                                    emptyLabel="Tutti i tipi"
                                />
                                <StandardSelect
                                    label="Esito Colloquio"
                                    value={filters.esito_colloquio === "all" ? "" : filters.esito_colloquio}
                                    onChange={(value) => updateFilter("esito_colloquio", value)}
                                    options={INTERVIEW_OUTCOME_OPTIONS}
                                    emptyLabel="Tutti gli esiti"
                                />
                                <StandardSelect
                                    label="Colloqui Positivi"
                                    value={filters.has_colloqui_positivi === "all" ? "" : filters.has_colloqui_positivi}
                                    onChange={(value) => updateFilter("has_colloqui_positivi", value)}
                                    options={YES_NO_OPTIONS}
                                    emptyLabel="Tutti"
                                />
                            </div>
                        )}
                    </div>

                    {/* ── TEST BIGSTER ── */}
                    <div className="border border-bigster-border">
                        <button
                            onClick={() => toggleSection("test")}
                            className="w-full flex items-center justify-between p-4 bg-bigster-card-bg hover:bg-bigster-muted-bg transition-colors"
                        >
                            <span className="font-semibold text-bigster-text">Test BigsTer</span>
                            <ChevronDown
                                className={`h-5 w-5 text-bigster-text transition-transform ${expandedSections.test ? "rotate-180" : ""}`}
                            />
                        </button>
                        {expandedSections.test && (
                            <div className="p-4 space-y-4">
                                <StandardSelect
                                    label="Test Inviato"
                                    value={filters.has_test === "all" ? "" : filters.has_test}
                                    onChange={(value) => updateFilter("has_test", value)}
                                    options={YES_NO_OPTIONS}
                                    emptyLabel="Tutti"
                                />
                                <StandardSelect
                                    label="Stato Test"
                                    value={filters.test_status === "all" ? "" : filters.test_status}
                                    onChange={(value) => updateFilter("test_status", value)}
                                    options={TEST_STATUS_OPTIONS}
                                    emptyLabel="Tutti gli stati"
                                />
                                <StandardSelect
                                    label="Test Completato"
                                    value={filters.test_completed === "all" ? "" : filters.test_completed}
                                    onChange={(value) => updateFilter("test_completed", value)}
                                    options={YES_NO_OPTIONS}
                                    emptyLabel="Tutti"
                                />
                                <StandardSelect
                                    label="Esito Idoneità"
                                    value={filters.test_eligible === "all" ? "" : filters.test_eligible}
                                    onChange={(value) => updateFilter("test_eligible", value)}
                                    options={YES_NO_OPTIONS}
                                    emptyLabel="Tutti"
                                />
                                <StandardSelect
                                    label="Test Sospetto"
                                    value={filters.test_suspect === "all" ? "" : filters.test_suspect}
                                    onChange={(value) => updateFilter("test_suspect", value)}
                                    options={YES_NO_OPTIONS}
                                    emptyLabel="Tutti"
                                />
                                <StandardSelect
                                    label="Test Inaffidabile"
                                    value={filters.test_unreliable === "all" ? "" : filters.test_unreliable}
                                    onChange={(value) => updateFilter("test_unreliable", value)}
                                    options={YES_NO_OPTIONS}
                                    emptyLabel="Tutti"
                                />
                                <StandardSelect
                                    label="Test Preferito"
                                    value={filters.test_preferred === "all" ? "" : filters.test_preferred}
                                    onChange={(value) => updateFilter("test_preferred", value)}
                                    options={YES_NO_OPTIONS}
                                    emptyLabel="Tutti"
                                />
                                <StandardSelect
                                    label="Test Letto"
                                    value={filters.test_read === "all" ? "" : filters.test_read}
                                    onChange={(value) => updateFilter("test_read", value)}
                                    options={YES_NO_OPTIONS}
                                    emptyLabel="Tutti"
                                />
                                <StandardSelect
                                    label="Valutazione Test"
                                    value={filters.test_evaluation === "all" ? "" : filters.test_evaluation}
                                    onChange={(value) => updateFilter("test_evaluation", value)}
                                    options={TEST_EVALUATION_OPTIONS}
                                    emptyLabel="Tutte le valutazioni"
                                />
                                <div>
                                    <label className="text-sm font-semibold text-bigster-text block mb-2">
                                        ID Profilo Test
                                    </label>
                                    <input
                                        type="number"
                                        value={filters.test_profile_id === "all" ? "" : filters.test_profile_id}
                                        onChange={(e) =>
                                            onFiltersChange({
                                                ...filters,
                                                test_profile_id: e.target.value || "all",
                                            })
                                        }
                                        placeholder="ID profilo..."
                                        min={1}
                                        className={inputBase}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── PIATTAFORMA ── */}
                    <div className="border border-bigster-border">
                        <button
                            onClick={() => toggleSection("piattaforma")}
                            className="w-full flex items-center justify-between p-4 bg-bigster-card-bg hover:bg-bigster-muted-bg transition-colors"
                        >
                            <span className="font-semibold text-bigster-text">Piattaforma</span>
                            <ChevronDown
                                className={`h-5 w-5 text-bigster-text transition-transform ${expandedSections.piattaforma ? "rotate-180" : ""}`}
                            />
                        </button>
                        {expandedSections.piattaforma && (
                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="text-sm font-semibold text-bigster-text block mb-2">
                                        Piattaforma Annuncio
                                    </label>
                                    <input
                                        type="text"
                                        value={filters.piattaforma === "all" ? "" : filters.piattaforma}
                                        onChange={(e) =>
                                            onFiltersChange({
                                                ...filters,
                                                piattaforma: e.target.value || "all",
                                            })
                                        }
                                        placeholder="Es. Indeed, LinkedIn, InfoJobs..."
                                        className={inputBase}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── FILTRI PER DATA ── */}
                    <div className="border border-bigster-border">
                        <button
                            onClick={() => toggleSection("date")}
                            className="w-full flex items-center justify-between p-4 bg-bigster-card-bg hover:bg-bigster-muted-bg transition-colors"
                        >
                            <span className="font-semibold text-bigster-text">Filtri per Data</span>
                            <ChevronDown
                                className={`h-5 w-5 text-bigster-text transition-transform ${expandedSections.date ? "rotate-180" : ""}`}
                            />
                        </button>
                        {expandedSections.date && (
                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="text-sm font-semibold text-bigster-text block mb-2">
                                        Data Candidatura - Da
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.data_da}
                                        onChange={(e) =>
                                            onFiltersChange({ ...filters, data_da: e.target.value })
                                        }
                                        className={inputBase}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-bigster-text block mb-2">
                                        Data Candidatura - A
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.data_a}
                                        onChange={(e) =>
                                            onFiltersChange({ ...filters, data_a: e.target.value })
                                        }
                                        className={inputBase}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-bigster-text block mb-2">
                                        Data Chiusura - Da
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.data_chiusura_da}
                                        onChange={(e) =>
                                            onFiltersChange({ ...filters, data_chiusura_da: e.target.value })
                                        }
                                        className={inputBase}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-bigster-text block mb-2">
                                        Data Chiusura - A
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.data_chiusura_a}
                                        onChange={(e) =>
                                            onFiltersChange({ ...filters, data_chiusura_a: e.target.value })
                                        }
                                        className={inputBase}
                                    />
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

export default ApplicationFilters;

// Stato iniziale filtri — esportato per uso esterno (ApplicationList, ApplicationsToolbar)
export const INITIAL_FILTER_STATE: FilterState = {
    stato: "all",
    selezione_id: "all",
    company_id: "all",
    is_shortlisted: "all",
    sesso: "all",
    regione: "all",
    provincia: "all",
    citta: "all",
    titolo_studio: "all",
    eta_min: "",
    eta_max: "",
    domicilio_regione: "all",
    domicilio_provincia: "all",
    domicilio_citta: "all",
    automunito: "all",
    disponibilita_trasferte: "all",
    partita_iva: "all",
    attestato_aso: "all",
    disponibilita_immediata: "all",
    preavviso_min: "",
    preavviso_max: "",
    has_cv: "all",
    has_note: "all",
    is_read: "all",
    has_colloqui: "all",
    tipo_colloquio: "all",
    esito_colloquio: "all",
    has_colloqui_positivi: "all",
    has_test: "all",
    test_status: "all",
    test_completed: "all",
    test_eligible: "all",
    test_suspect: "all",
    test_unreliable: "all",
    test_preferred: "all",
    test_read: "all",
    test_evaluation: "all",
    test_profile_id: "all",
    piattaforma: "all",
    data_da: "",
    data_a: "",
    data_chiusura_da: "",
    data_chiusura_a: "",
};