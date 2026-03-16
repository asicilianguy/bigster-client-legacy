"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    HelpCircle,
    Timer,
    ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useGetBigsterTestAnswersQuery } from "@/lib/redux/features/bigster";
import BigsterLoader from "@/components/shared/BigsterLoader";

const BLOCK_SIZE = 25;
const TOTAL_QUESTIONS = 300;
const TOTAL_BLOCKS = Math.ceil(TOTAL_QUESTIONS / BLOCK_SIZE);

function getBlockRange(blockIndex: number): { start: number; end: number } {
    const start = blockIndex * BLOCK_SIZE + 1;
    const end = Math.min((blockIndex + 1) * BLOCK_SIZE, TOTAL_QUESTIONS);
    return { start, end };
}

function getBlockLabel(blockIndex: number): string {
    const { start, end } = getBlockRange(blockIndex);
    return `Blocco ${blockIndex + 1} (${start}-${end})`;
}

function formatDuration(startedAt: string | null, completedAt: string | null): string {
    if (!startedAt || !completedAt) return "—";
    const start = new Date(startedAt).getTime();
    const end = new Date(completedAt).getTime();
    const diffMs = end - start;
    if (diffMs <= 0) return "—";

    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
}

function formatAvgTime(startedAt: string | null, completedAt: string | null, totalQuestions: number): string {
    if (!startedAt || !completedAt || totalQuestions === 0) return "—";
    const start = new Date(startedAt).getTime();
    const end = new Date(completedAt).getTime();
    const diffMs = end - start;
    if (diffMs <= 0) return "—";

    const avgSeconds = Math.round(diffMs / 1000 / totalQuestions);
    if (avgSeconds < 60) {
        return `${avgSeconds}s`;
    }
    const mins = Math.floor(avgSeconds / 60);
    const secs = avgSeconds % 60;
    return `${mins}m ${secs}s`;
}

