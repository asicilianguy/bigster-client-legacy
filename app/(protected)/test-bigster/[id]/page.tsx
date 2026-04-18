"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGetBigsterTestByIdQuery } from "@/lib/redux/features/bigster";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle, RefreshCw, ListChecks } from "lucide-react";

import {
    TestDetailHeader,
    CandidateDetails,
    KPICards,
    AtteggiamentoChart,
    CapacitaChart,
    ValiditaChart,
    ActionsCard,
    ProgressCard,
    ProfileCard,
    EvaluationBanner,
    UnreadBanner,
} from "./_components";
import BigsterLoader from "@/components/shared/BigsterLoader";

export default function TestDetailPage() {
    const params = useParams();
    const router = useRouter();
    const testId = Number(params.id);

    const {
        data: test,
        isLoading,
        isError,
        refetch,
    } = useGetBigsterTestByIdQuery(testId, {
        skip: isNaN(testId),
    });

    if (isLoading) {
        return <BigsterLoader text="Caricamento test" />;
    }

    if (isError || !test) {
        return (
            <div className="min-h-screen bg-bigster-background flex items-center justify-center p-4">
                <div className="bg-bigster-surface border border-bigster-border p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-bigster-text mb-2">
                        Test non trovato
                    </h2>
                    <p className="text-bigster-text-muted mb-6">
                        Il test richiesto non esiste o non hai i permessi per
                        visualizzarlo.
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

            <UnreadBanner test={test} />

            <div className="mx-auto p-6 space-y-6">

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between"
                >
                    <Button
                        variant="outline"
                        onClick={() => router.push("/test-bigster")}
                        className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Torna alla lista
                    </Button>

                    {test.completed && (
                        <Button
                            onClick={() => router.push(`/test-bigster/${testId}/risposte`)}
                            className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90 font-semibold"
                        >
                            <ListChecks className="h-4 w-4 mr-2" />
                            Vedi Risposte
                        </Button>
                    )}
                </motion.div>

                <TestDetailHeader test={test} />

                <CandidateDetails test={test} />

                <KPICards test={test} />

                {test.completed && test.scores && (
                    <div className="space-y-6">
                        <AtteggiamentoChart scores={test.scores} />
                        <CapacitaChart scores={test.scores} />
                        <ValiditaChart scores={test.scores} />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <ActionsCard test={test} />
                    <ProgressCard test={test} />
                    {test.profile && <ProfileCard profile={test.profile} />}
                </div>

                {test.evaluation && <EvaluationBanner evaluation={test.evaluation} />}
            </div>
        </div>
    );
}