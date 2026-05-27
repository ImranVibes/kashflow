import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react-native";

export function AddBudgetModal({ visible, onClose, categories }) {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState("month");

  const expenseCategories = categories.filter(
    (c) => c.category_type === "expense",
  );

  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to save budget");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      setAmount("");
      setSelectedCategory(null);
      onClose();
    },
    onError: () => Alert.alert("Error", "Failed to save budget"),
  });

  const handleSave = () => {
    if (!selectedCategory || !amount) {
      Alert.alert("Required", "Please select a category and enter an amount");
      return;
    }
    mutation.mutate({
      category_id: selectedCategory,
      amount: parseFloat(amount),
      period,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 20,
            borderBottomWidth: 1,
            borderColor: "#E5E7EB",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>
            Set Budget
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={22} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#374151",
              marginBottom: 6,
            }}
          >
            Period
          </Text>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
            {["week", "month", "year"].map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setPeriod(p)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 8,
                  borderWidth: 1,
                  alignItems: "center",
                  backgroundColor: period === p ? "#EFF6FF" : "#FFFFFF",
                  borderColor: period === p ? "#2563EB" : "#E5E7EB",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: period === p ? "#2563EB" : "#6B7280",
                  }}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#374151",
              marginBottom: 6,
            }}
          >
            Category
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 20 }}
          >
            {expenseCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  marginRight: 8,
                  backgroundColor:
                    selectedCategory === cat.id ? "#FEE2E2" : "#F3F4F6",
                  borderWidth: 1,
                  borderColor:
                    selectedCategory === cat.id ? "#DC2626" : "#E5E7EB",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: selectedCategory === cat.id ? "#DC2626" : "#6B7280",
                  }}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#374151",
              marginBottom: 6,
            }}
          >
            Budget Amount
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F9FAFB",
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              paddingHorizontal: 14,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#6B7280",
                marginRight: 4,
              }}
            >
              $
            </Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
              style={{
                flex: 1,
                paddingVertical: 14,
                fontSize: 18,
                fontWeight: "600",
                color: "#111827",
              }}
            />
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={mutation.isLoading}
            style={{
              backgroundColor: "#2563EB",
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
            }}
          >
            {mutation.isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: "#FFFFFF" }}
              >
                Save Budget
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}
