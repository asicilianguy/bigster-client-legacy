"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { StandardSelect } from "@/components/ui/StandardSelect";
import { CityAutocomplete } from "@/components/ui/CityAutocomplete";
import { useSubmitApplicationMutation } from "@/lib/redux/features/public/publicApiSlice";
import { CvUpload } from "./CvUpload";
import { useItalianGeography } from "@/hooks/useItalianGeography";
import { AttestatoAsoStatus } from "@/types/application";
import {
  User,
  Mail,
  Phone,
  Send,
  AlertCircle,
  Home,
  MapPin,
  Briefcase,
  Clock,
  Cake,
} from "lucide-react";

const applicationSchema = z
  .object({
    nome: z
      .string()
      .min(2, "Il nome deve contenere almeno 2 caratteri")
      .max(50, "Il nome non può superare 50 caratteri"),
    cognome: z
      .string()
      .min(2, "Il cognome deve contenere almeno 2 caratteri")
      .max(50, "Il cognome non può superare 50 caratteri"),
    email: z
      .string()
      .email("Inserisci un indirizzo email valido")
      .max(100, "L'email non può superare 100 caratteri"),
    telefono: z
      .string()
      .min(1, "Il telefono è obbligatorio")
      .max(30, "Il telefono non può superare 30 caratteri"),
    sesso: z
      .enum(["M", "F", "ALTRO", "NON_SPECIFICATO"])
      .nullable()
      .refine((val) => val !== null, { message: "Seleziona il genere" }),

    birthdate: z
      .string()
      .min(1, "La data di nascita è obbligatoria")
      .refine(
        (val) => {
          if (!val) return false;
          const date = new Date(val);
          if (isNaN(date.getTime())) return false;
          const age =
            (new Date().getTime() - date.getTime()) /
            (365.25 * 24 * 60 * 60 * 1000);
          return age >= 16 && age <= 100;
        },
        { message: "Devi avere almeno 16 anni e non più di 100 anni" }
      ),

    regione: z.string().min(1, "La regione è obbligatoria"),
    provincia: z.string().min(1, "La provincia è obbligatoria"),
    citta: z
      .string()
      .min(1, "Il comune è obbligatorio")
      .max(100, "Il comune non può superare 100 caratteri"),

    domicilio_diverso: z.boolean().optional(),
    domicilio_regione: z.string().optional().or(z.literal("")),
    domicilio_provincia: z.string().optional().or(z.literal("")),
    domicilio_citta: z.string().max(100).optional().or(z.literal("")),

    automunito: z
      .boolean()
      .nullable()
      .refine((val) => val !== null, {
        message: "Indica se sei automunito/a",
      }),
    disponibilita_trasferte: z
      .boolean()
      .nullable()
      .refine((val) => val !== null, {
        message: "Indica la tua disponibilità a trasferte",
      }),
    partita_iva: z
      .boolean()
      .nullable()
      .refine((val) => val !== null, {
        message: "Indica se possiedi Partita IVA",
      }),
    attestato_aso: z
      .nativeEnum(AttestatoAsoStatus)
      .nullable()
      .refine((val) => val !== null, {
        message: "Indica lo stato dell'attestato ASO",
      }),
    disponibilita_immediata: z
      .boolean()
      .nullable()
      .refine((val) => val !== null, {
        message: "Indica la tua disponibilità",
      }),
    preavviso_settimane: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : null))
      .pipe(
        z
          .number()
          .int()
          .min(1, "Il preavviso deve essere almeno 1 settimana")
          .max(52, "Il preavviso non può superare 52 settimane")
          .nullable()
      ),

    titoli_studio: z.string().min(1, "Il titolo di studio è obbligatorio"),

    privacy_consent: z.literal(true, {
      errorMap: () => ({
        message: "Devi accettare l'informativa sulla privacy",
      }),
    }),
  })
  .superRefine((data, ctx) => {

    if (data.domicilio_diverso) {
      if (!data.domicilio_regione) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La regione di domicilio è obbligatoria",
          path: ["domicilio_regione"],
        });
      }
      if (!data.domicilio_provincia) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La provincia di domicilio è obbligatoria",
          path: ["domicilio_provincia"],
        });
      }
      if (!data.domicilio_citta) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Il comune di domicilio è obbligatorio",
          path: ["domicilio_citta"],
        });
      }
    }

    if (data.disponibilita_immediata === false && !data.preavviso_settimane) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indica le settimane di preavviso",
        path: ["preavviso_settimane"],
      });
    }
  });

