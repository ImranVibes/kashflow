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
import { offlineDb } from "@/utils/offlineDb";
import AddTransactionModal from "@/components/AddTransactionModal";

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
      const data = await offlineDb.getTransactions();
      let filtered = data;
      if (activeFilter && activeFilter !== "all") {
        filtered = filtered.filter(t => t.transaction_type === activeFilter);
      }
      if (searchQuery) {
        filtered = filtered.filter(t => t.description.toLowerCase().includes(searchQuery.toLowerCase()));
      }
      return filtered;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      return offlineDb.getCategories();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return offlineDb.deleteTransaction(id);
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
