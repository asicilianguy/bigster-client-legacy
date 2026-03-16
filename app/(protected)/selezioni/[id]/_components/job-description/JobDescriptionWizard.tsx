"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Save,
  Eye,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import {
  JobDescriptionType,
  JobDescriptionForm,
  WizardSection,
  WIZARD_STEPS,
  createDefaultJobDescriptionDO,
  createDefaultJobDescriptionASO,
} from "@/types/jobDescription";

import { useGenerateAndSavePdfMutation } from "@/lib/redux/features/job-collections/jobCollectionsApiSlice";

import { DatiAnagraficiSection } from "./sections/DatiAnagraficiSection";
import { StudioInfoSection } from "./sections/StudioInfoSection";
import { StrutturaSection } from "./sections/StrutturaSection";
import { ServiziSection } from "./sections/ServiziSection";
import { DigitalizzazioneSection } from "./sections/DigitalizzazioneSection";
import { SwotSection } from "./sections/SwotSection";
import { AttivitaSection } from "./sections/AttivitaSection";
import { CompetenzeHardSection } from "./sections/CompetenzeHardSection";
import { ConoscenzeTecnicheSection } from "./sections/ConoscenzeTecnicheSection";
import { SoftSkillsSection } from "./sections/SoftSkillsSection";
import { FormazioneSection } from "./sections/FormazioneSection";
import { OffertaSection } from "./sections/OffertaSection";
import { ChiusuraSection } from "./sections/ChiusuraSection";

import { JobDescriptionPreview } from "./JobDescriptionPreview";
import { useNotify } from "@/hooks/use-notify";

const inputBase =
  "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors";

interface JobDescriptionWizardProps {
  selectionId: number;
  companyName?: string;
  figuraProfessionale?: string;
  initialData?: Partial<JobDescriptionForm>;
  jobCollectionId?: number;
  hasExistingJson?: boolean;
  onClose?: () => void;
  onJobCollectionCreated?: (id: number) => void;
}

