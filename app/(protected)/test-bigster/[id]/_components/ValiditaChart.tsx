"use client";

import { motion } from "framer-motion";
import { Shield, AlertTriangle } from "lucide-react";
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
    Cell,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { BigsterTestScores } from "@/types/bigster";
import { getRawScoreColor } from "./helpers";

interface ValiditaChartProps {
    scores: BigsterTestScores;
}

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
            fill={getRawScoreColor(value)}
            fontSize={12}
            fontWeight={700}
        >
            {value > 0 ? `+${value}` : value}
        </text>
    );
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
            className="bg-bigster-surface border border-bigster-border"
        >
            <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-600" />
                    <h2 className="text-lg font-bold text-bigster-text">
                        Scale di Validità
                    </h2>
                </div>
                <p className="text-xs text-bigster-text-muted mt-1">
                    Indicatori di affidabilità del test — valori alti indicano possibile
                    inaffidabilità
                </p>
            </div>

            <div className="p-6 space-y-8">

                {/* ── Radar validità (full width) ── */}
                <div>
                    <p className="text-xs font-semibold text-bigster-text-muted uppercase tracking-wide mb-3">
                        Profilo Radar
                    </p>
                    <div className="h-[360px]">
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
                                    domain={[-100, 100]}
                                    tick={{ fill: "#666666", fontSize: 10 }}
                                />
                                <Radar
                                    name="Validità"
                                    dataKey="value"
                                    stroke="#f97316"
                                    fill="#f97316"
                                    fillOpacity={0.25}
                                    strokeWidth={2}
                                />
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const val = payload[0].value as number;
                                            return (
                                                <div className="bg-bigster-surface border border-bigster-border p-3 shadow-lg">
                                                    <p className="text-sm font-semibold text-bigster-text">{label}</p>
                                                    <p
                                                        className="text-lg font-bold"
                                                        style={{ color: getRawScoreColor(val) }}
                                                    >
                                                        {val > 0 ? `+${val}` : val}
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
                    <div className="h-[380px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                margin={{ top: 32, right: 24, bottom: 16, left: 24 }}
                                barCategoryGap="35%"
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#e5e5e5"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: "#6c4e06", fontSize: 13, fontWeight: 600 }}
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
                                            const val = payload[0].value as number;
                                            return (
                                                <div className="bg-bigster-surface border border-bigster-border p-3 shadow-lg">
                                                    <p className="text-sm font-semibold text-bigster-text">{label}</p>
                                                    <p
                                                        className="text-lg font-bold"
                                                        style={{ color: getRawScoreColor(val) }}
                                                    >
                                                        {val > 0 ? `+${val}` : val}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <ReferenceLine y={0} stroke="#6c4e06" strokeWidth={2} />
                                {/* Soglia attenzione */}
                                <ReferenceLine
                                    y={40}
                                    stroke="#fbbf24"
                                    strokeDasharray="5 5"
                                    strokeWidth={1.5}
                                    label={{
                                        value: "Attenzione (40)",
                                        fill: "#b45309",
                                        fontSize: 10,
                                        position: "insideTopRight",
                                    }}
                                />
                                {/* Soglia critica */}
                                <ReferenceLine
                                    y={80}
                                    stroke="#ef4444"
                                    strokeDasharray="5 5"
                                    strokeWidth={1.5}
                                    label={{
                                        value: "Critico (80)",
                                        fill: "#ef4444",
                                        fontSize: 10,
                                        position: "insideTopRight",
                                    }}
                                />
                                <Bar
                                    dataKey="value"
                                    radius={[3, 3, 0, 0]}
                                    label={<CustomBarLabel />}
                                    maxBarSize={72}
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={getRawScoreColor(entry.value)}
                                            fillOpacity={0.85}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {hasHighValues && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-semibold text-yellow-800">
                                    Attenzione — Verificare in colloquio
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