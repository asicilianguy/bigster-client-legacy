export const normalizeScore = (score: number | null): number => {
    if (score === null) return 50;
    return Math.round(((score + 100) / 200) * 100);
};

export const getScoreColor = (normalizedScore: number): string => {
    if (normalizedScore >= 70) return "#22c55e";
    if (normalizedScore >= 40) return "#fbbf24";
    return "#ef4444";
};

export const getValidityColor = (score: number | null): string => {
    if (score === null) return "#9ca3af";
    if (score >= 80) return "#ef4444";
    if (score >= 50) return "#f97316";
    if (score >= 40) return "#fbbf24";
    return "#22c55e";
};

export const calculateCompletionTime = (
    startedAt: string | null,
    completedAt: string | null
): string => {
    if (!startedAt || !completedAt) return "N/A";
    const start = new Date(startedAt);
    const end = new Date(completedAt);
    const diffMs = end.getTime() - start.getTime();

    if (diffMs < 0) return "N/A";

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;

    if (diffHours > 0) {
        return `${diffHours}h ${remainingMins}m`;
    }
    return `${diffMins} minuti`;
};

export const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};
