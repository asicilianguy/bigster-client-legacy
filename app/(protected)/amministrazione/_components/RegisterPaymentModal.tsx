"use client";

import { useState, useEffect } from "react";
import {
    CreditCard,
    Calendar,
    X,
    Check,
    FileText,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRegisterInvoicePaymentMutation } from "@/lib/redux/features/selections/selectionsApiSlice";
import { useNotify } from "@/hooks/use-notify";
import type { PendingInvoiceItem } from "@/types/selection";

const inputBase =
    "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors";

const INVOICE_TYPE_LABELS: Record<string, string> = {
    AV: "Fattura Avvio",
    INS: "Fattura Inserimento",
    MDO: "Fattura Master DTO",
};

interface RegisterPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectionId: number;
    selectionTitle: string;
    invoice: PendingInvoiceItem | null;
}

export function RegisterPaymentModal({
    isOpen,
    onClose,
    selectionId,
    selectionTitle,
    invoice,
}: RegisterPaymentModalProps) {
    const notify = useNotify();
    const [registerPayment, { isLoading }] = useRegisterInvoicePaymentMutation();
    const [dataPagamento, setDataPagamento] = useState("");

    useEffect(() => {
        if (isOpen) {

            setDataPagamento(new Date().toISOString().split("T")[0]);
        } else {
            setDataPagamento("");
        }
    }, [isOpen]);

    const handleConfirm = async () => {
        if (!invoice || !dataPagamento) {
            notify.error("Dati mancanti", "Inserisci la data di pagamento");
            return;
        }

        try {
            await registerPayment({
                selectionId,
                invoiceId: invoice.id,
                body: { data_pagamento: dataPagamento },
            }).unwrap();

            notify.success(
                "Pagamento registrato",
                `Fattura ${INVOICE_TYPE_LABELS[invoice.tipo_fattura] || invoice.tipo_fattura} registrata come saldata`
            );
            onClose();
        } catch (error: any) {
            console.error("Errore registrazione pagamento:", error);

            if (error?.status === 400) {
                notify.error(
                    "Errore",
                    error?.data?.error || "Questa fattura è già stata pagata"
                );
            } else {
                notify.error("Errore", "Impossibile registrare il pagamento");
            }
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    if (!invoice) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="rounded-none bg-bigster-surface border border-bigster-border max-w-md">

                <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-lg font-bold text-bigster-text">
                                Registra Pagamento
                            </DialogTitle>
                            <p className="text-xs text-bigster-text-muted mt-0.5">
                                {selectionTitle}
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

                <div className="p-6 space-y-5">

                    <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                        <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-bigster-text-muted flex-shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-bigster-text">
                                    {INVOICE_TYPE_LABELS[invoice.tipo_fattura] || invoice.tipo_fattura}
                                </p>
                                <p className="text-xs text-bigster-text-muted">
                                    Numero: {invoice.numero_fattura}
                                </p>
                                <p className="text-xs text-bigster-text-muted">
                                    Emessa il: {formatDate(invoice.data_emissione)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-bigster-text">
                            Data di Pagamento *
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-bigster-text-muted" />
                            <input
                                type="date"
                                value={dataPagamento}
                                onChange={(e) => setDataPagamento(e.target.value)}
                                className={`${inputBase} pl-10`}
                            />
                        </div>
                        <p className="text-xs text-bigster-text-muted">
                            Inserisci la data in cui è stato ricevuto il pagamento
                        </p>
                    </div>

                    <div className="p-3 bg-yellow-50 border border-yellow-200">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-700 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-700">
                                Questa operazione non è reversibile. Assicurati che la data di
                                pagamento sia corretta prima di confermare.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-bigster-border bg-bigster-card-bg">
                    <div className="flex items-center justify-end gap-3">
                        <Button
                            onClick={onClose}
                            variant="outline"
                            disabled={isLoading}
                            className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                        >
                            Annulla
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={!dataPagamento || isLoading}
                            className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Salvataggio…
                                </>
                            ) : (
                                <>
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Conferma Pagamento
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
