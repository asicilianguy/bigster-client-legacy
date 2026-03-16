export enum JobDescriptionType {
  DO = "DO",
  ASO = "ASO",
}

export enum RequirementLevel {
  VINCOLANTE = "VINCOLANTE",
  PREFERIBILE = "PREFERIBILE",
  ININFLUENTE = "ININFLUENTE",
}

export enum ContractTypeJD {
  TEMPO_INDETERMINATO = "TEMPO_INDETERMINATO",
  TEMPO_DETERMINATO = "TEMPO_DETERMINATO",
  TEMPO_DETERMINATO_6_MESI = "TEMPO_DETERMINATO_6_MESI",
  APPRENDISTATO = "APPRENDISTATO",
  PARTITA_IVA = "PARTITA_IVA",
  STAGE_TIROCINIO = "STAGE_TIROCINIO",
  LAVORO_STAGIONALE = "LAVORO_STAGIONALE",
  CONTRATTO_A_PROGETTO = "CONTRATTO_A_PROGETTO",
}

export enum WorkSchedule {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
}

export enum ServizioOdontoiatrico {
  IMPLANTOLOGIA = "IMPLANTOLOGIA",
  IGIENE = "IGIENE",
  CONSERVATIVA = "CONSERVATIVA",
  ENDODONZIA = "ENDODONZIA",
  ORTODONZIA = "ORTODONZIA",
  PROTESI = "PROTESI",
  CHIRURGIA = "CHIRURGIA",
  PARODONTOLOGIA = "PARODONTOLOGIA",
  PEDODONZIA = "PEDODONZIA",
  ESTETICA_DENTALE = "ESTETICA_DENTALE",
  GNATOLOGIA = "GNATOLOGIA",
  RADIOLOGIA = "RADIOLOGIA",
  ALTRO = "ALTRO",
}

export const SERVIZI_ODONTOIATRICI_LABELS: Record<
  ServizioOdontoiatrico,
  string
> = {
  [ServizioOdontoiatrico.IMPLANTOLOGIA]: "Implantologia",
  [ServizioOdontoiatrico.IGIENE]: "Igiene",
  [ServizioOdontoiatrico.CONSERVATIVA]: "Conservativa",
  [ServizioOdontoiatrico.ENDODONZIA]: "Endodonzia",
  [ServizioOdontoiatrico.ORTODONZIA]: "Ortodonzia",
  [ServizioOdontoiatrico.PROTESI]: "Protesi",
  [ServizioOdontoiatrico.CHIRURGIA]: "Chirurgia",
  [ServizioOdontoiatrico.PARODONTOLOGIA]: "Parodontologia",
  [ServizioOdontoiatrico.PEDODONZIA]: "Pedodonzia (Odontoiatria Pediatrica)",
  [ServizioOdontoiatrico.ESTETICA_DENTALE]: "Estetica Dentale",
  [ServizioOdontoiatrico.GNATOLOGIA]: "Gnatologia",
  [ServizioOdontoiatrico.RADIOLOGIA]: "Radiologia",
  [ServizioOdontoiatrico.ALTRO]: "Altro",
};

export interface DatiAnagrafici {
  ragione_sociale: string;
  indirizzo: string;
  citta: string;
  provincia: string;
}

export interface StudioInfo {
  anni_attivita: string;
  evoluzioni_nel_tempo: string;
}

export interface StrutturaDipendente {
  nome_cognome: string;
  ruolo_mansione: string;
  eta: string;
  dettagli_presenza: string;
}

export interface StrutturaAdOggi {
  n_dipendenti: number;
  dipendenti: StrutturaDipendente[];
  n_collaboratori: number;
  collaboratori: StrutturaDipendente[];
}

export interface DistribuzioneServizio {
  servizio: ServizioOdontoiatrico;
  attivo: boolean;
  percentuale: string;
}

export interface ServizioAltro {
  nome: string;
  percentuale: string;
}

export interface ServizioPersonalizzato {
  id: string;
  nome: string;
  attivo: boolean;
  percentuale: string;
}

