import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Consultant {
  id: number;
  fullName: string;
  email: string;
  role: string;
  area: string;
  areaColor: string;
  companies: number;
  profileUrl: string;
}

export interface ConsultantsApiResponse {
  success: boolean;
  totalConsultants: number;
  consultants: Consultant[];
}

export interface Invoice {
  id: number;
  number: string;
  date: string;
  amount_gross: number;
  contract_number?: string;
  items_codes?: string[];
}

export interface InvoicesApiResponse {
  success: boolean;
  invoices: Invoice[];
}

export interface CompanyInfo {
  id: number;
  name: string;
  type: string;
  vat_number?: string;
  tax_code?: string;
}

export interface CompaniesApiResponse {
  data: {
    companies: CompanyInfo[];
  };
}

export const externalApiSlice = createApi({
  reducerPath: "externalApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
  }),
  tagTypes: ["Consultants", "Invoices", "Companies"],
  endpoints: (builder) => ({

    getConsultants: builder.query<ConsultantsApiResponse, void>({
      query: () => "/consultants",
      providesTags: ["Consultants"],
    }),

    getInvoices: builder.query<InvoicesApiResponse, void>({
      query: () => "/invoices",
      providesTags: ["Invoices"],
    }),

    getCompanies: builder.query<CompaniesApiResponse, { token: string }>({
      query: ({ token }) => ({
        url: "/fattureincloud/companies",
        params: { token },
      }),
      providesTags: ["Companies"],
    }),
  }),
});

export const {
  useGetConsultantsQuery,
  useGetInvoicesQuery,
  useGetCompaniesQuery,
  useLazyGetCompaniesQuery,
} = externalApiSlice;
