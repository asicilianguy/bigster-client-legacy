import {
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle,
} from "lucide-react";

export const statusConfig: Record<
    string,
    {
        label: string;
        icon: typeof CheckCircle;
        bgColor: string;
        textColor: string;
        borderColor: string;
    }
> = {
    PENDING: {
        label: "In attesa",
        icon: Clock,
        bgColor: "bg-blue-50",
        textColor: "text-blue-700",
        borderColor: "border-blue-200",
    },
    IN_PROGRESS: {
        label: "In corso",
        icon: Clock,
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-700",
        borderColor: "border-yellow-200",
    },
    COMPLETED: {
        label: "Completato",
        icon: CheckCircle,
        bgColor: "bg-green-50",
        textColor: "text-green-700",
        borderColor: "border-green-200",
    },
    EXPIRED: {
        label: "Scaduto",
        icon: AlertCircle,
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        borderColor: "border-red-200",
    },
    CANCELLED: {
        label: "Annullato",
        icon: XCircle,
        bgColor: "bg-gray-50",
        textColor: "text-gray-700",
        borderColor: "border-gray-200",
    },
};

export const atteggiamentoMapping: Record<string, string> = {
    A: "Stabilità",
    B: "Allegria",
    C: "Tranquillità",
    D: "Fiducia",
    E: "Dinamicità",
    F: "Proattività",
    G: "Coscienziosità",
    H: "Imparzialità",
    I: "Empatia",
    J: "Comunicatività",
};

export const capacitaMapping: Record<string, string> = {
    C1: "Positività",
    C2: "Prospettiva",
    C3: "Resilienza",
    C4: "Controllo",
    C5: "Responsabilità",
    C6: "Volontà",
    C7: "Altruismo",
    C8: "Senso Etico",
    C9: "Comprensione",
    C10: "Consapevolezza",
};

export const validitaMapping: Record<string, string> = {
    K: "Difensività",
    L: "Lie",
    EGL: "Egoic Lies",
    ETL: "Ethic Lies",
    M: "Inconsapevolezza",
};
