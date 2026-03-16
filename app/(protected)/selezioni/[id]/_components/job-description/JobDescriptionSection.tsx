"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Edit3,
  Eye,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Mail,
  X,
  ArrowRight,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SelectionDetail, SelectionStatus } from "@/types/selection";
import JobDescriptionWizard from "./JobDescriptionWizard";
import { JobDescriptionPreview } from "./JobDescriptionPreview";
import { JobDescriptionType } from "@/types/jobDescription";
import { useJobCollectionData } from "@/hooks/useJobCollectionData";
import { useSendToClientMutation } from "@/lib/redux/features/job-collections/jobCollectionsApiSlice";
import { useChangeSelectionStatusMutation } from "@/lib/redux/features/selections/selectionsApiSlice";
import { toast } from "sonner";

interface JobDescriptionSectionProps {
  selection: SelectionDetail;
}

const VISIBLE_STATES = [
  SelectionStatus.HR_ASSEGNATA,
  SelectionStatus.PRIMA_CALL_COMPLETATA,
  SelectionStatus.RACCOLTA_JOB_IN_APPROVAZIONE_CLIENTE,
  SelectionStatus.RACCOLTA_JOB_APPROVATA_CLIENTE,
  SelectionStatus.BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO,
  SelectionStatus.ANNUNCIO_APPROVATO,
  SelectionStatus.ANNUNCIO_PUBBLICATO,
  SelectionStatus.CANDIDATURE_RICEVUTE,
  SelectionStatus.COLLOQUI_IN_CORSO,
  SelectionStatus.CANDIDATO_IN_PROVA,
  SelectionStatus.SELEZIONI_IN_SOSTITUZIONE,
  SelectionStatus.CHIUSA,
];

