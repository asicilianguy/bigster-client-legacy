"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Check,
    ArrowRight,
    User,
    Building2,
    FileText,
    PlusCircle,
    LogOut,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import ConsultantSelector from "@/components/accesso-fattureincloud/ConsultantSelector";
import CompanySelector from "@/components/accesso-fattureincloud/CompanySelector";
import InvoiceSelector from "@/components/accesso-fattureincloud/InvoiceSelector";
import SelectionForm from "@/components/accesso-fattureincloud/SelectionForm";
import { useCreateSelectionMutation } from "@/lib/redux/features/selections/selectionsApiSlice";
import { useGetConsulentiQuery } from "@/lib/redux/features/users/usersApiSlice";
import { useGetCompaniesQuery } from "@/lib/redux/features/companies/companiesApiSlice";
import { useLogoutMutation } from "@/lib/redux/features/auth/authApiSlice";
import { clearCredentials } from "@/lib/redux/features/auth/authSlice";
import { useNotify } from "@/hooks/use-notify";
import type { CreateSelectionPayload } from "@/types/selection";
import type { Invoice } from "@/app/contexts/InvoicesContext";
import { PackageType } from "@/types/user";

type CreationStep = "consultant" | "company" | "invoice" | "form";

const STORAGE_KEY = "bigster_selection_draft";

interface SelectionDraft {
    consultantId: number | null;
    companyId: number | null;
    invoiceId: number | null;
}

