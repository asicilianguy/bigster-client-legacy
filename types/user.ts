export enum UserRole {
  CEO = "CEO",
  RESPONSABILE_RISORSE_UMANE = "RESPONSABILE_RISORSE_UMANE",
  RISORSA_UMANA = "RISORSA_UMANA",
  AMMINISTRAZIONE = "AMMINISTRAZIONE",
  DEVELOPER = "DEVELOPER",
}

export enum SelectionStatus {
  FATTURA_AV_SALDATA = "FATTURA_AV_SALDATA",
  HR_ASSEGNATA = "HR_ASSEGNATA",
  PRIMA_CALL_COMPLETATA = "PRIMA_CALL_COMPLETATA",
  RACCOLTA_JOB_IN_APPROVAZIONE_CLIENTE = "RACCOLTA_JOB_IN_APPROVAZIONE_CLIENTE",
  RACCOLTA_JOB_APPROVATA_CLIENTE = "RACCOLTA_JOB_APPROVATA_CLIENTE",
  BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO = "BOZZA_ANNUNCIO_IN_APPROVAZIONE_CEO",
  ANNUNCIO_APPROVATO = "ANNUNCIO_APPROVATO",
  ANNUNCIO_PUBBLICATO = "ANNUNCIO_PUBBLICATO",
  CANDIDATURE_RICEVUTE = "CANDIDATURE_RICEVUTE",
  COLLOQUI_IN_CORSO = "COLLOQUI_IN_CORSO",
  CANDIDATO_IN_PROVA = "CANDIDATO_IN_PROVA",
  SELEZIONI_IN_SOSTITUZIONE = "SELEZIONI_IN_SOSTITUZIONE",
  CHIUSA = "CHIUSA",
  ANNULLATA = "ANNULLATA",
}

export enum PackageType {
  BASE = "BASE",
  MDO = "MDO",
}

export interface UserBase {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  ruolo: UserRole;
  data_creazione: string;
  data_modifica: string;
}

export interface CompanyBasic {
  id: number;
  nome: string;
}

export interface UserResponse extends UserBase { }

export interface UserDetail extends UserBase {
  _count: {
    selezioni_come_consulente: number;
    selezioni_come_hr: number;
    storico_selezioni: number;
  };
}

export interface UserWithSelectionCount {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  data_creazione: string;
  _count: {
    selezioni_come_consulente?: number;
    selezioni_come_hr?: number;
  };
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    nome: string;
    cognome: string;
    email: string;
    ruolo: UserRole;
  };
}

export interface VerifyTokenResponse {
  user: UserResponse;
}

export interface SelectionStatsItem {
  id: number;
  titolo: string;
  stato: SelectionStatus;
  pacchetto?: PackageType;
  data_creazione: string;
  company: CompanyBasic;
}

export interface UserStatsResponse {
  utente: {
    id: number;
    nome: string;
    cognome: string;
    ruolo: UserRole;
  };
  selezioni_vendute: {
    totale: number;
    per_stato: Record<SelectionStatus, number>;
    lista: SelectionStatsItem[];
  };
  selezioni_gestite: {
    totale: number;
    per_stato: Record<SelectionStatus, number>;
    lista: Array<Omit<SelectionStatsItem, "pacchetto">>;
  };
}

export interface RegisterPayload {
  nome: string;
  cognome: string;
  email: string;
  password: string;
  ruolo: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateUserPayload {
  nome?: string;
  cognome?: string;
  email?: string;
  password?: string;
  ruolo?: UserRole;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}

export interface GetUsersQueryParams {
  ruolo?: UserRole;
}

export interface MessageResponse {
  message: string;
}

export interface DeleteUserResponse extends MessageResponse { }
export interface ChangePasswordResponse extends MessageResponse { }
export interface LogoutResponse extends MessageResponse { }

export const isUserResponse = (obj: any): obj is UserResponse => {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "number" &&
    typeof obj.nome === "string" &&
    typeof obj.cognome === "string" &&
    typeof obj.email === "string" &&
    typeof obj.ruolo === "string"
  );
};

export const isLoginResponse = (obj: any): obj is LoginResponse => {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.token === "string" &&
    obj.user !== undefined &&
    isUserResponse(obj.user)
  );
};

export const isUserDetail = (obj: any): obj is UserDetail => {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "number" &&
    typeof obj.nome === "string" &&
    typeof obj.cognome === "string" &&
    typeof obj.email === "string" &&
    typeof obj.ruolo === "string" &&
    obj._count !== undefined &&
    typeof obj._count === "object" &&
    typeof obj._count.selezioni_come_consulente === "number" &&
    typeof obj._count.selezioni_come_hr === "number" &&
    typeof obj._count.storico_selezioni === "number"
  );
};
