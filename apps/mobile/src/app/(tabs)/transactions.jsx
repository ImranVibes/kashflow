import { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Trash2,
  X,
  ChevronDown,
} from "lucide-react-native";
import { format } from "date-fns";
import { useCurrencyStore } from "@/utils/useCurrencyStore";
import { usePersistedQuery } from "@/utils/localCache";

function AddTransactionModal({ visible, onClose, categories, onSuccess }) {
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
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to add transaction");
      return response.json();
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
    // 🔒 Double-tap guard: lock immediately before any async work
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

          {/* Submit — disabled immediately after first tap */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={mutation.isLoading || submittingRef.current}
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

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const { currency } = useCurrencyStore();
  const sym = currency.symbol;

  // 💾 Local cache — load snapshot from AsyncStorage first, keep in sync after every fetch
  const { initialData: cachedTransactions, persistData: persistTransactions } =
    usePersistedQuery("transactions_all");

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions", activeFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeFilter !== "all") params.append("type", activeFilter);
      if (searchQuery) params.append("search", searchQuery);
      const response = await fetch(`/api/transactions?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const data = await response.json();
      // Save latest unfiltered data to local cache
      if (activeFilter === "all" && !searchQuery) {
        persistTransactions(data);
      }
      return data;
    },
    // Show cached data immediately while fetching — feels instant
    placeholderData:
      activeFilter === "all" && !searchQuery ? cachedTransactions : undefined,
    staleTime: 1000 * 60, // 1 minute before re-fetching in background
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: () => Alert.alert("Error", "Failed to delete transaction"),
  });

  const handleDelete = useCallback(
    (transaction) => {
      Alert.alert(
        "Delete Transaction",
        `Delete "${transaction.description}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteMutation.mutate(transaction.id),
          },
        ],
      );
    },
    [deleteMutation],
  );

  const groupedTransactions = transactions.reduce((acc, t) => {
    const date = t.transaction_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(t);
    return acc;
  }, {});

  const totalIncome = transactions
    .filter((t) => t.transaction_type === "income")
    .reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.transaction_type === "expense")
    .reduce((s, t) => s + parseFloat(t.amount), 0);

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar style="dark" />

      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        categories={categories}
        onSuccess={() => setShowAddModal(false)}
      />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 16,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderColor: "#E5E7EB",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: "700", color: "#111827" }}>
            Transactions
          </Text>
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: "#2563EB",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F9FAFB",
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            paddingHorizontal: 12,
            marginBottom: 12,
          }}
        >
          <Search size={18} color="#6B7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search transactions..."
            placeholderTextColor="#9CA3AF"
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 8,
              fontSize: 14,
              color: "#111827",
            }}
          />
        </View>

        {/* Filters */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          {["all", "expense", "income"].map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor:
                  activeFilter === filter ? "#EFF6FF" : "#FFFFFF",
                borderWidth: 1,
                borderColor: activeFilter === filter ? "#2563EB" : "#E5E7EB",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: activeFilter === filter ? "600" : "400",
                  color: activeFilter === filter ? "#2563EB" : "#6B7280",
                }}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick totals bar */}
      {transactions.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#FFFFFF",
            borderBottomWidth: 1,
            borderColor: "#E5E7EB",
            paddingHorizontal: 16,
            paddingVertical: 10,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: "#6B7280", marginBottom: 2 }}>
              Income Shown
            </Text>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#16A34A" }}>
              +{sym}
              {totalIncome.toFixed(2)}
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 11, color: "#6B7280", marginBottom: 2 }}>
              Expenses Shown
            </Text>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#DC2626" }}>
              -{sym}
              {totalExpense.toFixed(2)}
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={{ fontSize: 11, color: "#6B7280", marginBottom: 2 }}>
              Net
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: totalIncome - totalExpense >= 0 ? "#16A34A" : "#DC2626",
              }}
            >
              {totalIncome - totalExpense >= 0 ? "+" : "-"}
              {sym}
              {Math.abs(totalIncome - totalExpense).toFixed(2)}
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={{ paddingVertical: 60, alignItems: "center" }}>
            <ActivityIndicator color="#2563EB" size="large" />
          </View>
        ) : Object.keys(groupedTransactions).length === 0 ? (
          <View style={{ paddingVertical: 60, alignItems: "center" }}>
            <Text style={{ fontSize: 15, color: "#6B7280", marginBottom: 8 }}>
              No transactions found
            </Text>
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              style={{
                backgroundColor: "#EFF6FF",
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "#BFDBFE",
              }}
            >
              <Text
                style={{ fontSize: 14, color: "#2563EB", fontWeight: "600" }}
              >
                + Add First Transaction
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          Object.keys(groupedTransactions)
            .sort((a, b) => new Date(b) - new Date(a))
            .map((date) => {
              const dayTotal = groupedTransactions[date].reduce(
                (sum, t) =>
                  sum +
                  (t.transaction_type === "income"
                    ? parseFloat(t.amount)
                    : -parseFloat(t.amount)),
                0,
              );
              return (
                <View
                  key={date}
                  style={{ marginBottom: 20, paddingHorizontal: 16 }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: "#6B7280",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {format(new Date(date), "EEE, MMM dd")}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: dayTotal >= 0 ? "#16A34A" : "#DC2626",
                      }}
                    >
                      {dayTotal >= 0 ? "+" : "-"}
                      {sym}
                      {Math.abs(dayTotal).toFixed(2)}
                    </Text>
                  </View>
                  {groupedTransactions[date].map((transaction) => (
                    <View
                      key={transaction.id}
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                        padding: 12,
                        marginBottom: 8,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 21,
                          backgroundColor:
                            transaction.transaction_type === "income"
                              ? "#DCFCE7"
                              : "#FEE2E2",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        {transaction.transaction_type === "income" ? (
                          <ArrowUpRight size={20} color="#16A34A" />
                        ) : (
                          <ArrowDownRight size={20} color="#DC2626" />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: "#111827",
                            marginBottom: 2,
                          }}
                          numberOfLines={1}
                        >
                          {transaction.description}
                        </Text>
                        <Text style={{ fontSize: 12, color: "#6B7280" }}>
                          {transaction.category_name || "Uncategorized"}
                        </Text>
                      </View>
                      <View style={{ alignItems: "flex-end", gap: 6 }}>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "700",
                            color:
                              transaction.transaction_type === "income"
                                ? "#16A34A"
                                : "#DC2626",
                          }}
                        >
                          {transaction.transaction_type === "income"
                            ? "+"
                            : "-"}
                          {sym}
                          {parseFloat(transaction.amount).toFixed(2)}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleDelete(transaction)}
                          style={{ padding: 2 }}
                        >
                          <Trash2 size={16} color="#D1D5DB" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              );
            })
        )}
      </ScrollView>
    </View>
  );
}
