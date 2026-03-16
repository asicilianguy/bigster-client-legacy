"use client";

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        value: number;
        fill?: string;
        stroke?: string;
    }>;
    label?: string;
}

export function CustomTooltip({ active, payload, label }: TooltipProps) {
    if (active && payload && payload.length) {
        const value = payload[0].value;
        return (
            <div className="bg-bigster-surface border border-bigster-border p-3 shadow-lg">
                <p className="text-sm font-semibold text-bigster-text">{label}</p>
                <p
                    className="text-lg font-bold"
                    style={{ color: payload[0].fill || payload[0].stroke }}
                >
                    {value}
                </p>
            </div>
        );
    }
    return null;
}
