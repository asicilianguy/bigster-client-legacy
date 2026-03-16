"use client";

import { ApplicationStatus } from "@/types/application";
import { CheckCircle2, XCircle, Clock, UserX } from "lucide-react";

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
  size?: "sm" | "md";
}

const statusConfig: Record<
  ApplicationStatus,
  {
    label: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    icon: React.ElementType;
  }
> = {
  [ApplicationStatus.IN_CORSO]: {
    label: "In Corso",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    icon: Clock,
  },

  [ApplicationStatus.IN_PROVA]: {
    label: "In Prova",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
    icon: Clock,
  },
  [ApplicationStatus.ASSUNTO]: {
    label: "Assunto",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    icon: CheckCircle2,
  },
  [ApplicationStatus.SCARTATO]: {
    label: "Scartato",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    icon: XCircle,
  },
  [ApplicationStatus.RITIRATO]: {
    label: "Ritirato",
    bgColor: "bg-gray-50",
    textColor: "text-gray-700",
    borderColor: "border-gray-200",
    icon: UserX,
  },
};

export function ApplicationStatusBadge({
  status,
  size = "md",
}: ApplicationStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-semibold border rounded-none
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeClasses[size]}
      `}
    >
      <Icon className={iconSize} />
      {config.label}
    </span>
  );
}
