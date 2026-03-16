import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useInvoicesCache } from "@/app/contexts/InvoicesContext";
import { useLazyGetCompaniesQuery } from "@/lib/redux/features/external/externalApiSlice";
import type { Invoice } from "@/app/contexts/InvoicesContext";

export interface FattureInCloudConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  companyIndex?: number;
  companyId: number;
}

export interface FattureInCloudAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  companyId: string | null;
  expiresAt: number | null;
  error: string | null;
}

export interface CompanyInfo {
  id: number;
  name: string;
  type: string;
  vat_number?: string;
  tax_code?: string;
}

export type { Invoice };

export function useFattureInCloudAuth(config: FattureInCloudConfig) {
  const searchParams = useSearchParams();
  const companyIndex = config.companyIndex ?? 0;

  const { getInvoices, setInvoices, isCached, getCacheAge } =
    useInvoicesCache();

  const [triggerGetCompanies] = useLazyGetCompaniesQuery();

  const [authState, setAuthState] = useState<FattureInCloudAuthState>({
    isAuthenticated: false,
    isLoading: true,
    accessToken: null,
    refreshToken: null,
    companyId: null,
    expiresAt: null,
    error: null,
  });

  const [companies, setCompanies] = useState<CompanyInfo[]>([]);

  const isProcessingRef = useRef(false);

  const isTokenValid = useCallback((expiresAt: string | null): boolean => {
    if (!expiresAt) return false;
    return new Date(parseInt(expiresAt)) > new Date();
  }, []);

  const saveTokenToStorage = useCallback(
    (tokenData: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    }) => {
      if (
        !tokenData.accessToken ||
        !tokenData.refreshToken ||
        !tokenData.expiresIn
      ) {
        console.error("Token data incompleto:", tokenData);
        return;
      }

      try {
        if (typeof window === "undefined" || !window.localStorage) {
          console.error("localStorage non disponibile");
          return;
        }

        localStorage.setItem("fic_accessToken", tokenData.accessToken);
        localStorage.setItem("fic_refreshToken", tokenData.refreshToken);

        const expiresAt = Date.now() + tokenData.expiresIn * 1000;
        localStorage.setItem("fic_expiresAt", expiresAt.toString());

        setAuthState((prev) => ({
          ...prev,
          accessToken: tokenData.accessToken,
          refreshToken: tokenData.refreshToken,
          expiresAt,
          isAuthenticated: true,
          error: null,
        }));
      } catch (error) {
        console.error("Errore nel salvataggio dei token:", error);
      }
    },
    []
  );

  const saveCompanyToStorage = useCallback((companyId: number) => {
    localStorage.setItem("fic_companyId", companyId.toString());

    setAuthState((prev) => ({
      ...prev,
      companyId: companyId.toString(),
    }));
  }, []);

  const clearStorage = useCallback(() => {
    localStorage.removeItem("fic_accessToken");
    localStorage.removeItem("fic_refreshToken");
    localStorage.removeItem("fic_companyId");
    localStorage.removeItem("fic_expiresAt");
    localStorage.removeItem("fic_state");

    isProcessingRef.current = false;

    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
      refreshToken: null,
      companyId: null,
      expiresAt: null,
      error: null,
    });

    setCompanies([]);
  }, []);

  const generateAuthUrl = useCallback(
    (state: string): string => {
      const scopes = "settings:a issued_documents.invoices:r";

      const params = new URLSearchParams({
        response_type: "code",
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        scope: scopes,
        state: state,
      });

      return `https://api-v2.fattureincloud.it/oauth/authorize?${params.toString()}`;
    },
    [config.clientId, config.redirectUri]
  );

  const fetchToken = useCallback(
    async (code: string) => {
      const response = await fetch("/api/fattureincloud/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          redirectUri: config.redirectUri,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch token");
      }

      return await response.json();
    },
    [config.clientId, config.clientSecret, config.redirectUri]
  );

  const fetchCompanies = useCallback(
    async (accessToken: string) => {
      try {
        const result = await triggerGetCompanies({
          token: accessToken,
        }).unwrap();
        return result;
      } catch (error: any) {
        throw new Error(
          error?.data?.error || error?.message || "Failed to fetch companies"
        );
      }
    },
    [triggerGetCompanies]
  );

  const fetchInvoices = useCallback(
    async (forceRefresh: boolean = false): Promise<Invoice[]> => {
      if (!authState.accessToken || !authState.companyId) {
        return [];
      }

      const companyId = authState.companyId;

      if (!forceRefresh && isCached(companyId)) {
        const cached = getInvoices(companyId);
        if (cached) {
          const age = getCacheAge(companyId);
          console.log(
            `📦 Returning cached invoices (${cached.length} items, age: ${age ? Math.round(age / 1000) : 0
            }s)`
          );
          return cached;
        }
      }

      console.log(`🌐 Fetching invoices from API for company ${companyId}...`);

      const response = await fetch(
        `/api/fattureincloud/invoices?token=${encodeURIComponent(
          authState.accessToken
        )}&companyId=${companyId}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch invoices");
      }

      const data = await response.json();
      const invoices: Invoice[] = data.data || [];

      setInvoices(companyId, invoices);
      console.log(
        `✅ Cached ${invoices.length} invoices for company ${companyId}`
      );

      return invoices;
    },
    [
      authState.accessToken,
      authState.companyId,
      getInvoices,
      setInvoices,
      isCached,
      getCacheAge,
    ]
  );

  const startAuthorization = useCallback(
    (additionalData?: Record<string, string>) => {
      try {
        if (additionalData) {
          Object.entries(additionalData).forEach(([key, value]) => {
            localStorage.setItem(`fic_${key}`, value);
          });
        }

        const state = Math.random().toString(36).substring(2, 15);
        localStorage.setItem("fic_state", state);

        const authUrl = generateAuthUrl(state);
        window.location.href = authUrl;
      } catch (error) {
        console.error("Error starting authorization:", error);
        setAuthState((prev) => ({
          ...prev,
          error: "Errore nell'avvio dell'autorizzazione",
          isLoading: false,
        }));
      }
    },
    [generateAuthUrl]
  );

  const retrieveToken = useCallback(
    async (code: string) => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

        const tokenData = await fetchToken(code);
        saveTokenToStorage(tokenData);

        const companiesData = await fetchCompanies(tokenData.accessToken);

        if (
          companiesData?.data?.companies &&
          companiesData.data.companies.length > 0
        ) {
          const companiesList = companiesData.data.companies;
          setCompanies(companiesList);

          let selectedCompany;

          if (config.companyId) {
            selectedCompany = companiesList.find(
              (c: CompanyInfo) => c.id === config.companyId
            );
            if (!selectedCompany) {
              throw new Error(`Company con ID ${config.companyId} non trovata`);
            }
          } else {
            selectedCompany = companiesList[companyIndex] || companiesList[0];
          }

          saveCompanyToStorage(selectedCompany.id);

          setAuthState((prev) => ({ ...prev, isLoading: false }));

          return {
            success: true,
            companies: companiesList,
            selectedCompany,
          };
        } else {
          throw new Error("Nessuna company trovata");
        }
      } catch (error) {
        console.error("Error retrieving token:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setAuthState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        clearStorage();
        return { success: false, error: errorMessage };
      }
    },
    [
      fetchToken,
      fetchCompanies,
      saveTokenToStorage,
      saveCompanyToStorage,
      clearStorage,
      companyIndex,
      config.companyId,
    ]
  );

  const loadExistingSession = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("fic_accessToken");
      const refreshToken = localStorage.getItem("fic_refreshToken");
      const companyId = localStorage.getItem("fic_companyId");
      const expiresAt = localStorage.getItem("fic_expiresAt");

      if (!accessToken || !companyId) {
        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: false,
          isLoading: false,
        }));
        return { success: false, reason: "No session found" };
      }

      if (!isTokenValid(expiresAt)) {
        console.warn("Token expired, clearing session");
        clearStorage();
        return { success: false, reason: "Token expired" };
      }

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        accessToken,
        refreshToken,
        companyId,
        expiresAt: expiresAt ? parseInt(expiresAt) : null,
        error: null,
      });

      try {
        const companiesData = await fetchCompanies(accessToken);
        if (companiesData?.data?.companies) {
          setCompanies(companiesData.data.companies);
        }
      } catch (error) {
        console.warn("Could not reload companies:", error);
      }

      return { success: true };
    } catch (error) {
      console.error("Error loading existing session:", error);
      clearStorage();
      return { success: false, error };
    }
  }, [isTokenValid, clearStorage, fetchCompanies]);

  const logout = useCallback(() => {
    clearStorage();
  }, [clearStorage]);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const savedState = localStorage.getItem("fic_state");

      if (!code || !state || state !== savedState) {
        await loadExistingSession();
        return;
      }

      if (localStorage.getItem("fic_accessToken")) {
        const url = new URL(window.location.href);
        url.searchParams.delete("code");
        url.searchParams.delete("state");
        window.history.replaceState({}, document.title, url.toString());
        localStorage.removeItem("fic_state");
        await loadExistingSession();
        return;
      }

      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      await retrieveToken(code);

      isProcessingRef.current = false;

      const url = new URL(window.location.href);
      url.searchParams.delete("code");
      url.searchParams.delete("state");
      window.history.replaceState({}, document.title, url.toString());
      localStorage.removeItem("fic_state");
    };

    handleOAuthCallback();
  }, [searchParams, retrieveToken, loadExistingSession]);

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code && authState.isLoading) {
      loadExistingSession();
    }
  }, []);

  return {
    ...authState,
    companies,
    startAuthorization,
    logout,
    fetchInvoices,
    clearStorage,
    isTokenValid: isTokenValid(authState.expiresAt?.toString() || null),
  };
}