export interface Digitalizzazione {
  applicativi_contabilita: boolean;
  applicativi_contabilita_note: string;
  software_gestionali_odontoiatrici: boolean;
  software_gestionali_odontoiatrici_note: string;
  altri_app_strumenti: boolean;
  altri_app_strumenti_note: string;
  sito: boolean;
  sito_url: string;
  social: boolean;
  social_note: string;
  piattaforme_marketing: boolean;
  piattaforme_marketing_note: string;
}

export interface AnalisiOrganizzativa {
  dati_anagrafici: DatiAnagrafici;
  studio_info: StudioInfo;
  struttura_ad_oggi: StrutturaAdOggi;
  clienti_segmenti: string;
  distribuzione_servizi: DistribuzioneServizio[];
  servizio_altro: ServizioAltro;
  servizi_personalizzati?: ServizioPersonalizzato[];
  servizi_di_punta: (ServizioOdontoiatrico | string)[];
  servizi_di_punta_note: string;
  fatturato_annuo: string;
  forniture_e_magazzino: string;
  digitalizzazione: Digitalizzazione;
  tratti_distintivi: string;
  obiettivi_di_sviluppo: string;
  swot_analysis: string;
}

export interface AttivitaDO {
  accoglie_paziente: boolean;
  gestisce_comunicazioni: boolean;
  attivita_marketing: boolean;
  coordina_attivita_studio: boolean;
  amministra_contratti_fornitura: boolean;
  gestisce_contatto_agenti: boolean;
  gestisce_magazzino: boolean;
  gestione_amministrativa: boolean;
  presenta_preventivi: boolean;
  gestisce_manutenzione: boolean;
  garantisce_igiene: boolean;
  monitora_risultati: boolean;
  elabora_report: boolean;
  gestisce_cassa: boolean;
  altro: boolean;
  altro_specifica: string;
  note_attivita: string;
}

export interface AttivitaASO {
  accoglie_paziente: boolean;
  prepara_area_intervento: boolean;
  riordina_strumentario: boolean;
  compila_schedario: boolean;
  gestisce_documentazione_clinica: boolean;
  controllo_scadenze_stoccaggio: boolean;
  raccolta_rifiuti_sanitari: boolean;
  assiste_odontoiatria: boolean;
  supporta_emergenze: boolean;
  aiuta_paziente_disagi: boolean;
  gestisce_prenotazioni: boolean;
  gestisce_agende: boolean;
  gestisce_rapporti_fornitori: boolean;
  gestisce_magazzino_cassa: boolean;
  utilizza_programmi_informatici: boolean;
  altro: boolean;
  altro_specifica: string;
  note_attivita: string;
}

export interface CompetenzaHard {
  selezionata: boolean;
  note: string;
}

export interface CompetenzeHardDO {
  capacita_organizzativa: CompetenzaHard;
  capacita_relazionale: CompetenzaHard;
  capacita_gestionali: CompetenzaHard;
  altro: CompetenzaHard;
}

export interface CompetenzeHardASO {
  capacita_organizzativa: CompetenzaHard;
  competenze_relazionali_comunicative: CompetenzaHard;
  competenze_tecniche_sterilizzazione: CompetenzaHard;
  altro: CompetenzaHard;
}

export interface ConoscenzaTecnica {
  selezionata: boolean;
  note: string;
}

export interface ConoscenzeTecnicheDO {
  contabilita_informatica: ConoscenzaTecnica;
  fasi_produttive: ConoscenzaTecnica;
  odontoiatria_clinica: ConoscenzaTecnica;
  excel_pivot: ConoscenzaTecnica;
  aspetti_normativi: ConoscenzaTecnica;
  sistema_normativo_etico: ConoscenzaTecnica;
  marketing_operativo: ConoscenzaTecnica;
  altro: ConoscenzaTecnica;
}

export interface ConoscenzeTecnicheASO {
  anatomia_generale: ConoscenzaTecnica;
  composti_farmaci: ConoscenzaTecnica;
  odontoiatria_clinica: ConoscenzaTecnica;
  legislazione_sanitaria: ConoscenzaTecnica;
  altro: ConoscenzaTecnica;
}

export interface CaratteristichePersonaliDO {
  pianificazione_organizzazione: boolean;
  comunicazione_assertiva: boolean;
  attenzione_dettaglio: boolean;
  problem_solving: boolean;
  orientamento_cliente: boolean;
  mediazione_negoziazione: boolean;
  altro: boolean;
  altro_specifica: string;
}

