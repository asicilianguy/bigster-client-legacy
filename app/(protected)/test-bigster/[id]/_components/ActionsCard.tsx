"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    Download,
    FileText,
    Loader2,
    Eye,
    AlertCircle,
    Users,
    Star,
    StarOff,
    Trash2,
    User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { BigsterTestDetail } from "@/types/bigster";
import { toast } from "sonner";
import { useBigsterReportDownload } from "@/lib/redux/features/bigster/useBigsterReportDownload";
import {
    useGetShortlistQuery,
    useAddToShortlistMutation,
    useRemoveFromShortlistMutation,
} from "@/lib/redux/features/selections/selectionsApiSlice";
import { ReadStatusBadge } from "./UnreadBanner";
import { useUserRole } from "@/hooks/use-user-role";

interface ActionsCardProps {
    test: BigsterTestDetail;
}

export function ActionsCard({ test }: ActionsCardProps) {
    const router = useRouter();
    const { isConsulente } = useUserRole();

    const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

    const { downloadPdf, previewPdf, isDownloading, isPreviewing } =
        useBigsterReportDownload();

    const selectionId = test.selection?.id;

    const { data: shortlistData, isLoading: isLoadingRosa } = useGetShortlistQuery(
        selectionId!,
        { skip: !selectionId }
    );

    const [addToShortlist, { isLoading: isAddingToRosa }] = useAddToShortlistMutation();
    const [removeFromShortlist, { isLoading: isRemovingFromRosa }] = useRemoveFromShortlistMutation();

    const isInRosa = useMemo(() => {
        if (!shortlistData?.data) return false;
        return shortlistData.data.some((entry) => entry.application_id === test.applicationId);
    }, [shortlistData, test.applicationId]);

    const handleDownloadPdf = async () => {
        if (!test.completed) {
            toast.error("Il test non è ancora completato");
            return;
        }

        try {
            await downloadPdf(test.id, `${test.firstName}-${test.lastName}`);
            toast.success("Report PDF scaricato con successo!");
        } catch (error) {
            console.error("❌ Errore download PDF:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Errore nel download del report"
            );
        }
    };

    const handlePreviewPdf = async () => {
        if (!test.completed) {
            toast.error("Il test non è ancora completato");
            return;
        }

        try {
            await previewPdf(test.id);
            toast.success("Report aperto in nuova scheda");
        } catch (error) {
            console.error("Errore preview PDF:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Errore nella preview del report"
            );
        }
    };

    const handleAddToRosa = async () => {
        if (!selectionId) {
            toast.error("Selezione non trovata");
            return;
        }

        try {
            await addToShortlist({
                selectionId,
                body: { application_id: test.applicationId },
            }).unwrap();

            toast.success("Aggiunto alla rosa!", {
                description: `${test.firstName} ${test.lastName} è stato aggiunto alla rosa dei candidati`,
            });
        } catch (error: any) {
            toast.error("Errore", {
                description: error?.data?.error || "Impossibile aggiungere alla rosa",
            });
        }
    };

    const handleRemoveFromRosa = async () => {
        if (!selectionId) return;

        try {
            await removeFromShortlist({
                selectionId,
                applicationId: test.applicationId,
            }).unwrap();

            toast.success("Rimosso dalla rosa", {
                description: `${test.firstName} ${test.lastName} è stato rimosso dalla rosa`,
            });
            setIsRemoveDialogOpen(false);
        } catch (error: any) {
            toast.error("Errore", {
                description: error?.data?.error || "Impossibile rimuovere dalla rosa",
            });
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="bg-bigster-surface border border-bigster-border"
            >
                <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                    <h2 className="text-lg font-bold text-bigster-text">Azioni</h2>
                </div>
                <div className="p-6 space-y-3">

                    <ReadStatusBadge test={test} variant="full" />

                    {selectionId && (
                        <>
                            {isLoadingRosa ? (
                                <div className="p-3 bg-bigster-card-bg border border-bigster-border">
                                    <div className="flex items-center gap-2">
                                        <Spinner className="h-4 w-4" />
                                        <span className="text-sm text-bigster-text-muted">
                                            Verifica rosa...
                                        </span>
                                    </div>
                                </div>
                            ) : isInRosa ? (
                                <div className="p-4 bg-amber-50 border border-amber-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Star className="h-4 w-4 text-amber-600 fill-amber-600" />
                                            <span className="text-sm font-semibold text-amber-700">
                                                Nella Rosa
                                            </span>
                                        </div>
                                        {!isConsulente && (
                                            <Button
                                                onClick={() => setIsRemoveDialogOpen(true)}
                                                variant="outline"
                                                size="sm"
                                                className="rounded-none border border-red-300 text-red-600 hover:bg-red-50 text-xs"
                                            >
                                                <StarOff className="h-3 w-3 mr-1" />
                                                Rimuovi
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ) : !isConsulente ? (
                                <Button
                                    onClick={handleAddToRosa}
                                    disabled={isAddingToRosa}
                                    className="w-full rounded-none bg-amber-500 hover:bg-amber-600 text-white border border-amber-400"
                                >
                                    {isAddingToRosa ? (
                                        <Spinner className="h-4 w-4 mr-2" />
                                    ) : (
                                        <Star className="h-4 w-4 mr-2" />
                                    )}
                                    Aggiungi alla Rosa
                                </Button>
                            ) : null}
                        </>
                    )}

                    {test.completed && (
                        <>
                            <Button
                                onClick={handleDownloadPdf}
                                disabled={isDownloading}
                                className="w-full rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90 disabled:opacity-50"
                            >
                                {isDownloading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Download className="h-4 w-4 mr-2" />
                                )}
                                {isDownloading ? "Download in corso..." : "Scarica Report PDF"}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={handlePreviewPdf}
                                disabled={isPreviewing}
                                className="w-full rounded-none border border-bigster-border hover:bg-bigster-muted-bg disabled:opacity-50"
                            >
                                {isPreviewing ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Eye className="h-4 w-4 mr-2" />
                                )}
                                {isPreviewing ? "Caricamento..." : "Anteprima Report"}
                            </Button>
                        </>
                    )}

                    {!test.completed && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-yellow-700">
                                    Il report PDF sarà disponibile quando il test sarà completato.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="pt-2 border-t border-bigster-border space-y-2">
                        <Button
                            variant="outline"
                            className="w-full rounded-none border border-bigster-border hover:bg-bigster-muted-bg"
                            onClick={() => router.push(`/candidature/${test.applicationId}`)}
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Vai alla Candidatura
                        </Button>

                        {!isConsulente && (
                            <Button
                                variant="outline"
                                className="w-full rounded-none border border-bigster-border hover:bg-bigster-muted-bg"
                                onClick={() => router.push(`/selezioni/${test.selection.id}`)}
                            >
                                <Users className="h-4 w-4 mr-2" />
                                Vai alla Selezione
                            </Button>
                        )}
                    </div>
                </div>
            </motion.div>

            <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
                <DialogContent className="rounded-none bg-bigster-surface border border-bigster-border max-w-md shadow-lg">
                    <DialogHeader
                        title="Rimuovi dalla Rosa"
                        onClose={() => setIsRemoveDialogOpen(false)}
                    />

                    <div className="p-5 pt-0 space-y-4">

                        <div className="p-4 bg-red-50 border border-red-200">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-red-800 mb-1">
                                        Conferma rimozione
                                    </p>
                                    <p className="text-xs text-red-700">
                                        Stai per rimuovere questo candidato dalla rosa.
                                        Potrai aggiungerlo nuovamente in seguito.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-bigster-primary flex items-center justify-center">
                                    <User className="h-5 w-5 text-bigster-primary-text" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-bigster-text">
                                        {test.firstName} {test.lastName}
                                    </p>
                                    <p className="text-xs text-bigster-text-muted">{test.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-bigster-border">
                            <Button
                                variant="outline"
                                onClick={() => setIsRemoveDialogOpen(false)}
                                className="flex-1 rounded-none border border-bigster-border"
                            >
                                Annulla
                            </Button>
                            <Button
                                onClick={handleRemoveFromRosa}
                                disabled={isRemovingFromRosa}
                                className="flex-1 rounded-none bg-red-600 hover:bg-red-700 text-white border border-red-500"
                            >
                                {isRemovingFromRosa ? (
                                    <Spinner className="h-4 w-4 mr-2" />
                                ) : (
                                    <Trash2 className="h-4 w-4 mr-2" />
                                )}
                                Rimuovi dalla Rosa
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}