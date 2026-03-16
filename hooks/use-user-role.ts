import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/lib/redux/features/auth/authSlice";
import { UserRole } from "@/types/user";

export function useUserRole() {
  const user = useSelector(selectCurrentUser);

  const role = user?.ruolo;

  const isCEO = role === UserRole.CEO;
  const isResponsabileHR = role === UserRole.RESPONSABILE_RISORSE_UMANE;
  const isHR = role === UserRole.RISORSA_UMANA;
  const isAmministrazione = role === UserRole.AMMINISTRAZIONE;
  const isDeveloper = role === UserRole.DEVELOPER;

  const hasFullAccess = isResponsabileHR || isDeveloper;
  const hasHighAccess = isCEO || hasFullAccess;

  const canCreateSelection = isAmministrazione || isDeveloper;
  const canApproveSelection = isCEO || isResponsabileHR || isDeveloper;
  const canAssignHR = isCEO || isResponsabileHR || isDeveloper;
  const canManageAnnouncements = isHR || hasHighAccess;
  const canManageApplications = isHR || hasHighAccess;
  const canChangeSelectionStatus = isHR || hasHighAccess;
  const canViewAllSelections = hasHighAccess;

  const canViewSelection = (selection: {
    risorsa_umana_id?: number | null;
  }): boolean => {
    if (hasHighAccess) return true;
    if (isHR) return selection.risorsa_umana_id === user?.id;
    return false;
  };

  return {
    role,

    isCEO,
    isResponsabileHR,
    isHR,
    isAmministrazione,
    isDeveloper,

    hasFullAccess,
    hasHighAccess,

    canCreateSelection,
    canApproveSelection,
    canAssignHR,
    canManageAnnouncements,
    canManageApplications,
    canChangeSelectionStatus,
    canViewAllSelections,
    canViewSelection,

    user,
  };
}