export interface CaratteristichePersonaliASO {
  attitudine_rapporto_interpersonale: boolean;
  attenzione_cliente: boolean;
  attenzione_dettaglio: boolean;
  pianificazione_gestione_ambiente: boolean;
  orientamento_risultato: boolean;
  teamworking: boolean;
  altro: boolean;
  altro_specifica: string;
}

export interface PercorsoFormativo {
  laurea_triennale: string;
  laurea_magistrale: string;
  diploma: string;
  nessun_titolo_preferenziale: boolean;
}

export interface EsperienzaProfessionale {
  richiesta: boolean;
  anni: string;
}

export interface ConoscenzaLingua {
  richiesta: boolean;
  livello: string;
}

export interface ConoscenzeLinguistiche {
  inglese: ConoscenzaLingua;
  altra_lingua: ConoscenzaLingua;
  altra_lingua_nome: string;
}

export interface AnalisiProfiloDO {
  attivita: AttivitaDO;
  competenze_hard: CompetenzeHardDO;
  conoscenze_tecniche: ConoscenzeTecnicheDO;
  caratteristiche_personali: CaratteristichePersonaliDO;
  percorso_formativo: PercorsoFormativo;
  esperienza: EsperienzaProfessionale;
  lingue: ConoscenzeLinguistiche;
}

export interface AnalisiProfiloASO {
  attivita: AttivitaASO;
  competenze_hard: CompetenzeHardASO;
  conoscenze_tecniche: ConoscenzeTecnicheASO;
  caratteristiche_personali: CaratteristichePersonaliASO;
  percorso_formativo: PercorsoFormativo;
  esperienza: EsperienzaProfessionale;
  lingue: ConoscenzeLinguistiche;
}

export interface BenefitOfferto {
  affiancamenti: boolean;
  auto_aziendale: boolean;
  benefits: boolean;
  benefits_specifica: string;
  corsi_aggiornamento: boolean;
  incentivi: boolean;
  quote_societarie: boolean;
  rimborso_spese: boolean;
  altro: boolean;
  altro_specifica: string;
}

export interface Offerta {

  numero_persone: number;
  motivo_ricerca: string;

  eta: string;
  eta_livello: RequirementLevel;
  patente: RequirementLevel;
  automunita: RequirementLevel;

  tipi_contratto: ContractTypeJD[];

  orario: WorkSchedule;
  orario_dettaglio: string;
  orario_part_time_dettagli: string;
  orario_full_time_dettagli: string;

  compenso_mensile_netto: string;
  composizione_retribuzione: string;

  prospettive_crescita: string;

  benefits: {
    affiancamenti: boolean;
    auto_aziendale: boolean;
    benefits: boolean;
    benefits_specifica: string;
    corsi_aggiornamento: boolean;
    incentivi: boolean;
    incentivi_specifica: string;
    master_dto: boolean;
    master_dto_specifica: string;
    quote_societarie: boolean;
    rimborso_spese: boolean;
    altro: boolean;
    altro_specifica: string;
  };
}

export interface Chiusura {
  canali_specifici: string;
  note_aggiuntive: string;
  luogo: string;
  data: string;
  firma_cliente: string;
}

export interface JobDescriptionFormDO {
  tipo: JobDescriptionType.DO;
  analisi_organizzativa: AnalisiOrganizzativa;
  analisi_profilo: AnalisiProfiloDO;
  offerta: Offerta;
  chiusura: Chiusura;
}

export interface JobDescriptionFormASO {
  tipo: JobDescriptionType.ASO;
  analisi_organizzativa: AnalisiOrganizzativa;
  analisi_profilo: AnalisiProfiloASO;
  offerta: Offerta;
  chiusura: Chiusura;
}

export type JobDescriptionForm = JobDescriptionFormDO | JobDescriptionFormASO;

export enum WizardSection {
  DATI_ANAGRAFICI = "DATI_ANAGRAFICI",
  STUDIO_INFO = "STUDIO_INFO",
  STRUTTURA = "STRUTTURA",
  SERVIZI = "SERVIZI",
  DIGITALIZZAZIONE = "DIGITALIZZAZIONE",
  SWOT = "SWOT",
  ATTIVITA = "ATTIVITA",
  COMPETENZE_HARD = "COMPETENZE_HARD",
  CONOSCENZE_TECNICHE = "CONOSCENZE_TECNICHE",
  SOFT_SKILLS = "SOFT_SKILLS",
  FORMAZIONE = "FORMAZIONE",
  OFFERTA = "OFFERTA",
  CHIUSURA = "CHIUSURA",
}

