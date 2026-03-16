"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, CheckCircle2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplicationDetail } from "@/types/application";
import { useMarkApplicationAsReadMutation } from "@/lib/redux/features/applications/applicationsApiSlice";
import { toast } from "sonner";

interface ApplicationUnreadBannerProps {
    application: ApplicationDetail;
}

export function ApplicationUnreadBanner({ application }: ApplicationUnreadBannerProps) {
    const [isDismissed, setIsDismissed] = useState(false);
    const [markAsRead, { isLoading }] = useMarkApplicationAsReadMutation();

    if (application.read || isDismissed) {
        return null;
    }

    const handleMarkAsRead = async () => {
        try {
            await markAsRead(application.id).unwrap();
            toast.success("Candidatura segnata come letta", {
                description: "Non apparirà più come 'da leggere'",
            });
        } catch (error: any) {
            toast.error("Errore", {
                description: error?.data?.error || "Impossibile segnare come letta",
            });
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="sticky top-0 z-50"
            >
                <div className="bg-blue-50 border-b-2 border-blue-300 shadow-md">
                    <div className="mx-auto px-6 py-3">
                        <div className="flex items-center justify-between gap-4">

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0">
                                    <EyeOff className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-blue-800">
                                        Candidatura non ancora visionata
                                    </p>
                                    <p className="text-xs text-blue-600">
                                        {application.nome} {application.cognome} è in attesa di essere segnata come letta
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={handleMarkAsRead}
                                    disabled={isLoading}
                                    className="rounded-none bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 text-sm px-4 py-2"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Eye className="h-4 w-4 mr-2" />
                                    )}
                                    {isLoading ? "Salvataggio..." : "Segna come visionata"}
                                </Button>

                                <button
                                    onClick={() => setIsDismissed(true)}
                                    className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-100 transition-colors"
                                    title="Nascondi banner"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

interface ApplicationReadStatusBadgeProps {
    application: ApplicationDetail;
    variant?: "full" | "compact";
}

export function ApplicationReadStatusBadge({
    application,
    variant = "full",
}: ApplicationReadStatusBadgeProps) {
    const [markAsRead, { isLoading }] = useMarkApplicationAsReadMutation();

    const handleMarkAsRead = async () => {
        try {
            await markAsRead(application.id).unwrap();
            toast.success("Candidatura segnata come letta");
        } catch (error: any) {
            toast.error("Errore", {
                description: error?.data?.error || "Impossibile segnare come letta",
            });
        }
    };

    if (application.read) {
        return (
            <div className="p-3 bg-green-50 border border-green-200">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                        Candidatura visionata
                    </span>
                </div>
            </div>
        );
    }

    if (variant === "compact") {
        return (
            <Button
                onClick={handleMarkAsRead}
                disabled={isLoading}
                variant="outline"
                className="w-full rounded-none border-2 border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                    <Eye className="h-4 w-4 mr-2" />
                )}
                {isLoading ? "Salvataggio..." : "Segna come visionata"}
            </Button>
        );
    }

    return (
        <div className="p-4 bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <EyeOff className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">
                        Non visionata
                    </span>
                </div>
                <Button
                    onClick={handleMarkAsRead}
                    disabled={isLoading}
                    size="sm"
                    className="rounded-none bg-blue-600 hover:bg-blue-700 text-white text-xs"
                >
                    {isLoading ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                        <Eye className="h-3 w-3 mr-1" />
                    )}
                    Segna letta
                </Button>
            </div>
        </div>
    );
}
