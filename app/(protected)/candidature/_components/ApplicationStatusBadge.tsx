"use client";

import { Clock, UserCheck, UserX, LogOut } from "lucide-react";

interface ApplicationStatusBadgeProps {
    status: string;
    size?: "sm" | "md" | "lg";
}

const STATUS_CONFIG: Record<
    string,
    {
        label: string;
        icon: React.ElementType;
        bgColor: string;
        textColor: string;
        borderColor: string;
    }
> = {
    IN_CORSO: {
        label: "In Corso",
        icon: Clock,
        bgColor: "bg-blue-50",
        textColor: "text-blue-700",
        borderColor: "border-blue-300",
    },

    IN_PROVA: {
        label: "In Prova",
        icon: Clock,
        bgColor: "bg-orange-50",
        textColor: "text-orange-700",
        borderColor: "border-orange-300",
    },
    ASSUNTO: {
        label: "Assunto",
        icon: UserCheck,
        bgColor: "bg-green-50",
        textColor: "text-green-700",
        borderColor: "border-green-300",
    },
    SCARTATO: {
        label: "Scartato",
        icon: UserX,
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        borderColor: "border-red-300",
    },
    RITIRATO: {
        label: "Ritirato",
        icon: LogOut,
        bgColor: "bg-gray-100",
        textColor: "text-gray-600",
        borderColor: "border-gray-300",
    },
};

export function ApplicationStatusBadge({
    status,
    size = "md",
}: ApplicationStatusBadgeProps) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.IN_CORSO;
    const Icon = config.icon;

    const sizeClasses = {
        sm: "text-xs px-2 py-0.5",
        md: "text-xs px-3 py-1",
        lg: "text-sm px-4 py-1.5",
    };

    const iconSizes = {
        sm: "h-3 w-3",
        md: "h-3.5 w-3.5",
        lg: "h-4 w-4",
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 font-semibold border ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses[size]}`}
        >
            <Icon className={iconSizes[size]} />
            {config.label}
        </span>
    );
}
