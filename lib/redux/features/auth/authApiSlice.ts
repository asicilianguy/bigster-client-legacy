import type {
  LoginPayload,
  LoginResponse,
  VerifyTokenResponse,
  LogoutResponse,
  AuthErrorResponse,
} from "@/types/auth";
import { apiSlice } from "../api/apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    login: builder.mutation<LoginResponse, LoginPayload>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      transformErrorResponse: (response: {
        status: number;
        data: AuthErrorResponse;
      }) => {
        return response.data;
      },
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
        } catch (error) {

        }
      },
    }),

    verifyToken: builder.query<VerifyTokenResponse, void>({
      query: () => ({
        url: "/auth/verify",
        method: "GET",
      }),
      providesTags: ["Auth"],
      transformErrorResponse: (response: {
        status: number;
        data: AuthErrorResponse;
      }) => {
        return response.data;
      },
    }),

    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } catch (error) {

          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      },
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useLoginMutation,
  useVerifyTokenQuery,
  useLazyVerifyTokenQuery,
  useLogoutMutation,
} = authApiSlice;
