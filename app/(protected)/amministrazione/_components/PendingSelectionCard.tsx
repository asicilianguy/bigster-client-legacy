"use client";

import { useState } from "react";
import {
    Building2,
    User,
    FileText,
    Plus,
    CreditCard,
    CheckCircle2,
    Clock,
    AlertCircle,
    Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PendingSelectionItem, PendingInvoiceItem } from "@/types/selection";
import { AddInvoiceModal } from "./AddInvoiceModal";
import { RegisterPaymentModal } from "./RegisterPaymentModal";

const INVOICE_TYPE_LABELS: Record<string, string> = {
    AV: "Avvio",
    INS: "Inserimento",
    MDO: "Master DTO",
};

const PACKAGE_LABELS: Record<string, string> = {
    BASE: "Base (AV + INS)",
    MDO: "Master DTO (AV + INS + MDO)",
};

interface PendingSelectionCardProps {
    selection: PendingSelectionItem;
}

export function PendingSelectionCard({ selection }: PendingSelectionCardProps) {
    const [addInvoiceModal, setAddInvoiceModal] = useState<{
        open: boolean;
        missingTypes: string[];
    }>({ open: false, missingTypes: [] });

    const [paymentModal, setPaymentModal] = useState<{
        open: boolean;
        invoice: PendingInvoiceItem | null;
    }>({ open: false, invoice: null });

    const { invoices_summary } = selection;

    const borderColor = invoices_summary.has_missing_invoices
        ? "border-l-4 border-l-yellow-400"
        : invoices_summary.has_pending_payments
            ? "border-l-4 border-l-orange-400"
            : "";

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <>
            <div
                className={`bg-bigster-surface border border-bigster-border ${borderColor} transition-colors`}
            >

                <div className="px-5 py-4 border-b border-bigster-border bg-bigster-card-bg">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm font-bold text-bigster-text">
                                    {selection.titolo}
                                </h3>
                                <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold border border-bigster-border bg-bigster-surface text-bigster-text">
                                    #{selection.id}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-bigster-text-muted">
                                <span className="flex items-center gap-1">
                                    <Building2 className="h-3 w-3" />
                                    {selection.company.nome}
                                </span>
                                <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {selection.consulente.nome} {selection.consulente.cognome}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Package className="h-3 w-3" />
                                    {selection.pacchetto}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDate(selection.data_creazione)}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                            <span className="text-xs font-semibold text-bigster-text px-2 py-1 bg-bigster-surface border border-bigster-border">
                                {invoices_summary.current}/{invoices_summary.expected} fatture
                            </span>
                            <span className="text-xs font-semibold text-bigster-text px-2 py-1 bg-bigster-surface border border-bigster-border">
                                {invoices_summary.paid}/{invoices_summary.current} saldate
                            </span>
                        </div>
                    </div>
                </div>

                <div className="px-5 py-4">
                    <div className="space-y-3">

                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-bigster-text-muted">Completamento fatturazione</span>
                                <span className="font-semibold text-bigster-text">
                                    {Math.round((invoices_summary.current / invoices_summary.expected) * 100)}%
                                </span>
                            </div>
                            <div className="w-full h-2 bg-bigster-card-bg border border-bigster-border">
                                <div
                                    className="h-full bg-bigster-primary transition-all"
                                    style={{
                                        width: `${Math.round(
                                            (invoices_summary.current / invoices_summary.expected) * 100
                                        )}%`,
                                    }}
                                />
                            </div>
                        </div>

                        {selection.fatture.length > 0 && (
                            <div className="space-y-2">
                                {selection.fatture.map((fattura) => (
                                    <div
                                        key={fattura.id}
                                        className="flex items-center justify-between p-3 bg-bigster-card-bg border border-bigster-border"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-4 w-4 text-bigster-text-muted" />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-bigster-text">
                                                        {INVOICE_TYPE_LABELS[fattura.tipo_fattura] || fattura.tipo_fattura}
                                                    </span>
                                                    <span className="text-xs text-bigster-text-muted">
                                                        {fattura.numero_fattura}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-bigster-text-muted">
                                                    Emessa: {formatDate(fattura.data_emissione)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {fattura.data_pagamento ? (
                                                <span className="flex items-center gap-1 text-xs font-semibold text-green-600 px-2 py-1 bg-green-50 border border-green-200">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Saldata {formatDate(fattura.data_pagamento)}
                                                </span>
                                            ) : (
                                                <Button
                                                    onClick={() =>
                                                        setPaymentModal({ open: true, invoice: fattura })
                                                    }
                                                    variant="outline"
                                                    className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg text-xs h-8 px-3"
                                                >
                                                    <CreditCard className="h-3 w-3 mr-1.5" />
                                                    Registra Pagamento
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {invoices_summary.has_missing_invoices && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-yellow-700" />
                                        <span className="text-xs font-semibold text-yellow-800">
                                            Fatture mancanti:{" "}
                                            {invoices_summary.missing_types
                                                .map((t) => INVOICE_TYPE_LABELS[t] || t)
                                                .join(", ")}
                                        </span>
                                    </div>
                                    <Button
                                        onClick={() =>
                                            setAddInvoiceModal({
                                                open: true,
                                                missingTypes: invoices_summary.missing_types.filter(
                                                    (t) => t !== "AV"
                                                ),
                                            })
                                        }
                                        className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90 text-xs h-8 px-3"
                                        disabled={
                                            invoices_summary.missing_types.filter((t) => t !== "AV")
                                                .length === 0
                                        }
                                    >
                                        <Plus className="h-3 w-3 mr-1.5" />
                                        Aggiungi Fattura
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AddInvoiceModal
                isOpen={addInvoiceModal.open}
                onClose={() => setAddInvoiceModal({ open: false, missingTypes: [] })}
                selectionId={selection.id}
                companyId={selection.company.id}
                companyName={selection.company.nome}
                selectionTitle={selection.titolo}
                missingTypes={addInvoiceModal.missingTypes}
                pacchetto={selection.pacchetto}
            />

            <RegisterPaymentModal
                isOpen={paymentModal.open}
                onClose={() => setPaymentModal({ open: false, invoice: null })}
                selectionId={selection.id}
                selectionTitle={selection.titolo}
                invoice={paymentModal.invoice}
            />
        </>
    );
}
