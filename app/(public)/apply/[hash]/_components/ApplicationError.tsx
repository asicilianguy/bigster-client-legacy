"use client";

import { XCircle, AlertTriangle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ApplicationErrorProps {
  type: "not_found" | "closed";
  announcement?: {
    selezione: {
      titolo: string;
      company: {
        nome: string;
      };
    };
  };
}

export function ApplicationError({ type, announcement }: ApplicationErrorProps) {
  if (type === "not_found") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-gray-200 shadow-xl text-center">
          <div className="p-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Posizione Non Trovata
            </h1>
            <p className="text-gray-600 mb-6">
              Il link che hai seguito non è valido o la posizione non esiste più.
            </p>

            <div className="p-4 bg-gray-50 border border-gray-200 text-left mb-6">
              <p className="text-sm text-gray-600">Possibili cause:</p>
              <ul className="text-sm text-gray-500 mt-2 space-y-1 list-disc list-inside">
                <li>Il link potrebbe essere stato copiato in modo incompleto</li>
                <li>La posizione potrebbe essere stata rimossa</li>
                <li>L'URL potrebbe contenere un errore di battitura</li>
              </ul>
            </div>

            <Button
              asChild
              className="w-full rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90 font-semibold"
            >
              <Link href="/">
                <Search className="h-4 w-4 mr-2" />
                Cerca altre posizioni
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-gray-200 shadow-xl text-center">
        <div className="p-8">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-10 w-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Candidature Chiuse
          </h1>
          <p className="text-gray-600 mb-6">
            Le candidature per questa posizione non sono più aperte.
          </p>

          {announcement && (
            <div className="p-4 bg-gray-50 border border-gray-200 text-left mb-6">
              <p className="text-sm font-semibold text-gray-900">
                {announcement.selezione.titolo}
              </p>
              <p className="text-sm text-gray-500">
                presso {announcement.selezione.company.nome}
              </p>
            </div>
          )}

          <p className="text-sm text-gray-500 mb-6">
            Ti consigliamo di cercare altre posizioni aperte che potrebbero
            interessarti.
          </p>

          <Button
            asChild
            className="w-full rounded-none bg-bigster-primary text-bigster-primary-text border border-yellow-200 hover:opacity-90 font-semibold"
          >
            <Link href="/">
              <Search className="h-4 w-4 mr-2" />
              Cerca altre posizioni
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
