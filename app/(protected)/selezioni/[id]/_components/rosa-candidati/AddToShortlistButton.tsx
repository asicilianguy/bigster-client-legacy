"use client";

import { useState } from "react";
import { Star, StarOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    useAddToShortlistMutation,
    useRemoveFromShortlistMutation,
    useGetShortlistQuery,
} from "@/lib/redux/features/selections/selectionsApiSlice";
import { ApplicationListItem, isInShortlist, getShortlistOrder } from "@/types/application";
import { toast } from "sonner";
import { AddToShortlistDialog } from "./AddToShortlistDialog";

interface AddToShortlistButtonProps {
    application: ApplicationListItem;
    selectionId: number;
    variant?: "default" | "compact" | "icon";
}

export function AddToShortlistButton({
    application,
    selectionId,
    variant = "default",
}: AddToShortlistButtonProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data: shortlistData } = useGetShortlistQuery(selectionId);
    const [removeFromShortlist, { isLoading: isRemoving }] = useRemoveFromShortlistMutation();

    const inShortlist = isInShortlist(application, selectionId);
    const shortlistOrder = getShortlistOrder(application, selectionId);
    const shortlistCount = shortlistData?.count || 0;
    const isFull = shortlistCount >= 10;

    const fullName = `${application.nome} ${application.cognome}`;

    const handleRemove = async () => {
        const confirmRemove = window.confirm(`Rimuovere ${fullName} dalla rosa candidati?`);
        if (!confirmRemove) return;

        try {
            await removeFromShortlist({ selectionId, applicationId: application.id }).unwrap();
            toast.success("Rimosso dalla rosa", { description: `${fullName} è stato rimosso dalla rosa candidati` });
        } catch (error: any) {
            toast.error("Errore", { description: error?.data?.error || "Impossibile rimuovere dalla rosa" });
        }
    };

    const handleClick = () => {
        if (inShortlist) {
            handleRemove();
        } else {
            setIsDialogOpen(true);
        }
    };

    if (variant === "icon") {
        return (
            <>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClick}
                    disabled={isRemoving || (!inShortlist && isFull)}
                    className={`rounded-none px-2 ${inShortlist
                            ? "border-bigster-star bg-yellow-50 text-bigster-star hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                            : "border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                        }`}
                    title={inShortlist ? `Rimuovi dalla rosa (${shortlistOrder}°)` : isFull ? "Rosa piena (max 10)" : "Aggiungi alla rosa"}
                >
                    {isRemoving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : inShortlist ? (
                        <Star className="h-4 w-4 fill-bigster-star" />
                    ) : (
                        <Star className="h-4 w-4" />
                    )}
                </Button>

                <AddToShortlistDialog
                    application={application}
                    selectionId={selectionId}
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    currentCount={shortlistCount}
                />
            </>
        );
    }

    if (variant === "compact") {
        return (
            <>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClick}
                    disabled={isRemoving || (!inShortlist && isFull)}
                    className={`rounded-none h-8 text-xs ${inShortlist
                            ? "border-bigster-star bg-yellow-50 text-bigster-star hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                            : "border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                        }`}
                >
                    {isRemoving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                    ) : inShortlist ? (
                        <>
                            <Star className="h-3.5 w-3.5 fill-bigster-star mr-1" />
                            #{shortlistOrder}
                        </>
                    ) : (
                        <>
                            <Star className="h-3.5 w-3.5 mr-1" />
                            Rosa
                        </>
                    )}
                </Button>

                <AddToShortlistDialog
                    application={application}
                    selectionId={selectionId}
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    currentCount={shortlistCount}
                />
            </>
        );
    }

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={handleClick}
                disabled={isRemoving || (!inShortlist && isFull)}
                className={`rounded-none ${inShortlist
                        ? "border-bigster-star bg-yellow-50 text-bigster-star hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                        : "border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                    }`}
            >
                {isRemoving ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Rimuovendo...
                    </>
                ) : inShortlist ? (
                    <>
                        <Star className="h-4 w-4 fill-bigster-star mr-2" />
                        In Rosa ({shortlistOrder}°)
                    </>
                ) : isFull ? (
                    <>
                        <StarOff className="h-4 w-4 mr-2" />
                        Rosa Piena
                    </>
                ) : (
                    <>
                        <Star className="h-4 w-4 mr-2" />
                        Aggiungi alla Rosa
                    </>
                )}
            </Button>

            <AddToShortlistDialog
                application={application}
                selectionId={selectionId}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                currentCount={shortlistCount}
            />
        </>
    );
}

export default AddToShortlistButton;