export interface WizardStep {
  id: WizardSection;
  label: string;
  shortLabel: string;
  group: "organizzativa" | "profilo" | "offerta" | "chiusura";
}

export interface WizardState {
  currentSection: WizardSection;
  completedSections: WizardSection[];
  formData: Partial<JobDescriptionForm>;
  isDirty: boolean;
  lastSaved?: Date;
}

export const createDefaultAnalisiOrganizzativa = (): AnalisiOrganizzativa => ({
  dati_anagrafici: {
    ragione_sociale: "",
    indirizzo: "",
    citta: "",
    provincia: "",
  },
  studio_info: {
    anni_attivita: "",
    evoluzioni_nel_tempo: "",
  },
  struttura_ad_oggi: {
    n_dipendenti: 0,
    dipendenti: [],
    n_collaboratori: 0,
    collaboratori: [],
  },
  clienti_segmenti: "",
  distribuzione_servizi: [
    {
      servizio: ServizioOdontoiatrico.IMPLANTOLOGIA,
      attivo: false,
      percentuale: "",
    },
    { servizio: ServizioOdontoiatrico.IGIENE, attivo: false, percentuale: "" },
    {
      servizio: ServizioOdontoiatrico.CONSERVATIVA,
      attivo: false,
      percentuale: "",
    },
    {
      servizio: ServizioOdontoiatrico.ENDODONZIA,
      attivo: false,
      percentuale: "",
    },
    {
      servizio: ServizioOdontoiatrico.ORTODONZIA,
      attivo: false,
      percentuale: "",
    },
    { servizio: ServizioOdontoiatrico.PROTESI, attivo: false, percentuale: "" },
    {
      servizio: ServizioOdontoiatrico.CHIRURGIA,
      attivo: false,
      percentuale: "",
    },
    {
      servizio: ServizioOdontoiatrico.PARODONTOLOGIA,
      attivo: false,
      percentuale: "",
    },
    {
      servizio: ServizioOdontoiatrico.PEDODONZIA,
      attivo: false,
      percentuale: "",
    },
    {
      servizio: ServizioOdontoiatrico.ESTETICA_DENTALE,
      attivo: false,
      percentuale: "",
    },
    {
      servizio: ServizioOdontoiatrico.GNATOLOGIA,
      attivo: false,
      percentuale: "",
    },
    {
      servizio: ServizioOdontoiatrico.RADIOLOGIA,
      attivo: false,
      percentuale: "",
    },
  ],
  servizio_altro: { nome: "", percentuale: "" },
  servizi_di_punta: [],
  servizi_di_punta_note: "",
  fatturato_annuo: "",
  forniture_e_magazzino: "",
  digitalizzazione: {
    applicativi_contabilita: false,
    applicativi_contabilita_note: "",
    software_gestionali_odontoiatrici: false,
    software_gestionali_odontoiatrici_note: "",
    altri_app_strumenti: false,
    altri_app_strumenti_note: "",
    sito: false,
    sito_url: "",
    social: false,
    social_note: "",
    piattaforme_marketing: false,
    piattaforme_marketing_note: "",
  },
  tratti_distintivi: "",
  obiettivi_di_sviluppo: "",
  swot_analysis: `PUNTI DI FORZA:

AREE DI MIGLIORAMENTO:
`,
});

export const createDefaultAttivitaDO = (): AttivitaDO => ({
  accoglie_paziente: false,
  gestisce_comunicazioni: false,
  attivita_marketing: false,
  coordina_attivita_studio: false,
  amministra_contratti_fornitura: false,
  gestisce_contatto_agenti: false,
  gestisce_magazzino: false,
  gestione_amministrativa: false,
  presenta_preventivi: false,
  gestisce_manutenzione: false,
  garantisce_igiene: false,
  monitora_risultati: false,
  elabora_report: false,
  gestisce_cassa: false,
  altro: false,
  altro_specifica: "",
  note_attivita: "",
});

