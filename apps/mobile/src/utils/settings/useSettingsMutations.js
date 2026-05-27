import { Alert } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSettingsMutations() {
  const queryClient = useQueryClient();

  const deleteBudgetMutation = useMutation({
    mutationFn: async (id) => {
      const r = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete budget");
      return r.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
    onError: () => Alert.alert("Error", "Failed to delete budget"),
  });

  const deleteRecurringMutation = useMutation({
    mutationFn: async (id) => {
      const r = await fetch(`/api/recurring/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recurring"] }),
    onError: () => Alert.alert("Error", "Failed to delete"),
  });

  const toggleRecurringMutation = useMutation({
    mutationFn: async ({ id, is_active }) => {
      const r = await fetch(`/api/recurring/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active }),
      });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recurring"] }),
  });

  const processRecurringMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/recurring/process", { method: "POST" });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      Alert.alert(
        "Done",
        data.count > 0
          ? `Processed ${data.count} recurring transaction(s)`
          : "No transactions due today",
      );
    },
    onError: () =>
      Alert.alert("Error", "Failed to process recurring transactions"),
  });

  return {
    deleteBudgetMutation,
    deleteRecurringMutation,
    toggleRecurringMutation,
    processRecurringMutation,
  };
}