export default function RispostePage() {
    const params = useParams();
    const router = useRouter();
    const testId = Number(params.id);

    const [currentBlock, setCurrentBlock] = useState(0);

    const {
        data,
        isLoading,
        isError,
    } = useGetBigsterTestAnswersQuery(testId, {
        skip: isNaN(testId),
    });

    const blockQuestions = useMemo(() => {
        if (!data?.questions) return [];
        const { start, end } = getBlockRange(currentBlock);
        return data.questions.filter((q) => q.number >= start && q.number <= end);
    }, [data, currentBlock]);

    const blockAnswerCounts = useMemo(() => {
        if (!data?.questions) return [];
        return Array.from({ length: TOTAL_BLOCKS }, (_, i) => {
            const { start, end } = getBlockRange(i);
            const blockQs = data.questions.filter((q) => q.number >= start && q.number <= end);
            const answered = blockQs.filter((q) => q.selected_answer_id !== null).length;
            return { total: blockQs.length, answered };
        });
    }, [data]);

    if (isLoading) {
        return <BigsterLoader text="Caricamento risposte" />;
    }

    if (isError || !data) {
        return (
            <div className="min-h-screen bg-bigster-background flex items-center justify-center p-4">
                <div className="bg-bigster-surface border border-bigster-border p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-bigster-text mb-2">
                        Impossibile caricare le risposte
                    </h2>
                    <p className="text-bigster-text-muted mb-6">
                        Il test potrebbe non essere completato o non hai i permessi per visualizzarlo.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/test-bigster/${testId}`)}
                        className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Torna al test
                    </Button>
                </div>
            </div>
        );
    }

    const canGoPrev = currentBlock > 0;
    const canGoNext = currentBlock < TOTAL_BLOCKS - 1;

    const goToPrev = () => {
        if (canGoPrev) {
            setCurrentBlock((prev) => prev - 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const goToNext = () => {
        if (canGoNext) {
            setCurrentBlock((prev) => prev + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const { start: blockStart, end: blockEnd } = getBlockRange(currentBlock);

    return (
        <div className="min-h-screen bg-bigster-background">
            <div className="mx-auto p-6 space-y-6">

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                    <div>
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/test-bigster/${testId}`)}
                            className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg mb-3"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Torna al test
                        </Button>
                        <h1 className="text-3xl font-bold text-bigster-text tracking-tight">
                            Risposte Test
                        </h1>
                        <p className="text-sm text-bigster-text-muted mt-1">
                            {data.candidate_name}
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-bigster-surface border border-bigster-border shadow-bigster-card"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-bigster-border">

                        <div className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-bigster-card-bg border border-bigster-border flex items-center justify-center flex-shrink-0">
                                <Clock className="h-5 w-5 text-bigster-text-muted" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide">
                                    Tempo Totale
                                </p>
                                <p className="text-lg font-bold text-bigster-text">
                                    {formatDuration(data.started_at, data.completed_at)}
                                </p>
                            </div>
                        </div>

                        <div className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-bigster-card-bg border border-bigster-border flex items-center justify-center flex-shrink-0">
                                <ListChecks className="h-5 w-5 text-bigster-text-muted" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide">
                                    Risposte Date
                                </p>
                                <p className="text-lg font-bold text-bigster-text">
                                    {data.total_answered}
                                    <span className="text-sm font-normal text-bigster-text-muted">
                                        {" "}/ {data.total_questions}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-bigster-card-bg border border-bigster-border flex items-center justify-center flex-shrink-0">
                                <Timer className="h-5 w-5 text-bigster-text-muted" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide">
                                    Media per Domanda
                                </p>
                                <p className="text-lg font-bold text-bigster-text">
                                    {formatAvgTime(data.started_at, data.completed_at, data.total_questions)}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-6">

                    <motion.aside
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:w-64 flex-shrink-0"
                    >
                        <div className="bg-bigster-surface border border-bigster-border shadow-bigster-card lg:sticky lg:top-20">
                            <div className="px-4 py-3 border-b border-bigster-border bg-bigster-card-bg">
                                <h2 className="text-sm font-bold text-bigster-text">
                                    Navigazione Blocchi
                                </h2>
                                <p className="text-xs text-bigster-text-muted">
                                    {TOTAL_BLOCKS} blocchi · {TOTAL_QUESTIONS} domande
                                </p>
                            </div>
                            <div className="p-2 space-y-1 ">
                                {Array.from({ length: TOTAL_BLOCKS }, (_, i) => {
                                    const isActive = i === currentBlock;
                                    const counts = blockAnswerCounts[i];
                                    const allAnswered = counts && counts.answered === counts.total;

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setCurrentBlock(i);
                                                window.scrollTo({ top: 0, behavior: "smooth" });
                                            }}
                                            className={`w-full text-left px-3 py-2.5 text-sm transition-all flex items-center justify-between gap-2 ${isActive
                                                ? "bg-bigster-primary text-bigster-primary-text font-semibold border-2 border-yellow-200"
                                                : "bg-bigster-surface text-bigster-text border border-bigster-border hover:bg-bigster-muted-bg"
                                                }`}
                                        >
                                            <span>{getBlockLabel(i)}</span>
                                            {counts && (
                                                <span className="flex-shrink-0">
                                                    {allAnswered ? (
                                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <span
                                                            className={`text-xs ${isActive
                                                                ? "text-bigster-primary-text/70"
                                                                : "text-bigster-text-muted"
                                                                }`}
                                                        >
                                                            {counts.answered}/{counts.total}
                                                        </span>
                                                    )}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.aside>

                    <motion.main
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex-1 min-w-0"
                    >
                        <div className="bg-bigster-surface border border-bigster-border shadow-bigster-card">

                            <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-bigster-text">
                                        {getBlockLabel(currentBlock)}
                                    </h2>
                                    <p className="text-xs text-bigster-text-muted">
                                        Domande {blockStart}–{blockEnd}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!canGoPrev}
                                        onClick={goToPrev}
                                        className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg disabled:opacity-40"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-xs font-semibold text-bigster-text-muted">
                                        {currentBlock + 1} / {TOTAL_BLOCKS}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!canGoNext}
                                        onClick={goToNext}
                                        className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg disabled:opacity-40"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="divide-y divide-bigster-border">
                                {blockQuestions.map((question) => {
                                    const hasAnswer = question.selected_answer_id !== null;

                                    return (
                                        <div
                                            key={question.id}
                                            className="px-6 py-4"
                                        >

                                            <div className="flex items-start gap-3 mb-3">
                                                <span className="flex-shrink-0 w-8 h-8 bg-bigster-card-bg border border-bigster-border flex items-center justify-center text-xs font-bold text-bigster-text">
                                                    {question.number}
                                                </span>
                                                <p className="text-sm text-bigster-text leading-relaxed pt-1">
                                                    {question.description}
                                                </p>
                                            </div>

                                            <div className="ml-11 space-y-1.5">
                                                {question.answers.map((answer) => {
                                                    const isSelected = answer.id === question.selected_answer_id;

                                                    return (
                                                        <div
                                                            key={answer.id}
                                                            className={`px-3 py-2 text-sm transition-all ${isSelected
                                                                ? "bg-bigster-primary/15 border-2 border-bigster-primary text-bigster-text font-semibold"
                                                                : "bg-bigster-muted-bg border border-bigster-border text-bigster-text-muted"
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {isSelected && (
                                                                    <CheckCircle2 className="h-4 w-4 text-bigster-text flex-shrink-0" />
                                                                )}
                                                                <span>{answer.description}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                {!hasAnswer && (
                                                    <div className="flex items-center gap-2 px-3 py-2 text-sm text-bigster-text-muted italic">
                                                        <HelpCircle className="h-4 w-4 flex-shrink-0" />
                                                        <span>Nessuna risposta selezionata</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="px-6 py-4 border-t border-bigster-border bg-bigster-card-bg flex items-center justify-between">
                                <Button
                                    variant="outline"
                                    disabled={!canGoPrev}
                                    onClick={goToPrev}
                                    className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg disabled:opacity-40 font-semibold"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Blocco Precedente
                                </Button>

                                <span className="text-xs font-semibold text-bigster-text-muted hidden sm:block">
                                    Blocco {currentBlock + 1} di {TOTAL_BLOCKS}
                                </span>

                                <Button
                                    variant="outline"
                                    disabled={!canGoNext}
                                    onClick={goToNext}
                                    className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg disabled:opacity-40 font-semibold"
                                >
                                    Blocco Successivo
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </motion.main>
                </div>
            </div>
        </div>
    );
}
