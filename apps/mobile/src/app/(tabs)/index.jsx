import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Zap,
} from "lucide-react-native";
import { format } from "date-fns";
import { useCurrencyStore } from "@/utils/useCurrencyStore";
import { usePersistedQuery } from "@/utils/localCache";
import { offlineDb } from "@/utils/offlineDb";
import { offlineAiParser } from "@/utils/offlineAiParser";
import TransactionDetailModal from "@/components/TransactionDetailModal";

// Premium card shadow style
const shadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 16,
  elevation: 4,
};

const softShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [aiInput, setAiInput] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const { currency } = useCurrencyStore();
  const sym = currency.symbol;

  // 💾 Local cache for analytics — shows last-known data instantly on app open
  const { initialData: cachedAnalytics, persistData: persistAnalytics } =
    usePersistedQuery("analytics_month");

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics", "month"],
    queryFn: async () => {
      const data = await offlineDb.getAnalytics("month");
      persistAnalytics(data); // keep local cache fresh
      return data;
    },
    placeholderData: cachedAnalytics,
    staleTime: 1000 * 60, // 1 minute
  });

  const addTransactionMutation = useMutation({
    mutationFn: async (t) => {
      return offlineDb.addTransaction(t);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setAiInput("");
      Alert.alert("✓ Added", "Transaction saved successfully");
    },
    onError: () => Alert.alert("Error", "Failed to add transaction"),
  });

  const handleAiParse = useCallback(async () => {
    if (!aiInput.trim()) return;
    setIsParsing(true);
    try {
      const parsed = await offlineAiParser.parseTransaction(aiInput);
      Alert.alert(
        parsed.transaction_type === "expense"
          ? "💸 Expense Detected"
          : "💰 Income Detected",
        `${sym}${parsed.amount}  ·  ${parsed.description}\nCategory: ${parsed.category_name}`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Add Transaction",
            onPress: () => addTransactionMutation.mutate({
              transaction_type: parsed.transaction_type,
              amount: parsed.amount,
              description: parsed.description,
              category_id: parsed.category_id,
              notes: "Added via AI Smart Entry",
              transaction_date: new Date().toISOString().split("T")[0],
            }),
          },
        ],
      );
    } catch (e) {
      if (e.message === "NO_API_KEY") {
        Alert.alert(
          "API Key Required ✦",
          "KashFlow is a 100% offline-only private app. To use AI Smart Entry, please add your own free Gemini API Key under Settings > AI Model Settings.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", e.message || "Could not understand input. Try again.");
      }
    } finally {
      setIsParsing(false);
    }
  }, [aiInput, addTransactionMutation, currency, sym]);

  const summary = analytics?.summary || {
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
  };
  const recentTransactions = analytics?.recentTransactions || [];
  const isProfit = summary.netProfit >= 0;

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F2F7" }}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* ── Hero Gradient Card ── */}
        <LinearGradient
          colors={["#1C1C3A", "#0A2463", "#1B4FD8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: insets.top + 20,
            paddingHorizontal: 20,
            paddingBottom: 48,
          }}
        >
          <MotiView
            from={{ opacity: 0, translateY: -8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500 }}
          >
            <Text
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.55)",
                fontWeight: "500",
                letterSpacing: 0.5,
                marginBottom: 4,
              }}
            >
              {format(new Date(), "EEEE, MMMM d").toUpperCase()}
            </Text>
            <Text
              style={{
                fontSize: 30,
                fontWeight: "700",
                color: "#FFFFFF",
                marginBottom: 2,
              }}
            >
              Good{" "}
              {new Date().getHours() < 12
                ? "Morning"
                : new Date().getHours() < 18
                  ? "Afternoon"
                  : "Evening"}{" "}
              👋
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.5)",
                marginBottom: 28,
              }}
            >
              Here's your financial overview
            </Text>
          </MotiView>

          {/* Net Balance */}
          <MotiView
            from={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "timing", duration: 500, delay: 100 }}
          >
            <Text
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                fontWeight: "500",
                marginBottom: 4,
              }}
            >
              NET PROFIT · THIS MONTH
            </Text>
            <Text
              style={{
                fontSize: 48,
                fontWeight: "800",
                letterSpacing: -1,
                color: isProfit ? "#4ADE80" : "#F87171",
                marginBottom: 2,
              }}
            >
              {isProfit ? "+" : "-"}
              {sym}
              {Math.abs(summary.netProfit).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </MotiView>
        </LinearGradient>

        {/* ── Floating Summary Cards ── */}
        <View
          style={{ marginTop: -28, paddingHorizontal: 16, marginBottom: 20 }}
        >
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 450, delay: 150 }}
            style={{
              flexDirection: "row",
              gap: 12,
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 16,
              ...shadow,
            }}
          >
            {/* Income */}
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6,
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    backgroundColor: "#D1FAE5",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendingUp size={14} color="#059669" />
                </View>
                <Text
                  style={{ fontSize: 12, color: "#8E8E93", fontWeight: "500" }}
                >
                  Income
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: "#059669",
                  letterSpacing: -0.5,
                }}
              >
                {sym}
                {summary.totalIncome.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>

            {/* Divider */}
            <View
              style={{
                width: 1,
                backgroundColor: "#F2F2F7",
                marginVertical: 4,
              }}
            />

            {/* Expenses */}
            <View style={{ flex: 1, paddingLeft: 4 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6,
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    backgroundColor: "#FEE2E2",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendingDown size={14} color="#DC2626" />
                </View>
                <Text
                  style={{ fontSize: 12, color: "#8E8E93", fontWeight: "500" }}
                >
                  Expenses
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: "#DC2626",
                  letterSpacing: -0.5,
                }}
              >
                {sym}
                {summary.totalExpenses.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
          </MotiView>
        </View>

        {/* ── AI Smart Input ── */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 450, delay: 220 }}
          >
            <LinearGradient
              colors={["#EFF6FF", "#F5F3FF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 20,
                padding: 16,
                borderWidth: 1,
                borderColor: "#E0E7FF",
                ...softShadow,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <LinearGradient
                  colors={["#6366F1", "#8B5CF6"]}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Sparkles size={16} color="#FFFFFF" />
                </LinearGradient>
                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: "#1C1C1E",
                    }}
                  >
                    AI Smart Entry
                  </Text>
                  <Text style={{ fontSize: 11, color: "#8E8E93" }}>
                    {currency.code} · {currency.name}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#FFFFFF",
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "#E0E7FF",
                  paddingHorizontal: 14,
                  paddingVertical: 2,
                  marginBottom: 10,
                  ...softShadow,
                }}
              >
                <TextInput
                  value={aiInput}
                  onChangeText={setAiInput}
                  placeholder={`e.g. "200 Taka bus bhara" or "received 1200 salary"`}
                  placeholderTextColor="#C7C7CC"
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    fontSize: 14,
                    color: "#1C1C1E",
                  }}
                  onSubmitEditing={handleAiParse}
                  returnKeyType="send"
                  editable={!isParsing}
                />
              </View>

              <TouchableOpacity
                onPress={handleAiParse}
                disabled={!aiInput.trim() || isParsing}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    aiInput.trim() && !isParsing
                      ? ["#6366F1", "#4F46E5"]
                      : ["#E5E7EB", "#E5E7EB"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 12,
                    paddingVertical: 13,
                    alignItems: "center",
                  }}
                >
                  {isParsing ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: aiInput.trim() ? "#FFFFFF" : "#9CA3AF",
                      }}
                    >
                      Add Transaction with AI ✦
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </MotiView>
        </View>

        {/* ── Recent Activity ── */}
        <View style={{ paddingHorizontal: 16 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#1C1C1E",
                letterSpacing: -0.3,
              }}
            >
              Recent Activity
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Zap size={12} color="#007AFF" />
              <Text
                style={{ fontSize: 13, color: "#007AFF", fontWeight: "600" }}
              >
                This Month
              </Text>
            </View>
          </View>

          {isLoading ? (
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
              <ActivityIndicator color="#007AFF" />
            </View>
          ) : recentTransactions.length === 0 ? (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                padding: 32,
                alignItems: "center",
                ...softShadow,
              }}
            >
              <Text style={{ fontSize: 32, marginBottom: 8 }}>📊</Text>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: "#1C1C1E",
                  marginBottom: 4,
                }}
              >
                No transactions yet
              </Text>
              <Text
                style={{ fontSize: 13, color: "#8E8E93", textAlign: "center" }}
              >
                Use the AI input above to log your first transaction
              </Text>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                overflow: "hidden",
                ...softShadow,
              }}
            >
              {recentTransactions.slice(0, 6).map((t, i) => (
                <MotiView
                  key={t.id}
                  from={{ opacity: 0, translateX: -6 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: "timing", duration: 350, delay: i * 50 }}
                >
                  <TouchableOpacity
                    onPress={() => setSelectedTransaction(t)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 14,
                      borderBottomWidth:
                        i < recentTransactions.slice(0, 6).length - 1 ? 0.5 : 0,
                      borderBottomColor: "#F2F2F7",
                    }}
                  >
                    <LinearGradient
                      colors={
                        t.transaction_type === "income"
                          ? ["#D1FAE5", "#A7F3D0"]
                          : ["#FEE2E2", "#FECACA"]
                      }
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 13,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      {t.transaction_type === "income" ? (
                        <ArrowUpRight size={20} color="#059669" />
                      ) : (
                        <ArrowDownRight size={20} color="#DC2626" />
                      )}
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: "#1C1C1E",
                          marginBottom: 2,
                        }}
                        numberOfLines={1}
                      >
                        {t.description}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#8E8E93",
                          fontWeight: "500",
                        }}
                      >
                        {t.category_name || "Uncategorized"} ·{" "}
                        {format(new Date(t.transaction_date), "MMM d")}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        letterSpacing: -0.3,
                        color:
                          t.transaction_type === "income"
                            ? "#059669"
                            : "#DC2626",
                      }}
                    >
                      {t.transaction_type === "income" ? "+" : "-"}
                      {sym}
                      {parseFloat(t.amount).toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                </MotiView>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <TransactionDetailModal
        visible={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
      />
    </View>
  );
}
