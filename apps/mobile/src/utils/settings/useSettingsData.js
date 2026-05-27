import { useQuery } from "@tanstack/react-query";
import { offlineDb } from "@/utils/offlineDb";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      return offlineDb.getCategories();
    },
  });
}

export function useBudgets() {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      return offlineDb.getBudgets();
    },
  });
}

export function useRecurring() {
  return useQuery({
    queryKey: ["recurring"],
    queryFn: async () => {
      return offlineDb.getRecurring();
    },
  });
}
