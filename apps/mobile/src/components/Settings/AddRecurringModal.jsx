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
import { offlineDb } from "@/utils/offlineDb";

export function AddRecurringModal({ visible, onClose, categories }) {
  const queryClient = useQueryClient();
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [frequency, setFrequency] = useState("monthly");
  const [nextDate, setNextDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const filteredCategories = categories.filter((c) => c.category_type === type);

  const mutation = useMutation({
    mutationFn: async (data) => {
      return offlineDb.addRecurring(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
      setAmount("");
      setDescription("");
      setSelectedCategory(null);
      setType("expense");
      setFrequency("monthly");
      onClose();
    },
    onError: () => Alert.alert("Error", "Failed to save recurring transaction"),
  });

  const handleSave = () => {
    if (!amount || !description) {
      Alert.alert("Required", "Please enter amount and description");
      return;
    }
    mutation.mutate({
      transaction_type: type,
      amount: parseFloat(amount),
      description,
      category_id: selectedCategory,
      frequency,
      next_date: nextDate,
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
            Recurring Transaction
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={22} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {/* Type */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#F3F4F6",
              borderRadius: 10,
              padding: 4,
              marginBottom: 20,
            }}
          >
            {["expense", "income"].map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => {
                  setType(t);
                  setSelectedCategory(null);
                }}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 8,
                  alignItems: "center",
                  backgroundColor: type === t ? "#FFFFFF" : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color:
                      type === t
                        ? t === "expense"
                          ? "#DC2626"
                          : "#16A34A"
                        : "#6B7280",
                  }}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#374151",
              marginBottom: 6,
            }}
          >
            Amount *
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
              marginBottom: 16,
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

          {/* Description */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#374151",
              marginBottom: 6,
            }}
          >
            Description *
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. Netflix subscription"
            placeholderTextColor="#9CA3AF"
            style={{
              backgroundColor: "#F9FAFB",
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              paddingHorizontal: 14,
              paddingVertical: 14,
              fontSize: 14,
              color: "#111827",
              marginBottom: 16,
            }}
          />

          {/* Frequency */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#374151",
              marginBottom: 6,
            }}
          >
            Frequency
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 16,
            }}
          >
            {["daily", "weekly", "monthly", "yearly"].map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setFrequency(f)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1,
                  backgroundColor: frequency === f ? "#EFF6FF" : "#FFFFFF",
                  borderColor: frequency === f ? "#2563EB" : "#E5E7EB",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: frequency === f ? "#2563EB" : "#6B7280",
                  }}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category */}
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
            style={{ marginBottom: 16 }}
          >
            {filteredCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  marginRight: 8,
                  backgroundColor:
                    selectedCategory === cat.id
                      ? type === "expense"
                        ? "#FEE2E2"
                        : "#DCFCE7"
                      : "#F3F4F6",
                  borderWidth: 1,
                  borderColor:
                    selectedCategory === cat.id
                      ? type === "expense"
                        ? "#DC2626"
                        : "#16A34A"
                      : "#E5E7EB",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color:
                      selectedCategory === cat.id
                        ? type === "expense"
                          ? "#DC2626"
                          : "#16A34A"
                        : "#6B7280",
                    fontWeight: "500",
                  }}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Next date */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#374151",
              marginBottom: 6,
            }}
          >
            Start Date
          </Text>
          <TextInput
            value={nextDate}
            onChangeText={setNextDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
            style={{
              backgroundColor: "#F9FAFB",
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              paddingHorizontal: 14,
              paddingVertical: 14,
              fontSize: 14,
              color: "#111827",
              marginBottom: 24,
            }}
          />

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
                Save Recurring
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}
