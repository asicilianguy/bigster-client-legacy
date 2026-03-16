"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, FileText, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useLogoutMutation } from "@/lib/redux/features/auth/authApiSlice";
import { clearCredentials } from "@/lib/redux/features/auth/authSlice";
import { useNotify } from "@/hooks/use-notify";
import { CreateSelectionWizard } from "./_components/CreateSelectionWizard";
import { InvoiceManagement } from "./_components/InvoiceManagement";

type AdminView = "create" | "invoices";

export default function AmministrazionePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const notify = useNotify();
  const [logout] = useLogoutMutation();
  const [activeView, setActiveView] = useState<AdminView>("create");

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(clearCredentials());
      notify.success("Logout effettuato", "Sessione terminata correttamente");
      setTimeout(() => {
        router.push("/login");
      }, 500);
    } catch (error) {
      console.error("Errore durante il logout:", error);
      dispatch(clearCredentials());
      notify.warning("Logout locale", "Sessione terminata localmente");
      setTimeout(() => {
        router.push("/login");
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-bigster-background">

      <div className="bg-bigster-surface border-b border-bigster-border">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">

            <div>
              <h1 className="text-2xl font-bold text-bigster-text tracking-tight">
                Amministrazione
              </h1>
              <p className="text-xs text-bigster-text-muted mt-0.5">
                Gestione selezioni e fatturazione
              </p>
            </div>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          <div className="flex gap-0 mt-4 -mb-px">
            <button
              onClick={() => setActiveView("create")}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${activeView === "create"
                  ? "border-bigster-primary text-bigster-text bg-bigster-surface"
                  : "border-transparent text-bigster-text-muted hover:text-bigster-text hover:border-bigster-border"
                }`}
            >
              <div className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Crea Selezione
              </div>
            </button>

            <button
              onClick={() => setActiveView("invoices")}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${activeView === "invoices"
                  ? "border-bigster-primary text-bigster-text bg-bigster-surface"
                  : "border-transparent text-bigster-text-muted hover:text-bigster-text hover:border-bigster-border"
                }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Gestione Fatture
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-6">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {activeView === "create" && <CreateSelectionWizard />}
          {activeView === "invoices" && <InvoiceManagement />}
        </motion.div>
      </div>
    </div>
  );
}