export function CreateSelectionWizard() {
    const router = useRouter();
    const dispatch = useDispatch();
    const notify = useNotify();

    const [createSelection, { isLoading }] = useCreateSelectionMutation();
    const [logout] = useLogoutMutation();

    const { data: consultants } = useGetConsulentiQuery();
    const { data: companies } = useGetCompaniesQuery();

    const [selectedConsultantId, setSelectedConsultantId] = useState<
        number | null
    >(null);
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
        null
    );
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(
        null
    );
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [currentStep, setCurrentStep] = useState<CreationStep>("consultant");
    const [isInitialized, setIsInitialized] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        const savedDraft = localStorage.getItem(STORAGE_KEY);
        if (savedDraft) {
            try {
                const draft: SelectionDraft = JSON.parse(savedDraft);

                if (draft.consultantId) setSelectedConsultantId(draft.consultantId);
                if (draft.companyId) setSelectedCompanyId(draft.companyId);
                if (draft.invoiceId) setSelectedInvoiceId(draft.invoiceId);

                if (draft.invoiceId) {
                    setCurrentStep("form");
                } else if (draft.companyId) {
                    setCurrentStep("invoice");
                } else if (draft.consultantId) {
                    setCurrentStep("company");
                }

                if (draft.consultantId || draft.companyId || draft.invoiceId) {
                    notify.info(
                        "Bozza ripristinata",
                        "Hai una bozza salvata in precedenza"
                    );
                }
            } catch (error) {
                console.error("Errore nel caricamento della bozza:", error);
                localStorage.removeItem(STORAGE_KEY);
                notify.error(
                    "Errore nel ripristino",
                    "Non è stato possibile recuperare la bozza salvata"
                );
            }
        }
        setIsInitialized(true);
    }, []);

    useEffect(() => {
        if (!isInitialized) return;

        const draft: SelectionDraft = {
            consultantId: selectedConsultantId,
            companyId: selectedCompanyId,
            invoiceId: selectedInvoiceId,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    }, [
        selectedConsultantId,
        selectedCompanyId,
        selectedInvoiceId,
        isInitialized,
    ]);

    const selectedConsultant = consultants?.find(
        (c) => c.id === selectedConsultantId
    );
    const selectedCompany = companies?.find((c) => c.id === selectedCompanyId);

    const handleConsultantSelect = (consultantId: number) => {
        setSelectedConsultantId(consultantId);
        notify.success("Consulente selezionato");
    };

    const handleCompanySelect = (companyId: number) => {
        setSelectedCompanyId(companyId);
        notify.success("Azienda selezionata");
    };

    const handleInvoiceSelect = (invoiceId: number, invoice: Invoice) => {
        setSelectedInvoiceId(invoiceId);
        setSelectedInvoice(invoice);
        notify.success("Fattura selezionata");
    };

    const handleNext = () => {
        if (currentStep === "consultant" && selectedConsultantId) {
            setCurrentStep("company");
        } else if (currentStep === "company" && selectedCompanyId) {
            setCurrentStep("invoice");
        } else if (currentStep === "invoice" && selectedInvoiceId) {
            setCurrentStep("form");
        }
    };

    const handleSubmit = async (formData: {
        titolo: string;
        pacchetto: "BASE" | "MDO";
        figura_ricercata: string;
    }) => {
        if (!selectedConsultantId || !selectedCompanyId || !selectedInvoiceId || !selectedInvoice) {
            notify.error(
                "Dati mancanti",
                "Completa tutti i passaggi prima di procedere"
            );
            return;
        }

        try {
            const payload: CreateSelectionPayload = {
                titolo: formData.titolo,
                company_id: selectedCompanyId,
                pacchetto: formData.pacchetto as PackageType,
                consulente_id: selectedConsultantId,
                figura_ricercata: formData.figura_ricercata,
                invoice_data: {
                    fic_id: selectedInvoice.id,
                    numero_fattura: selectedInvoice.number,
                    tipo_fattura: selectedInvoice.service_code || selectedInvoice.items_codes?.[0] || "AV",
                    data_emissione: selectedInvoice.date,
                },
            };

            const creationPromise = createSelection(payload).unwrap();

            await notify.promise(creationPromise, {
                loading: "Creazione selezione in corso...",
                success: "Selezione creata con successo!",
                error: "Errore nella creazione della selezione",
            });

            localStorage.removeItem(STORAGE_KEY);

            setShowSuccessModal(true);
        } catch (error: any) {
            console.error("Errore nella creazione della selezione:", error);

            if (error?.status === 400) {
                notify.error(
                    "Dati non validi",
                    error?.data?.message || "Controlla i dati inseriti"
                );
            } else if (error?.status === 401) {
                notify.error("Sessione scaduta", "Effettua nuovamente il login");
                setTimeout(() => router.push("/login"), 1500);
            } else if (error?.status === 403) {
                notify.error(
                    "Permessi insufficienti",
                    "Non hai i permessi per creare selezioni"
                );
            } else if (error?.status === 409) {
                notify.error(
                    "Fattura già utilizzata",
                    "Questa fattura è già associata a un'altra selezione"
                );
            }
        }
    };

    const handleCreateAnother = () => {
        setShowSuccessModal(false);
        setSelectedConsultantId(null);
        setSelectedCompanyId(null);
        setSelectedInvoiceId(null);
        setSelectedInvoice(null);
        setCurrentStep("consultant");
        localStorage.removeItem(STORAGE_KEY);
        notify.info("Nuova selezione", "Inizia una nuova creazione");
    };

    const handleCloseAndLogout = async () => {
        setShowSuccessModal(false);

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

    const handleBack = () => {
        if (currentStep === "form") {
            setCurrentStep("invoice");
        } else if (currentStep === "invoice") {
            setCurrentStep("company");
        } else if (currentStep === "company") {
            setCurrentStep("consultant");
        } else {
            if (selectedConsultantId || selectedCompanyId || selectedInvoiceId) {
                notify.richWarning(
                    "Uscire dalla creazione?",
                    "La bozza verrà salvata automaticamente",
                    {
                        actionLabel: "Esci",
                        actionOnClick: () => router.back(),
                        cancelLabel: "Resta",
                    }
                );
            } else {
                router.back();
            }
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case "consultant":
                return selectedConsultantId !== null;
            case "company":
                return selectedCompanyId !== null;
            case "invoice":
                return selectedInvoiceId !== null;
            case "form":
                return false;
            default:
                return false;
        }
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case "consultant":
                return "Seleziona Consulente di Riferimento";
            case "company":
                return "Seleziona Compagnia";
            case "invoice":
                return "Seleziona Fattura";
            case "form":
                return "Completa Selezione";
            default:
                return "";
        }
    };

    const getStepDescription = () => {
        switch (currentStep) {
            case "consultant":
                return "Scegli il consulente che gestirà questa selezione";
            case "company":
                return "Seleziona l'azienda per cui creare la selezione";
            case "invoice":
                return "Scegli la fattura associata alla selezione";
            case "form":
                return "Inserisci i dettagli finali della selezione";
            default:
                return "";
        }
    };

    if (!isInitialized) {
        return null;
    }

    return (
        <div className="space-y-6">

            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Indietro
                    </Button>

                    <div>
                        <h2 className="text-lg font-bold text-bigster-text">
                            {getStepTitle()}
                        </h2>
                    </div>
                </div>

                {currentStep !== "form" && (
                    <Button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Avanti
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                )}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <Card className="shadow-bigster-card border border-bigster-border rounded-none">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            {(["consultant", "company", "invoice", "form"] as CreationStep[]).map(
                                (step, index) => {
                                    const isActive = currentStep === step;
                                    const isPast =
                                        ["consultant", "company", "invoice", "form"].indexOf(
                                            currentStep
                                        ) > index;

                                    return (
                                        <div key={step} className="flex items-center flex-1">
                                            <div
                                                className={`flex items-center justify-center w-8 h-8 border-2 transition-colors ${isActive
                                                        ? "border-bigster-primary bg-bigster-primary text-bigster-primary-text"
                                                        : isPast
                                                            ? "border-green-500 bg-green-500 text-white"
                                                            : "border-bigster-border bg-bigster-surface text-bigster-text-muted"
                                                    }`}
                                            >
                                                {isPast ? (
                                                    <Check className="h-4 w-4" />
                                                ) : (
                                                    <span className="text-xs font-bold">{index + 1}</span>
                                                )}
                                            </div>

                                            <span
                                                className={`ml-2 text-xs font-semibold hidden sm:inline ${isActive
                                                        ? "text-bigster-text"
                                                        : isPast
                                                            ? "text-green-600"
                                                            : "text-bigster-text-muted"
                                                    }`}
                                            >
                                                {step === "consultant"
                                                    ? "Consulente"
                                                    : step === "company"
                                                        ? "Azienda"
                                                        : step === "invoice"
                                                            ? "Fattura"
                                                            : "Dettagli"}
                                            </span>

                                            {index < 3 && (
                                                <div
                                                    className={`flex-1 h-px mx-3 ${isPast ? "bg-green-500" : "bg-bigster-border"
                                                        }`}
                                                />
                                            )}
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <Card className="shadow-bigster-card border border-bigster-border rounded-none">
                    <CardContent className="py-3 px-4">
                        <div className="flex items-center gap-4">

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <User className="h-4 w-4 text-bigster-text-muted" />
                                    <span className="text-xs font-semibold text-bigster-text-muted uppercase">
                                        Consulente
                                    </span>
                                </div>
                                {selectedConsultant ? (
                                    <div>
                                        <p className="font-semibold text-sm text-bigster-text">
                                            {selectedConsultant.nome} {selectedConsultant.cognome}
                                        </p>
                                        <p className="text-xs text-bigster-text-muted">
                                            {selectedConsultant.email}
                                        </p>
                                    </div>
                                ) : (
                                    <span className="text-sm text-bigster-text-muted">—</span>
                                )}
                            </div>

                            <div className="h-12 w-px bg-bigster-border" />

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Building2 className="h-4 w-4 text-bigster-text-muted" />
                                    <span className="text-xs font-semibold text-bigster-text-muted uppercase">
                                        Azienda
                                    </span>
                                </div>
                                {selectedCompany ? (
                                    <div>
                                        <p className="font-semibold text-sm text-bigster-text">
                                            {selectedCompany.nome}
                                        </p>
                                        <p className="text-xs text-bigster-text-muted">
                                            {selectedCompany.citta}
                                        </p>
                                    </div>
                                ) : (
                                    <span className="text-sm text-bigster-text-muted">—</span>
                                )}
                            </div>

                            <div className="h-12 w-px bg-bigster-border" />

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <FileText className="h-4 w-4 text-bigster-text-muted" />
                                    <span className="text-xs font-semibold text-bigster-text-muted uppercase">
                                        Fattura
                                    </span>
                                </div>
                                {selectedInvoice ? (
                                    <div>
                                        <p className="font-semibold text-sm text-bigster-text">
                                            {selectedInvoice.number}
                                        </p>
                                        <p className="text-xs text-bigster-text-muted">
                                            {selectedInvoice.entity?.name || `FIC #${selectedInvoice.id}`}
                                        </p>
                                    </div>
                                ) : (
                                    <span className="text-sm text-bigster-text-muted">—</span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mb-6"
            >
                <div className="px-1">
                    <p className="text-sm text-bigster-text-muted italic">
                        {getStepDescription()}
                    </p>
                </div>
            </motion.div>

            <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
            >
                {currentStep === "consultant" && (
                    <ConsultantSelector
                        onSelect={handleConsultantSelect}
                        selectedId={selectedConsultantId}
                    />
                )}

                {currentStep === "company" && (
                    <CompanySelector
                        onSelect={handleCompanySelect}
                        selectedId={selectedCompanyId}
                    />
                )}

                {currentStep === "invoice" && selectedCompanyId && (
                    <InvoiceSelector
                        companyId={selectedCompanyId}
                        onSelect={handleInvoiceSelect}
                        selectedId={selectedInvoiceId}
                    />
                )}

                {currentStep === "form" && (
                    <SelectionForm onSubmit={handleSubmit} isLoading={isLoading} />
                )}
            </motion.div>

            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-bigster-surface border border-bigster-border max-w-md w-full mx-4"
                    >
                        <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
                            <h2 className="text-lg font-bold text-bigster-text">
                                Selezione Creata!
                            </h2>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="p-4 bg-green-50 border-2 border-green-200">
                                <div className="flex items-start gap-3">
                                    <Check className="h-6 w-6 text-green-600 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-green-800 mb-1">
                                            Operazione Completata
                                        </p>
                                        <p className="text-xs text-green-700">
                                            La selezione è stata creata con successo e la fattura è
                                            stata associata.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-bigster-text">
                                Cosa vuoi fare adesso?
                            </p>

                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={handleCreateAnother}
                                    className="w-full rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90"
                                >
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Crea un&apos;altra selezione
                                </Button>

                                <Button
                                    onClick={handleCloseAndLogout}
                                    variant="outline"
                                    className="w-full rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Chiudi e Logout
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
