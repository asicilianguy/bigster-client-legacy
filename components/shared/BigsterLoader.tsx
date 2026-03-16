"use client";

interface BigsterLoaderProps {

    text?: string;

    fullScreen?: boolean;

    size?: "sm" | "md" | "lg";
}

const sizeConfig = {
    sm: { imgH: 36, barW: 120, gap: 20 },
    md: { imgH: 56, barW: 200, gap: 32 },
    lg: { imgH: 76, barW: 280, gap: 40 },
};

export function BigsterLoader({
    text = "Caricamento",
    fullScreen = true,
    size = "md",
}: BigsterLoaderProps) {
    const s = sizeConfig[size];

    return (
        <>
            <style jsx global>{`
        @keyframes bigster-breathe {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.03); opacity: 0.92; }
        }
        @keyframes bigster-slide-bar {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(350%); }
        }
        @keyframes bigster-dot-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes bigster-text-fade {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 0.7; }
        }
        @keyframes bigster-glow-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes bigster-fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>

            <div
                className={`flex items-center justify-center ${fullScreen ? "fixed inset-0 z-50" : "w-full py-16"
                    }`}
                style={{
                    background: fullScreen
                        ? "rgba(239, 234, 199, 0.85)"
                        : "transparent",
                    backdropFilter: fullScreen ? "blur(6px)" : undefined,
                    WebkitBackdropFilter: fullScreen ? "blur(6px)" : undefined,
                    animation: "bigster-fade-in 0.4s ease-out forwards",
                }}
            >

                {fullScreen && (
                    <div
                        className="absolute pointer-events-none"
                        style={{
                            width: 300,
                            height: 300,
                            borderRadius: "50%",
                            background:
                                "radial-gradient(circle, rgba(253,224,28,0.12) 0%, transparent 70%)",
                            animation: "bigster-glow-pulse 3s ease-in-out infinite",
                        }}
                    />
                )}

                <div
                    className="flex flex-col items-center"
                    style={{ gap: s.gap }}
                >

                    <div
                        className="relative"
                        style={{ animation: "bigster-breathe 2.4s ease-in-out infinite" }}
                    >
                        <img
                            src="/logo_header.png"
                            alt="BigSter"
                            style={{
                                height: s.imgH,
                                width: "auto",
                                objectFit: "contain",
                                filter: "drop-shadow(0 0 12px rgba(253,224,28,0.15))",
                            }}
                        />
                    </div>

                    <div
                        className="relative overflow-hidden"
                        style={{
                            width: s.barW,
                            height: 3,
                            background: "rgba(108,78,6,0.1)",
                        }}
                    >
                        <div
                            className="absolute top-0 left-0 h-full"
                            style={{
                                width: "40%",
                                background:
                                    "linear-gradient(90deg, transparent 0%, #e4d72b 40%, #fde01c 60%, transparent 100%)",
                                animation: "bigster-slide-bar 1.6s ease-in-out infinite",
                            }}
                        />
                    </div>

                    <div className="flex items-center gap-2.5">
                        <span
                            className="text-xs font-medium uppercase tracking-[3px]"
                            style={{
                                color: "rgba(108,78,6,0.5)",
                                animation: "bigster-text-fade 2.4s ease-in-out infinite",
                            }}
                        >
                            {text}
                        </span>
                        <div className="flex gap-1.5 items-center">
                            {[0, 0.15, 0.3].map((delay, i) => (
                                <span
                                    key={i}
                                    className="block"
                                    style={{
                                        width: 5,
                                        height: 5,
                                        background: "#e4d72b",
                                        animation: `bigster-dot-bounce 1.4s ease-in-out infinite ${delay}s`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default BigsterLoader;
