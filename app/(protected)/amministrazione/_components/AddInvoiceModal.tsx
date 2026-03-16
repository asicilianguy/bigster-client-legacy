"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
    FileText,
    Search,
    Euro,
    Calendar,
    X,
    Lock,
    AlertCircle,
    Check,
    Building,
    RefreshCw,
    Loader2,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { StandardSelect } from "@/components/ui/StandardSelect";
import {
    useAddInvoiceToSelectionMutation,
    useGetUsedInvoiceFicIdsQuery,
} from "@/lib/redux/features/selections/selectionsApiSlice";
import { useFattureInCloudAuth } from "@/hooks/useFattureInCloudAuth";
import { useInvoicesCache } from "@/app/contexts/InvoicesContext";
import { useNotify } from "@/hooks/use-notify";
import type { Invoice } from "@/app/contexts/InvoicesContext";

const inputBase =
    "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors";

const INVOICE_TYPE_LABELS: Record<string, string> = {
    AV: "Avvio",
    INS: "Inserimento",
    MDO: "Master DTO",
};

type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

const SORT_OPTIONS = [
    { value: "date-desc", label: "Data (più recente)" },
    { value: "date-asc", label: "Data (più vecchia)" },
    { value: "amount-desc", label: "Importo (maggiore)" },
    { value: "amount-asc", label: "Importo (minore)" },
];

interface AddInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectionId: number;
    companyId: number;
    companyName: string;
    selectionTitle: string;
    missingTypes: string[];
    pacchetto: string;
}

