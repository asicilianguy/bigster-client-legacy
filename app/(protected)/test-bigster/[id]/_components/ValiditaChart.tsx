"use client";

import { motion } from "framer-motion";
import { Shield, AlertTriangle } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
    ReferenceLine,
    ResponsiveContainer,
} from "recharts";
import { BigsterTestScores } from "@/types/bigster";
import { CustomTooltip } from "./CustomTooltip";
import { getValidityColor } from "./helpers";

interface ValiditaChartProps {
    scores: BigsterTestScores;
}

export function ValiditaChart({ scores }: ValiditaChartProps) {
    const data = scores.validity
        ? [
            { name: "Difensivo", code: "K", value: scores.validity.K ?? 0 },
            { name: "Lie", code: "L", value: scores.validity.L ?? 0 },
            { name: "Egoic Lies", code: "EGL", value: scores.validity.EGL ?? 0 },
            { name: "Ethic Lies", code: "ETL", value: scores.validity.ETL ?? 0 },
            { name: "Inconsapevole", code: "M", value: scores.validity.M ?? 0 },
        ]
        : [];

    if (data.length === 0) return null;

    const hasHighValues = data.some((v) => v.value >= 40);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-bigster-surface border border-bigster-border lg:col-span-2"
        >
            <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-600" />
                    <h2 className="text-lg font-bold text-bigster-text">
                        Scale di Validità
                    </h2>
                </div>
                <p className="text-xs text-bigster-text-muted mt-1">
                    Indicatori di affidabilità del test - valori alti indicano possibile
                    inaffidabilità
                </p>
            </div>
            <div className="p-6">
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                            <XAxis
                                type="number"
                                domain={[0, 100]}
                                tick={{ fill: "#666666", fontSize: 11 }}
                            />
                            <YAxis
                                type="category"
                                dataKey="name"
                                tick={{ fill: "#6c4e06", fontSize: 12 }}
                                width={90}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <ReferenceLine
                                x={40}
                                stroke="#fbbf24"
                                strokeDasharray="5 5"
                                label={{
                                    value: "Attenzione",
                                    fill: "#fbbf24",
                                    fontSize: 10,
                                }}
                            />
                            <ReferenceLine
                                x={80}
                                stroke="#ef4444"
                                strokeDasharray="5 5"
                                label={{
                                    value: "Critico",
                                    fill: "#ef4444",
                                    fontSize: 10,
                                }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={getValidityColor(entry.value)}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {hasHighValues && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-semibold text-yellow-800">
                                    Attenzione - Verificare in colloquio
                                </p>
                                <p className="text-xs text-yellow-700 mt-1">
                                    {data
                                        .filter((v) => v.value >= 40)
                                        .map((v) => v.name)
                                        .join(", ")}{" "}
                                    presentano valori elevati. Si consiglia verifica durante il
                                    colloquio.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
