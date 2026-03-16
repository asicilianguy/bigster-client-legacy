"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Save, AlertCircle, Package, Plus, Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import {
  useGetBigsterProfilesQuery,
  useCreateBigsterProfileMutation,
} from "@/lib/redux/features/bigster";
import { toast } from "sonner";

interface SelectionFormProps {
  onSubmit: (data: {
    titolo: string;
    pacchetto: "BASE" | "MDO";
    figura_ricercata: string;
  }) => Promise<void>;
  isLoading: boolean;
}

const inputBase =
  "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-2 text-sm transition-colors";

export default function SelectionForm({
  onSubmit,
  isLoading,
}: SelectionFormProps) {

  const [titolo, setTitolo] = useState("");
  const [pacchetto, setPacchetto] = useState<"BASE" | "MDO">("BASE");
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [error, setError] = useState("");

  const [showNewProfileForm, setShowNewProfileForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileError, setNewProfileError] = useState("");

  const {
    data: profiles,
    isLoading: isLoadingProfiles,
    refetch: refetchProfiles,
  } = useGetBigsterProfilesQuery();

  const [createBigsterProfile, { isLoading: isCreatingProfile }] =
    useCreateBigsterProfileMutation();

  const profileOptions = useMemo(
    () =>
      (profiles || []).map((p) => ({
        value: p.id.toString(),
        label: p.name,
      })),
    [profiles]
  );

  const selectedProfileName = useMemo(() => {
    if (!selectedProfileId || !profiles) return "";
    const found = profiles.find((p) => p.id.toString() === selectedProfileId);
    return found ? found.name : "";
  }, [selectedProfileId, profiles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titolo.trim()) {
      setError("Il titolo è obbligatorio");
      return;
    }

    if (titolo.length < 3) {
      setError("Il titolo deve contenere almeno 3 caratteri");
      return;
    }

    if (titolo.length > 200) {
      setError("Il titolo non può superare i 200 caratteri");
      return;
    }

    if (!selectedProfileId) {
      setError("Seleziona un profilo professionale BigsTer");
      return;
    }

    setError("");
    await onSubmit({
      titolo: titolo.trim(),
      pacchetto,
      figura_ricercata: selectedProfileName,
    });
  };

  const handleCreateProfile = async () => {
    const trimmed = newProfileName.trim();

    if (!trimmed) {
      setNewProfileError("Il nome del profilo è obbligatorio");
      return;
    }

    if (trimmed.length < 2) {
      setNewProfileError("Il nome deve contenere almeno 2 caratteri");
      return;
    }

    const duplicate = profiles?.find(
      (p) => p.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setNewProfileError(`Esiste già un profilo con nome "${duplicate.name}"`);
      return;
    }

    setNewProfileError("");

    try {
      const result = await createBigsterProfile({ name: trimmed }).unwrap();

      toast.success("Profilo creato con successo!", {
        description: `"${trimmed}" è ora disponibile`,
      });

      await refetchProfiles();

      if (result?.data?.id) {
        setSelectedProfileId(result.data.id.toString());
      }

      setNewProfileName("");
      setShowNewProfileForm(false);
    } catch (err: any) {
      const message =
        err?.data?.error || "Errore nella creazione del profilo";
      setNewProfileError(message);
      toast.error("Errore creazione profilo", { description: message });
    }
  };

  const handleCancelNewProfile = () => {
    setShowNewProfileForm(false);
    setNewProfileName("");
    setNewProfileError("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-bigster-card border border-bigster-border rounded-none">
        <CardHeader className="bg-bigster-card-bg border-b border-bigster-border">
          <CardTitle className="text-lg font-semibold text-bigster-text">
            Dettagli Selezione
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label
                htmlFor="titolo"
                className="block text-sm font-semibold text-bigster-text mb-2"
              >
                Titolo della Selezione
                <span className="text-red-600 ml-1">*</span>
              </label>
              <input
                type="text"
                id="titolo"
                value={titolo}
                onChange={(e) => {
                  setTitolo(e.target.value);
                  setError("");
                }}
                placeholder="Es: Ricerca Odontoiatra Senior"
                className={`${inputBase} ${error && !titolo.trim() ? "border-red-400" : ""}`}
                disabled={isLoading}
                maxLength={200}
              />

              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-bigster-text-muted">
                  Minimo 3 caratteri, massimo 200
                </p>
                <p
                  className={`text-xs ${titolo.length > 200
                    ? "text-red-600"
                    : "text-bigster-text-muted"
                    }`}
                >
                  {titolo.length}/200
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-bigster-text mb-2">
                Profilo Professionale
                <span className="text-red-600 ml-1">*</span>
              </label>

              {isLoadingProfiles ? (
                <div className="flex items-center gap-2 p-3 bg-bigster-muted-bg border border-bigster-border">
                  <Spinner className="h-4 w-4" />
                  <span className="text-sm text-bigster-text-muted">
                    Caricamento profili...
                  </span>
                </div>
              ) : (
                <div className="space-y-3">

                  <SearchableSelect
                    value={selectedProfileId}
                    onChange={(value) => {
                      setSelectedProfileId(value);
                      setError("");
                    }}
                    options={profileOptions}
                    placeholder="Cerca profilo..."
                    emptyLabel="Seleziona profilo..."
                    disabled={isLoading}
                  />

                  {!showNewProfileForm ? (
                    <button
                      type="button"
                      onClick={() => setShowNewProfileForm(true)}
                      disabled={isLoading}
                      className="flex items-center gap-2 text-xs font-semibold text-bigster-text hover:text-bigster-primary-text transition-colors disabled:opacity-50"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Il profilo che cerchi non esiste? Creane uno nuovo
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-bigster-card-bg border border-bigster-border space-y-3"
                    >
                      <p className="text-xs font-semibold text-bigster-text">
                        Crea Nuovo Profilo
                      </p>
                      <input
                        type="text"
                        value={newProfileName}
                        onChange={(e) => {
                          setNewProfileName(e.target.value);
                          setNewProfileError("");
                        }}
                        placeholder="Es: Assistente alla Poltrona"
                        className={`${inputBase} ${newProfileError ? "border-red-400" : ""
                          }`}
                        disabled={isCreatingProfile}
                        maxLength={100}
                      />
                      {newProfileError && (
                        <div className="flex items-center gap-2 text-xs text-red-600">
                          <AlertCircle className="h-3 w-3 flex-shrink-0" />
                          <span>{newProfileError}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          onClick={handleCreateProfile}
                          disabled={
                            isCreatingProfile || !newProfileName.trim()
                          }
                          size="sm"
                          className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 text-xs disabled:opacity-50"
                        >
                          {isCreatingProfile ? (
                            <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3 mr-1.5" />
                          )}
                          Crea Profilo
                        </Button>
                        <Button
                          type="button"
                          onClick={handleCancelNewProfile}
                          disabled={isCreatingProfile}
                          variant="outline"
                          size="sm"
                          className="rounded-none border border-bigster-border text-xs hover:bg-bigster-muted-bg"
                        >
                          Annulla
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-bigster-text mb-3">
                Tipo di Pacchetto
                <span className="text-red-600 ml-1">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPacchetto("BASE")}
                  disabled={isLoading}
                  className={`p-4 border transition-all text-left rounded-none ${pacchetto === "BASE"
                    ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                    : "bg-bigster-surface text-bigster-text border-bigster-border hover:border-bigster-text-muted"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-base mb-1">Base</p>
                      <p
                        className={`text-xs ${pacchetto === "BASE"
                          ? "text-bigster-primary-text/80"
                          : "text-bigster-text-muted"
                          }`}
                      >
                        Pacchetto standard per selezioni base
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPacchetto("MDO")}
                  disabled={isLoading}
                  className={`p-4 border transition-all text-left rounded-none ${pacchetto === "MDO"
                    ? "bg-bigster-primary text-bigster-primary-text border-yellow-200"
                    : "bg-bigster-surface text-bigster-text border-bigster-border hover:border-bigster-text-muted"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-base mb-1">MDO</p>
                      <p
                        className={`text-xs ${pacchetto === "MDO"
                          ? "text-bigster-primary-text/80"
                          : "text-bigster-text-muted"
                          }`}
                      >
                        Pacchetto avanzato Master DTO
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 border border-red-400 bg-red-50 rounded-none"
              >
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}

            <div className="p-4 bg-bigster-card-bg border border-bigster-border rounded-none">
              <h4 className="text-sm font-semibold text-bigster-text mb-2">
                Riepilogo:
              </h4>
              <ul className="space-y-1 text-sm text-bigster-text-muted">
                <li>
                  Il titolo sarà visibile in tutte le comunicazioni relative a
                  questa selezione
                </li>
                <li>
                  Il profilo BigsTer determina i criteri di valutazione
                  psicologica applicati ai candidati
                </li>
                <li>
                  Il tipo di pacchetto determina le funzionalità e i servizi
                  disponibili
                </li>
                <li>
                  Entrambi i campi potranno essere modificati successivamente
                </li>
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-bigster-border">
              <Button
                type="submit"
                disabled={isLoading || !titolo.trim() || !selectedProfileId}
                className="rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Creazione in corso...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Crea Selezione
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
