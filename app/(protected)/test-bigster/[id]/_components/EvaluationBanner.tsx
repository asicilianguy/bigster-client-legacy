"use client";

import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { BigsterEvaluation } from "@/types/bigster";

interface EvaluationBannerProps {
    evaluation: BigsterEvaluation;
}

export function EvaluationBanner({ evaluation }: EvaluationBannerProps) {
    const config = {
        IDONEO: {
            icon: CheckCircle,
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
            iconColor: "text-green-600",
            titleColor: "text-green-800",
            textColor: "text-green-700",
            description: "Il candidato soddisfa i requisiti del profilo",
        },
        PARZIALMENTE_IDONEO: {
            icon: AlertTriangle,
            bgColor: "bg-yellow-50",
            borderColor: "border-yellow-200",
            iconColor: "text-yellow-600",
            titleColor: "text-yellow-800",
            textColor: "text-yellow-700",
            description: "Il candidato soddisfa parzialmente i requisiti",
        },
        NON_IDONEO: {
            icon: XCircle,
            bgColor: "bg-red-50",
            borderColor: "border-red-200",
            iconColor: "text-red-600",
            titleColor: "text-red-800",
            textColor: "text-red-700",
            description: "Il candidato non soddisfa i requisiti del profilo",
        },
    };

    const currentConfig = (evaluation ? config[evaluation] : null) || config.NON_IDONEO;
    const Icon = currentConfig.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-bigster-surface border border-bigster-border"
        >
            <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                <h2 className="text-lg font-bold text-bigster-text">
                    Valutazione Finale
                </h2>
            </div>
            <div className="p-6">
                <div
                    className={`p-4 border-2 ${currentConfig.bgColor} ${currentConfig.borderColor}`}
                >
                    <div className="flex items-center gap-3">
                        <Icon className={`h-6 w-6 ${currentConfig.iconColor}`} />
                        <div>
                            <p className={`text-lg font-bold ${currentConfig.titleColor}`}>
                                {evaluation?.replace("_", " ")}
                            </p>
                            <p className={`text-sm ${currentConfig.textColor}`}>
                                {currentConfig.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
