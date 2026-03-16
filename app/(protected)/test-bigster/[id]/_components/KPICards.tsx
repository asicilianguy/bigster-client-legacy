"use client";

import { motion } from "framer-motion";
import { Timer, Heart, Zap, ShieldAlert } from "lucide-react";
import { BigsterTestDetail } from "@/types/bigster";
import { calculateCompletionTime, normalizeScore } from "./helpers";
import { atteggiamentoMapping, capacitaMapping } from "./constants";

interface KPICardsProps {
    test: BigsterTestDetail;
}

export function KPICards({ test }: KPICardsProps) {
    if (!test.completed || !test.scores) return null;

    const completionTime = calculateCompletionTime(test.startedAt, test.completedAt);

    const atteggiamentoData = test.scores.base
        ? Object.keys(atteggiamentoMapping).map((code) => ({
            value: normalizeScore(
                test.scores!.base[code as keyof typeof test.scores.base] ?? null
            ),
        }))
        : [];

    const capacitaData = test.scores.composite
        ? Object.keys(capacitaMapping).map((code) => ({
            value: normalizeScore(
                test.scores!.composite[code as keyof typeof test.scores.composite] ?? null
            ),
        }))
        : [];

    const avgAtteggiamento =
        atteggiamentoData.length > 0
            ? Math.round(
                atteggiamentoData.reduce((acc, d) => acc + d.value, 0) /
                atteggiamentoData.length
            )
            : 0;

    const avgCapacita =
        capacitaData.length > 0
            ? Math.round(
                capacitaData.reduce((acc, d) => acc + d.value, 0) / capacitaData.length
            )
            : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >

            <div className="bg-bigster-surface border border-bigster-border p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 flex items-center justify-center">
                        <Timer className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                            Tempo
                        </p>
                        <p className="text-lg font-bold text-bigster-text">
                            {completionTime}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-bigster-surface border border-bigster-border p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 flex items-center justify-center">
                        <Heart className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                            Atteggiamento
                        </p>
                        <p className="text-lg font-bold text-bigster-text">
                            {avgAtteggiamento}%
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-bigster-surface border border-bigster-border p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                            Capacità
                        </p>
                        <p className="text-2xl font-bold text-bigster-text">
                            {avgCapacita}%
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-bigster-surface border border-bigster-border p-4">
                <div className="flex items-center gap-3">
                    <div
                        className={`w-10 h-10 flex items-center justify-center ${test.unreliable ? "bg-red-100" : "bg-green-100"
                            }`}
                    >
                        <ShieldAlert
                            className={`h-5 w-5 ${test.unreliable ? "text-red-600" : "text-green-600"
                                }`}
                        />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                            Affidabilità
                        </p>
                        <p
                            className={`text-2xl font-bold ${test.unreliable ? "text-red-600" : "text-green-600"
                                }`}
                        >
                            {test.unreliable ? "Bassa" : "Alta"}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
