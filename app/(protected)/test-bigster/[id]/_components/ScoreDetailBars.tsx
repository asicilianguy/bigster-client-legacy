"use client";

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { BigsterTestScores } from "@/types/bigster";
import { atteggiamentoMapping, capacitaMapping } from "./constants";
import { normalizeScore, getScoreColor } from "./helpers";

interface ScoreDetailBarsProps {
    scores: BigsterTestScores;
    type: "atteggiamento" | "capacita";
}

export function ScoreDetailBars({ scores, type }: ScoreDetailBarsProps) {
    const isAtteggiamento = type === "atteggiamento";
    const mapping = isAtteggiamento ? atteggiamentoMapping : capacitaMapping;
    const sourceData = isAtteggiamento ? scores.base : scores.composite;

    const data = sourceData
        ? Object.entries(mapping).map(([code, name]) => ({
            name,
            code,
            value: normalizeScore(
                sourceData[code as keyof typeof sourceData] ?? null
            ),
            rawValue: sourceData[code as keyof typeof sourceData] ?? null,
        }))
        : [];

    if (data.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: isAtteggiamento ? 0.35 : 0.4 }}
            className="bg-bigster-surface border border-bigster-border"
        >
            <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-bigster-text" />
                    <h2 className="text-lg font-bold text-bigster-text">
                        Dettaglio {isAtteggiamento ? "Atteggiamento" : "Capacità"}
                    </h2>
                </div>
            </div>
            <div className="p-6">
                <div className="space-y-3">
                    {data.map((item) => (
                        <div key={item.code} className="flex items-center gap-4">
                            <div className="w-28 flex-shrink-0">
                                <p className="text-xs font-semibold text-bigster-text truncate">
                                    {item.name}
                                </p>
                            </div>
                            <div className="flex-1 h-3 bg-bigster-card-bg border border-bigster-border overflow-hidden">
                                <div
                                    className="h-full transition-all duration-500"
                                    style={{
                                        width: `${item.value}%`,
                                        backgroundColor: getScoreColor(item.value),
                                    }}
                                />
                            </div>
                            <div className="w-16 text-right">
                                <span
                                    className="text-sm font-bold"
                                    style={{ color: getScoreColor(item.value) }}
                                >
                                    {item.rawValue ?? "—"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
