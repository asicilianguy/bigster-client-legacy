"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { BigsterTestScores } from "@/types/bigster";
import { atteggiamentoMapping } from "./constants";
import { normalizeScore } from "./helpers";

interface AtteggiamentoChartProps {
    scores: BigsterTestScores;
}

// Colore neutro fisso — nessuna codifica semantica buono/cattivo
const ATTEGGIAMENTO_COLOR = "#8b5cf6"; // viola, coerente con il radar

function CustomBarLabel(props: any) {
    const { x, y, width, height, value } = props;
    if (value === null || value === undefined) return null;
    const isPositive = value >= 0;
    const barTop = Math.min(y, y + height);
    const barBottom = Math.max(y, y + height);
    const labelY = isPositive ? barTop - 7 : barBottom + 15;
    return (
        <text
            x={x + width / 2}
            y={labelY}
            textAnchor="middle"
            fill={ATTEGGIAMENTO_COLOR}
            fontSize={12}
            fontWeight={700}
        >
            {value > 0 ? `+${value}` : value}
        </text>
    );
}

export function AtteggiamentoChart({ scores }: AtteggiamentoChartProps) {
    const data = scores.base
        ? Object.entries(atteggiamentoMapping).map(([code, name]) => ({
            name,
            code,
            value: normalizeScore(
                scores.base[code as keyof typeof scores.base] ?? null
            ),
            rawValue: scores.base[code as keyof typeof scores.base] ?? 0,
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

            <div className="p-6 space-y-8">

                {/* ── Radar (full width) ── */}
                <div>
                    <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-3">
                        Profilo Radar
                    </p>
                    <div className="h-[380px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart
                                data={data}
                                margin={{ top: 20, right: 40, bottom: 20, left: 40 }}
                            >
                                <PolarGrid stroke="#d8d8d8" />
                                <PolarAngleAxis
                                    dataKey="name"
                                    tick={{ fill: "#6c4e06", fontSize: 12 }}
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
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const item = data.find((d) => d.name === label);
                                            return (
                                                <div className="bg-bigster-surface border border-bigster-border p-3 shadow-lg">
                                                    <p className="text-sm font-semibold text-bigster-text">{label}</p>
                                                    <p className="text-base font-bold" style={{ color: "#8b5cf6" }}>
                                                        Valore grezzo: {item?.rawValue ?? "—"}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ── Istogramma verticale (full width) ── */}
                <div>
                    <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-3">
                        Valori Grezzi &nbsp;(−100 / +100)
                    </p>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                margin={{ top: 32, right: 24, bottom: 16, left: 24 }}
                                barCategoryGap="30%"
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#e5e5e5"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: "#6c4e06", fontSize: 12, fontWeight: 600 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    domain={[-100, 100]}
                                    tick={{ fill: "#666666", fontSize: 11 }}
                                    tickCount={9}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const raw = payload[0].value as number;
                                            return (
                                                <div className="bg-bigster-surface border border-bigster-border p-3 shadow-lg">
                                                    <p className="text-sm font-semibold text-bigster-text">{label}</p>
                                                    <p
                                                        className="text-lg font-bold"
                                                        style={{ color: ATTEGGIAMENTO_COLOR }}
                                                    >
                                                        {raw > 0 ? `+${raw}` : raw}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <ReferenceLine y={0} stroke="#6c4e06" strokeWidth={2} />
                                <Bar
                                    dataKey="rawValue"
                                    radius={[3, 3, 0, 0]}
                                    label={<CustomBarLabel />}
                                    maxBarSize={56}
                                    fill={ATTEGGIAMENTO_COLOR}
                                    fillOpacity={0.8}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </motion.div>
    );
}