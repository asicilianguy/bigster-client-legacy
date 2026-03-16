import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import {
  JobDescriptionForm,
  JobDescriptionType,
  SERVIZI_ODONTOIATRICI_LABELS,
  ServizioOdontoiatrico,
  ATTIVITA_DO_LABELS,
  ATTIVITA_ASO_LABELS,
  COMPETENZE_HARD_DO_LABELS,
  COMPETENZE_HARD_ASO_LABELS,
  CONOSCENZE_TECNICHE_DO_LABELS,
  CONOSCENZE_TECNICHE_ASO_LABELS,
  CARATTERISTICHE_DO_LABELS,
  CARATTERISTICHE_ASO_LABELS,
  CONTRACT_TYPE_LABELS,
  REQUIREMENT_LEVEL_LABELS,
  WorkSchedule,
} from "@/types/jobDescription";

const colors = {
  primary: "#fde01c",
  primaryText: "#6c4e06",
  text: "#6c4e06",
  textMuted: "#666666",
  border: "#d8d8d8",
  cardBg: "#f5f5f7",
  white: "#ffffff",
  green: "#16a34a",
  blue: "#2563eb",
  yellow: "#ca8a04",
};

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: colors.text,
  },

  header: {
    textAlign: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.primaryText,
  },
  headerCompany: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 4,
  },

  macroSection: {
    marginBottom: 15,
  },
  macroSectionHeader: {
    backgroundColor: colors.cardBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  macroSectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },

  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  col2: {
    width: "50%",
    paddingRight: 8,
  },
  col3: {
    width: "33.33%",
    paddingRight: 8,
  },
  colFull: {
    width: "100%",
  },

  field: {
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 9,
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxText: {
    fontSize: 9,
    flex: 1,
  },
  checkboxTextChecked: {
    fontFamily: "Helvetica-Bold",
  },
  checkboxNoteRow: {
    marginLeft: 16,
    marginTop: 2,
  },
  checkboxNote: {
    fontSize: 8,
    color: colors.textMuted,
    fontStyle: "italic",
  },
  checkmark: {
    fontSize: 7,
    color: colors.primaryText,
    fontFamily: "Helvetica-Bold",
  },

  infoBox: {
    backgroundColor: colors.cardBg,
    padding: 8,
    marginBottom: 6,
  },
  infoBoxLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  infoBoxValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
  },

  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.primaryText,
  },
  badgeBlue: {
    backgroundColor: "#dbeafe",
  },
  badgeBlueText: {
    color: "#1e40af",
  },

  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.cardBg,
    padding: 6,
    marginBottom: 3,
  },
  listItemBlue: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },

  noteBox: {
    backgroundColor: "#fefce8",
    borderWidth: 1,
    borderColor: "#fde047",
    padding: 6,
    marginTop: 4,
  },
  noteLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#a16207",
    marginBottom: 2,
  },
  noteText: {
    fontSize: 8,
    color: "#854d0e",
  },

  greenBox: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#86efac",
    padding: 8,
    marginBottom: 6,
  },
  greenText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#166534",
  },
  greenSubtext: {
    fontSize: 8,
    color: "#15803d",
    marginTop: 2,
  },

  footer: {
    textAlign: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 15,
  },
  footerText: {
    fontSize: 8,
    color: colors.textMuted,
  },

  checkboxGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  checkboxGridItem: {
    width: "50%",
    paddingRight: 4,
  },
});

const CheckItem = ({
  checked,
  label,
  note,
  fullWidth = false,
}: {
  checked: boolean;
  label: string;
  note?: string;
  fullWidth?: boolean;
}) => (
  <View
    style={[{ marginBottom: 5 }, ...(fullWidth ? [styles.colFull] : [])]}
    wrap={false}
  >

    <View style={styles.checkboxRow}>
      <View
        style={[styles.checkbox, ...(checked ? [styles.checkboxChecked] : [])]}
      >
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text
        style={[
          styles.checkboxText,
          ...(checked ? [styles.checkboxTextChecked] : []),
        ]}
      >
        {label}
      </Text>
    </View>

    {note && checked && (
      <View style={styles.checkboxNoteRow}>
        <Text style={styles.checkboxNote}>({note})</Text>
      </View>
    )}
  </View>
);

