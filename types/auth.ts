import { UserRole } from "./user";

export interface UserBasic {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  ruolo: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserBasic;
}

export interface VerifyTokenResponse {
  user: UserBasic;
}

export interface LogoutResponse {
  message: string;
}

export interface AuthErrorResponse {
  message: string;
}

export const isLoginResponse = (obj: any): obj is LoginResponse => {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.token === "string" &&
    obj.user !== undefined &&
    typeof obj.user === "object" &&
    typeof obj.user.id === "number" &&
    typeof obj.user.email === "string"
  );
};

export const isVerifyTokenResponse = (obj: any): obj is VerifyTokenResponse => {
  return (
    obj &&
    typeof obj === "object" &&
    obj.user !== undefined &&
    typeof obj.user === "object" &&
    typeof obj.user.id === "number" &&
    typeof obj.user.email === "string"
  );
};
