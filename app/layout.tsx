import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/lib/redux/provider";
import { InvoicesProvider } from "@/app/contexts/InvoicesContext";
import { BigsterToaster } from "@/components/ui/bigster-toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BigSter 2.0",
  description: "Piattaforma per la gestione delle selezioni del personale.",
  generator: "v0.dev",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⭐</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <ReduxProvider>
          <InvoicesProvider>
            {children}
            <BigsterToaster />
          </InvoicesProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
