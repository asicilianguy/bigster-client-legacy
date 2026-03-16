"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  useGetRegioniQuery,
  useGetProvinceQuery,
} from "@/lib/redux/features/geography/geographyApiSlice";

export interface ItalianGeographyState {
  regione: string;
  provincia: string;
  citta: string;
}

export interface ItalianGeographyOptions {
  value: string;
  label: string;
}

export interface UseItalianGeographyReturn {

  state: ItalianGeographyState;

  setRegione: (value: string) => void;
  setProvincia: (value: string) => void;
  setCitta: (value: string) => void;

  setCityWithContext: (value: { citta: string; provincia: string; regione: string }) => void;

  reset: () => void;

  regioniOptions: ItalianGeographyOptions[];
  provinceOptions: ItalianGeographyOptions[];

  isValid: boolean;
  isComplete: boolean;

  isLoading: boolean;
}

interface UseItalianGeographyProps {
  initialRegione?: string;
  initialProvincia?: string;
  initialCitta?: string;
}

export function useItalianGeography(
  props?: UseItalianGeographyProps
): UseItalianGeographyReturn {
  const {
    initialRegione = "",
    initialProvincia = "",
    initialCitta = "",
  } = props || {};

  const [regione, setRegioneState] = useState(initialRegione);
  const [provincia, setProvinciaState] = useState(initialProvincia);
  const [citta, setCittaState] = useState(initialCitta);

  const {
    data: regioniData,
    isLoading: isLoadingRegioni,
  } = useGetRegioniQuery();

  const {
    data: allProvinceData,
    isLoading: isLoadingProvince,
  } = useGetProvinceQuery();

  useEffect(() => {
    if (initialRegione && initialRegione !== regione) {
      setRegioneState(initialRegione);
    }
  }, [initialRegione]);

  useEffect(() => {
    if (initialProvincia && initialProvincia !== provincia) {
      setProvinciaState(initialProvincia);
    }
  }, [initialProvincia]);

  useEffect(() => {
    if (initialCitta && initialCitta !== citta) {
      setCittaState(initialCitta);
    }
  }, [initialCitta]);

  const regioniOptions = useMemo<ItalianGeographyOptions[]>(() => {
    if (!regioniData) return [];
    return regioniData.map((r) => ({
      value: r.nome,
      label: r.nome,
    }));
  }, [regioniData]);

  const provinceOptions = useMemo<ItalianGeographyOptions[]>(() => {
    if (!allProvinceData) return [];

    let filtered = allProvinceData;

    if (regione) {
      filtered = allProvinceData.filter(
        (p) => p.regione.toLowerCase() === regione.toLowerCase()
      );
    }

    return filtered.map((p) => ({
      value: p.nome,
      label: `${p.nome} (${p.sigla})`,
    }));
  }, [allProvinceData, regione]);

  const setRegione = useCallback(
    (value: string) => {
      setRegioneState(value);
      if (value !== regione) {
        setProvinciaState("");
        setCittaState("");
      }
    },
    [regione]
  );

  const setProvincia = useCallback(
    (value: string) => {
      setProvinciaState(value);
      if (value !== provincia) {
        setCittaState("");
      }

      if (value && !regione && allProvinceData) {
        const provinciaData = allProvinceData.find(
          (p) => p.nome.toLowerCase() === value.toLowerCase()
        );
        if (provinciaData) {
          setRegioneState(provinciaData.regione);
        }
      }
    },
    [provincia, regione, allProvinceData]
  );

  const setCitta = useCallback(
    (value: string) => {
      setCittaState(value);
    },
    []
  );

  const setCityWithContext = useCallback(
    (value: { citta: string; provincia: string; regione: string }) => {
      setCittaState(value.citta);
      setProvinciaState(value.provincia);
      setRegioneState(value.regione);
    },
    []
  );

  const reset = useCallback(() => {
    setRegioneState("");
    setProvinciaState("");
    setCittaState("");
  }, []);

  const isComplete = useMemo(
    () => Boolean(regione && provincia && citta),
    [regione, provincia, citta]
  );

  const isValid = useMemo(() => {
    if (!regione || !provincia || !citta) return false;

    if (allProvinceData) {
      const provinciaData = allProvinceData.find(
        (p) => p.nome.toLowerCase() === provincia.toLowerCase()
      );
      if (provinciaData && provinciaData.regione.toLowerCase() !== regione.toLowerCase()) {
        return false;
      }
    }

    return true;
  }, [regione, provincia, citta, allProvinceData]);

  return {
    state: { regione, provincia, citta },
    setRegione,
    setProvincia,
    setCitta,
    setCityWithContext,
    reset,
    regioniOptions,
    provinceOptions,
    isValid,
    isComplete,
    isLoading: isLoadingRegioni || isLoadingProvince,
  };
}
