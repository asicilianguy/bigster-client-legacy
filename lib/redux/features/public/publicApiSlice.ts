import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BigsterTestPublicInfo,
  BigsterQuestionsResponse,
  BigsterProgressResponse,
  VerifyHashResponse,
  StartBigsterTestRequest,
  StartBigsterTestResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  SubmitAnswersBatchRequest,
  SubmitAnswersBatchResponse,
  CompleteTestRequest,
  CompleteTestResponse,
} from "@/types/bigster";
import { AttestatoAsoStatus } from "@/types/application";

export interface PublicAnnouncement {
  id: number;
  hash_candidatura: string;
  piattaforma: string | null;
  citta: string | null;
  provincia: string | null;
  regione: string | null;
  stato: string;
  link_annuncio: string | null;
  data_pubblicazione: string | null;
  selezione: {
    id: number;
    titolo: string;
    figura_ricercata: string | null;
    company: {
      id: number;
      nome: string;
      citta: string | null;
    };
  };
}

export interface CreateApplicationPayload {
  annuncio_id: number;
  nome: string;
  cognome: string;
  email: string;
  telefono?: string | null;
  sesso?: string | null;

  birthdate?: string | null;

  regione?: string | null;
  provincia?: string | null;
  citta?: string | null;

  domicilio_regione?: string | null;
  domicilio_provincia?: string | null;
  domicilio_citta?: string | null;

  automunito?: boolean | null;
  disponibilita_trasferte?: boolean | null;
  partita_iva?: boolean | null;
  attestato_aso?: AttestatoAsoStatus | null;
  disponibilita_immediata?: boolean | null;
  preavviso_settimane?: number | null;

  titoli_studio?: string | null;
  cv_s3_key?: string | null;
}

export interface CreateApplicationResponse {
  message: string;
  data: {
    id: number;
    nome: string;
    cognome: string;
    email: string;
    data_creazione: string;
  };
}

export interface CvUploadUrlRequest {
  filename: string;
  contentType: string;
  announcementId?: number | null;
}

export interface CvUploadUrlResponse {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}

interface BigsterTestInfoResponse {
  success: true;
  data: BigsterTestPublicInfo;
}

interface BigsterQuestionsApiResponse {
  success: true;
  data: BigsterQuestionsResponse;
}

interface BigsterProgressApiResponse {
  success: true;
  data: BigsterProgressResponse;
}

export const publicApiSlice = createApi({
  reducerPath: "publicApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  }),
  tagTypes: [
    "PublicAnnouncement",

    "BigsterPublicTest",
  ],
  endpoints: (builder) => ({

    getAnnouncementByHash: builder.query<PublicAnnouncement, string>({
      query: (hash) => `/announcements/public/${hash}`,
      transformResponse: (response: { data: PublicAnnouncement }) =>
        response.data,
      providesTags: (result, error, hash) => [
        { type: "PublicAnnouncement", id: hash },
      ],
    }),

    submitApplication: builder.mutation<
      CreateApplicationResponse,
      CreateApplicationPayload
    >({
      query: (body) => ({
        url: "/applications",
        method: "POST",
        body,
      }),
    }),

    getCvUploadUrl: builder.mutation<CvUploadUrlResponse, CvUploadUrlRequest>({
      query: (body) => ({
        url: "/upload/cv",
        method: "POST",
        body,
      }),
    }),

    verifyBigsterHash: builder.query<VerifyHashResponse, string>({
      query: (hash) => `/bigster/verify/${hash}`,
    }),

    getBigsterTestInfo: builder.query<BigsterTestPublicInfo, string>({
      query: (hash) => `/bigster/test/${hash}`,
      transformResponse: (response: BigsterTestInfoResponse) => response.data,
      providesTags: (result, error, hash) => [
        { type: "BigsterPublicTest", id: hash },
      ],
    }),

    startBigsterTest: builder.mutation<
      StartBigsterTestResponse,
      { hash: string; body: StartBigsterTestRequest }
    >({
      query: ({ hash, body }) => ({
        url: `/bigster/test/${hash}/start`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { hash }) => [
        { type: "BigsterPublicTest", id: hash },
      ],
    }),

    getBigsterQuestions: builder.query<
      BigsterQuestionsResponse,
      { hash: string; lang?: string }
    >({
      query: ({ hash, lang = "it" }) =>
        `/bigster/test/${hash}/questions?lang=${lang}`,
      transformResponse: (response: BigsterQuestionsApiResponse) =>
        response.data,
    }),

    submitBigsterAnswer: builder.mutation<
      SubmitAnswerResponse,
      { hash: string; body: SubmitAnswerRequest }
    >({
      query: ({ hash, body }) => ({
        url: `/bigster/test/${hash}/answer`,
        method: "POST",
        body,
      }),
    }),

    submitBigsterAnswersBatch: builder.mutation<
      SubmitAnswersBatchResponse,
      { hash: string; body: SubmitAnswersBatchRequest }
    >({
      query: ({ hash, body }) => ({
        url: `/bigster/test/${hash}/answers`,
        method: "POST",
        body,
      }),
    }),

    getBigsterProgress: builder.query<BigsterProgressResponse, string>({
      query: (hash) => `/bigster/test/${hash}/progress`,
      transformResponse: (response: BigsterProgressApiResponse) =>
        response.data,
    }),

    completeBigsterTest: builder.mutation<
      CompleteTestResponse,
      { hash: string; body: CompleteTestRequest }
    >({
      query: ({ hash, body }) => ({
        url: `/bigster/test/${hash}/complete`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { hash }) => [
        { type: "BigsterPublicTest", id: hash },
      ],
    }),
  }),
});

export const {

  useGetAnnouncementByHashQuery,
  useLazyGetAnnouncementByHashQuery,
  useSubmitApplicationMutation,
  useGetCvUploadUrlMutation,

  useVerifyBigsterHashQuery,
  useLazyVerifyBigsterHashQuery,
  useGetBigsterTestInfoQuery,
  useLazyGetBigsterTestInfoQuery,
  useStartBigsterTestMutation,
  useGetBigsterQuestionsQuery,
  useLazyGetBigsterQuestionsQuery,
  useSubmitBigsterAnswerMutation,
  useSubmitBigsterAnswersBatchMutation,
  useGetBigsterProgressQuery,
  useLazyGetBigsterProgressQuery,
  useCompleteBigsterTestMutation,
} = publicApiSlice;
