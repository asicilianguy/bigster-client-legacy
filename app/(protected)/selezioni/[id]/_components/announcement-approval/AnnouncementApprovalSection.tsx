"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Edit3,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  X,
  ThumbsUp,
  ThumbsDown,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SelectionDetail, SelectionStatus } from "@/types/selection";
import { WysiwygEditor } from "./WysiwygEditor";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  useGetAnnouncementApprovalBySelectionIdQuery,
  useCreateAnnouncementApprovalMutation,
  useUpdateAnnouncementApprovalMutation,
  useApproveAnnouncementApprovalMutation,
  useDeleteAnnouncementApprovalMutation,
} from "@/lib/redux/features/announcement-approvals/announcementApprovalsApiSlice";
import { useUserRole } from "@/hooks/use-user-role";
import { toast } from "sonner";

interface AnnouncementApprovalSectionProps {
  selection: SelectionDetail;
}

const VISIBLE_STATES = [
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
  SelectionStatus.RACCOLTA_JOB_APPROVATA_CLIENTE,
  SelectionStatus.BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO,
];

const APPROVAL_STATES = [SelectionStatus.BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO];

export function AnnouncementApprovalSection({
  selection,
}: AnnouncementApprovalSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [markdownContent, setMarkdownContent] = useState("");
  const [approvalNote, setApprovalNote] = useState("");
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<
    "approve" | "reject" | null
  >(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { isCEO, isDeveloper, isResponsabileHR } = useUserRole();
  const canApprove = isCEO || isDeveloper;
  const canDelete = isCEO || isDeveloper || isResponsabileHR;

  const isVisible = VISIBLE_STATES.includes(selection.stato as SelectionStatus);
  const isEditable = EDITABLE_STATES.includes(
    selection.stato as SelectionStatus
  );
  const canApproveNow = APPROVAL_STATES.includes(
    selection.stato as SelectionStatus
  );

  const {
    data: existingApproval,
    isLoading,
    error,
    refetch,
  } = useGetAnnouncementApprovalBySelectionIdQuery(selection.id, {
    skip: !isVisible,
  });

  const [createApproval, { isLoading: isCreating }] =
    useCreateAnnouncementApprovalMutation();
  const [updateApproval, { isLoading: isUpdating }] =
    useUpdateAnnouncementApprovalMutation();
  const [approveApproval, { isLoading: isApproving }] =
    useApproveAnnouncementApprovalMutation();
  const [deleteApproval, { isLoading: isDeleting }] =
    useDeleteAnnouncementApprovalMutation();

  useEffect(() => {
    if (existingApproval?.testo_markdown) {
      setMarkdownContent(existingApproval.testo_markdown);
    }
  }, [existingApproval]);

  const handleCreate = async () => {
    if (!markdownContent.trim()) {
      toast.error("Inserisci il contenuto della bozza");
      return;
    }

    try {
      await createApproval({
        selezione_id: selection.id,
        testo_markdown: markdownContent,
      }).unwrap();

      toast.success("Bozza annuncio creata e inviata per approvazione");
      setIsEditing(false);
      refetch();
    } catch (error: any) {
      console.error("Errore creazione bozza:", error);
      toast.error(error?.data?.error || "Errore nella creazione della bozza");
    }
  };

  const handleUpdate = async () => {
    if (!existingApproval) return;
    if (!markdownContent.trim()) {
      toast.error("Inserisci il contenuto della bozza");
      return;
    }

    try {
      await updateApproval({
        id: existingApproval.id,
        selezione_id: selection.id,
        testo_markdown: markdownContent,
      }).unwrap();

      toast.success("Bozza annuncio aggiornata");
      setIsEditing(false);
      refetch();
    } catch (error: any) {
      console.error("Errore aggiornamento bozza:", error);
      toast.error(
        error?.data?.error || "Errore nell'aggiornamento della bozza"
      );
    }
  };

  const handleApprove = async (approved: boolean) => {
    if (!existingApproval) return;

    try {
      await approveApproval({
        id: existingApproval.id,
        selezione_id: selection.id,
        approvato: approved,
        note_approvazione: approvalNote.trim() || null,
      }).unwrap();

      toast.success(
        approved
          ? "Bozza annuncio approvata!"
          : "Richiesta modifiche inviata all'HR"
      );
      setIsApprovalModalOpen(false);
      setApprovalNote("");
      setApprovalAction(null);
      refetch();
    } catch (error: any) {
      console.error("Errore approvazione:", error);
      toast.error(error?.data?.error || "Errore durante l'approvazione");
    }
  };

  const handleDelete = async () => {
    if (!existingApproval) return;

    try {
      await deleteApproval({
        id: existingApproval.id,
        selezione_id: selection.id,
      }).unwrap();

      toast.success("Bozza annuncio eliminata");
      setIsDeleteModalOpen(false);
      setMarkdownContent("");
      refetch();
    } catch (error: any) {
      console.error("Errore eliminazione:", error);
      toast.error(error?.data?.error || "Errore nell'eliminazione della bozza");
    }
  };

  const openApprovalModal = (action: "approve" | "reject") => {
    setApprovalAction(action);
    setApprovalNote("");
    setIsApprovalModalOpen(true);
  };

  if (!isVisible) return null;

  const hasExistingApproval = !!existingApproval && !error;
  const isApproved = existingApproval?.approvato === true;

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
              Bozza Annuncio
            </h2>
            <p className="text-xs text-bigster-text-muted">
              Testo dell'annuncio da pubblicare
            </p>
          </div>

          {hasExistingApproval && (
            <div className="flex items-center gap-2">
              {isApproved ? (
                <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold">
                  <CheckCircle2 className="h-3 w-3" />
                  Approvata dal CEO
                </span>
              ) : (
                <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold">
                  <Clock className="h-3 w-3" />
                  In attesa approvazione CEO
                </span>
              )}
            </div>
          )}
        </div>
      </div>


      <div className="p-6">
        {isLoading && (
          <div className="text-center py-12">
            <Spinner className="h-8 w-8 mx-auto mb-4 text-bigster-primary" />
            <p className="text-sm text-bigster-text-muted">
              Caricamento bozza...
            </p>
          </div>
        )}

        {!isLoading && !isEditing && (
          <>
            {hasExistingApproval ? (
              <div className="space-y-4">

                <div className="p-5 bg-bigster-card-bg border border-bigster-border">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                        Data Richiesta
                      </p>
                      <p className="text-sm font-medium text-bigster-text">
                        {existingApproval.data_richiesta
                          ? new Date(
                            existingApproval.data_richiesta
                          ).toLocaleDateString("it-IT", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : "-"}
                      </p>
                    </div>
                    {isApproved && existingApproval.data_approvazione && (
                      <div>
                        <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                          Approvata il
                        </p>
                        <p className="text-sm font-medium text-green-600">
                          {new Date(
                            existingApproval.data_approvazione
                          ).toLocaleDateString("it-IT", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  {existingApproval.note_approvazione && (
                    <div className="pt-4 border-t border-bigster-border">
                      <p className="text-xs font-semibold text-bigster-text-muted uppercase mb-2">
                        Note CEO
                      </p>
                      <p className="text-sm text-bigster-text">
                        {existingApproval.note_approvazione}
                      </p>
                    </div>
                  )}
                </div>


                <div className="border border-bigster-border">
                  <div className="px-4 py-2 border-b border-bigster-border bg-bigster-card-bg">
                    <p className="text-xs font-semibold text-bigster-text-muted uppercase">
                      Anteprima Annuncio
                    </p>
                  </div>
                  <div className="p-4 markdown-preview max-h-96 overflow-auto">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {existingApproval.testo_markdown}
                    </ReactMarkdown>
                  </div>
                </div>


                <div className="flex items-center gap-3 flex-wrap">

                  {isEditable && !isApproved && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Modifica Bozza
                    </Button>
                  )}


                  {canApprove && canApproveNow && !isApproved && (
                    <>
                      <Button
                        onClick={() => openApprovalModal("approve")}
                        className="rounded-none bg-green-600 text-white border border-green-500 hover:bg-green-700"
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Approva
                      </Button>
                      <Button
                        onClick={() => openApprovalModal("reject")}
                        variant="outline"
                        className="rounded-none border border-red-400 text-red-600 hover:bg-red-50"
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        Richiedi Modifiche
                      </Button>
                    </>
                  )}


                  {canDelete && !isApproved && (
                    <Button
                      onClick={() => setIsDeleteModalOpen(true)}
                      variant="outline"
                      className="rounded-none border border-red-400 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Elimina
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-bigster-text-muted mx-auto mb-4" />
                <h3 className="text-base font-semibold text-bigster-text mb-2">
                  Nessuna Bozza Annuncio
                </h3>
                <p className="text-sm text-bigster-text-muted mb-6 max-w-md mx-auto">
                  {isEditable
                    ? "Crea la bozza dell'annuncio di lavoro da inviare per approvazione al CEO."
                    : "La bozza dell'annuncio verrà creata dalla risorsa HR assegnata."}
                </p>

                {isEditable &&
                  selection.stato ===
                  SelectionStatus.RACCOLTA_JOB_APPROVATA_CLIENTE && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Crea Bozza Annuncio
                    </Button>
                  )}

                {!isEditable && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 inline-block">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <p className="text-xs text-yellow-800">
                        La bozza può essere creata solo dopo l'approvazione
                        della Job Description
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {!isLoading && isEditing && (
          <div className="space-y-4">
            <WysiwygEditor
              value={markdownContent}
              onChange={setMarkdownContent}
              placeholder="Scrivi il contenuto dell'annuncio di lavoro..."
              disabled={isCreating || isUpdating}
            />

            <div className="flex items-center justify-end gap-3">
              <Button
                onClick={() => {
                  setIsEditing(false);
                  if (existingApproval) {
                    setMarkdownContent(existingApproval.testo_markdown);
                  }
                }}
                disabled={isCreating || isUpdating}
                variant="outline"
                className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
              >
                Annulla
              </Button>
              <Button
                onClick={hasExistingApproval ? handleUpdate : handleCreate}
                disabled={isCreating || isUpdating || !markdownContent.trim()}
                className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90"
              >
                {isCreating || isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvataggio...
                  </>
                ) : hasExistingApproval ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Aggiorna Bozza
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Invia per Approvazione
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {isApprovalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsApprovalModalOpen(false)}
          />

          <div className="relative bg-bigster-surface border border-bigster-border w-full max-w-lg mx-4 shadow-xl">
            <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg flex items-center justify-between">
              <div className="flex items-center gap-3">
                {approvalAction === "approve" ? (
                  <ThumbsUp className="h-5 w-5 text-green-600" />
                ) : (
                  <ThumbsDown className="h-5 w-5 text-red-600" />
                )}
                <h3 className="text-lg font-bold text-bigster-text">
                  {approvalAction === "approve"
                    ? "Approva Bozza"
                    : "Richiedi Modifiche"}
                </h3>
              </div>
              <button
                onClick={() => setIsApprovalModalOpen(false)}
                className="p-1 hover:bg-bigster-muted-bg transition-colors"
                disabled={isApproving}
              >
                <X className="h-5 w-5 text-bigster-text-muted" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-bigster-text">
                {approvalAction === "approve"
                  ? "Stai per approvare questa bozza annuncio. Una volta approvata, l'HR potrà procedere con la pubblicazione."
                  : "Stai per richiedere modifiche a questa bozza. L'HR riceverà una notifica e potrà modificare il contenuto."}
              </p>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-bigster-text">
                  Note (opzionale)
                </label>
                <textarea
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  placeholder={
                    approvalAction === "approve"
                      ? "Aggiungi eventuali note..."
                      : "Indica le modifiche richieste..."
                  }
                  disabled={isApproving}
                  rows={4}
                  className="w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-bigster-border bg-bigster-card-bg flex items-center justify-end gap-3">
              <Button
                onClick={() => setIsApprovalModalOpen(false)}
                disabled={isApproving}
                variant="outline"
                className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
              >
                Annulla
              </Button>
              <Button
                onClick={() => handleApprove(approvalAction === "approve")}
                disabled={isApproving}
                className={`rounded-none ${approvalAction === "approve"
                  ? "bg-green-600 text-white border border-green-500 hover:bg-green-700"
                  : "bg-red-600 text-white border border-red-500 hover:bg-red-700"
                  }`}
              >
                {isApproving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Elaborazione...
                  </>
                ) : approvalAction === "approve" ? (
                  <>
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Conferma Approvazione
                  </>
                ) : (
                  <>
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Richiedi Modifiche
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsDeleteModalOpen(false)}
          />

          <div className="relative bg-bigster-surface border border-bigster-border w-full max-w-md mx-4 shadow-xl">
            <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trash2 className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-bold text-bigster-text">
                  Elimina Bozza
                </h3>
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="p-1 hover:bg-bigster-muted-bg transition-colors"
                disabled={isDeleting}
              >
                <X className="h-5 w-5 text-bigster-text-muted" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-bigster-text">
                Sei sicuro di voler eliminare questa bozza annuncio? Lo stato
                della selezione tornerà a "Raccolta Job Approvata" e l'HR dovrà
                creare una nuova bozza.
              </p>
            </div>

            <div className="px-6 py-4 border-t border-bigster-border bg-bigster-card-bg flex items-center justify-end gap-3">
              <Button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                variant="outline"
                className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg"
              >
                Annulla
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-none bg-red-600 text-white border border-red-500 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Eliminazione...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Elimina Bozza
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
