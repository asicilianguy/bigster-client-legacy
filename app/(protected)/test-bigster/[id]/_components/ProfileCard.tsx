"use client";

import { motion } from "framer-motion";
import { BigsterProfile } from "@/types/bigster";

interface ProfileCardProps {
    profile: BigsterProfile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="bg-bigster-surface border border-bigster-border"
        >
            <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                <h2 className="text-lg font-bold text-bigster-text">
                    Profilo Assegnato
                </h2>
            </div>
            <div className="p-6">
                <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                    <p className="text-sm font-bold text-bigster-text">
                        {profile.name}
                    </p>
                    <p className="text-xs text-bigster-text-muted mt-1">
                        {profile.slug}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
