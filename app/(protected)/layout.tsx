"use client";

import type React from "react";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { Header } from "@/components/shared/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProtectedRoute from "@/components/shared/protected-route";
import { useUserRole } from "@/hooks/use-user-role";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAmministrazione } = useUserRole();

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-secondary">
          <div className="flex flex-1 flex-col">
            {!isAmministrazione && <Header />}
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