export function AddInvoiceModal({
    isOpen,
    onClose,
    selectionId,
    companyId,
    companyName,
    selectionTitle,
    missingTypes,
    pacchetto,
}: AddInvoiceModalProps) {
    const notify = useNotify();

    const [addInvoice, { isLoading: isAdding }] = useAddInvoiceToSelectionMutation();
    const { data: usedInvoicesData } = useGetUsedInvoiceFicIdsQuery();

    const { isCached } = useInvoicesCache();

    const {
        isAuthenticated,
        isLoading: isAuthLoading,
        fetchInvoices,
        companyId: ficCompanyId,
        startAuthorization,
    } = useFattureInCloudAuth({
        clientId: "MTtGdO45g82xfjERs9lGODOmXHRuaBWM",
        clientSecret:
            "XRm8t8N4l5jEwJMEKM6p02zYCJ6BJcxfDVSYgUeeRUVZMmxbFgfFowBetpT4Kig0",
        redirectUri: `http://localhost:3001/amministrazione`,
        companyIndex: 0,
        companyId: 709890,
    });

    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [selectedType, setSelectedType] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("date-desc");
    const [filterCode, setFilterCode] = useState<string>("ALL");

    const usedFicIds = useMemo(
        () => new Set(usedInvoicesData?.used_fic_ids ?? []),
        [usedInvoicesData]
    );

    useEffect(() => {
        if (!isOpen) {
            setSelectedInvoice(null);
            setSelectedType("");
            setSearchTerm("");
            setFilterCode("ALL");
            setSortBy("date-desc");
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && missingTypes.length === 1) {
            setSelectedType(missingTypes[0]);
        }
    }, [isOpen, missingTypes]);

    useEffect(() => {
        if (isOpen && isAuthenticated && invoices.length === 0) {
            handleLoadInvoices(false);
        }
    }, [isOpen, isAuthenticated]);

    const handleLoadInvoices = async (forceRefresh: boolean = false) => {
        try {
            setIsLoadingInvoices(true);
            const data = await fetchInvoices(forceRefresh);
            setInvoices(data);
        } catch (err) {
            console.error("Error loading invoices:", err);
            notify.error("Errore", "Impossibile caricare le fatture da FIC");
        } finally {
            setIsLoadingInvoices(false);
        }
    };

    const filteredInvoices = useMemo(() => {
        let filtered = [...invoices];

        if (filterCode !== "ALL") {
            filtered = filtered.filter((inv) =>
                inv.items_codes?.includes(filterCode)
            );
        }

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (inv) =>
                    inv.contract_number?.toLowerCase().includes(search) ||
                    inv.number.toLowerCase().includes(search) ||
                    inv.entity?.name?.toLowerCase().includes(search)
            );
        }

        filtered.sort((a, b) => {
            const aUsed = usedFicIds.has(a.id);
            const bUsed = usedFicIds.has(b.id);
            if (aUsed !== bUsed) return aUsed ? 1 : -1;

            switch (sortBy) {
                case "date-desc":
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                case "date-asc":
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                case "amount-desc":
                    return b.amount_gross - a.amount_gross;
                case "amount-asc":
                    return a.amount_gross - b.amount_gross;
                default:
                    return 0;
            }
        });

        return filtered;
    }, [invoices, filterCode, searchTerm, sortBy, usedFicIds]);

    const handleConfirm = async () => {
        if (!selectedInvoice || !selectedType) {
            notify.error("Dati mancanti", "Seleziona una fattura e un tipo");
            return;
        }

        try {
            const result = await addInvoice({
                selectionId,
                body: {
                    fic_id: selectedInvoice.id,
                    numero_fattura: selectedInvoice.number,
                    tipo_fattura: selectedType as "INS" | "MDO",
                    data_emissione: selectedInvoice.date,
                },
            }).unwrap();

            notify.success(
                "Fattura aggiunta",
                `Fattura ${INVOICE_TYPE_LABELS[selectedType]} associata con successo`
            );
            onClose();
        } catch (error: any) {
            console.error("Errore aggiunta fattura:", error);

            if (error?.status === 409) {
                notify.error(
                    "Fattura già associata",
                    error?.data?.error || "Questa fattura è già in uso"
                );
            } else if (error?.status === 400) {
                notify.error(
                    "Operazione non valida",
                    error?.data?.error || "Controlla i dati inseriti"
                );
            } else {
                notify.error("Errore", "Impossibile aggiungere la fattura");
            }
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const typeOptions = missingTypes
        .filter((t) => t !== "AV")
        .map((t) => ({
            value: t,
            label: INVOICE_TYPE_LABELS[t] || t,
        }));

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="rounded-none bg-bigster-surface border border-bigster-border max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">

                <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-lg font-bold text-bigster-text">
                                Aggiungi Fattura
                            </DialogTitle>
                            <p className="text-xs text-bigster-text-muted mt-0.5">
                                {selectionTitle} — {companyName}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-bigster-muted-bg transition-colors"
                        >
                            <X className="h-5 w-5 text-bigster-text-muted" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-5">

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-bigster-text">
                            Tipo Fattura *
                        </label>
                        {typeOptions.length === 1 ? (
                            <div className="p-3 bg-bigster-card-bg border border-bigster-border">
                                <span className="text-sm font-semibold text-bigster-text">
                                    {typeOptions[0].label}
                                </span>
                            </div>
                        ) : (
                            <StandardSelect
                                value={selectedType}
                                onChange={setSelectedType}
                                options={typeOptions}
                                emptyLabel="Seleziona tipo"
                                useEmptyStringForAll
                            />
                        )}
                    </div>

                    {isAuthLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Spinner className="h-8 w-8 text-bigster-text" />
                        </div>
                    ) : !isAuthenticated ? (
                        <div className="text-center py-8 bg-bigster-muted-bg border border-bigster-border space-y-4">
                            <AlertCircle className="h-12 w-12 mx-auto text-bigster-text-muted" />
                            <div>
                                <p className="text-sm font-semibold text-bigster-text mb-1">
                                    Connessione a Fatture in Cloud richiesta
                                </p>
                                <p className="text-xs text-bigster-text-muted">
                                    Per selezionare la fattura è necessario autenticarsi
                                </p>
                            </div>
                            <Button
                                onClick={() =>
                                    startAuthorization({ companyId: companyId.toString() })
                                }
                                className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90"
                            >
                                <Building className="mr-2 h-4 w-4" />
                                Connetti Fatture in Cloud
                            </Button>
                        </div>
                    ) : (
                        <>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-bigster-text">
                                    Seleziona Fattura da FIC *
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-bigster-text-muted" />
                                        <input
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Cerca per numero o contratto…"
                                            className={`${inputBase} pl-10`}
                                        />
                                    </div>
                                    <div className="w-[180px]">
                                        <StandardSelect
                                            value={sortBy}
                                            onChange={(v) => setSortBy(v as SortOption)}
                                            options={SORT_OPTIONS}
                                            emptyLabel="Ordina"
                                        />
                                    </div>
                                    <Button
                                        onClick={() => handleLoadInvoices(true)}
                                        variant="outline"
                                        disabled={isLoadingInvoices}
                                        className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg h-10 px-3"
                                    >
                                        <RefreshCw
                                            className={`h-4 w-4 ${isLoadingInvoices ? "animate-spin" : ""}`}
                                        />
                                    </Button>
                                </div>
                            </div>

                            {selectedInvoice && (
                                <div className="p-3 bg-green-50 border-2 border-green-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Check className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="text-sm font-semibold text-green-800">
                                                    {selectedInvoice.number}
                                                </p>
                                                <p className="text-xs text-green-700">
                                                    {selectedInvoice.entity?.name} — €
                                                    {selectedInvoice.amount_gross.toFixed(2)} —{" "}
                                                    {formatDate(selectedInvoice.date)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedInvoice(null)}
                                            className="p-1 hover:bg-green-100 transition-colors"
                                        >
                                            <X className="h-4 w-4 text-green-600" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {isLoadingInvoices ? (
                                <div className="flex items-center justify-center py-8">
                                    <Spinner className="h-8 w-8 text-bigster-text" />
                                </div>
                            ) : (
                                <div className="border border-bigster-border max-h-[300px] overflow-y-auto">
                                    {filteredInvoices.length === 0 ? (
                                        <div className="p-6 text-center">
                                            <p className="text-sm text-bigster-text-muted">
                                                Nessuna fattura trovata
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-bigster-border">
                                            {filteredInvoices.map((invoice) => {
                                                const isUsed = usedFicIds.has(invoice.id);
                                                const isSelected = selectedInvoice?.id === invoice.id;

                                                return (
                                                    <button
                                                        key={invoice.id}
                                                        type="button"
                                                        onClick={() => {
                                                            if (!isUsed) setSelectedInvoice(invoice);
                                                        }}
                                                        disabled={isUsed}
                                                        className={`w-full p-3 text-left transition-colors ${isUsed
                                                                ? "opacity-50 cursor-not-allowed bg-bigster-muted-bg"
                                                                : isSelected
                                                                    ? "bg-green-50 border-l-4 border-l-green-500"
                                                                    : "hover:bg-bigster-muted-bg cursor-pointer"
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                {isUsed ? (
                                                                    <Lock className="h-4 w-4 text-bigster-text-muted flex-shrink-0" />
                                                                ) : (
                                                                    <FileText className="h-4 w-4 text-bigster-text-muted flex-shrink-0" />
                                                                )}
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-sm font-semibold text-bigster-text">
                                                                            {invoice.number}
                                                                        </span>
                                                                        {invoice.items_codes?.map((code, idx) => (
                                                                            <span
                                                                                key={idx}
                                                                                className="inline-flex items-center px-1.5 py-0.5 text-xs font-semibold border border-bigster-border bg-bigster-surface text-bigster-text"
                                                                            >
                                                                                {code}
                                                                            </span>
                                                                        ))}
                                                                        {isUsed && (
                                                                            <span className="text-xs font-semibold text-red-600 px-1.5 py-0.5 bg-red-50 border border-red-200">
                                                                                Già associata
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs text-bigster-text-muted">
                                                                        {invoice.entity?.name} —{" "}
                                                                        {formatDate(invoice.date)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className="text-sm font-semibold text-bigster-text">
                                                                €{invoice.amount_gross.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-bigster-border bg-bigster-card-bg flex-shrink-0">
                    <div className="flex items-center justify-end gap-3">
                        <Button
                            onClick={onClose}
                            variant="outline"
                            disabled={isAdding}
                            className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                        >
                            Annulla
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={!selectedInvoice || !selectedType || isAdding}
                            className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isAdding ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Salvataggio…
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Conferma Associazione
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