export const createDefaultAttivitaASO = (): AttivitaASO => ({
  accoglie_paziente: false,
  prepara_area_intervento: false,
  riordina_strumentario: false,
  compila_schedario: false,
  gestisce_documentazione_clinica: false,
  controllo_scadenze_stoccaggio: false,
  raccolta_rifiuti_sanitari: false,
  assiste_odontoiatria: false,
  supporta_emergenze: false,
  aiuta_paziente_disagi: false,
  gestisce_prenotazioni: false,
  gestisce_agende: false,
  gestisce_rapporti_fornitori: false,
  gestisce_magazzino_cassa: false,
  utilizza_programmi_informatici: false,
  altro: false,
  altro_specifica: "",
  note_attivita: "",
});

export const createDefaultCompetenzeHardDO = (): CompetenzeHardDO => ({
  capacita_organizzativa: { selezionata: false, note: "" },
  capacita_relazionale: { selezionata: false, note: "" },
  capacita_gestionali: { selezionata: false, note: "" },
  altro: { selezionata: false, note: "" },
});

export const createDefaultCompetenzeHardASO = (): CompetenzeHardASO => ({
  capacita_organizzativa: { selezionata: false, note: "" },
  competenze_relazionali_comunicative: { selezionata: false, note: "" },
  competenze_tecniche_sterilizzazione: { selezionata: false, note: "" },
  altro: { selezionata: false, note: "" },
});

export const createDefaultConoscenzeTecnicheDO = (): ConoscenzeTecnicheDO => ({
  contabilita_informatica: { selezionata: false, note: "" },
  fasi_produttive: { selezionata: false, note: "" },
  odontoiatria_clinica: { selezionata: false, note: "" },
  excel_pivot: { selezionata: false, note: "" },
  aspetti_normativi: { selezionata: false, note: "" },
  sistema_normativo_etico: { selezionata: false, note: "" },
  marketing_operativo: { selezionata: false, note: "" },
  altro: { selezionata: false, note: "" },
});

export const createDefaultConoscenzeTecnicheASO =
  (): ConoscenzeTecnicheASO => ({
    anatomia_generale: { selezionata: false, note: "" },
    composti_farmaci: { selezionata: false, note: "" },
    odontoiatria_clinica: { selezionata: false, note: "" },
    legislazione_sanitaria: { selezionata: false, note: "" },
    altro: { selezionata: false, note: "" },
  });

export const createDefaultCaratteristichePersonaliDO =
  (): CaratteristichePersonaliDO => ({
    pianificazione_organizzazione: false,
    comunicazione_assertiva: false,
    attenzione_dettaglio: false,
    problem_solving: false,
    orientamento_cliente: false,
    mediazione_negoziazione: false,
    altro: false,
    altro_specifica: "",
  });

export const createDefaultCaratteristichePersonaliASO =
  (): CaratteristichePersonaliASO => ({
    attitudine_rapporto_interpersonale: false,
    attenzione_cliente: false,
    attenzione_dettaglio: false,
    pianificazione_gestione_ambiente: false,
    orientamento_risultato: false,
    teamworking: false,
    altro: false,
    altro_specifica: "",
  });

export const createDefaultPercorsoFormativo = (): PercorsoFormativo => ({
  laurea_triennale: "",
  laurea_magistrale: "",
  diploma: "",
  nessun_titolo_preferenziale: false,
});

export const createDefaultEsperienza = (): EsperienzaProfessionale => ({
  richiesta: false,
  anni: "",
});

export const createDefaultLingue = (): ConoscenzeLinguistiche => ({
  inglese: { richiesta: false, livello: "" },
  altra_lingua: { richiesta: false, livello: "" },
  altra_lingua_nome: "",
});

export function createDefaultOfferta(): Offerta {
  return {
    numero_persone: 1,
    motivo_ricerca: "",
    eta: "",
    eta_livello: RequirementLevel.PREFERIBILE,
    patente: RequirementLevel.PREFERIBILE,
    automunita: RequirementLevel.PREFERIBILE,
    tipi_contratto: [],
    orario: WorkSchedule.FULL_TIME,
    orario_dettaglio: "",
    orario_part_time_dettagli: "",
    orario_full_time_dettagli: "",
    compenso_mensile_netto: "",
    composizione_retribuzione: "",
    prospettive_crescita: "",
    benefits: {
      affiancamenti: false,
      auto_aziendale: false,
      benefits: false,
      benefits_specifica: "",
      corsi_aggiornamento: false,
      incentivi: false,
      incentivi_specifica: "",
      master_dto: false,
      master_dto_specifica: "",
      quote_societarie: false,
      rimborso_spese: false,
      altro: false,
      altro_specifica: "",
    },
  };
}

