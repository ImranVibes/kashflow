import { useQuery } from "@tanstack/react-query";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const r = await fetch("/api/categories");
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
  });
}

export function useBudgets() {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const r = await fetch("/api/budgets");
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
  });
}

export function useRecurring() {
  return useQuery({
    queryKey: ["recurring"],
    queryFn: async () => {
      const r = await fetch("/api/recurring");
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
  });
}
