"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGetApplicationByIdQuery } from "@/lib/redux/features/applications/applicationsApiSlice";
import { ApplicationHeader } from "./_components/ApplicationHeader";
import { ApplicationInfo } from "./_components/ApplicationInfo";
import { CvViewer } from "./_components/CvViewer";
import { TestSection } from "./_components/TestSection";
import { InterviewSection } from "./_components/InterviewSection";
import { StatusTimeline } from "./_components/StatusTimeline";
import { QuickActions } from "./_components/QuickActions";
import { NotesSection } from "./_components/NotesSection";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";
import BigsterLoader from "@/components/shared/BigsterLoader";
import { ApplicationReadStatusBadge, ApplicationUnreadBanner } from "./_components/ApplicationUnreadBanner";

export default function ApplicationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const applicationId = Number(params.id);

    const {
        data: application,
        isLoading,
        isError,
        refetch,
    } = useGetApplicationByIdQuery(applicationId, {
        skip: isNaN(applicationId),
    });

    if (isLoading) {
        return <BigsterLoader text="Caricamento candidatura" />;
    }

    if (isError || !application) {
        return (
            <div className="min-h-screen bg-bigster-background flex items-center justify-center p-4">
                <div className="bg-bigster-surface border border-bigster-border p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-bigster-text mb-2">
                        Candidatura non trovata
                    </h2>
                    <p className="text-bigster-text-muted mb-6">
                        La candidatura richiesta non esiste o non hai i permessi per
                        visualizzarla.
                    </p>
                    <div className="flex items-center gap-3 justify-center">
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            className="rounded-none border border-bigster-border"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Indietro
                        </Button>
                        <Button
                            onClick={() => refetch()}
                            className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Riprova
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bigster-background">
            <ApplicationUnreadBanner application={application} />

            <div className="mx-auto space-y-6 p-6">

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-6"
                >
                    <Button
                        variant="outline"
                        onClick={() => router.push("/candidature")}
                        className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Torna alle candidature
                    </Button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <ApplicationHeader application={application} onRefetch={refetch} />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

                    <div className="lg:col-span-2 space-y-6">

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <ApplicationInfo application={application} />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <CvViewer
                                applicationId={application.id}
                                cvS3Key={application.cv_s3_key}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <NotesSection
                                applicationId={application.id}
                                notes={application.note}
                                onRefetch={refetch}
                            />
                        </motion.div>
                    </div>

                    <div className="space-y-6">

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                        >
                            <ApplicationReadStatusBadge application={application} />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <QuickActions
                                application={{
                                    id: application.id,
                                    nome: application.nome,
                                    cognome: application.cognome,
                                    email: application.email,
                                    telefono: application.telefono,
                                    stato: application.stato,
                                    annuncio: application.annuncio
                                        ? {
                                            selezione: application.annuncio.selezione
                                                ? {
                                                    id: application.annuncio.selezione.id,
                                                    figura_ricercata:
                                                        application.annuncio.selezione
                                                            .figura_ricercata ?? undefined,
                                                }
                                                : undefined,
                                        }
                                        : undefined,
                                }}
                                onRefetch={refetch}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <StatusTimeline application={application} />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <TestSection
                                applicationId={application.id}
                                applicationStatus={application.stato}
                                candidateName={`${application.nome} ${application.cognome}`}
                                candidateEmail={application.email}
                                onRefetch={refetch}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <InterviewSection
                                applicationId={application.id}
                                interviews={application.colloqui || []}
                                applicationStatus={application.stato}
                                onRefetch={refetch}
                            />
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
