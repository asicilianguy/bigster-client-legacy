"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  FileText,
  CheckCircle2,
  Play,
  Megaphone,
  Users2,
  MessageSquare,
  Crown,
  Trophy,
  X,
  Clock,
} from "lucide-react";

const StatusBadge = ({
  status,
  className,
  showIcon = true,
  size = "default",
}: {
  status: string;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "default" | "lg";
}) => {
  const statusConfig = {
    CREATA: {
      label: "Creata",
      icon: FileText,
      bgColor: "rgba(254, 241, 154, 0.3)",
      textColor: "#6c4e06",
      borderColor: "rgba(108, 78, 6, 0.2)",
      hoverBg: "rgba(254, 241, 154, 0.5)",
      hoverBorder: "rgba(108, 78, 6, 0.3)",
      iconColor: "rgba(108, 78, 6, 0.7)",
      animation: "",
    },
    APPROVATA: {
      label: "Approvata",
      icon: CheckCircle2,
      bgColor: "rgba(228, 215, 43, 0.4)",
      textColor: "#6c4e06",
      borderColor: "rgba(228, 215, 43, 0.3)",
      hoverBg: "rgba(228, 215, 43, 0.6)",
      hoverBorder: "rgba(228, 215, 43, 0.5)",
      iconColor: "#6c4e06",
      animation: "",
    },
    IN_CORSO: {
      label: "In Corso",
      icon: Play,
      bgColor: "rgba(254, 241, 154, 0.5)",
      textColor: "#6c4e06",
      borderColor: "rgba(108, 78, 6, 0.3)",
      hoverBg: "rgba(254, 241, 154, 0.7)",
      hoverBorder: "rgba(108, 78, 6, 0.5)",
      iconColor: "#6c4e06",
      animation: "animate-pulse",
    },
    ANNUNCI_PUBBLICATI: {
      label: "Annunci Pubblicati",
      icon: Megaphone,
      bgColor: "rgba(228, 215, 43, 0.5)",
      textColor: "#6c4e06",
      borderColor: "rgba(228, 215, 43, 0.4)",
      hoverBg: "rgba(228, 215, 43, 0.7)",
      hoverBorder: "rgba(228, 215, 43, 0.6)",
      iconColor: "#6c4e06",
      animation: "animate-pulse",
    },
    CANDIDATURE_RICEVUTE: {
      label: "Candidature",
      icon: Users2,
      bgColor: "rgba(254, 241, 154, 0.6)",
      textColor: "#6c4e06",
      borderColor: "rgba(108, 78, 6, 0.4)",
      hoverBg: "rgba(254, 241, 154, 0.8)",
      hoverBorder: "rgba(108, 78, 6, 0.6)",
      iconColor: "#6c4e06",
      animation: "",
    },
    COLLOQUI_IN_CORSO: {
      label: "Colloqui",
      icon: MessageSquare,
      bgColor: "rgba(228, 215, 43, 0.6)",
      textColor: "#6c4e06",
      borderColor: "rgba(228, 215, 43, 0.5)",
      hoverBg: "rgba(228, 215, 43, 0.8)",
      hoverBorder: "rgba(228, 215, 43, 0.7)",
      iconColor: "#6c4e06",
      animation: "animate-pulse",
    },
    COLLOQUI_CEO: {
      label: "Colloqui CEO",
      icon: Crown,
      bgColor: "rgba(228, 215, 43, 0.7)",
      textColor: "#6c4e06",
      borderColor: "rgba(228, 215, 43, 0.6)",
      hoverBg: "rgba(228, 215, 43, 0.9)",
      hoverBorder: "rgba(228, 215, 43, 0.8)",
      iconColor: "#6c4e06",
      animation: "animate-pulse",
    },
    CHIUSA: {
      label: "Chiusa",
      icon: Trophy,
      bgColor: "rgba(228, 215, 43, 0.8)",
      textColor: "#6c4e06",
      borderColor: "rgba(228, 215, 43, 0.7)",
      hoverBg: "#e4d72b",
      hoverBorder: "#e4d72b",
      iconColor: "#6c4e06",
      animation: "",
    },
    ANNULLATA: {
      label: "Annullata",
      icon: X,
      bgColor: "rgba(216, 216, 216, 0.5)",
      textColor: "#666666",
      borderColor: "#d8d8d8",
      hoverBg: "rgba(216, 216, 216, 0.7)",
      hoverBorder: "rgba(102, 102, 102, 0.5)",
      iconColor: "#666666",
      animation: "",
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status.replace(/_/g, " "),
    icon: Clock,
    bgColor: "rgba(216, 216, 216, 0.3)",
    textColor: "#666666",
    borderColor: "rgba(216, 216, 216, 0.5)",
    hoverBg: "rgba(216, 216, 216, 0.5)",
    hoverBorder: "rgba(102, 102, 102, 0.3)",
    iconColor: "#666666",
    animation: "",
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    default: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    default: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const IconComponent = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-semibold text-bigster-text border-bigster-text p-2 rounded-none cursor-default select-none",
        "transform-gpu border-2 !border-bigster",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {showIcon && (
          <IconComponent
            className={cn(iconSizes[size], "flex-shrink-0 text-bigster-text")}
          />
        )}
        <span className="font-semibold tracking-wide whitespace-nowrap">
          {config.label}
        </span>
      </div>
    </Badge>
  );
};

export default StatusBadge;
