import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Test Attitudinale | Bigster",
    description: "Completa il tuo test attitudinale",
    robots: "noindex, nofollow",
};

export default function TestLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return <>{children}</>;
}
