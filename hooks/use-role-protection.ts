import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "./use-user-role";

export function useRoleProtection(
  allowedRoles: Array<"CEO" | "RESPONSABILE_REPARTO" | "RISORSA_UMANA" | "DEVELOPER">
) {
  const { role, user } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (role && !allowedRoles.includes(role as any)) {
      router.push("/selezioni");
    }
  }, [role, user, router, allowedRoles]);

  return { role, user };
}
