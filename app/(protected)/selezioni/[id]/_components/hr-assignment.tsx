"use client";

import { useState } from "react";
import { useGetUsersByRoleQuery } from "@/lib/redux/features/users/usersApiSlice";
import { useAssignHrMutation } from "@/lib/redux/features/selections/selectionsApiSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, UserPlus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { UserRole } from "@/types/user";

type HRAssignmentProps = {
  selectionId: number;
};

export function HRAssignment({ selectionId }: HRAssignmentProps) {
  const [selectedHr, setSelectedHr] = useState<string | null>(null);
  const [assignHr, { isLoading: isAssigning }] = useAssignHrMutation();
  const { data: hrUsersData, isLoading: isLoadingHrUsers } =
    useGetUsersByRoleQuery(UserRole.RISORSA_UMANA);

  const handleAssignHr = async () => {
    if (!selectedHr) {
      toast.error("Seleziona una risorsa umana.");
      return;
    }
    try {
      await assignHr({
        id: selectionId,
        body: { risorsa_umana_id: Number(selectedHr) },
      }).unwrap();
      toast.success("Risorsa umana assegnata con successo!");
    } catch (err) {
      toast.error("Errore durante l'assegnazione.");
    }
  };

  return (
    <Alert className="border-blue-400/50 bg-blue-400/10 text-blue-700">
      <Info className="h-4 w-4 !text-blue-600" />
      <AlertTitle className="font-semibold">
        Assegna una Risorsa Umana
      </AlertTitle>
      <AlertDescription>
        <div className="flex flex-col gap-3">
          <p>Seleziona un membro del team HR per avviare la selezione.</p>
          <Select onValueChange={setSelectedHr} disabled={isLoadingHrUsers}>
            <SelectTrigger>
              <SelectValue placeholder="Seleziona HR" />
            </SelectTrigger>
            <SelectContent>
              {hrUsersData?.map((hr: any) => (
                <SelectItem key={hr.id} value={hr.id.toString()}>
                  {hr.nome} {hr.cognome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAssignHr}
            disabled={isAssigning || !selectedHr}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
          >
            {isAssigning ? <Spinner /> : <UserPlus />}
            Assegna HR
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
