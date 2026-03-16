"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    FileText,
    Search,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Clock,
    Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { StandardSelect } from "@/components/ui/StandardSelect";
import { useGetPendingInvoicesQuery } from "@/lib/redux/features/selections/selectionsApiSlice";
import { PendingSelectionCard } from "./PendingSelectionCard";

const inputBase =
    "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors";

const FILTER_OPTIONS = [
    { value: "all", label: "Tutte" },
    { value: "missing_invoices", label: "Fatture mancanti" },
    { value: "pending_payments", label: "Pagamenti pendenti" },
];

export function InvoiceManagement() {
    const {
        data: pendingData,
        isLoading,
        isError,
        isFetching,
        refetch,
    } = useGetPendingInvoicesQuery();

    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");

    const filteredSelections = useMemo(() => {
        if (!pendingData?.data) return [];

        let filtered = [...pendingData.data];

        if (filterType === "missing_invoices") {
            filtered = filtered.filter((s) => s.invoices_summary.has_missing_invoices);
        } else if (filterType === "pending_payments") {
            filtered = filtered.filter((s) => s.invoices_summary.has_pending_payments);
        }

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (s) =>
                    s.titolo.toLowerCase().includes(search) ||
                    s.company.nome.toLowerCase().includes(search) ||
                    s.consulente.nome.toLowerCase().includes(search) ||
                    s.consulente.cognome.toLowerCase().includes(search)
            );
        }

        return filtered;
    }, [pendingData, searchTerm, filterType]);

    const stats = useMemo(() => {
        if (!pendingData?.data) return { total: 0, missingInvoices: 0, pendingPayments: 0 };

        const items = pendingData.data;
        return {
            total: items.length,
            missingInvoices: items.filter((s) => s.invoices_summary.has_missing_invoices).length,
            pendingPayments: items.filter((s) => s.invoices_summary.has_pending_payments).length,
        };
    }, [pendingData]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Spinner className="h-10 w-10 text-bigster-text" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-12 bg-bigster-muted-bg border border-bigster-border">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-bigster-text mb-1">
                    Errore nel caricamento
                </p>
                <p className="text-xs text-bigster-text-muted mb-4">
                    Non è stato possibile caricare le selezioni con fatture pendenti
                </p>
                <Button
                    onClick={() => refetch()}
                    variant="outline"
                    className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Riprova
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-bigster-surface border border-bigster-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-bigster-card-bg border border-bigster-border">
                            <FileText className="h-5 w-5 text-bigster-text" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                                Selezioni da completare
                            </p>
                            <p className="text-2xl font-bold text-bigster-text">
                                {stats.total}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-bigster-surface border border-bigster-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-50 border border-yellow-200">
                            <Clock className="h-5 w-5 text-yellow-700" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                                Fatture mancanti
                            </p>
                            <p className="text-2xl font-bold text-bigster-text">
                                {stats.missingInvoices}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-bigster-surface border border-bigster-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-50 border border-orange-200">
                            <AlertCircle className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                                Pagamenti pendenti
                            </p>
                            <p className="text-2xl font-bold text-bigster-text">
                                {stats.pendingPayments}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-bigster-surface border border-bigster-border">
                <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-bigster-text">
                            Selezioni con fatturazione incompleta
                        </h2>
                        <Button
                            onClick={() => refetch()}
                            variant="outline"
                            disabled={isFetching}
                            className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
                            Aggiorna
                        </Button>
                    </div>
                </div>

                <div className="px-6 py-4 border-b border-bigster-border">
                    <div className="flex items-center gap-4">

                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-bigster-text-muted" />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cerca per titolo, azienda o consulente…"
                                className={`${inputBase} pl-10`}
                            />
                        </div>

                        <div className="w-[220px]">
                            <StandardSelect
                                value={filterType}
                                onChange={setFilterType}
                                options={FILTER_OPTIONS}
                                emptyLabel="Tutte"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {filteredSelections.length === 0 ? (
                        <div className="text-center py-12 bg-bigster-muted-bg border border-bigster-border">
                            {pendingData?.total === 0 ? (
                                <>
                                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                                    <p className="text-sm font-medium text-bigster-text mb-1">
                                        Tutto in ordine!
                                    </p>
                                    <p className="text-xs text-bigster-text-muted">
                                        Tutte le selezioni hanno la fatturazione completa
                                    </p>
                                </>
                            ) : (
                                <>
                                    <Filter className="h-12 w-12 text-bigster-text-muted mx-auto mb-3" />
                                    <p className="text-sm font-medium text-bigster-text-muted mb-1">
                                        Nessun risultato
                                    </p>
                                    <p className="text-xs text-bigster-text-muted">
                                        Nessuna selezione corrisponde ai criteri di ricerca
                                    </p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredSelections.map((selection, index) => (
                                <motion.div
                                    key={selection.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                >
                                    <PendingSelectionCard selection={selection} />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