export const createDefaultChiusura = (): Chiusura => ({
  canali_specifici: "",
  note_aggiuntive: "",
  luogo: "",
  data: new Date().toISOString().split("T")[0],
  firma_cliente: "",
});

export const createDefaultJobDescriptionDO = (): JobDescriptionFormDO => ({
  tipo: JobDescriptionType.DO,
  analisi_organizzativa: createDefaultAnalisiOrganizzativa(),
  analisi_profilo: {
    attivita: createDefaultAttivitaDO(),
    competenze_hard: createDefaultCompetenzeHardDO(),
    conoscenze_tecniche: createDefaultConoscenzeTecnicheDO(),
    caratteristiche_personali: createDefaultCaratteristichePersonaliDO(),
    percorso_formativo: createDefaultPercorsoFormativo(),
    esperienza: createDefaultEsperienza(),
    lingue: createDefaultLingue(),
  },
  offerta: createDefaultOfferta(),
  chiusura: createDefaultChiusura(),
});

export const createDefaultJobDescriptionASO = (): JobDescriptionFormASO => ({
  tipo: JobDescriptionType.ASO,
  analisi_organizzativa: createDefaultAnalisiOrganizzativa(),
  analisi_profilo: {
    attivita: createDefaultAttivitaASO(),
    competenze_hard: createDefaultCompetenzeHardASO(),
    conoscenze_tecniche: createDefaultConoscenzeTecnicheASO(),
    caratteristiche_personali: createDefaultCaratteristichePersonaliASO(),
    percorso_formativo: createDefaultPercorsoFormativo(),
    esperienza: createDefaultEsperienza(),
    lingue: createDefaultLingue(),
  },
  offerta: createDefaultOfferta(),
  chiusura: createDefaultChiusura(),
});

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: WizardSection.DATI_ANAGRAFICI,
    label: "Dati Anagrafici",
    shortLabel: "Anagrafica",
    group: "organizzativa",
  },
  {
    id: WizardSection.STUDIO_INFO,
    label: "Info Studio",
    shortLabel: "Studio",
    group: "organizzativa",
  },
  {
    id: WizardSection.STRUTTURA,
    label: "Struttura",
    shortLabel: "Struttura",
    group: "organizzativa",
  },
  {
    id: WizardSection.SERVIZI,
    label: "Servizi e Fatturato",
    shortLabel: "Servizi",
    group: "organizzativa",
  },
  {
    id: WizardSection.DIGITALIZZAZIONE,
    label: "Digitalizzazione",
    shortLabel: "Digital",
    group: "organizzativa",
  },
  {
    id: WizardSection.SWOT,
    label: "SWOT e Obiettivi",
    shortLabel: "SWOT",
    group: "organizzativa",
  },
  {
    id: WizardSection.ATTIVITA,
    label: "Attività Previste",
    shortLabel: "Attività",
    group: "profilo",
  },
  {
    id: WizardSection.COMPETENZE_HARD,
    label: "Competenze Hard",
    shortLabel: "Hard Skills",
    group: "profilo",
  },
  {
    id: WizardSection.CONOSCENZE_TECNICHE,
    label: "Conoscenze Tecniche",
    shortLabel: "Tecniche",
    group: "profilo",
  },
  {
    id: WizardSection.SOFT_SKILLS,
    label: "Soft Skills",
    shortLabel: "Soft Skills",
    group: "profilo",
  },
  {
    id: WizardSection.FORMAZIONE,
    label: "Formazione ed Esperienza",
    shortLabel: "Formazione",
    group: "profilo",
  },
  {
    id: WizardSection.OFFERTA,
    label: "Offerta",
    shortLabel: "Offerta",
    group: "offerta",
  },
  {
    id: WizardSection.CHIUSURA,
    label: "Chiusura",
    shortLabel: "Chiusura",
    group: "chiusura",
  },
];