const Field = ({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined;
}) => {
  if (!value) return null;
  return (
    <View style={styles.field} wrap={false}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
};

const SectionTitle = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader} wrap={false}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

interface JobDescriptionPdfDocumentProps {
  formData: JobDescriptionForm;
  tipo: JobDescriptionType;
  companyName?: string;
}

export const JobDescriptionPdfDocument = ({
  formData,
  tipo,
  companyName,
}: JobDescriptionPdfDocumentProps) => {
  const analisi = formData.analisi_organizzativa;
  const profilo = formData.analisi_profilo;
  const offerta = formData.offerta;
  const chiusura = formData.chiusura;

  const getServizioNome = (servizioId: string): string => {
    if (
      Object.values(ServizioOdontoiatrico).includes(
        servizioId as ServizioOdontoiatrico
      )
    ) {
      return SERVIZI_ODONTOIATRICI_LABELS[servizioId as ServizioOdontoiatrico];
    }
    const personalizzato = analisi.servizi_personalizzati?.find(
      (s) => s.id === servizioId
    );
    return personalizzato?.nome || servizioId;
  };

  const attivitaLabels =
    tipo === JobDescriptionType.DO ? ATTIVITA_DO_LABELS : ATTIVITA_ASO_LABELS;
  const competenzeLabels =
    tipo === JobDescriptionType.DO
      ? COMPETENZE_HARD_DO_LABELS
      : COMPETENZE_HARD_ASO_LABELS;
  const conoscenzeLabels =
    tipo === JobDescriptionType.DO
      ? CONOSCENZE_TECNICHE_DO_LABELS
      : CONOSCENZE_TECNICHE_ASO_LABELS;
  const caratteristicheLabels =
    tipo === JobDescriptionType.DO
      ? CARATTERISTICHE_DO_LABELS
      : CARATTERISTICHE_ASO_LABELS;

  const attivita = profilo.attivita;
  const competenze = profilo.competenze_hard;
  const conoscenze = profilo.conoscenze_tecniche;
  const caratteristiche = profilo.caratteristiche_personali;

  return (
    <Document>

      <Page size="A4" style={styles.page}>

        <View style={styles.header} fixed>
          <Text style={styles.headerTitle}>SCHEDA RACCOLTA JOB</Text>
          <Text style={styles.headerSubtitle}>
            {tipo === JobDescriptionType.DO
              ? "DENTIST ORGANIZER (DO)"
              : "ASSISTENTE DI STUDIO ODONTOIATRICO (ASO)"}
          </Text>
          {companyName && false && (
            <Text style={styles.headerCompany}>{companyName}</Text>
          )}
        </View>

        <View style={styles.macroSection}>
          <View style={styles.macroSectionHeader}>
            <Text style={styles.macroSectionTitle}>
              1. ANALISI ORGANIZZATIVA
            </Text>
          </View>

          <View style={styles.section} wrap={false}>
            <SectionTitle title="Dati Anagrafici" />
            <View style={styles.row}>
              <View style={styles.colFull}>
                <Field
                  label="Ragione Sociale"
                  value={analisi.dati_anagrafici.ragione_sociale}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.colFull}>
                <Field
                  label="Indirizzo"
                  value={analisi.dati_anagrafici.indirizzo}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.col2}>
                <Field label="Città" value={analisi.dati_anagrafici.citta} />
              </View>
              <View style={styles.col2}>
                <Field
                  label="Provincia"
                  value={analisi.dati_anagrafici.provincia}
                />
              </View>
            </View>
          </View>

          <View style={styles.section} wrap={false}>
            <SectionTitle title="Lo Studio" />
            <View style={styles.row}>
              <View style={styles.col2}>
                <Field
                  label="Anni di Attività"
                  value={analisi.studio_info.anni_attivita}
                />
              </View>
            </View>
            <Field
              label="Evoluzioni nel Tempo"
              value={analisi.studio_info.evoluzioni_nel_tempo}
            />
          </View>

          <View style={styles.section} wrap={false}>
            <SectionTitle title="Struttura ad Oggi" />
            <View style={styles.row}>
              <View style={styles.col2}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoBoxLabel}>Dipendenti</Text>
                  <Text style={styles.infoBoxValue}>
                    {analisi.struttura_ad_oggi.n_dipendenti}
                  </Text>
                </View>
              </View>
              <View style={styles.col2}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoBoxLabel}>Collaboratori</Text>
                  <Text style={styles.infoBoxValue}>
                    {analisi.struttura_ad_oggi.n_collaboratori}
                  </Text>
                </View>
              </View>
            </View>

            {analisi.struttura_ad_oggi.dipendenti?.length > 0 && (
              <View style={{ marginTop: 6 }}>
                <Text style={styles.infoBoxLabel}>DIPENDENTI</Text>
                {analisi.struttura_ad_oggi.dipendenti.map((dip, idx) => (
                  <View key={idx} style={styles.listItem} wrap={false}>
                    <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>
                      {dip.nome_cognome
                        ? `${dip.nome_cognome}${dip.ruolo_mansione ? ` — ${dip.ruolo_mansione}` : ""}`
                        : dip.ruolo_mansione || `Dipendente ${idx + 1}`}
                    </Text>
                    <Text style={{ fontSize: 8, color: colors.textMuted }}>
                      {dip.eta && `${dip.eta} anni`}
                      {dip.dettagli_presenza && ` • ${dip.dettagli_presenza}`}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {analisi.struttura_ad_oggi.collaboratori?.length > 0 && (
              <View style={{ marginTop: 6 }}>
                <Text style={styles.infoBoxLabel}>COLLABORATORI</Text>
                {analisi.struttura_ad_oggi.collaboratori.map((coll, idx) => (
                  <View
                    key={idx}
                    style={[styles.listItem, styles.listItemBlue]}
                    wrap={false}
                  >
                    <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>
                      {coll.nome_cognome
                        ? `${coll.nome_cognome}${coll.ruolo_mansione ? ` — ${coll.ruolo_mansione}` : ""}`
                        : coll.ruolo_mansione || `Collaboratore ${idx + 1}`}
                    </Text>
                    <Text style={{ fontSize: 8, color: colors.textMuted }}>
                      {coll.eta && `${coll.eta} anni`}
                      {coll.dettagli_presenza && ` • ${coll.dettagli_presenza}`}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section} wrap={false}>
            <SectionTitle title="Servizi e Clientela" />
            <Field
              label="Clienti / Segmenti"
              value={analisi.clienti_segmenti}
            />

            {analisi.distribuzione_servizi?.some((s) => s.attivo) && (
              <View style={{ marginTop: 6 }}>
                <Text style={styles.infoBoxLabel}>DISTRIBUZIONE SERVIZI</Text>
                <View style={styles.row}>
                  {analisi.distribuzione_servizi
                    .filter((s) => s.attivo)
                    .map((s) => (
                      <View
                        key={s.servizio}
                        style={[styles.col2, { marginBottom: 4 }]}
                      >
                        <View style={styles.listItem}>
                          <Text style={{ fontSize: 8 }}>
                            {SERVIZI_ODONTOIATRICI_LABELS[s.servizio]}
                          </Text>
                          <Text
                            style={{
                              fontSize: 9,
                              fontFamily: "Helvetica-Bold",
                            }}
                          >
                            {s.percentuale}%
                          </Text>
                        </View>
                      </View>
                    ))}
                </View>
              </View>
            )}

            {(analisi.servizi_di_punta?.length ?? 0) > 0 && (
              <View style={{ marginTop: 6 }}>
                <Text style={styles.infoBoxLabel}>SERVIZI DI PUNTA</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {analisi.servizi_di_punta?.map((servizioId) => (
                    <View key={servizioId} style={styles.badge}>
                      <Text style={styles.badgeText}>
                        ★ {getServizioNome(servizioId)}
                      </Text>
                    </View>
                  ))}
                </View>
                {analisi.servizi_di_punta_note && (
                  <View style={styles.noteBox}>
                    <Text style={styles.noteLabel}>NOTE:</Text>
                    <Text style={styles.noteText}>
                      {analisi.servizi_di_punta_note}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={[styles.row, { marginTop: 6 }]}>
              <View style={styles.col2}>
                <Field
                  label="Fatturato Annuo"
                  value={analisi.fatturato_annuo}
                />
              </View>
              <View style={styles.col2}>
                <Field
                  label="Forniture e Magazzino"
                  value={analisi.forniture_e_magazzino}
                />
              </View>
            </View>
          </View>

          <View style={styles.section} wrap={false}>
            <SectionTitle title="Digitalizzazione" />
            <View style={styles.checkboxGrid}>
              <View style={styles.checkboxGridItem}>
                <CheckItem
                  checked={analisi.digitalizzazione.applicativi_contabilita}
                  label="Applicativi contabilità"
                  note={analisi.digitalizzazione.applicativi_contabilita_note}
                />
              </View>
              <View style={styles.checkboxGridItem}>
                <CheckItem
                  checked={
                    analisi.digitalizzazione.software_gestionali_odontoiatrici
                  }
                  label="Software gestionali"
                  note={
                    analisi.digitalizzazione
                      .software_gestionali_odontoiatrici_note
                  }
                />
              </View>
              <View style={styles.checkboxGridItem}>
                <CheckItem
                  checked={analisi.digitalizzazione.sito}
                  label="Sito Web"
                  note={analisi.digitalizzazione.sito_url}
                />
              </View>
              <View style={styles.checkboxGridItem}>
                <CheckItem
                  checked={analisi.digitalizzazione.social}
                  label="Social Network"
                  note={analisi.digitalizzazione.social_note}
                />
              </View>
              <View style={styles.checkboxGridItem}>
                <CheckItem
                  checked={analisi.digitalizzazione.piattaforme_marketing}
                  label="Piattaforme Marketing"
                  note={analisi.digitalizzazione.piattaforme_marketing_note}
                />
              </View>
              <View style={styles.checkboxGridItem}>
                <CheckItem
                  checked={analisi.digitalizzazione.altri_app_strumenti}
                  label="Altri strumenti"
                  note={analisi.digitalizzazione.altri_app_strumenti_note}
                />
              </View>
            </View>
          </View>

          <View style={styles.section} wrap={false}>
            <SectionTitle title="SWOT e Obiettivi" />
            <Field
              label="Tratti Distintivi"
              value={analisi.tratti_distintivi}
            />
            <Field
              label="Obiettivi di Sviluppo"
              value={analisi.obiettivi_di_sviluppo}
            />
            <Field label="SWOT Analysis" value={analisi.swot_analysis} />
          </View>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.macroSection}>
          <View style={styles.macroSectionHeader}>
            <Text style={styles.macroSectionTitle}>2. ANALISI DEL PROFILO</Text>
          </View>

          <View style={styles.section} wrap={false}>
            <SectionTitle title="Attività Previste dal Ruolo" />
            <View style={styles.checkboxGrid}>
              {Object.entries(attivitaLabels).map(([key, label]) => {
                if (key === "altro_specifica" || key === "note_attivita")
                  return null;
                return (
                  <View key={key} style={styles.checkboxGridItem}>
                    <CheckItem
                      checked={(attivita as any)[key] || false}
                      label={label}
                    />
                  </View>
                );
              })}
            </View>
            {(attivita as any).altro_specifica && (
              <View style={styles.noteBox}>
                <Text style={styles.noteLabel}>ALTRO:</Text>
                <Text style={styles.noteText}>
                  {(attivita as any).altro_specifica}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section} wrap={false}>
            <SectionTitle title="Competenze Hard" />
            {Object.entries(competenzeLabels).map(([key, label]) => {
              const comp = competenze as any;
              const isChecked =
                typeof comp[key] === "boolean"
                  ? comp[key]
                  : comp[key]?.selezionata || false;
              const note = typeof comp[key] === "object" ? comp[key]?.note : "";
              return (
                <CheckItem
                  key={key}
                  checked={isChecked}
                  label={label}
                  note={note}
                  fullWidth
                />
              );
            })}
          </View>

          <View style={styles.section} wrap={false}>
            <SectionTitle title="Conoscenze Tecniche" />
            {Object.entries(conoscenzeLabels).map(([key, label]) => {
              const con = conoscenze as any;
              const isChecked =
                typeof con[key] === "boolean"
                  ? con[key]
                  : con[key]?.selezionata || false;
              const note = typeof con[key] === "object" ? con[key]?.note : "";
              return (
                <CheckItem
                  key={key}
                  checked={isChecked}
                  label={label}
                  note={note}
                  fullWidth
                />
              );
            })}
          </View>

          <View style={styles.section} wrap={false}>
            <SectionTitle title="Caratteristiche Personali" />
            <View style={styles.checkboxGrid}>
              {Object.entries(caratteristicheLabels).map(([key, label]) => {
                if (key === "altro_specifica") return null;
                return (
                  <View key={key} style={styles.checkboxGridItem}>
                    <CheckItem
                      checked={(caratteristiche as any)[key] || false}
                      label={label}
                    />
                  </View>
                );
              })}
            </View>
            {(caratteristiche as any).altro_specifica && (
              <View style={styles.noteBox}>
                <Text style={styles.noteLabel}>ALTRO:</Text>
                <Text style={styles.noteText}>
                  {(caratteristiche as any).altro_specifica}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section} wrap={false}>
            <SectionTitle title="Formazione ed Esperienza" />

            <View style={{ marginBottom: 8 }}>
              <Text style={styles.infoBoxLabel}>PERCORSO FORMATIVO</Text>
              {profilo.percorso_formativo.diploma && (
                <CheckItem
                  checked={true}
                  label={`Diploma: ${profilo.percorso_formativo.diploma}`}
                  fullWidth
                />
              )}
              {profilo.percorso_formativo.laurea_triennale && (
                <CheckItem
                  checked={true}
                  label={`Laurea Triennale: ${profilo.percorso_formativo.laurea_triennale}`}
                  fullWidth
                />
              )}
              {profilo.percorso_formativo.laurea_magistrale && (
                <CheckItem
                  checked={true}
                  label={`Laurea Magistrale: ${profilo.percorso_formativo.laurea_magistrale}`}
                  fullWidth
                />
              )}
              <CheckItem
                checked={profilo.percorso_formativo.nessun_titolo_preferenziale}
                label="Nessun titolo preferenziale"
                fullWidth
              />
              {!profilo.percorso_formativo.diploma &&
                !profilo.percorso_formativo.laurea_triennale &&
                !profilo.percorso_formativo.laurea_magistrale &&
                !profilo.percorso_formativo.nessun_titolo_preferenziale && (
                  <Text
                    style={{
                      fontSize: 8,
                      color: colors.textMuted,
                      fontStyle: "italic",
                    }}
                  >
                    Nessun requisito formativo specificato
                  </Text>
                )}
            </View>

            <View style={styles.row}>
              <View style={styles.col2}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoBoxLabel}>ESPERIENZA RICHIESTA</Text>
                  <Text style={{ fontSize: 9 }}>
                    {profilo.esperienza.richiesta
                      ? `Sì, ${profilo.esperienza.anni || "non specificato"}`
                      : "Non richiesta"}
                  </Text>
                </View>
              </View>
              <View style={styles.col2}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoBoxLabel}>LINGUE</Text>
                  {profilo.lingue.inglese.richiesta && (
                    <Text style={{ fontSize: 9 }}>
                      Inglese: {profilo.lingue.inglese.livello || "Base"}
                    </Text>
                  )}
                  {profilo.lingue.altra_lingua.richiesta && (
                    <Text style={{ fontSize: 9 }}>
                      {profilo.lingue.altra_lingua_nome || "Altra lingua"}:{" "}
                      {profilo.lingue.altra_lingua.livello || "Base"}
                    </Text>
                  )}
                  {!profilo.lingue.inglese.richiesta &&
                    !profilo.lingue.altra_lingua.richiesta && (
                      <Text style={{ fontSize: 8, color: colors.textMuted }}>
                        Nessun requisito linguistico
                      </Text>
                    )}
                </View>
              </View>
            </View>
          </View>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>

        <View style={styles.macroSection}>
          <View style={styles.macroSectionHeader}>
            <Text style={styles.macroSectionTitle}>3. OFFERTA</Text>
          </View>

          <View style={styles.section} wrap={false}>
            <SectionTitle title="Dettagli Offerta" />
            <View style={styles.row}>
              <View style={styles.col2}>
                <Field
                  label="N. Persone Ricercate"
                  value={offerta.numero_persone}
                />
              </View>
              <View style={styles.col2}>
                <Field
                  label="Motivo della Ricerca"
                  value={offerta.motivo_ricerca}
                />
              </View>
            </View>
          </View>

          <View style={styles.section} wrap={false}>
            <Text style={styles.infoBoxLabel}>REQUISITI ANAGRAFICI</Text>
            <View style={styles.row}>
              <View style={styles.col3}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoBoxLabel}>Età</Text>
                  <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>
                    {offerta.eta || "-"}
                  </Text>
                  <Text style={{ fontSize: 7, color: colors.textMuted }}>
                    ({REQUIREMENT_LEVEL_LABELS[offerta.eta_livello]})
                  </Text>
                </View>
              </View>
              <View style={styles.col3}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoBoxLabel}>Patente</Text>
                  <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>
                    {REQUIREMENT_LEVEL_LABELS[offerta.patente]}
                  </Text>
                </View>
              </View>
              <View style={styles.col3}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoBoxLabel}>Automunita</Text>
                  <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>
                    {REQUIREMENT_LEVEL_LABELS[offerta.automunita]}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {offerta.tipi_contratto?.length > 0 && (
            <View style={styles.section} wrap={false}>
              <Text style={styles.infoBoxLabel}>TIPOLOGIA CONTRATTO</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {offerta.tipi_contratto.map((contratto) => (
                  <View
                    key={contratto}
                    style={[styles.badge, styles.badgeBlue]}
                  >
                    <Text style={[styles.badgeText, styles.badgeBlueText]}>
                      {CONTRACT_TYPE_LABELS[contratto]}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section} wrap={false}>
            <Text style={styles.infoBoxLabel}>ORARIO DI LAVORO</Text>
            <View style={styles.greenBox}>
              <Text style={styles.greenText}>
                {offerta.orario === WorkSchedule.FULL_TIME
                  ? "Full Time"
                  : "Part Time"}
              </Text>
              {offerta.orario === WorkSchedule.PART_TIME &&
                offerta.orario_part_time_dettagli && (
                  <Text style={styles.greenSubtext}>
                    {offerta.orario_part_time_dettagli}
                  </Text>
                )}
              {offerta.orario === WorkSchedule.FULL_TIME &&
                offerta.orario_full_time_dettagli && (
                  <Text style={styles.greenSubtext}>
                    {offerta.orario_full_time_dettagli}
                  </Text>
                )}
            </View>
          </View>

          <View style={styles.section} wrap={false}>
            <View style={styles.row}>
              <View style={styles.col2}>
                <Field
                  label="Compenso Mensile Netto"
                  value={offerta.compenso_mensile_netto}
                />
              </View>
              <View style={styles.col2}>
                <Field
                  label="Composizione Retribuzione"
                  value={offerta.composizione_retribuzione}
                />
              </View>
            </View>
            <Field
              label="Prospettive di Crescita"
              value={offerta.prospettive_crescita}
            />
          </View>

          <View style={styles.section} wrap={false}>
            <Text style={styles.infoBoxLabel}>BENEFITS</Text>
            <View style={styles.checkboxGrid}>
              <View style={styles.checkboxGridItem}>
                <CheckItem
                  checked={offerta.benefits.affiancamenti}
                  label="Affiancamenti"
                />
              </View>
              <View style={styles.checkboxGridItem}>
                <CheckItem
                  checked={offerta.benefits.auto_aziendale}
                  label="Auto aziendale"
                />
              </View>
              <View style={styles.checkboxGridItem}>
                <CheckItem
                  checked={offerta.benefits.corsi_aggiornamento}
                  label="Corsi di aggiornamento"
                />
              </View>
              <View style={styles.checkboxGridItem}>
                <CheckItem
                  checked={offerta.benefits.quote_societarie}
                  label="Quote societarie"
                />
              </View>
              <View style={styles.checkboxGridItem}>
                <CheckItem
                  checked={offerta.benefits.rimborso_spese}
                  label="Rimborso spese"
                />
              </View>
              {offerta.benefits.incentivi && (
                <View style={styles.checkboxGridItem}>
                  <CheckItem
                    checked={true}
                    label="Incentivi"
                    note={offerta.benefits.incentivi_specifica}
                  />
                </View>
              )}
              {offerta.benefits.master_dto && (
                <View style={styles.checkboxGridItem}>
                  <CheckItem
                    checked={true}
                    label="Master DTO"
                    note={offerta.benefits.master_dto_specifica}
                  />
                </View>
              )}
              {offerta.benefits.benefits && (
                <View style={styles.checkboxGridItem}>
                  <CheckItem
                    checked={true}
                    label="Benefits"
                    note={offerta.benefits.benefits_specifica}
                  />
                </View>
              )}
              {offerta.benefits.altro && (
                <View style={styles.checkboxGridItem}>
                  <CheckItem
                    checked={true}
                    label="Altro"
                    note={offerta.benefits.altro_specifica}
                  />
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.macroSection}>
          <View style={styles.macroSectionHeader}>
            <Text style={styles.macroSectionTitle}>4. CHIUSURA</Text>
          </View>

          <View style={styles.section} wrap={false}>
            <SectionTitle title="Note e Firma" />
            <Field
              label="Canali Specifici da Attivare"
              value={chiusura.canali_specifici}
            />
            <Field label="Note Aggiuntive" value={chiusura.note_aggiuntive} />

            <View
              style={{
                marginTop: 12,
                paddingTop: 10,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
              <View style={styles.row}>
                <View style={styles.col2}>
                  <Field label="Luogo" value={chiusura.luogo} />
                </View>
                <View style={styles.col2}>
                  <Field
                    label="Data"
                    value={
                      chiusura.data
                        ? new Date(chiusura.data).toLocaleDateString("it-IT")
                        : undefined
                    }
                  />
                </View>
              </View>
              {chiusura.firma_cliente && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.infoBoxLabel}>Firma Cliente</Text>
                  <View
                    style={{
                      padding: 10,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.cardBg,
                      minHeight: 30,
                    }}
                  >
                    <Text style={{ fontSize: 10, fontStyle: "italic" }}>
                      {chiusura.firma_cliente}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Documento generato il{" "}
            {new Date().toLocaleDateString("it-IT", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default JobDescriptionPdfDocument;
