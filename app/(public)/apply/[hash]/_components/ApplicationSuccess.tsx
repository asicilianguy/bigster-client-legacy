"use client";

import { CheckCircle2, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ApplicationSuccessProps {
  candidato: {
    nome: string;
    cognome: string;
    email: string;
  };
  posizione: string;
  azienda: string;
}

export function ApplicationSuccess({
  candidato,
  posizione,
  azienda,
}: ApplicationSuccessProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white border border-gray-200 shadow-xl">

        <div className="p-8 text-center border-b border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Candidatura Inviata!
          </h1>
          <p className="text-gray-600">
            Grazie per aver inviato la tua candidatura
          </p>
        </div>

        <div className="p-8 space-y-6">

          <div className="p-4 bg-gray-50 border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Hai candidato come:</p>
            <p className="text-lg font-bold text-gray-900">
              {candidato.nome} {candidato.cognome}
            </p>
            <p className="text-sm text-gray-600 mt-3">Per la posizione di:</p>
            <p className="text-lg font-bold text-gray-900">{posizione}</p>
            <p className="text-sm text-gray-500">presso {azienda}</p>
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200">
            <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800">
                Conferma inviata
              </p>
              <p className="text-sm text-blue-700">
                Abbiamo inviato una email di conferma a{" "}
                <strong>{candidato.email}</strong>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Prossimi passi
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-bigster-primary text-bigster-primary-text text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                Il team HR esaminerà la tua candidatura
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-bigster-primary text-bigster-primary-text text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                Se il tuo profilo è in linea, verrai contattato per un colloquio
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-bigster-primary text-bigster-primary-text text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                Riceverai comunque un riscontro sulla tua candidatura
              </li>
            </ul>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Powered by{" "}
            <span className="font-semibold text-bigster-text">Bigster</span> •
            Il team di selezione ti contatterà presto
          </p>
        </div>
      </div>
    </div>
  );
}
