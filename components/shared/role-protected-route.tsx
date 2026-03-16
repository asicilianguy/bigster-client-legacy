import { ReactNode } from "react";
import { useRoleProtection } from "@/hooks/use-role-protection";
import { Spinner } from "@/components/ui/spinner";
import BigsterLoader from "./BigsterLoader";

type RoleProtectedRouteProps = {
  children: ReactNode;
  allowedRoles: Array<"CEO" | "RESPONSABILE_REPARTO" | "RISORSA_UMANA" | "DEVELOPER">;
};

export default function RoleProtectedRoute({
  children,
  allowedRoles,
}: RoleProtectedRouteProps) {
  const { user } = useRoleProtection(allowedRoles);

  if (!user) {
    return <BigsterLoader text="Verifica permessi" />;

  }

  return <>{children}</>;
}
