"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Building2,
  Briefcase,
  ArrowRight,
  Calendar,
} from "lucide-react";

const statusConfig: Record<string, any> = {
  CREATA: {
    label: "Creata",
    icon: FileText,
    step: 1,
    totalSteps: 8,
    bgColor: "#ffffff",
    textColor: "#6c4e06",
    borderColor: "rgba(108, 78, 6, 0.2)",
    cardAccent: "rgba(255, 255, 255, 1)",
    cardBackground: "white",
  },
  APPROVATA: {
    label: "Approvata",
    icon: CheckCircle2,
    step: 2,
    totalSteps: 8,
    bgColor: "rgba(228, 215, 43, 0.4)",
    textColor: "#6c4e06",
    borderColor: "rgba(228, 215, 43, 0.3)",
    cardAccent: "rgba(228, 215, 43, 0.1)",
  },
  IN_CORSO: {
    label: "In Corso",
    icon: Play,
    step: 3,
    totalSteps: 8,
    bgColor: "rgba(254, 241, 154, 0.5)",
    textColor: "#6c4e06",
    borderColor: "rgba(108, 78, 6, 0.3)",
    cardAccent: "rgba(254, 241, 154, 0.15)",
  },
  ANNUNCI_PUBBLICATI: {
    label: "Annunci Pubblicati",
    icon: Megaphone,
    step: 4,
    totalSteps: 8,
    bgColor: "rgba(228, 215, 43, 0.5)",
    textColor: "#6c4e06",
    borderColor: "rgba(228, 215, 43, 0.4)",
    cardAccent: "rgba(228, 215, 43, 0.15)",
  },
  CANDIDATURE_RICEVUTE: {
    label: "Candidature Ricevute",
    icon: Users2,
    step: 5,
    totalSteps: 8,
    bgColor: "rgba(254, 241, 154, 0.6)",
    textColor: "#6c4e06",
    borderColor: "rgba(108, 78, 6, 0.4)",
    cardAccent: "rgba(254, 241, 154, 0.2)",
  },
  COLLOQUI_IN_CORSO: {
    label: "Colloqui in Corso",
    icon: MessageSquare,
    step: 6,
    totalSteps: 8,
    bgColor: "rgba(228, 215, 43, 0.6)",
    textColor: "#6c4e06",
    borderColor: "rgba(228, 215, 43, 0.5)",
    cardAccent: "rgba(228, 215, 43, 0.2)",
  },
  COLLOQUI_CEO: {
    label: "Colloqui CEO",
    icon: Crown,
    step: 7,
    totalSteps: 8,
    bgColor: "rgba(228, 215, 43, 0.7)",
    textColor: "#6c4e06",
    borderColor: "rgba(228, 215, 43, 0.6)",
    cardAccent: "rgba(228, 215, 43, 0.25)",
  },
  CHIUSA: {
    label: "Completata",
    icon: Trophy,
    step: 8,
    totalSteps: 8,
    bgColor: "rgba(76, 175, 80, 0.8)",
    textColor: "#2e7d32",
    borderColor: "rgba(76, 175, 80, 0.7)",
    cardAccent: "rgba(76, 175, 80, 0.3)",
    cardBackground:
      "linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(255, 255, 255, 0.95) 100%)",
  },
  ANNULLATA: {
    label: "Annullata",
    icon: X,
    step: 0,
    totalSteps: 8,
    bgColor: "rgba(216, 216, 216, 0.5)",
    textColor: "#666666",
    borderColor: "#d8d8d8",
    cardAccent: "rgba(216, 216, 216, 0.1)",
  },
};

interface SelectionCardProps {
  selection: {
    id: number;
    titolo: string;
    stato: string;
    figura_ricercata?: string | null;
    company?: {
      id: number;
      nome: string;
    };
    data_creazione?: string;
    _count?: {
      annunci?: number;
      candidature?: number;
    };
  };
  index?: number;
}

export function SelectionCard({ selection, index = 0 }: SelectionCardProps) {
  const config = statusConfig[selection.stato] || statusConfig.CREATA;
  const StatusIcon = config.icon;

  const progressPercentage =
    config.step === 0 ? 0 : (config.step / config.totalSteps) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -4 }}
      className="w-full h-full"
    >
      <Card
        className="rounded-none w-full h-full transition-all duration-300 hover:shadow-xl border-0 overflow-hidden group flex flex-col"
        style={{
          background: `white`,
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
        }}
      >
        <CardContent className="p-6 flex flex-col h-full">

          <div className="flex items-start justify-between mb-4">
            <Badge
              variant="outline"
              className="font-semibold text-xs px-3 py-1 border-2 whitespace-nowrap text-bigster-text"
              style={{
                backgroundColor: "white",
                borderColor: "#6c4e06",
              }}
            >
              <StatusIcon className="h-3 w-3 mr-1 inline" />
              {config.label} • {config.step}/{config.totalSteps}
            </Badge>
          </div>

          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-3">
            {selection.titolo}
          </h3>

          <div className="space-y-2 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {selection.figura_ricercata || "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {selection.company?.nome || "N/A"}
              </span>
            </div>
            {selection.data_creazione && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>
                  {new Date(selection.data_creazione).toLocaleDateString(
                    "it-IT"
                  )}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between bg-bigster-background rounded-lg p-4 mb-6">
            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Megaphone className="h-4 w-4 text-gray-500" />
                <span className="text-xs text-gray-500 font-medium">
                  Annunci
                </span>
              </div>
              <p className="text-2xl font-bold text-bigster-text">
                {selection._count?.annunci || 0}
              </p>
            </div>

            <div className="w-px h-16 bg-gray-400" />

            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users2 className="h-4 w-4 text-gray-500" />
                <span className="text-xs text-gray-500 font-medium">
                  Candidature
                </span>
              </div>
              <p className="text-2xl font-bold text-bigster-text">
                {selection._count?.candidature || 0}
              </p>
            </div>
          </div>

          <div className="mt-auto">
            <Button
              asChild
              variant="outline"
              className="w-full font-semibold text-bigster-text transition-all duration-300 border-2 bg-transparent"
              style={{
                borderColor: "#6c4e06",
              }}
            >
              <Link
                href={`/selezioni/${selection.id}`}
                className="flex items-center justify-center gap-2"
              >
                Visualizza dettagli
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
