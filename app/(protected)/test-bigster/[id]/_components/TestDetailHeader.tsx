"use client";

import { motion } from "framer-motion";
import {
    Brain,
    Mail,
    User,
    Calendar,
    Clock,
    Award,
    AlertTriangle,
    Shield,
} from "lucide-react";
import { BigsterTestDetail } from "@/types/bigster";
import { statusConfig } from "./constants";
import { formatDate } from "./helpers";

interface TestDetailHeaderProps {
    test: BigsterTestDetail;
}

export function TestDetailHeader({ test }: TestDetailHeaderProps) {
    const status = statusConfig[test.status] || statusConfig.PENDING;
    const StatusIcon = status.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-bigster-surface border border-bigster-border shadow-bigster-card"
        >
            <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-bigster-primary flex items-center justify-center">
                            <Brain className="h-6 w-6 text-bigster-primary-text" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-bigster-text">
                                {test.firstName} {test.lastName}
                            </h1>
                            <p className="text-sm text-bigster-text-muted">
                                Test BigsTer #{test.id}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">

                        <div
                            className={`flex items-center gap-2 px-3 py-1.5 ${status.bgColor} ${status.textColor} border ${status.borderColor}`}
                        >
                            <StatusIcon className="h-4 w-4" />
                            <span className="text-sm font-medium">{status.label}</span>
                        </div>

                        {test.completed && test.eligible !== null && (
                            <div
                                className={`flex items-center gap-2 px-3 py-1.5 ${test.eligible
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : "bg-red-50 text-red-700 border-red-200"
                                    } border`}
                            >
                                <Award className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    {test.eligible ? "Idoneo" : "Non idoneo"}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-bigster-text-muted flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                                Email
                            </p>
                            <p className="text-sm text-bigster-text">{test.email}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-bigster-text-muted flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                                Sesso
                            </p>
                            <p className="text-sm text-bigster-text">
                                {test.sex === "MALE" ? "Maschio" : "Femmina"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-bigster-text-muted flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                                Inviato
                            </p>
                            <p className="text-sm text-bigster-text">
                                {formatDate(test.sentAt)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-bigster-text-muted flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                                {test.completed ? "Completato" : "Scadenza"}
                            </p>
                            <p className="text-sm text-bigster-text">
                                {test.completed
                                    ? formatDate(test.completedAt)
                                    : formatDate(test.expiresAt)}
                            </p>
                        </div>
                    </div>
                </div>

                {(test.suspect || test.unreliable) && (
                    <div className="mt-4 pt-4 border-t border-bigster-border flex items-center gap-4 flex-wrap">
                        {test.suspect && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 text-orange-700">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    Test sospetto - Punteggio M elevato
                                </span>
                            </div>
                        )}
                        {test.unreliable && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 text-red-700">
                                <Shield className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    Test non affidabile - Punteggio K ≥ 80
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
