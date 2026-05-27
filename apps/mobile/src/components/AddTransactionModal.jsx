import { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { X } from "lucide-react-native";
import { useCurrencyStore } from "@/utils/useCurrencyStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { offlineDb } from "@/utils/offlineDb";

export default function AddTransactionModal({ visible, onClose, categories, onSuccess }) {
  const { currency } = useCurrencyStore();
  const sym = currency.symbol;
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [notes, setNotes] = useState("");
  const submittingRef = useRef(false); // prevents double-tap duplicates
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data) => {
      return offlineDb.addTransaction(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      setAmount("");
      setDescription("");
      setNotes("");
      setSelectedCategory(null);
      setType("expense");
      submittingRef.current = false;
      onSuccess();
    },
    onError: () => {
      submittingRef.current = false;
      Alert.alert("Error", "Failed to add transaction");
    },
  });

  const filteredCategories = categories.filter((c) => c.category_type === type);

  const handleSubmit = () => {
    if (submittingRef.current || mutation.isLoading) return;
    if (!amount || !description) {
      Alert.alert("Missing Fields", "Please enter amount and description");
      return;
    }
    submittingRef.current = true;
    mutation.mutate({
      transaction_type: type,
      amount: parseFloat(amount),
      description,
      category_id: selectedCategory,
      notes,
      transaction_date: new Date().toISOString().split("T")[0],
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
            Add Transaction
          </Text>
          <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
            <X size={22} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Type Toggle */}
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
                  backgroundColor: type === t ? "#FFFFFF" : "transparent",
                  alignItems: "center",
                  ...(type === t
                    ? {
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.08,
                        shadowRadius: 2,
                        elevation: 2,
                      }
                    : {}),
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
              {sym}
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
            placeholder="What was this for?"
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
            style={{ flexGrow: 0, marginBottom: 16 }}
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
                    fontWeight: "500",
                    color:
                      selectedCategory === cat.id
                        ? type === "expense"
                          ? "#DC2626"
                          : "#16A34A"
                        : "#6B7280",
                  }}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Notes */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#374151",
              marginBottom: 6,
            }}
          >
            Notes
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional notes..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            style={{
              backgroundColor: "#F9FAFB",
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 14,
              color: "#111827",
              marginBottom: 24,
              minHeight: 80,
              textAlignVertical: "top",
            }}
          />

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={mutation.isLoading}
            activeOpacity={0.8}
            style={{
              backgroundColor: mutation.isLoading
                ? "#9CA3AF"
                : type === "expense"
                  ? "#DC2626"
                  : "#16A34A",
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              opacity: mutation.isLoading ? 0.75 : 1,
            }}
          >
            {mutation.isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: "#FFFFFF" }}
              >
                Add {type === "expense" ? "Expense" : "Income"}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}
