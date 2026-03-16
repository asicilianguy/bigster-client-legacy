"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { BigsterTestScores } from "@/types/bigster";
import { CustomTooltip } from "./CustomTooltip";
import { atteggiamentoMapping } from "./constants";
import { normalizeScore, getScoreColor } from "./helpers";

interface AtteggiamentoChartProps {
    scores: BigsterTestScores;
}

export function AtteggiamentoChart({ scores }: AtteggiamentoChartProps) {
    const data = scores.base
        ? Object.entries(atteggiamentoMapping).map(([code, name]) => ({
            name,
            code,
            value: normalizeScore(
                scores.base[code as keyof typeof scores.base] ?? null
            ),
            rawValue: scores.base[code as keyof typeof scores.base] ?? null,
        }))
        : [];

    if (data.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-bigster-surface border border-bigster-border"
        >
            <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-purple-600" />
                    <h2 className="text-lg font-bold text-bigster-text">
                        Atteggiamento
                    </h2>
                </div>
                <p className="text-xs text-bigster-text-muted mt-1">
                    Profilo comportamentale e relazionale
                </p>
            </div>
            <div className="p-6">
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart
                            data={data}
                            margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
                        >
                            <PolarGrid stroke="#d8d8d8" />
                            <PolarAngleAxis
                                dataKey="name"
                                tick={{ fill: "#6c4e06", fontSize: 11 }}
                            />
                            <PolarRadiusAxis
                                angle={90}
                                domain={[0, 100]}
                                tick={{ fill: "#666666", fontSize: 10 }}
                            />
                            <Radar
                                name="Atteggiamento"
                                dataKey="value"
                                stroke="#8b5cf6"
                                fill="#8b5cf6"
                                fillOpacity={0.3}
                                strokeWidth={2}
                            />
                            <Tooltip content={<CustomTooltip />} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                    {data.map((item) => (
                        <div
                            key={item.code}
                            className="flex items-center justify-between text-xs p-2 bg-bigster-card-bg border border-bigster-border"
                        >
                            <span className="text-bigster-text-muted">{item.name}</span>
                            <span
                                className="font-bold"
                                style={{ color: getScoreColor(item.value) }}
                            >
                                {item.rawValue ?? "—"}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