type ApplicationFormData = z.input<typeof applicationSchema>;

const inputBase =
  "w-full rounded-none bg-bigster-surface border border-bigster-border text-bigster-text placeholder:text-bigster-text-muted focus:outline-none focus:ring-0 focus:border-bigster-text px-4 py-3 text-sm transition-colors";

const labelBase = "block text-sm font-semibold text-bigster-text mb-1.5";

const errorBase = "text-xs text-red-600 mt-1 flex items-center gap-1";

const SESSO_OPTIONS = [
  { value: "M", label: "Maschio" },
  { value: "F", label: "Femmina" },
  { value: "ALTRO", label: "Altro" },
  { value: "NON_SPECIFICATO", label: "Non specificato" },
];

const TITOLI_STUDIO_OPTIONS = [
  { value: "Licenza media", label: "Licenza media" },
  {
    value: "Diploma di scuola superiore",
    label: "Diploma di scuola superiore",
  },
  { value: "Qualifica professionale", label: "Qualifica professionale" },
  { value: "Laurea triennale", label: "Laurea triennale" },
  { value: "Laurea magistrale", label: "Laurea magistrale" },
  { value: "Master di primo livello", label: "Master di primo livello" },
  { value: "Master di secondo livello", label: "Master di secondo livello" },
  { value: "Dottorato di ricerca", label: "Dottorato di ricerca" },
  { value: "Altro", label: "Altro" },
];

const ATTESTATO_ASO_OPTIONS = [
  { value: AttestatoAsoStatus.SI, label: "Sì, lo possiedo" },
  { value: AttestatoAsoStatus.NO, label: "No, non lo possiedo" },
  { value: AttestatoAsoStatus.IN_CORSO, label: "In corso di conseguimento" },
];

const BOOLEAN_OPTIONS = [
  { value: "true", label: "Sì" },
  { value: "false", label: "No" },
];

const PREAVVISO_OPTIONS = [
  { value: "1", label: "1 settimana" },
  { value: "2", label: "2 settimane" },
  { value: "3", label: "3 settimane" },
  { value: "4", label: "4 settimane (1 mese)" },
  { value: "6", label: "6 settimane" },
  { value: "8", label: "8 settimane (2 mesi)" },
  { value: "12", label: "12 settimane (3 mesi)" },
];

interface ApplicationFormProps {
  announcementId: number;
  figuraRicercata?: string;
  onSuccess: (data: { nome: string; cognome: string; email: string }) => void;
}