export const ATTIVITA_DO_LABELS: Record<
  keyof Omit<AttivitaDO, "altro_specifica" | "note_attivita">,
  string
> = {
  accoglie_paziente:
    "Accoglie il paziente, raccoglie i suoi dati e lo accompagna alla poltrona",
  gestisce_comunicazioni:
    "Gestisce le comunicazioni con i pazienti (telefonate, appuntamenti, prenotazioni)",
  attivita_marketing:
    "Svolge attività di marketing e comunicazione verso l'esterno",
  coordina_attivita_studio:
    "Coordina e organizza le attività dello studio, gestendo l'agenda",
  amministra_contratti_fornitura:
    "Amministra e gestisce i contratti di fornitura",
  gestisce_contatto_agenti:
    "Gestisce il contatto con agenti, informatori scientifici e consulenti",
  gestisce_magazzino: "Gestisce il magazzino, stoccaggio ed esecuzione ordini",
  gestione_amministrativa:
    "Si occupa della gestione amministrativa dello studio",
  presenta_preventivi:
    "Presenta al cliente il preventivo con le modalità di pagamento",
  gestisce_manutenzione:
    "Gestisce la manutenzione delle apparecchiature mediche",
  garantisce_igiene:
    "Garantisce l'igiene attraverso pulizia, disinfezione e sterilizzazione",
  monitora_risultati: "Monitora i risultati e li comunica ai titolari",
  elabora_report: "Elabora report e si dedica al monitoraggio",
  gestisce_cassa: "Gestisce la cassa e i pagamenti di pazienti e fornitori",
  altro: "Altro",
};

export const ATTIVITA_ASO_LABELS: Record<
  keyof Omit<AttivitaASO, "altro_specifica" | "note_attivita">,
  string
> = {
  accoglie_paziente:
    "Accoglie il paziente, raccoglie i suoi dati e lo accompagna alla poltrona",
  prepara_area_intervento:
    "Prepara l'area dell'intervento clinico, la decontamina e disinfetta",
  riordina_strumentario:
    "Riordina, sterilizza, sanifica e prepara lo strumentario",
  compila_schedario:
    "Compila, aggiorna e gestisce lo schedario tecnico del paziente",
  gestisce_documentazione_clinica:
    "Gestisce la documentazione clinica e il materiale radiografico",
  controllo_scadenze_stoccaggio:
    "Esegue il controllo delle scadenze e lo stoccaggio dei farmaci e materiali",
  raccolta_rifiuti_sanitari:
    "Raccoglie ed esegue lo stoccaggio e smaltimento dei rifiuti sanitari",
  assiste_odontoiatria:
    "Assiste l'odontoiatra nelle attività proprie dell'odontoiatria",
  supporta_emergenze:
    "Supporta l'odontoiatra nella gestione dei soccorsi per le emergenze",
  aiuta_paziente_disagi:
    "Aiuta la persona assistita ad affrontare eventuali disagi",
  gestisce_prenotazioni:
    "Gestisce le prenotazioni e il calendario degli appuntamenti*",
  gestisce_agende: "Gestisce e coordina le agende dei diversi collaboratori*",
  gestisce_rapporti_fornitori:
    "Gestisce i rapporti con fornitori, agenti e consulenti*",
  gestisce_magazzino_cassa: "Gestisce il magazzino e la cassa*",
  utilizza_programmi_informatici:
    "Utilizza programmi informatici per la gestione amministrativa*",
  altro: "Altro",
};

export const COMPETENZE_HARD_DO_LABELS: Record<keyof CompetenzeHardDO, string> =
  {
    capacita_organizzativa: "Capacità organizzativa e di pianificazione",
    capacita_relazionale: "Capacità relazionale e abilità comunicative",
    capacita_gestionali: "Capacità gestionali",
    altro: "Altro",
  };

export const COMPETENZE_HARD_ASO_LABELS: Record<
  keyof CompetenzeHardASO,
  string
> = {
  capacita_organizzativa: "Capacità organizzativa e di pianificazione",
  competenze_relazionali_comunicative:
    "Competenze relazionali e comunicative con paziente e odontoiatra",
  competenze_tecniche_sterilizzazione:
    "Competenze tecniche di sterilizzazione e preparazione strumentario",
  altro: "Altro",
};

