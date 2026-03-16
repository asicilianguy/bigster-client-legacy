import { useGetConsulentiQuery } from "@/lib/redux/features/users/usersApiSlice";
import type { UserWithSelectionCount } from "@/types/user";

export function useConsultants() {
  const {
    data: consultants = [],
    isLoading,
    error: queryError,
  } = useGetConsulentiQuery();

  const error = queryError
    ? "data" in queryError
      ? JSON.stringify(queryError.data)
      : "error" in queryError
      ? String(queryError.error)
      : "Errore nel caricamento dei consulenti"
    : null;

  return {
    consultants: consultants as UserWithSelectionCount[],
    isLoading,
    error,
  };
}
