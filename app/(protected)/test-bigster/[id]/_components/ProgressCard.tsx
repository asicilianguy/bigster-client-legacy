"use client";

import { motion } from "framer-motion";
import { BigsterTestDetail } from "@/types/bigster";

interface ProgressCardProps {
    test: BigsterTestDetail;
}

export function ProgressCard({ test }: ProgressCardProps) {
    const totalQuestions = test.totalQuestions || 300;
    const progress = Math.round((test.questionProgress / totalQuestions) * 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-bigster-surface border border-bigster-border"
        >
            <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                <h2 className="text-lg font-bold text-bigster-text">Progresso</h2>
            </div>
            <div className="p-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-bigster-text-muted">
                            Domande risposte
                        </span>
                        <span className="text-sm font-bold text-bigster-text">
                            {test.questionProgress}/{totalQuestions}
                        </span>
                    </div>
                    <div className="h-2 bg-bigster-border">
                        <div
                            className={`h-full transition-all ${test.completed ? "bg-green-500" : "bg-bigster-primary"
                                }`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-bigster-text-muted text-center">
                        {progress}% completato
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
