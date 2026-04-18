"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLoginMutation } from "@/lib/redux/features/auth/authApiSlice";
import { useRouter } from "next/navigation";
import { useNotify } from "@/hooks/use-notify";
import Image from "next/image";
import { Check, Key, Users } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import CustomDialog from "@/components/ui/bigster/CustomDialog";
import { UserRole } from "@/types/user";

const loginSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "La password deve contenere almeno 6 caratteri"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type User = {
  email: string;
  password: string;
  name: string;
  role: string;
  roleBadgeColor: string;
};

export default function LoginPage() {
  const router = useRouter();
  const notify = useNotify();
  const [login, { isLoading }] = useLoginMutation();
  const [showUserSelector, setShowUserSelector] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const result = await login(data).unwrap();

      notify.success("Login effettuato", "Accesso completato con successo!");

      const userRole = result.user.ruolo;

      setTimeout(() => {
        if (userRole === UserRole.AMMINISTRAZIONE) {
          router.push("/amministrazione");
        } else if (userRole === UserRole.CONSULENTE) {
          // Il consulente non ha accesso alle selezioni: atterraggio su candidature
          router.push("/candidature");
        } else {
          router.push("/selezioni");
        }
      }, 500);
    } catch (err: any) {
      if (err?.status === 401) {
        notify.error(
          "Accesso negato",
          "Email o password non corretti. Riprova."
        );
      } else if (err?.status === 403) {
        notify.error(
          "Account disabilitato",
          "Il tuo account è stato disabilitato. Contatta l'amministratore."
        );
      } else if (err?.status === 429) {
        notify.error(
          "Troppi tentativi",
          "Hai superato il numero massimo di tentativi. Riprova tra qualche minuto."
        );
      } else if (err?.status === 500) {
        notify.error(
          "Errore del server",
          "Si è verificato un problema. Riprova più tardi."
        );
      } else if (!navigator.onLine) {
        notify.error(
          "Nessuna connessione",
          "Verifica la tua connessione internet e riprova."
        );
      } else {
        notify.error(
          "Errore di accesso",
          "Si è verificato un errore imprevisto. Riprova."
        );
      }
    }
  };

  // Utenti disponibili nel selettore rapido per sviluppo/demo
  const availableUsers: User[] = [
    {
      email: "max@dentalead.ch",
      password: "admin123",
      name: "Max Calore",
      role: "CEO",
      roleBadgeColor: "bg-purple-500/20 text-purple-600 border-purple-500/30",
    },
    {
      email: "sgiunta@dentalead.ch",
      password: "password123",
      name: "Sara Giunta",
      role: "Responsabile Risorse Umane",
      roleBadgeColor: "bg-blue-500/20 text-blue-600 border-blue-500/30",
    },
    {
      email: "goggiana@dentalead.ch",
      password: "password123",
      name: "Giulia Oggiana",
      role: "Risorsa Umana",
      roleBadgeColor: "bg-amber-500/20 text-amber-600 border-amber-500/30",
    },
    {
      email: "amministrazione@dentalead.ch",
      password: "password123",
      name: "Elisabetta Nuzzo",
      role: "Amministrazione",
      roleBadgeColor: "bg-green-500/20 text-green-600 border-green-500/30",
    },
    // Consulenti statici (seedati sempre in ogni ambiente)
    {
      email: "marco.rossi@dentalead.ch",
      password: "consulente2024!",
      name: "Marco Rossi",
      role: "Consulente",
      roleBadgeColor: "bg-orange-500/20 text-orange-600 border-orange-500/30",
    },
    {
      email: "elena.bianchi@dentalead.ch",
      password: "consulente2024!",
      name: "Elena Bianchi",
      role: "Consulente",
      roleBadgeColor: "bg-orange-500/20 text-orange-600 border-orange-500/30",
    },
    {
      email: "luca.ferrari@dentalead.ch",
      password: "consulente2024!",
      name: "Luca Ferrari",
      role: "Consulente",
      roleBadgeColor: "bg-orange-500/20 text-orange-600 border-orange-500/30",
    },
  ];

  const fillCredentials = (user: User) => {
    setValue("email", user.email);
    setValue("password", user.password);
    setShowUserSelector(false);
    notify.success(
      "Credenziali impostate",
      `Pronto per accedere come ${user.name}`
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-yellow-100 via-yellow-50 to-white p-4">
      <div className="mb-8 text-center">
        <Image
          src="/logo.png"
          alt="BigSter Logo"
          width={200}
          height={200}
          className="mx-auto"
        />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Esegui l'accesso</CardTitle>
          <CardDescription>
            Inserisci le tue credenziali per continuare
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="inserisci la tua email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() =>
                    notify.info(
                      "Recupero password",
                      "Contatta l'amministratore per reimpostare la password"
                    )
                  }
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Dimenticata?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="inserisci la tua password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                variant="default"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Esegui l'accesso
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={() => setShowUserSelector(!showUserSelector)}
                className="px-3"
                title="Seleziona utente di test"
              >
                <Users size={18} />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <CustomDialog
        isOpen={showUserSelector}
        onClose={() => setShowUserSelector(false)}
        title="Seleziona un utente"
      >
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {availableUsers.map((user, index) => (
            <div
              key={index}
              onClick={() => fillCredentials(user)}
              className="flex items-center gap-3 p-3 rounded-md hover:bg-slate-100 cursor-pointer border transition-colors last:mb-4"
            >
              <div className="flex-shrink-0 bg-gray-100 rounded-full p-2">
                <Users size={20} className="text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <Badge
                variant="outline"
                className={cn("font-medium", user.roleBadgeColor)}
              >
                {user.role}
              </Badge>
              <div className="flex-shrink-0 text-gray-400">
                <Key size={14} />
              </div>
            </div>
          ))}
        </div>
      </CustomDialog>

      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>BigSter © 2025. All Rights Reserved.</p>
      </footer>
    </div>
  );
}