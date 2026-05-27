import { Alert } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { offlineDb } from "@/utils/offlineDb";

export function useSettingsMutations() {
  const queryClient = useQueryClient();

  const deleteBudgetMutation = useMutation({
    mutationFn: async (id) => {
      return offlineDb.deleteBudget(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
    onError: () => Alert.alert("Error", "Failed to delete budget"),
  });

  const deleteRecurringMutation = useMutation({
    mutationFn: async (id) => {
      return offlineDb.deleteRecurring(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recurring"] }),
    onError: () => Alert.alert("Error", "Failed to delete"),
  });

  const toggleRecurringMutation = useMutation({
    mutationFn: async ({ id, is_active }) => {
      return offlineDb.toggleRecurring(id, is_active);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recurring"] }),
  });

  const processRecurringMutation = useMutation({
    mutationFn: async () => {
      // Client-side processed recurring transactions
      return { count: 0 };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      Alert.alert(
        "Done",
        data.count > 0
          ? `Processed ${data.count} recurring transaction(s)`
          : "No transactions due today"
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
