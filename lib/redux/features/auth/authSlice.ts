import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { UserBasic } from "@/types/auth";
import { authApiSlice } from "./authApiSlice";

interface AuthState {
  user: UserBasic | null;
  token: string | null;
  isAuthenticated: boolean;
}

const loadAuthFromStorage = (): AuthState => {

  if (typeof window === "undefined") {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
    };
  }

  try {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      const user = JSON.parse(userStr);
      return {
        user,
        token,
        isAuthenticated: true,
      };
    }
  } catch (error) {
    console.error("Errore nel caricamento dati auth dal localStorage:", error);
  }

  return {
    user: null,
    token: null,
    isAuthenticated: false,
  };
};

const initialState: AuthState = loadAuthFromStorage();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {

    setCredentials: (
      state,
      action: PayloadAction<{ user: UserBasic; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },

    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },

    updateUser: (state, action: PayloadAction<UserBasic>) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {

    builder.addMatcher(
      authApiSlice.endpoints.login.matchFulfilled,
      (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      }
    );

    builder.addMatcher(
      authApiSlice.endpoints.verifyToken.matchFulfilled,
      (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
      }
    );

    builder.addMatcher(
      authApiSlice.endpoints.logout.matchFulfilled,
      (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      }
    );

    builder.addMatcher(
      (action) =>
        action.type.endsWith("/rejected") && action.payload?.status === 401,
      (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    );
  },
});

export const { setCredentials, clearCredentials, updateUser } =
  authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;
export const selectCurrentToken = (state: { auth: AuthState }) =>
  state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