const EDITABLE_STATES = [
  SelectionStatus.HR_ASSEGNATA,
  SelectionStatus.PRIMA_CALL_COMPLETATA,
];

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export function JobDescriptionSection({
  selection,
}: JobDescriptionSectionProps) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [sendToClient, { isLoading: isSending }] = useSendToClientMutation();
  const [changeStatus, { isLoading: isChangingStatus }] =
    useChangeSelectionStatusMutation();

  const isVisible = VISIBLE_STATES.includes(selection.stato as SelectionStatus);
  const isEditable = EDITABLE_STATES.includes(
    selection.stato as SelectionStatus
  );

  const canSendDirectly =
    selection.stato === SelectionStatus.PRIMA_CALL_COMPLETATA ||
    selection.stato === SelectionStatus.RACCOLTA_JOB_IN_APPROVAZIONE_CLIENTE;

  const needsStatusChange = selection.stato === SelectionStatus.HR_ASSEGNATA;

  const determineType = (): JobDescriptionType => {
    const figuraNome = selection.figura_ricercata?.toLowerCase() || "";
    if (figuraNome.includes("aso") || figuraNome.includes("assistente")) {
      return JobDescriptionType.ASO;
    }
    return JobDescriptionType.DO;
  };

  const tipo = determineType();

  const {
    isLoading,
    isLoadingJson,
    initialFormData,
    jobCollectionId,
    hasExistingData,
    hasJsonData,
    error,
  } = useJobCollectionData({
    selectionId: selection.id,
    tipo,
    enabled: isVisible,
  });

  const existingJobCollection = selection.raccolta_job;
  const hasPdf = !!existingJobCollection?.s3_key;

  const handleViewPdf = () => {
    if (!initialFormData) return;
    setIsPreviewOpen(true);
  };

  const handleSendClick = () => {
    if (needsStatusChange) {

      setIsChangeStatusModalOpen(true);
    } else {

      handleOpenSendModal();
    }
  };

  const handleOpenSendModal = () => {
    setRecipientEmail(selection.company?.email || "");
    setEmailError("");
    setIsSendModalOpen(true);
  };

  const handleCloseSendModal = () => {
    setIsSendModalOpen(false);
    setRecipientEmail("");
    setEmailError("");
  };

  const handleCloseChangeStatusModal = () => {
    setIsChangeStatusModalOpen(false);
  };

  const handleConfirmStatusChange = async () => {
    try {
      await await changeStatus({
        id: selection.id,
        body: {
          nuovo_stato: SelectionStatus.PRIMA_CALL_COMPLETATA,
          note: "Prima call completata - pronto per invio Job Description",
        },
      }).unwrap();

      toast.success("Stato aggiornato a 'Prima Call Completata'", {
        duration: 3000,
      });

      handleCloseChangeStatusModal();

      setTimeout(() => {
        handleOpenSendModal();
      }, 300);
    } catch (error: any) {
      console.error("Errore cambio stato:", error);
      toast.error(error?.data?.error || "Errore durante il cambio di stato");
    }
  };

  const handleConfirmSend = async () => {
    if (!recipientEmail.trim()) {
      setEmailError("Inserisci un indirizzo email");
      return;
    }

    if (!isValidEmail(recipientEmail.trim())) {
      setEmailError("Inserisci un indirizzo email valido");
      return;
    }

    if (!jobCollectionId) {
      toast.error("Job Collection non trovata");
      return;
    }

    try {
      const result = await sendToClient({
        id: jobCollectionId,
        email: recipientEmail.trim(),
      }).unwrap();

      toast.success(
        `Job Collection inviata con successo a ${result.email_sent_to}`,
        { duration: 5000 }
      );

      if (result.warning) {
        toast.error(result.warning, { duration: 8000 });
      }

      handleCloseSendModal();
      window.location.reload();
    } catch (error: any) {
      console.error("Errore invio al cliente:", error);
      toast.error(error?.data?.error || "Errore durante l'invio al cliente");
    }
  };

  const handleWizardClose = () => {
    setIsWizardOpen(false);
    window.location.reload();
  };

  const handlePreviewClose = () => {
    setIsPreviewOpen(false);
  };

  const handleJobCollectionCreated = useCallback((newId: number) => {
    window.location.reload();
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bigster-surface border border-bigster-border"
    >

      <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-bigster-text">
              Raccolta Job Description
            </h2>
            <p className="text-xs text-bigster-text-muted">
              {tipo === JobDescriptionType.DO
                ? "Dentist Organizer (DO)"
                : "Assistente di Studio Odontoiatrico (ASO)"}
            </p>
          </div>

          {hasExistingData && (
            <div className="flex items-center gap-2">
              {existingJobCollection?.approvata_dal_cliente ? (
                <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold">
                  <CheckCircle2 className="h-3 w-3" />
                  Approvata
                </span>
              ) : existingJobCollection?.inviata_al_cliente ? (
                <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold">
                  <Clock className="h-3 w-3" />
                  In attesa approvazione
                </span>
              ) : (
                <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold">
                  <Clock className="h-3 w-3" />
                  Bozza
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {(isLoading || isLoadingJson) && (
          <div className="text-center py-12">
            <Spinner className="h-8 w-8 mx-auto mb-4 text-bigster-primary" />
            <p className="text-sm text-bigster-text-muted">
              {isLoadingJson
                ? "Caricamento dati salvati..."
                : "Verifica dati esistenti..."}
            </p>
          </div>
        )}

        {error && !isLoading && !isLoadingJson && (
          <div className="p-4 bg-red-50 border border-red-200 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">
                  Errore nel caricamento
                </p>
                <p className="text-xs text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !isLoadingJson && isWizardOpen && (
          <JobDescriptionWizard
            selectionId={selection.id}
            companyName={selection.company?.nome}
            figuraProfessionale={selection.figura_ricercata || ""}
            initialData={initialFormData || undefined}
            jobCollectionId={jobCollectionId || undefined}
            hasExistingJson={hasJsonData}
            onClose={handleWizardClose}
            onJobCollectionCreated={handleJobCollectionCreated}
          />
        )}

        {!isLoading && !isLoadingJson && !isWizardOpen && (
          <>
            {hasExistingData ? (
              <div className="space-y-4">
                <div className="p-5 bg-bigster-card-bg border border-bigster-border">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                        Creata il
                      </p>
                      <p className="text-sm font-medium text-bigster-text">
                        {existingJobCollection?.data_creazione
                          ? new Date(
                            existingJobCollection.data_creazione
                          ).toLocaleDateString("it-IT")
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                        Ultima modifica
                      </p>
                      <p className="text-sm font-medium text-bigster-text">
                        {existingJobCollection?.data_modifica
                          ? new Date(
                            existingJobCollection.data_modifica
                          ).toLocaleDateString("it-IT")
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                        PDF Generato
                      </p>
                      <p className="text-sm font-medium text-bigster-text">
                        {hasPdf ? (
                          <span className="text-green-600">Sì</span>
                        ) : (
                          <span className="text-yellow-600">No</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {existingJobCollection?.inviata_al_cliente && (
                    <div className="pt-4 border-t border-bigster-border">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                            Inviata al cliente
                          </p>
                          <p className="text-sm font-medium text-bigster-text">
                            {existingJobCollection.data_invio_cliente
                              ? new Date(
                                existingJobCollection.data_invio_cliente
                              ).toLocaleDateString("it-IT", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                              : "Sì"}
                          </p>
                        </div>
                        {existingJobCollection.approvata_dal_cliente && (
                          <div>
                            <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                              Approvata il
                            </p>
                            <p className="text-sm font-medium text-green-600">
                              {existingJobCollection.data_approvazione_cliente
                                ? new Date(
                                  existingJobCollection.data_approvazione_cliente
                                ).toLocaleDateString("it-IT")
                                : "Sì"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {needsStatusChange &&
                  hasPdf &&
                  !existingJobCollection?.inviata_al_cliente && (
                    <div className="p-4 bg-blue-50 border border-blue-200">
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-blue-800 mb-1">
                            Prima Call richiesta
                          </p>
                          <p className="text-xs text-blue-700">
                            Per inviare la Job Description al cliente, devi
                            prima confermare di aver completato la prima call
                            con lo studio. Clicca su "Invia al Cliente" per
                            procedere.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                <div className="flex items-center gap-3">
                  {isEditable && (
                    <Button
                      onClick={() => setIsWizardOpen(true)}
                      className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      {hasJsonData ? "Modifica" : "Compila Dati"}
                    </Button>
                  )}

                  <Button
                    onClick={handleViewPdf}
                    disabled={!hasJsonData || !initialFormData}
                    variant="outline"
                    className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg disabled:opacity-50"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizza PDF
                  </Button>

                  {isEditable && !existingJobCollection?.inviata_al_cliente && (
                    <Button
                      onClick={handleSendClick}
                      disabled={!hasPdf || isSending}
                      variant="outline"
                      className="rounded-none border border-blue-400 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Invia al Cliente
                    </Button>
                  )}

                  {isEditable &&
                    existingJobCollection?.inviata_al_cliente &&
                    !existingJobCollection?.approvata_dal_cliente && (
                      <Button
                        onClick={handleOpenSendModal}
                        disabled={!hasPdf || isSending}
                        variant="outline"
                        className="rounded-none border border-orange-400 text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Invia Nuovamente
                      </Button>
                    )}
                </div>

                {!hasPdf && isEditable && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <p className="text-xs text-yellow-800">
                        Genera il PDF dall'anteprima prima di poterlo inviare al
                        cliente
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-bigster-text-muted mx-auto mb-4" />
                <h3 className="text-base font-semibold text-bigster-text mb-2">
                  Nessuna Raccolta Job Presente
                </h3>
                <p className="text-sm text-bigster-text-muted mb-6 max-w-md mx-auto">
                  {isEditable
                    ? "Avvia la compilazione della Job Description per questa selezione."
                    : "La raccolta job verrà compilata dalla risorsa HR assegnata."}
                </p>

                {isEditable && (
                  <Button
                    onClick={() => setIsWizardOpen(true)}
                    className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Avvia Raccolta Job
                  </Button>
                )}

                {!isEditable && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 inline-block">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <p className="text-xs text-yellow-800">
                        La modifica è disponibile solo negli stati "HR
                        Assegnata" e "Prima Call Completata"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>


      {isPreviewOpen && initialFormData && (
        <JobDescriptionPreview
          formData={initialFormData}
          tipo={tipo}
          companyName={selection.company?.nome}
          selectionId={selection.id}
          onClose={handlePreviewClose}
          onUploadSuccess={handlePreviewClose}
          jobCollectionId={jobCollectionId || undefined}
          mode="preview"
        />
      )}


      {isChangeStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleCloseChangeStatusModal}
          />

          <div className="relative bg-bigster-surface border border-bigster-border w-full max-w-lg mx-4 shadow-xl">

            <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-bigster-text" />
                <h3 className="text-lg font-bold text-bigster-text">
                  Conferma Prima Call
                </h3>
              </div>
              <button
                onClick={handleCloseChangeStatusModal}
                className="p-1 hover:bg-bigster-muted-bg transition-colors"
                disabled={isChangingStatus}
              >
                <X className="h-5 w-5 text-bigster-text-muted" />
              </button>
            </div>


            <div className="p-6 space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800 mb-1">
                      Azione richiesta
                    </p>
                    <p className="text-xs text-blue-700">
                      Per inviare la Job Description al cliente, devi prima
                      confermare di aver completato la{" "}
                      <strong>prima call</strong> con lo studio dentistico.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-bigster-text">
                  Confermando, lo stato della selezione passerà da:
                </p>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 text-sm font-semibold">
                    HR Assegnata
                  </span>
                  <ArrowRight className="h-4 w-4 text-bigster-text-muted" />
                  <span className="px-3 py-1.5 bg-green-100 text-green-800 text-sm font-semibold">
                    Prima Call Completata
                  </span>
                </div>

                <p className="text-xs text-bigster-text-muted">
                  Dopo la conferma, potrai procedere con l'invio della Job
                  Description al cliente per l'approvazione.
                </p>
              </div>

              <div className="p-3 bg-bigster-card-bg border border-bigster-border">
                <p className="text-xs text-bigster-text-muted">
                  <strong>Nota:</strong> Assicurati di aver discusso con il
                  cliente tutte le informazioni presenti nella Job Description
                  durante la call.
                </p>
              </div>
            </div>


            <div className="px-6 py-4 border-t border-bigster-border bg-bigster-card-bg flex items-center justify-end gap-3">
              <Button
                onClick={handleCloseChangeStatusModal}
                disabled={isChangingStatus}
                variant="outline"
                className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
              >
                Annulla
              </Button>
              <Button
                onClick={handleConfirmStatusChange}
                disabled={isChangingStatus}
                className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90"
              >
                {isChangingStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Aggiornamento...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Conferma e Procedi
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}


      {isSendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleCloseSendModal}
          />

          <div className="relative bg-bigster-surface border border-bigster-border w-full max-w-md mx-4 shadow-xl">
            <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-bigster-text" />
                <h3 className="text-lg font-bold text-bigster-text">
                  Invia al Cliente
                </h3>
              </div>
              <button
                onClick={handleCloseSendModal}
                className="p-1 hover:bg-bigster-muted-bg transition-colors"
                disabled={isSending}
              >
                <X className="h-5 w-5 text-bigster-text-muted" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-bigster-text">
                Inserisci l'indirizzo email a cui inviare la Job Description per{" "}
                <strong>{selection.company?.nome}</strong>.
              </p>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-bigster-text">
                  Email destinatario *
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => {
                    setRecipientEmail(e.target.value);
                    setEmailError("");
                  }}
                  placeholder="esempio@email.com"
                  disabled={isSending}
                  className={`w-full rounded-none bg-bigster-surface border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors ${emailError ? "border-red-400" : "border-bigster-border"
                    }`}
                />
                {emailError && (
                  <p className="text-xs text-red-600">{emailError}</p>
                )}
              </div>

              <div className="p-3 bg-bigster-card-bg border border-bigster-border">
                <p className="text-xs text-bigster-text-muted">
                  Il documento PDF della Job Description verrà allegato
                  all'email. Il destinatario riceverà anche le istruzioni per
                  l'approvazione.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-bigster-border bg-bigster-card-bg flex items-center justify-end gap-3">
              <Button
                onClick={handleCloseSendModal}
                disabled={isSending}
                variant="outline"
                className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
              >
                Annulla
              </Button>
              <Button
                onClick={handleConfirmSend}
                disabled={isSending || !recipientEmail.trim()}
                className="rounded-none bg-blue-600 text-white border border-blue-500 hover:bg-blue-700 disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Invio in corso...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Invia Email
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
