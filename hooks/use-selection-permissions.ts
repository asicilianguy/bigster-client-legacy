import { UserRole } from "@/types/user";

export function useSelectionPermissions(selection: any, user: any) {

  const isOwner = user?.id === selection?.responsabile_id;

  const isAssignedHR = user?.id === selection?.risorsa_umana_id;

  const isCEO = user?.ruolo === "CEO";
  const isHR = user?.ruolo === "RISORSA_UMANA";
  const isDeveloper = user?.ruolo === "DEVELOPER";

  const canView = isCEO || isDeveloper || isOwner || isAssignedHR;

  const canEdit = isDeveloper || isOwner;

  const canApprove = isCEO && selection?.stato === "CREATA";

  const isResponsabileRisorseUmane =
    user?.reparto_id === 12 && user.ruolo === UserRole.RESPONSABILE_RISORSE_UMANE;
  console.log({ isResponsabileRisorseUmane });

  console.log({ user, selection });

  const canAssignHR =
    isResponsabileRisorseUmane || selection?.risorsa_umana_id === user.id;

  const canCreateAnnouncements =
    (isHR && isAssignedHR) || isDeveloper || isResponsabileRisorseUmane;

  const canManageApplications =
    (isHR && isAssignedHR) || isDeveloper || isOwner;

  return {
    isOwner,
    isAssignedHR,
    canView,
    canEdit,
    canApprove,
    canAssignHR,
    canCreateAnnouncements,
    canManageApplications,
  };
}