export function JobDescriptionWizard({
  selectionId,
  companyName,
  figuraProfessionale,
  initialData,
  jobCollectionId: initialJobCollectionId,
  hasExistingJson = false,
  onClose,
  onJobCollectionCreated,
}: JobDescriptionWizardProps) {
  const notify = useNotify();

  const [jobCollectionId, setJobCollectionId] = useState<number | undefined>(
    initialJobCollectionId
  );

  const initialTipo = useMemo(() => {
    if (initialData?.tipo) return initialData.tipo;
    const figuraLower = figuraProfessionale?.toLowerCase() || "";
    if (figuraLower.includes("aso") || figuraLower.includes("assistente")) {
      return JobDescriptionType.ASO;
    }
    return JobDescriptionType.DO;
  }, [initialData, figuraProfessionale]);

  const [tipo, setTipo] = useState<JobDescriptionType>(initialTipo);
  const [formData, setFormData] = useState<JobDescriptionForm>(() => {
    if (initialData && "tipo" in initialData) {
      return initialData as JobDescriptionForm;
    }
    return tipo === JobDescriptionType.DO
      ? createDefaultJobDescriptionDO()
      : createDefaultJobDescriptionASO();
  });
  const [currentSection, setCurrentSection] = useState<WizardSection>(
    WizardSection.DATI_ANAGRAFICI
  );
  const [completedSections, setCompletedSections] = useState<
    Set<WizardSection>
  >(new Set());
  const [showPreview, setShowPreview] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const initialFormDataRef = useRef<string>(JSON.stringify(formData));

  const [generateAndSavePdf, { isLoading: isSaving }] =
    useGenerateAndSavePdfMutation();

  useEffect(() => {
    const currentJson = JSON.stringify(formData);
    const isModified = currentJson !== initialFormDataRef.current;
    setIsDirty(isModified);

    if (isModified && saveSuccess) {
      setSaveSuccess(false);
    }
  }, [formData, saveSuccess]);

  const currentIndex = useMemo(
    () => WIZARD_STEPS.findIndex((s) => s.id === currentSection),
    [currentSection]
  );

  const updateFormData = useCallback(
    <K extends keyof JobDescriptionForm>(
      key: K,
      value: JobDescriptionForm[K]
    ) => {
      setFormData((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const updateNestedData = useCallback(
    <K extends keyof JobDescriptionForm>(
      key: K,
      nestedKey: string,
      value: any
    ) => {
      setFormData((prev) => ({
        ...prev,
        [key]: {
          ...(prev[key] as any),
          [nestedKey]: value,
        },
      }));
    },
    []
  );

  const goToSection = useCallback((section: WizardSection) => {
    setCurrentSection(section);
  }, []);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentSection(WIZARD_STEPS[currentIndex - 1].id);
    }
  }, [currentIndex]);

  const goToNext = useCallback(() => {
    if (currentIndex < WIZARD_STEPS.length - 1) {
      setCompletedSections((prev) => new Set([...prev, currentSection]));
      setCurrentSection(WIZARD_STEPS[currentIndex + 1].id);
    }
  }, [currentIndex, currentSection]);

  const handleSaveData = useCallback(async () => {
    try {
      const result = await generateAndSavePdf({
        selectionId,
        formData,
        companyName,
      }).unwrap();

      if (!jobCollectionId) {
        setJobCollectionId(result.id);
        onJobCollectionCreated?.(result.id);
      }

      setSaveSuccess(true);
      setIsDirty(false);
      initialFormDataRef.current = JSON.stringify(formData);

      notify.success(
        jobCollectionId
          ? "Dati e PDF aggiornati con successo!"
          : "Job Collection creata con successo!"
      );
    } catch (error: any) {
      console.error("Errore salvataggio:", error);
      notify.error(
        error?.data?.error || error?.message || "Errore durante il salvataggio"
      );
    }
  }, [
    formData,
    jobCollectionId,
    selectionId,
    companyName,
    generateAndSavePdf,
    onJobCollectionCreated,
    notify,
  ]);

  const handleTypeChange = useCallback(
    (newType: JobDescriptionType) => {
      if (newType === tipo) return;

      const commonData = {
        analisi_organizzativa: formData.analisi_organizzativa,
        offerta: formData.offerta,
        chiusura: formData.chiusura,
      };

      if (newType === JobDescriptionType.DO) {
        setFormData({
          ...createDefaultJobDescriptionDO(),
          ...commonData,
        });
      } else {
        setFormData({
          ...createDefaultJobDescriptionASO(),
          ...commonData,
        });
      }

      setTipo(newType);
    },
    [tipo, formData]
  );

  const handleUploadSuccess = useCallback(
    (newJobCollectionId?: number) => {
      initialFormDataRef.current = JSON.stringify(formData);
      setIsDirty(false);
      setSaveSuccess(true);

      if (newJobCollectionId && !jobCollectionId) {
        setJobCollectionId(newJobCollectionId);
        onJobCollectionCreated?.(newJobCollectionId);
      }
    },
    [formData, jobCollectionId, onJobCollectionCreated]
  );

  const renderCurrentSection = () => {
    const sectionProps = {
      formData,
      updateFormData,
      updateNestedData,
      tipo,
      inputBase,
    };

    switch (currentSection) {
      case WizardSection.DATI_ANAGRAFICI:
        return <DatiAnagraficiSection {...sectionProps} />;
      case WizardSection.STUDIO_INFO:
        return <StudioInfoSection {...sectionProps} />;
      case WizardSection.STRUTTURA:
        return <StrutturaSection {...sectionProps} />;
      case WizardSection.SERVIZI:
        return <ServiziSection {...sectionProps} />;
      case WizardSection.DIGITALIZZAZIONE:
        return <DigitalizzazioneSection {...sectionProps} />;
      case WizardSection.SWOT:
        return <SwotSection {...sectionProps} />;
      case WizardSection.ATTIVITA:
        return <AttivitaSection {...sectionProps} />;
      case WizardSection.COMPETENZE_HARD:
        return <CompetenzeHardSection {...sectionProps} />;
      case WizardSection.CONOSCENZE_TECNICHE:
        return <ConoscenzeTecnicheSection {...sectionProps} />;
      case WizardSection.SOFT_SKILLS:
        return <SoftSkillsSection {...sectionProps} />;
      case WizardSection.FORMAZIONE:
        return <FormazioneSection {...sectionProps} />;
      case WizardSection.OFFERTA:
        return <OffertaSection {...sectionProps} />;
      case WizardSection.CHIUSURA:
        return <ChiusuraSection {...sectionProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="border border-bigster-border bg-bigster-surface">

      <div className="px-6 py-4 border-b border-bigster-border bg-bigster-card-bg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-bigster-text">
              Job Description Wizard
            </h2>
            <p className="text-xs text-bigster-text-muted">
              {companyName && false && `${companyName} • `}
              Compilazione guidata della raccolta job
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-bigster-text-muted mr-2">
              TIPO:
            </span>
            <div className="flex">
              <Button
                onClick={() => handleTypeChange(JobDescriptionType.DO)}
                className={`rounded-none px-4 py-2 text-xs font-semibold ${tipo === JobDescriptionType.DO
                    ? "bg-bigster-primary text-bigster-primary-text border-2 border-yellow-200"
                    : "bg-bigster-surface text-bigster-text border border-bigster-border hover:bg-bigster-muted-bg"
                  }`}
              >
                DO
              </Button>
              <Button
                onClick={() => handleTypeChange(JobDescriptionType.ASO)}
                className={`rounded-none px-4 py-2 text-xs font-semibold ${tipo === JobDescriptionType.ASO
                    ? "bg-bigster-primary text-bigster-primary-text border-2 border-yellow-200"
                    : "bg-bigster-surface text-bigster-text border border-bigster-border hover:bg-bigster-muted-bg"
                  }`}
              >
                ASO
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 border-b border-bigster-border bg-bigster-muted-bg">
        <div className="flex items-center gap-1 overflow-x-auto">
          {WIZARD_STEPS.map((step, index) => {
            const isActive = step.id === currentSection;
            const isCompleted = completedSections.has(step.id);
            const isPast = index < currentIndex;

            return (
              <button
                key={step.id}
                onClick={() => goToSection(step.id)}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${isActive
                    ? "bg-bigster-primary text-bigster-primary-text"
                    : isPast || isCompleted
                      ? "bg-bigster-card-bg text-bigster-text hover:bg-bigster-border"
                      : "bg-transparent text-bigster-text-muted hover:bg-bigster-card-bg"
                  }`}
              >
                {(isPast || isCompleted) && !isActive && (
                  <Check className="h-3 w-3" />
                )}
                <span>{step.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 py-3 border-b border-bigster-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-bigster-primary flex items-center justify-center">
            <span className="text-sm font-bold text-bigster-primary-text">
              {currentIndex + 1}
            </span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-bigster-text">
              {WIZARD_STEPS[currentIndex]?.label}
            </h3>
            <p className="text-xs text-bigster-text-muted">
              {getStepDescription(currentSection, tipo)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderCurrentSection()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-6 py-4 border-t border-bigster-border bg-bigster-card-bg">
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <Button
              onClick={handleSaveData}
              disabled={!isDirty || isSaving}
              variant="outline"
              className={`rounded-none border-2 ${saveSuccess
                  ? "border-green-400 text-green-600 bg-green-50"
                  : isDirty
                    ? "border-purple-400 text-purple-600 hover:bg-purple-50"
                    : "border-bigster-border text-bigster-text-muted"
                }`}
            >
              {isSaving ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Salvataggio...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Salvato
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salva Dati
                </>
              )}
            </Button>

            <span className="text-xs text-bigster-text-muted">
              {!isDirty ? (
                "Nessuna modifica da salvare"
              ) : (
                <span className="text-purple-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {jobCollectionId
                    ? "Hai modifiche non salvate"
                    : "Salva per creare la Job Collection"}
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3">

            <div className="flex items-center">
              <Button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                variant="outline"
                className="rounded-none border border-bigster-border bg-bigster-surface text-bigster-text hover:bg-bigster-muted-bg disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Indietro
              </Button>
              <Button
                onClick={goToNext}
                disabled={currentIndex === WIZARD_STEPS.length - 1}
                className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90"
              >
                Avanti
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {currentIndex === WIZARD_STEPS.length - 1 && (
              <Button
                onClick={() => setShowPreview(true)}
                className="rounded-none bg-green-600 text-white border border-green-500 hover:bg-green-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                Anteprima
              </Button>
            )}
          </div>
        </div>
      </div>

      {showPreview && (
        <JobDescriptionPreview
          formData={formData}
          tipo={tipo}
          companyName={companyName}
          onClose={() => setShowPreview(false)}
          selectionId={selectionId}
          onUploadSuccess={handleUploadSuccess}
          jobCollectionId={jobCollectionId}
          mode="upload"
        />
      )}
    </div>
  );
}

function getStepDescription(
  section: WizardSection,
  tipo: JobDescriptionType
): string {
  const descriptions: Record<WizardSection, string> = {
    [WizardSection.DATI_ANAGRAFICI]:
      "Inserisci i dati anagrafici dello studio del cliente.",
    [WizardSection.STUDIO_INFO]:
      "Raccogli informazioni sulla storia e l'evoluzione dello studio.",
    [WizardSection.STRUTTURA]:
      "Definisci la struttura organizzativa attuale con dipendenti e collaboratori.",
    [WizardSection.SERVIZI]:
      "Indica i servizi offerti, la distribuzione e il fatturato.",
    [WizardSection.DIGITALIZZAZIONE]:
      "Mappa il livello di digitalizzazione dello studio.",
    [WizardSection.SWOT]:
      "Identifica punti di forza, debolezze, obiettivi e tratti distintivi.",
    [WizardSection.ATTIVITA]:
      tipo === JobDescriptionType.DO
        ? "Seleziona le attività che il Dentist Organizer dovrà gestire."
        : "Seleziona le attività che l'ASO dovrà svolgere.",
    [WizardSection.COMPETENZE_HARD]:
      "Indica le competenze hard rilevanti per il ruolo.",
    [WizardSection.CONOSCENZE_TECNICHE]:
      "Specifica le conoscenze tecniche richieste.",
    [WizardSection.SOFT_SKILLS]:
      "Seleziona le caratteristiche personali e soft skills desiderate.",
    [WizardSection.FORMAZIONE]:
      "Definisci i requisiti di formazione, esperienza e lingue.",
    [WizardSection.OFFERTA]:
      "Compila i dettagli dell'offerta contrattuale e dei benefit.",
    [WizardSection.CHIUSURA]:
      "Aggiungi note finali, canali di recruiting e firma.",
  };

  return descriptions[section] || "";
}

export default JobDescriptionWizard;