export const CONOSCENZE_TECNICHE_DO_LABELS: Record<
  keyof ConoscenzeTecnicheDO,
  string
> = {
  contabilita_informatica:
    "Conoscenze base di contabilità e applicativi informatici/software gestionali",
  fasi_produttive:
    "Conoscenza di tutte le fasi produttive caratteristiche dello studio dentistico",
  odontoiatria_clinica:
    "Conoscenza base dell'odontoiatria clinica (patologie, diagnosi, terapie, materiali)",
  excel_pivot:
    "Conoscenza delle formule e funzioni per analizzare i dati (Excel, pivot)",
  aspetti_normativi:
    "Aspetti normativi in odontoiatria (sicurezza, contratti, privacy)",
  sistema_normativo_etico:
    "Conoscenza del sistema normativo, aspetti etici e deontologici",
  marketing_operativo:
    "Conoscenza dei processi e strumenti di marketing operativo",
  altro: "Altro",
};

export const CONOSCENZE_TECNICHE_ASO_LABELS: Record<
  keyof ConoscenzeTecnicheASO,
  string
> = {
  anatomia_generale:
    "Cenni di anatomia generale (in particolare bocca e denti)",
  composti_farmaci:
    "Conoscenza dei composti dei farmaci più noti, malattie e allergeni",
  odontoiatria_clinica:
    "Conoscenza base dell'odontoiatria clinica (patologie, diagnosi, terapie)",
  legislazione_sanitaria:
    "Legislazione sanitaria: sistema normativo, aspetti etici e deontologici",
  altro: "Altro",
};

export const CARATTERISTICHE_DO_LABELS: Record<
  keyof Omit<CaratteristichePersonaliDO, "altro_specifica">,
  string
> = {
  pianificazione_organizzazione: "Capacità di pianificazione e organizzazione",
  comunicazione_assertiva: "Comunicazione assertiva",
  attenzione_dettaglio: "Attenzione al dettaglio",
  problem_solving: "Problem solving (specie in real time)",
  orientamento_cliente: "Orientamento al cliente (interno ed esterno)",
  mediazione_negoziazione: "Mediazione e negoziazione",
  altro: "Altro",
};

export const CARATTERISTICHE_ASO_LABELS: Record<
  keyof Omit<CaratteristichePersonaliASO, "altro_specifica">,
  string
> = {
  attitudine_rapporto_interpersonale: "Attitudine al rapporto interpersonale",
  attenzione_cliente: "Attenzione al cliente (interno ed esterno)",
  attenzione_dettaglio: "Attenzione al dettaglio",
  pianificazione_gestione_ambiente:
    "Pianificazione e gestione dell'ambiente di lavoro",
  orientamento_risultato: "Orientamento al risultato",
  teamworking: "Teamworking",
  altro: "Altro",
};

export const CONTRACT_TYPE_LABELS: Record<ContractTypeJD, string> = {
  [ContractTypeJD.TEMPO_INDETERMINATO]: "Tempo indeterminato",
  [ContractTypeJD.TEMPO_DETERMINATO]: "Tempo determinato",
  [ContractTypeJD.TEMPO_DETERMINATO_6_MESI]:
    "Tempo determinato 6+6 mesi con valutazione per passaggio a indeterminato",
  [ContractTypeJD.APPRENDISTATO]: "Apprendistato",
  [ContractTypeJD.PARTITA_IVA]: "Partita IVA",
  [ContractTypeJD.STAGE_TIROCINIO]: "Stage/Tirocinio",
  [ContractTypeJD.LAVORO_STAGIONALE]: "Lavoro stagionale",
  [ContractTypeJD.CONTRATTO_A_PROGETTO]: "Contratto a progetto",
};

export const REQUIREMENT_LEVEL_LABELS: Record<RequirementLevel, string> = {
  [RequirementLevel.VINCOLANTE]: "Vincolante",
  [RequirementLevel.PREFERIBILE]: "Preferibile",
  [RequirementLevel.ININFLUENTE]: "Ininfluente",
};

export const WORK_SCHEDULE_LABELS: Record<WorkSchedule, string> = {
  [WorkSchedule.FULL_TIME]: "Full time",
  [WorkSchedule.PART_TIME]: "Part time",
};
