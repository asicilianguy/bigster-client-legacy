"use client";

import { motion } from "framer-motion";
import {
    Users,
    Target,
    Briefcase,
    Building2,
    User,
    Phone,
    MapPin,
    Mail,
    FileText,
} from "lucide-react";
import { BigsterTestDetail } from "@/types/bigster";

interface CandidateDetailsProps {
    test: BigsterTestDetail;
}

function calculateAge(birthDate: string | Date | null | undefined): number | null {
    if (!birthDate) return null;

    const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
    if (isNaN(birth.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
}

export function CandidateDetails({ test }: CandidateDetailsProps) {

    const candidateAge = calculateAge(test.birthDate);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-bigster-surface border border-bigster-border shadow-bigster-card"
        >
            <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-bigster-text" />
                    <h2 className="text-lg font-bold text-bigster-text">
                        Dettagli Candidato
                    </h2>
                </div>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

                    <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-purple-600" />
                            <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                                Profilo
                            </p>
                        </div>
                        <p className="text-sm font-bold text-bigster-text">
                            {test.profile?.name || "Non assegnato"}
                        </p>
                    </div>

                    <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                        <div className="flex items-center gap-2 mb-2">
                            <Briefcase className="h-4 w-4 text-blue-600" />
                            <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                                Figura
                            </p>
                        </div>
                        <p className="text-sm font-bold text-bigster-text">
                            {test.selection?.figura_ricercata ||
                                test.selection?.titolo ||
                                "N/A"}
                        </p>
                    </div>

                    <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                        <div className="flex items-center gap-2 mb-2">
                            <Building2 className="h-4 w-4 text-green-600" />
                            <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                                Azienda
                            </p>
                        </div>
                        <p className="text-sm font-bold text-bigster-text">
                            {test.selection?.company?.nome || "N/A"}
                        </p>
                    </div>

                    <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                        <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-orange-600" />
                            <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                                Sesso / Età
                            </p>
                        </div>
                        <p className="text-sm font-bold text-bigster-text">
                            {test.sex === "MALE" ? "M" : test.sex === "FEMALE" ? "F" : "—"}
                            {candidateAge !== null
                                ? ` / ${candidateAge} anni`
                                : " / —"}
                        </p>
                    </div>

                    <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                        <div className="flex items-center gap-2 mb-2">
                            <Phone className="h-4 w-4 text-teal-600" />
                            <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                                Telefono
                            </p>
                        </div>
                        <p className="text-sm font-bold text-bigster-text">
                            {test.phone || test.application?.telefono || "N/A"}
                        </p>
                    </div>

                    <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-red-600" />
                            <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                                Città
                            </p>
                        </div>
                        <p className="text-sm font-bold text-bigster-text">
                            {test.application?.citta || "N/A"}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">

                    <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                        <div className="flex items-center gap-2 mb-2">
                            <Mail className="h-4 w-4 text-indigo-600" />
                            <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                                Email Candidato
                            </p>
                        </div>
                        <p className="text-sm font-bold text-bigster-text break-all">
                            {test.email || test.email}
                        </p>
                    </div>

                    <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-purple-600" />
                            <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                                Regione
                            </p>
                        </div>
                        <p className="text-sm font-bold text-bigster-text">
                            {test.application?.regione || "N/A"}
                        </p>
                    </div>

                    <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                        <div className="flex items-center gap-2 mb-2">
                            <Building2 className="h-4 w-4 text-teal-600" />
                            <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                                Sede Azienda
                            </p>
                        </div>
                        <p className="text-sm font-bold text-bigster-text">
                            {test.selection?.company?.citta || "N/A"}
                        </p>
                    </div>

                    <div className="p-4 bg-bigster-card-bg border border-bigster-border">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-amber-600" />
                            <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                                Selezione
                            </p>
                        </div>
                        <p className="text-sm font-bold text-bigster-text">
                            {test.selection?.titolo || "N/A"}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
