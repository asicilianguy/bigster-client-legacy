import { apiSlice } from "../api/apiSlice";

export interface GeographyRegione {
    nome: string;
}

export interface GeographyProvincia {
    nome: string;
    sigla: string;
    regione: string;
}

export interface GeographyComune {
    nome: string;
    provincia: string;
    provinciaName: string;
    regione: string;
}

export interface ComuniSearchResponse {
    results: GeographyComune[];
    total: number;
    query: string;
}

const geographyApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        getRegioni: builder.query<GeographyRegione[], void>({
            query: () => "/geography/regioni",
            keepUnusedDataFor: 3600,
        }),

        getProvince: builder.query<GeographyProvincia[], string | void>({
            query: (regione) =>
                regione
                    ? `/geography/province?regione=${encodeURIComponent(regione)}`
                    : "/geography/province",
            keepUnusedDataFor: 3600,
        }),

        getComuni: builder.query<GeographyComune[], { provincia?: string; regione?: string }>({
            query: ({ provincia, regione }) => {
                if (provincia) return `/geography/comuni?provincia=${encodeURIComponent(provincia)}`;
                if (regione) return `/geography/comuni?regione=${encodeURIComponent(regione)}`;
                return "/geography/comuni";
            },
            keepUnusedDataFor: 3600,
        }),

        searchComuni: builder.query<ComuniSearchResponse, { q: string; provincia: string; limit?: number }>({
            query: ({ q, provincia, limit = 15 }) =>
                `/geography/comuni/search?q=${encodeURIComponent(q)}&provincia=${encodeURIComponent(provincia)}&limit=${limit}`,
            keepUnusedDataFor: 300,
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetRegioniQuery,
    useGetProvinceQuery,
    useGetComuniQuery,
    useSearchComuniQuery,
    useLazySearchComuniQuery,
} = geographyApi;