export function ApplicationForm({
  announcementId,
  figuraRicercata,
  onSuccess,
}: ApplicationFormProps) {
  const isAso = figuraRicercata === "Assistente alla poltrona";
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [cvS3Key, setCvS3Key] = useState<string | null>(null);
  const [cvError, setCvError] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showDomicilio, setShowDomicilio] = useState(false);

  const {
    state: geoState,
    setRegione,
    setProvincia,
    setCityWithContext,
    regioniOptions,
    provinceOptions,
  } = useItalianGeography();

  const {
    state: domicilioGeoState,
    setRegione: setDomicilioRegione,
    setProvincia: setDomicilioProvincia,
    setCityWithContext: setDomicilioCityWithContext,
    regioniOptions: domicilioRegioniOptions,
    provinceOptions: domicilioProvinceOptions,
  } = useItalianGeography();

  const [submitApplication, { isLoading: isSubmitting }] =
    useSubmitApplicationMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      sesso: null,
      automunito: null,
      disponibilita_trasferte: null,
      partita_iva: null,
      attestato_aso: isAso ? null : AttestatoAsoStatus.NO,
      disponibilita_immediata: null,
      domicilio_diverso: false,
    },
  });

  const sessoValue = watch("sesso");
  const titoliStudioValue = watch("titoli_studio");
  const disponibilitaImmediata = watch("disponibilita_immediata");
  const attestatoAsoValue = watch("attestato_aso");

  useEffect(() => {
    setValue("regione", geoState.regione);
    setValue("provincia", geoState.provincia);
  }, [geoState.regione, geoState.provincia, setValue]);

  useEffect(() => {
    setValue("citta", geoState.citta);
  }, [geoState.citta, setValue]);

  useEffect(() => {
    setValue("domicilio_regione", domicilioGeoState.regione);
    setValue("domicilio_provincia", domicilioGeoState.provincia);
  }, [domicilioGeoState.regione, domicilioGeoState.provincia, setValue]);

  useEffect(() => {
    setValue("domicilio_citta", domicilioGeoState.citta);
  }, [domicilioGeoState.citta, setValue]);

  useEffect(() => {
    if (cvS3Key) setCvError(false);
  }, [cvS3Key]);

  const regioniSelectOptions = useMemo(
    () => regioniOptions.map((opt) => ({ value: opt.value, label: opt.label })),
    [regioniOptions]
  );

  const provinceSelectOptions = useMemo(
    () =>
      provinceOptions.map((opt) => ({ value: opt.value, label: opt.label })),
    [provinceOptions]
  );

  const domicilioRegioniSelectOptions = useMemo(
    () =>
      domicilioRegioniOptions.map((opt) => ({
        value: opt.value,
        label: opt.label,
      })),
    [domicilioRegioniOptions]
  );

  const domicilioProvinceSelectOptions = useMemo(
    () =>
      domicilioProvinceOptions.map((opt) => ({
        value: opt.value,
        label: opt.label,
      })),
    [domicilioProvinceOptions]
  );

  const onSubmit = async (data: ApplicationFormData) => {
    setSubmitError(null);

    if (!cvS3Key) {
      setCvError(true);
      setSubmitError(
        "Il Curriculum Vitae è obbligatorio. Carica il tuo CV prima di inviare la candidatura."
      );
      return;
    }

    try {
      await submitApplication({
        annuncio_id: announcementId,
        nome: data.nome,
        cognome: data.cognome,
        email: data.email,
        telefono: data.telefono || null,
        sesso: data.sesso || null,
        birthdate: data.birthdate || null,

        regione: data.regione || null,
        provincia: data.provincia || null,
        citta: data.citta || null,

        domicilio_regione: showDomicilio
          ? data.domicilio_regione || null
          : null,
        domicilio_provincia: showDomicilio
          ? data.domicilio_provincia || null
          : null,
        domicilio_citta: showDomicilio ? data.domicilio_citta || null : null,

        automunito: data.automunito ?? null,
        disponibilita_trasferte: data.disponibilita_trasferte ?? null,
        partita_iva: data.partita_iva ?? null,
        attestato_aso: data.attestato_aso || null,
        disponibilita_immediata: data.disponibilita_immediata ?? null,
        preavviso_settimane:
          data.disponibilita_immediata === false && data.preavviso_settimane
            ? parseInt(String(data.preavviso_settimane), 10)
            : null,

        titoli_studio: data.titoli_studio || null,
        cv_s3_key: cvS3Key,
      }).unwrap();

      onSuccess({
        nome: data.nome,
        cognome: data.cognome,
        email: data.email,
      });
    } catch (error: any) {
      if (error?.data?.message) {
        setSubmitError(error.data.message);
      } else {
        setSubmitError(
          "Si è verificato un errore durante l'invio della candidatura. Riprova più tardi."
        );
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {submitError && (
        <div className="p-4 bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              Errore nell&apos;invio
            </p>
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-bigster-text uppercase tracking-wide border-b border-bigster-border pb-2 flex items-center gap-2">
          <User className="h-4 w-4" />
          Dati Personali
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label htmlFor="nome" className={labelBase}>
              Nome <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bigster-text-muted" />
              <input
                id="nome"
                type="text"
                {...register("nome")}
                placeholder="Il tuo nome"
                className={`${inputBase} pl-10 ${errors.nome ? "border-red-400" : ""
                  }`}
              />
            </div>
            {errors.nome && (
              <p className={errorBase}>
                <AlertCircle className="h-3 w-3" />
                {errors.nome.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="cognome" className={labelBase}>
              Cognome <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bigster-text-muted" />
              <input
                id="cognome"
                type="text"
                {...register("cognome")}
                placeholder="Il tuo cognome"
                className={`${inputBase} pl-10 ${errors.cognome ? "border-red-400" : ""
                  }`}
              />
            </div>
            {errors.cognome && (
              <p className={errorBase}>
                <AlertCircle className="h-3 w-3" />
                {errors.cognome.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label htmlFor="email" className={labelBase}>
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bigster-text-muted" />
              <input
                id="email"
                type="email"
                {...register("email")}
                placeholder="tua.email@esempio.com"
                className={`${inputBase} pl-10 ${errors.email ? "border-red-400" : ""
                  }`}
              />
            </div>
            {errors.email && (
              <p className={errorBase}>
                <AlertCircle className="h-3 w-3" />
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="telefono" className={labelBase}>
              Telefono <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bigster-text-muted" />
              <input
                id="telefono"
                type="tel"
                {...register("telefono")}
                placeholder="+39 123 456 7890"
                className={`${inputBase} pl-10 ${errors.telefono ? "border-red-400" : ""
                  }`}
              />
            </div>
            {errors.telefono && (
              <p className={errorBase}>
                <AlertCircle className="h-3 w-3" />
                {errors.telefono.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <StandardSelect
              label="Genere *"
              value={sessoValue || ""}
              onChange={(value) => setValue("sesso", (value as any) || null)}
              options={SESSO_OPTIONS}
              emptyLabel="Seleziona genere"
            />
            {errors.sesso && (
              <p className={errorBase}>
                <AlertCircle className="h-3 w-3" />
                {errors.sesso.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="birthdate" className={labelBase}>
              Data di Nascita <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Cake className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bigster-text-muted" />
              <input
                id="birthdate"
                type="date"
                {...register("birthdate")}
                className={`${inputBase} pl-10 ${errors.birthdate ? "border-red-400" : ""
                  }`}
              />
            </div>
            {errors.birthdate && (
              <p className={errorBase}>
                <AlertCircle className="h-3 w-3" />
                {errors.birthdate.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-bigster-text uppercase tracking-wide border-b border-bigster-border pb-2 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Residenza <span className="text-red-500">*</span>
        </h3>

        <div className="space-y-4">

          <div>
            <CityAutocomplete
              label="Comune *"
              value={geoState.citta}
              onChange={(value) => setCityWithContext(value)}
              onClear={() =>
                setCityWithContext({ citta: "", provincia: "", regione: "" })
              }
              provincia={geoState.provincia}
              regione={geoState.regione}
              placeholder="Digita il nome del tuo comune..."
              showContext={false}
            />
            {errors.citta && (
              <p className={errorBase}>
                <AlertCircle className="h-3 w-3" />
                {errors.citta.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <SearchableSelect
                label="Regione *"
                value={geoState.regione}
                onChange={(value) => setRegione(value)}
                options={regioniSelectOptions}
                placeholder="Cerca regione..."
                emptyLabel="Seleziona regione"
              />
              {errors.regione && (
                <p className={errorBase}>
                  <AlertCircle className="h-3 w-3" />
                  {errors.regione.message}
                </p>
              )}
            </div>

            <div>
              <SearchableSelect
                label="Provincia *"
                value={geoState.provincia}
                onChange={(value) => setProvincia(value)}
                options={provinceSelectOptions}
                placeholder="Cerca provincia..."
                emptyLabel="Seleziona provincia"
              />
              {errors.provincia && (
                <p className={errorBase}>
                  <AlertCircle className="h-3 w-3" />
                  {errors.provincia.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="domicilio_diverso"
            checked={showDomicilio}
            onChange={(e) => {
              setShowDomicilio(e.target.checked);
              setValue("domicilio_diverso", e.target.checked);
            }}
            className="h-4 w-4 rounded-none border-bigster-border text-bigster-primary focus:ring-bigster-primary"
          />
          <label
            htmlFor="domicilio_diverso"
            className="text-sm text-bigster-text"
          >
            Il mio domicilio è diverso dalla residenza
          </label>
        </div>
      </div>

      {showDomicilio && (
        <div className="space-y-4 p-4 bg-bigster-card-bg border border-bigster-border">
          <h3 className="text-sm font-bold text-bigster-text uppercase tracking-wide flex items-center gap-2">
            <Home className="h-4 w-4" />
            Domicilio <span className="text-red-500">*</span>
          </h3>

          <div className="space-y-4">

            <div>
              <CityAutocomplete
                label="Comune *"
                value={domicilioGeoState.citta}
                onChange={(value) => setDomicilioCityWithContext(value)}
                onClear={() =>
                  setDomicilioCityWithContext({
                    citta: "",
                    provincia: "",
                    regione: "",
                  })
                }
                provincia={domicilioGeoState.provincia}
                regione={domicilioGeoState.regione}
                placeholder="Digita il nome del comune di domicilio..."
                showContext={false}
              />
              {errors.domicilio_citta && (
                <p className={errorBase}>
                  <AlertCircle className="h-3 w-3" />
                  {errors.domicilio_citta.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <SearchableSelect
                  label="Regione *"
                  value={domicilioGeoState.regione}
                  onChange={(value) => setDomicilioRegione(value)}
                  options={domicilioRegioniSelectOptions}
                  placeholder="Cerca regione..."
                  emptyLabel="Seleziona regione"
                />
                {errors.domicilio_regione && (
                  <p className={errorBase}>
                    <AlertCircle className="h-3 w-3" />
                    {errors.domicilio_regione.message}
                  </p>
                )}
              </div>

              <div>
                <SearchableSelect
                  label="Provincia *"
                  value={domicilioGeoState.provincia}
                  onChange={(value) => setDomicilioProvincia(value)}
                  options={domicilioProvinceSelectOptions}
                  placeholder="Cerca provincia..."
                  emptyLabel="Seleziona provincia"
                />
                {errors.domicilio_provincia && (
                  <p className={errorBase}>
                    <AlertCircle className="h-3 w-3" />
                    {errors.domicilio_provincia.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-bigster-text uppercase tracking-wide border-b border-bigster-border pb-2">
          Formazione
        </h3>

        <div>
          <StandardSelect
            label="Titolo di studio *"
            value={titoliStudioValue || ""}
            onChange={(value) => setValue("titoli_studio", value)}
            options={TITOLI_STUDIO_OPTIONS}
            emptyLabel="Seleziona titolo di studio"
          />
          {errors.titoli_studio && (
            <p className={errorBase}>
              <AlertCircle className="h-3 w-3" />
              {errors.titoli_studio.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-bigster-text uppercase tracking-wide border-b border-bigster-border pb-2 flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          Informazioni Professionali
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <Controller
              name="automunito"
              control={control}
              render={({ field }) => (
                <StandardSelect
                  label="Automunito/a *"
                  value={
                    field.value === true
                      ? "true"
                      : field.value === false
                        ? "false"
                        : ""
                  }
                  onChange={(value) =>
                    field.onChange(
                      value === "true"
                        ? true
                        : value === "false"
                          ? false
                          : null
                    )
                  }
                  options={BOOLEAN_OPTIONS}
                  emptyLabel="Seleziona..."
                />
              )}
            />
            {errors.automunito && (
              <p className={errorBase}>
                <AlertCircle className="h-3 w-3" />
                {errors.automunito.message}
              </p>
            )}
          </div>

          <div>
            <Controller
              name="disponibilita_trasferte"
              control={control}
              render={({ field }) => (
                <StandardSelect
                  label="Disponibilità a trasferte *"
                  value={
                    field.value === true
                      ? "true"
                      : field.value === false
                        ? "false"
                        : ""
                  }
                  onChange={(value) =>
                    field.onChange(
                      value === "true"
                        ? true
                        : value === "false"
                          ? false
                          : null
                    )
                  }
                  options={BOOLEAN_OPTIONS}
                  emptyLabel="Seleziona..."
                />
              )}
            />
            {errors.disponibilita_trasferte && (
              <p className={errorBase}>
                <AlertCircle className="h-3 w-3" />
                {errors.disponibilita_trasferte.message}
              </p>
            )}
          </div>

          <div>
            <Controller
              name="partita_iva"
              control={control}
              render={({ field }) => (
                <StandardSelect
                  label="Possiedi Partita IVA? *"
                  value={
                    field.value === true
                      ? "true"
                      : field.value === false
                        ? "false"
                        : ""
                  }
                  onChange={(value) =>
                    field.onChange(
                      value === "true"
                        ? true
                        : value === "false"
                          ? false
                          : null
                    )
                  }
                  options={BOOLEAN_OPTIONS}
                  emptyLabel="Seleziona..."
                />
              )}
            />
            {errors.partita_iva && (
              <p className={errorBase}>
                <AlertCircle className="h-3 w-3" />
                {errors.partita_iva.message}
              </p>
            )}
          </div>

          {isAso && (
            <div>
              <StandardSelect
                label="Attestato ASO *"
                value={attestatoAsoValue || ""}
                onChange={(value) =>
                  setValue(
                    "attestato_aso",
                    (value as AttestatoAsoStatus) || null
                  )
                }
                options={ATTESTATO_ASO_OPTIONS}
                emptyLabel="Seleziona..."
              />
              {errors.attestato_aso && (
                <p className={errorBase}>
                  <AlertCircle className="h-3 w-3" />
                  {errors.attestato_aso.message}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="p-4 bg-bigster-card-bg border border-bigster-border space-y-4">
          <h4 className="text-sm font-semibold text-bigster-text flex items-center gap-2">
            <Clock className="h-4 w-4 text-bigster-text-muted" />
            Disponibilità Lavorativa
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <Controller
                name="disponibilita_immediata"
                control={control}
                render={({ field }) => (
                  <StandardSelect
                    label="Disponibilità immediata *"
                    value={
                      field.value === true
                        ? "true"
                        : field.value === false
                          ? "false"
                          : ""
                    }
                    onChange={(value) =>
                      field.onChange(
                        value === "true"
                          ? true
                          : value === "false"
                            ? false
                            : null
                      )
                    }
                    options={BOOLEAN_OPTIONS}
                    emptyLabel="Seleziona..."
                  />
                )}
              />
              {errors.disponibilita_immediata && (
                <p className={errorBase}>
                  <AlertCircle className="h-3 w-3" />
                  {errors.disponibilita_immediata.message}
                </p>
              )}
            </div>

            {disponibilitaImmediata === false && (
              <div>
                <Controller
                  name="preavviso_settimane"
                  control={control}
                  render={({ field }) => (
                    <StandardSelect
                      label="Settimane di preavviso *"
                      value={
                        field.value != null ? String(field.value) : ""
                      }
                      onChange={(value: string) =>
                        field.onChange(value || "")
                      }
                      options={PREAVVISO_OPTIONS}
                      emptyLabel="Seleziona..."
                      useEmptyStringForAll
                    />
                  )}
                />
                {errors.preavviso_settimane && (
                  <p className={errorBase}>
                    <AlertCircle className="h-3 w-3" />
                    {errors.preavviso_settimane.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-bigster-text uppercase tracking-wide border-b border-bigster-border pb-2">
          Curriculum Vitae <span className="text-red-500">*</span>
        </h3>

        <CvUpload
          onUploadComplete={(key) => setCvS3Key(key)}
          announcementId={announcementId}
        />

        {cvError && !cvS3Key && (
          <p className={errorBase}>
            <AlertCircle className="h-3 w-3" />
            Il Curriculum Vitae è obbligatorio per candidarsi
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="privacy_consent"
            {...register("privacy_consent")}
            className="mt-1 h-4 w-4 rounded-none border-bigster-border text-bigster-primary focus:ring-bigster-primary"
          />
          <label
            htmlFor="privacy_consent"
            className="text-sm text-bigster-text-muted"
          >
            Ho letto e accetto l&apos;
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowPrivacyModal(true);
              }}
              className="text-bigster-text font-semibold underline hover:no-underline"
            >
              informativa sulla privacy
            </button>
            e acconsento al trattamento dei miei dati personali per finalità di
            selezione del personale.{" "}
            <span className="text-red-500">*</span>
          </label>
        </div>
        {errors.privacy_consent && (
          <p className={errorBase}>
            <AlertCircle className="h-3 w-3" />
            {errors.privacy_consent.message}
          </p>
        )}
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-none bg-bigster-primary text-bigster-primary-text border-2 border-yellow-400 hover:opacity-90 font-bold py-4 text-base transition-all"
        >
          {isSubmitting ? (
            <>
              <Spinner className="h-5 w-5 mr-2" />
              Invio in corso...
            </>
          ) : (
            <>
              <Send className="h-5 w-5 mr-2" />
              Invia Candidatura
            </>
          )}
        </Button>

        <p className="text-xs text-bigster-text-muted text-center mt-3">
          Tutti i campi contrassegnati con{" "}
          <span className="text-red-500">*</span> sono obbligatori
        </p>
      </div>

      {showPrivacyModal && (
        <PrivacyPolicyModal onClose={() => setShowPrivacyModal(false)} />
      )}
    </form>
  );
}

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

function PrivacyPolicyModal({ onClose }: { onClose: () => void }) {
  const privacyText = `Oggetto: Informativa ai sensi dell'art. 13 del D. Lgs. 196/2003 e dell'articolo 13 del Regolamento UE n. 2016/679

Ai sensi dell'art. 13 del D. Lgs. 196/2003 (di seguito "Codice Privacy") e dell'art. 13 del Regolamento UE n. 2016/679 (di seguito "GDPR 2016/679"), recante disposizioni a tutela delle persone e di altri soggetti rispetto al trattamento dei dati personali, desideriamo informarLa che i dati personali da Lei forniti formeranno oggetto di trattamento nel rispetto della normativa sopra richiamata e degli obblighi di riservatezza cui è tenuta l'azienda Kayros 8 SA.

Titolare del trattamento
Il Titolare del trattamento è Kayros 8 SA nella persona del Presidente e legale rappresentante pro tempore Sig. Federico Marchesi, domiciliato per la carica in Lugano alla Via Pioda 12.

Responsabile della protezione dei dati (DPO)
Il responsabile della protezione dei dati (DPO) è Kayros 8 SA Via Pioda, 12 Lugano. Il Responsabile del trattamento è il Sig. Federico Marchesi.

Finalità del trattamento
I dati personali da Lei forniti sono necessari per gli adempimenti previsti per legge.

Modalità di trattamento e conservazione
Il trattamento sarà svolto in forma automatizzata e/o manuale, nel rispetto di quanto previsto dall'art. 32 del GDPR 2016/679 e dall'Allegato B del D.Lgs. 196/2003 (artt. 33-36 del Codice) in materia di misure di sicurezza, ad opera di soggetti appositamente incaricati e in ottemperanza a quanto previsto dagli art. 29 GDPR 2016/679. Le segnaliamo che, nel rispetto dei principi di liceità, limitazione delle finalità e minimizzazione dei dati, ai sensi dell'art. 5 GDPR 2016/679, previo il Suo consenso libero ed esplicito espresso in calce alla presente informativa, i Suoi dati personali saranno conservati per il periodo di tempo necessario per il conseguimento delle finalità per le quali sono raccolti e trattati.

Ambito di comunicazione e diffusione
I dati raccolti non saranno mai diffusi e non saranno oggetto di comunicazione senza Suo esplicito consenso, salvo le comunicazioni necessarie che possono comportare il trasferimento di dati ad enti pubblici, a consulenti o ad altri soggetti per l'adempimento degli obblighi di legge.

Trasferimento dei dati personali
I suoi dati non saranno trasferiti né in Stati membri dell'Unione Europea né in Paesi terzi non appartenenti all'Unione Europea.

Categorie particolari di dati personali
Ai sensi degli articoli 26 e 27 del D.Lgs. 196/2003 e degli articoli 9 e 10 del Regolamento UE n. 2016/679, Lei potrebbe conferire, al titolare del trattamento dati qualificabili come "categorie particolari di dati personali" e cioè quei dati che rivelano "l'origine razziale o etnica, le opinioni politiche, le convinzioni religiose o filosofiche, o l'appartenenza sindacale, nonché dati genetici, dati biometrici intesi a identificare in modo univoco una persona fisica, dati relativi alla salute o alla vita sessuale o all'orientamento sessuale della persona". Tali categorie di dati potranno essere trattate solo previo Suo libero ed esplicito consenso, manifestato in forma scritta in calce alla presente informativa.

Esistenza di un processo decisionale automatizzato
La società Kayros 8 SA non adotta alcun processo decisionale automatizzato, compresa la profilazione, di cui all'articolo 22, paragrafi 1 e 4, del Regolamento UE n. 679/2016.

Diritti dell'interessato
In ogni momento, Lei potrà esercitare, ai sensi dell'art. 7 del D.Lgs. 196/2003 e degli articoli dal 15 al 22 del Regolamento UE n. 2016/679, il diritto di:
a) chiedere la conferma dell'esistenza o meno di propri dati personali;
b) ottenere le indicazioni circa le finalità del trattamento, le categorie dei dati personali, i destinatari o le categorie di destinatari a cui i dati personali sono stati o saranno comunicati e, quando possibile, il periodo di conservazione;
c) ottenere la rettifica e la cancellazione dei dati;
d) ottenere la limitazione del trattamento;
e) ottenere la portabilità dei dati;
f) opporsi al trattamento in qualsiasi momento;
g) opporsi ad un processo decisionale automatizzato relativo alle persone fisiche, compresa la profilazione;
h) chiedere al titolare del trattamento l'accesso ai dati personali e la rettifica o la cancellazione degli stessi;
i) revocare il consenso in qualsiasi momento;
j) proporre reclamo a un'autorità di controllo.

Può esercitare i Suoi diritti con richiesta scritta inviata a Kayros 8 SA all'indirizzo postale della sede legale o all'indirizzo mail amministrazione@kayros8.ch.`;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-none bg-bigster-surface border border-bigster-border max-w-2xl max-h-[80vh] flex flex-col">

        <DialogHeader title="Informativa sulla Privacy" onClose={onClose} />

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {privacyText.split("\n\n").map((paragraph, idx) => {

            const lines = paragraph.split("\n");
            const isSection = lines[0].length < 60 && !lines[0].endsWith(".");

            if (isSection && lines.length > 1) {
              return (
                <div key={idx} className="mb-4">
                  <h3 className="text-sm font-bold text-bigster-text mb-1">
                    {lines[0]}
                  </h3>
                  <p className="text-sm text-bigster-text-muted leading-relaxed">
                    {lines.slice(1).join("\n")}
                  </p>
                </div>
              );
            }

            return (
              <p
                key={idx}
                className="text-sm text-bigster-text-muted mb-3 leading-relaxed"
              >
                {paragraph}
              </p>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-bigster-border flex-shrink-0">
          <Button
            type="button"
            onClick={onClose}
            className="w-full rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90 font-semibold"
          >
            Ho letto l'informativa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
