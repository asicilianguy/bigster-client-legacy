"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface Invoice {
  id: number;
  type: string;
  amount_net: number;
  amount_vat: number;
  amount_gross: number;
  entity: {
    name: string;
    vat_number: string;
    tax_code: string;
    address_street: string;
    address_postal_code: string;
    address_city: string;
    address_province: string;
    country: string;
    id: number;
  };
  contract_number: string;
  date: string;
  number: string;
  url: string;
  service_name: string;
  service_code?: string;
  items_codes?: string[];
  items_names?: string[];
}

interface InvoicesCache {
  [companyId: string]: {
    invoices: Invoice[];
    timestamp: number;
  };
}

interface InvoicesContextType {
  getInvoices: (companyId: string) => Invoice[] | null;
  setInvoices: (companyId: string, invoices: Invoice[]) => void;
  clearCache: (companyId?: string) => void;
  isCached: (companyId: string, maxAge?: number) => boolean;
  getCacheAge: (companyId: string) => number | null;
}

const InvoicesContext = createContext<InvoicesContextType | undefined>(
  undefined
);

const CACHE_MAX_AGE = 5 * 60 * 1000;

export function InvoicesProvider({ children }: { children: React.ReactNode }) {
  const [cache, setCache] = useState<InvoicesCache>({});

  const getInvoices = useCallback(
    (companyId: string): Invoice[] | null => {
      const cached = cache[companyId];
      if (!cached) return null;

      const age = Date.now() - cached.timestamp;
      if (age > CACHE_MAX_AGE) {

        console.log(`⏰ Cache expired for company ${companyId}`);
        return null;
      }

      console.log(
        `📦 Cache HIT for company ${companyId} (age: ${Math.round(
          age / 1000
        )}s)`
      );
      return cached.invoices;
    },
    [cache]
  );

  const setInvoices = useCallback((companyId: string, invoices: Invoice[]) => {
    console.log(
      `💾 Caching ${invoices.length} invoices for company ${companyId}`
    );
    setCache((prev) => ({
      ...prev,
      [companyId]: {
        invoices,
        timestamp: Date.now(),
      },
    }));
  }, []);

  const clearCache = useCallback((companyId?: string) => {
    if (companyId) {
      console.log(`🗑️ Clearing cache for company ${companyId}`);
      setCache((prev) => {
        const newCache = { ...prev };
        delete newCache[companyId];
        return newCache;
      });
    } else {
      console.log("🗑️ Clearing ALL cache");
      setCache({});
    }
  }, []);

  const isCached = useCallback(
    (companyId: string, maxAge: number = CACHE_MAX_AGE): boolean => {
      const cached = cache[companyId];
      if (!cached) return false;

      const age = Date.now() - cached.timestamp;
      return age <= maxAge;
    },
    [cache]
  );

  const getCacheAge = useCallback(
    (companyId: string): number | null => {
      const cached = cache[companyId];
      if (!cached) return null;
      return Date.now() - cached.timestamp;
    },
    [cache]
  );

  return (
    <InvoicesContext.Provider
      value={{ getInvoices, setInvoices, clearCache, isCached, getCacheAge }}
    >
      {children}
    </InvoicesContext.Provider>
  );
}

export function useInvoicesCache() {
  const context = useContext(InvoicesContext);
  if (!context) {
    throw new Error("useInvoicesCache must be used within InvoicesProvider");
  }
  return context;
}
