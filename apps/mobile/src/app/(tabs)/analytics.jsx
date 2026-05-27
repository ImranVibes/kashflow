import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Target,
  AlertTriangle,
} from "lucide-react-native";
import { useCurrencyStore } from "@/utils/useCurrencyStore";

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState("month");
  const [isExporting, setIsExporting] = useState(false);
  const { currency } = useCurrencyStore();
  const sym = currency.symbol;

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics", period],
    queryFn: async () => {
      const response = await fetch(`/api/analytics?period=${period}`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    },
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const response = await fetch("/api/budgets");
      if (!response.ok) throw new Error("Failed to fetch budgets");
      return response.json();
    },
  });

  const handleExportPDF = useCallback(async () => {
    setIsExporting(true);
    try {
      const baseUrl = process.env.EXPO_PUBLIC_BASE_URL || "";
      const pdfUrl = `${baseUrl}/api/reports?period=${period}`;
      const supported = await Linking.canOpenURL(pdfUrl);
      if (supported) {
        await Linking.openURL(pdfUrl);
      } else {
        Alert.alert(
          "Export Ready",
          `Your PDF report is ready. Open this URL in your browser:\n\n${pdfUrl}`,
        );
      }
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert("Error", "Could not export report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [period]);

  const summary = analytics?.summary || {
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalTransactions: 0,
  };
  const categoryBreakdown = analytics?.categoryBreakdown || [];

  const budgetsByCategory = budgets.reduce((acc, b) => {
    acc[b.category_id] = b;
    return acc;
  }, {});

  const expenseCategories = categoryBreakdown.filter(
    (c) => c.category_type === "expense",
  );
  const incomeCategories = categoryBreakdown.filter(
    (c) => c.category_type === "income",
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar style="dark" />

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
            Analytics
          </Text>
          <TouchableOpacity
            onPress={handleExportPDF}
            disabled={isExporting}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: isExporting ? "#E5E7EB" : "#EFF6FF",
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: isExporting ? "#D1D5DB" : "#BFDBFE",
            }}
          >
            {isExporting ? (
              <ActivityIndicator size={16} color="#2563EB" />
            ) : (
              <FileText size={16} color="#2563EB" />
            )}
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: isExporting ? "#9CA3AF" : "#2563EB",
              }}
            >
              {isExporting ? "Exporting…" : "Export PDF"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Period picker */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          {["week", "month", "year"].map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: period === p ? "#EFF6FF" : "#FFFFFF",
                borderWidth: 1,
                borderColor: period === p ? "#2563EB" : "#E5E7EB",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: period === p ? "600" : "400",
                  color: period === p ? "#2563EB" : "#6B7280",
                }}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: insets.bottom + 80,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={{ paddingVertical: 60, alignItems: "center" }}>
            <ActivityIndicator color="#2563EB" size="large" />
          </View>
        ) : (
          <>
            {/* Summary Cards */}
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  padding: 16,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "#DCFCE7",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 8,
                  }}
                >
                  <TrendingUp size={16} color="#16A34A" />
                </View>
                <Text
                  style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}
                >
                  Income
                </Text>
                <Text
                  style={{ fontSize: 20, fontWeight: "700", color: "#111827" }}
                >
                  {sym}
                  {summary.totalIncome.toFixed(2)}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  padding: 16,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "#FEE2E2",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 8,
                  }}
                >
                  <TrendingDown size={16} color="#DC2626" />
                </View>
                <Text
                  style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}
                >
                  Expenses
                </Text>
                <Text
                  style={{ fontSize: 20, fontWeight: "700", color: "#111827" }}
                >
                  {sym}
                  {summary.totalExpenses.toFixed(2)}
                </Text>
              </View>
            </View>

            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                padding: 16,
                marginBottom: 24,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor:
                        summary.netProfit >= 0 ? "#DBEAFE" : "#FEE2E2",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 8,
                    }}
                  >
                    <DollarSign
                      size={16}
                      color={summary.netProfit >= 0 ? "#2563EB" : "#DC2626"}
                    />
                  </View>
                  <Text
                    style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}
                  >
                    Net Profit
                  </Text>
                  <Text
                    style={{
                      fontSize: 28,
                      fontWeight: "700",
                      color: summary.netProfit >= 0 ? "#16A34A" : "#DC2626",
                    }}
                  >
                    {summary.netProfit >= 0 ? "" : "-"}
                    {sym}
                    {Math.abs(summary.netProfit).toFixed(2)}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}
                  >
                    Transactions
                  </Text>
                  <Text
                    style={{
                      fontSize: 28,
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    {summary.totalTransactions}
                  </Text>
                </View>
              </View>
            </View>

            {/* Expense Breakdown with Budget */}
            {expenseCategories.length > 0 && (
              <>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#111827",
                    marginBottom: 12,
                  }}
                >
                  Expenses by Category
                </Text>
                {expenseCategories.map((category) => {
                  const spent = parseFloat(category.total_amount);
                  const budget = budgetsByCategory[category.id];
                  const budgetAmount = budget
                    ? parseFloat(budget.amount)
                    : null;
                  const pct = budgetAmount
                    ? Math.min((spent / budgetAmount) * 100, 100)
                    : summary.totalExpenses > 0
                      ? (spent / summary.totalExpenses) * 100
                      : 0;
                  const isOverBudget = budgetAmount && spent > budgetAmount;

                  return (
                    <View
                      key={category.id}
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: isOverBudget ? "#FECACA" : "#E5E7EB",
                        padding: 14,
                        marginBottom: 10,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 10,
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: "600",
                                color: "#111827",
                              }}
                            >
                              {category.name}
                            </Text>
                            {isOverBudget && (
                              <AlertTriangle size={14} color="#DC2626" />
                            )}
                          </View>
                          <Text
                            style={{
                              fontSize: 12,
                              color: "#6B7280",
                              marginTop: 2,
                            }}
                          >
                            {category.transaction_count} transaction
                            {parseInt(category.transaction_count) !== 1
                              ? "s"
                              : ""}
                          </Text>
                        </View>
                        <View style={{ alignItems: "flex-end" }}>
                          <Text
                            style={{
                              fontSize: 15,
                              fontWeight: "700",
                              color: isOverBudget ? "#DC2626" : "#111827",
                            }}
                          >
                            {sym}
                            {spent.toFixed(2)}
                          </Text>
                          {budgetAmount && (
                            <Text
                              style={{
                                fontSize: 11,
                                color: "#6B7280",
                                marginTop: 2,
                              }}
                            >
                              of {sym}
                              {budgetAmount.toFixed(2)} budget
                            </Text>
                          )}
                        </View>
                      </View>
                      <View
                        style={{
                          height: 6,
                          backgroundColor: "#F3F4F6",
                          borderRadius: 3,
                          overflow: "hidden",
                        }}
                      >
                        <View
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            backgroundColor: isOverBudget
                              ? "#DC2626"
                              : "#2563EB",
                            borderRadius: 3,
                          }}
                        />
                      </View>
                      {budgetAmount && (
                        <Text
                          style={{
                            fontSize: 11,
                            color: isOverBudget ? "#DC2626" : "#6B7280",
                            marginTop: 4,
                            fontWeight: isOverBudget ? "600" : "400",
                          }}
                        >
                          {isOverBudget
                            ? `Over budget by ${sym}${(spent - budgetAmount).toFixed(2)}`
                            : `${sym}${(budgetAmount - spent).toFixed(2)} remaining`}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </>
            )}

            {/* Income Breakdown */}
            {incomeCategories.length > 0 && (
              <>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#111827",
                    marginBottom: 12,
                    marginTop: 8,
                  }}
                >
                  Income by Category
                </Text>
                {incomeCategories.map((category) => {
                  const earned = parseFloat(category.total_amount);
                  const pct =
                    summary.totalIncome > 0
                      ? (earned / summary.totalIncome) * 100
                      : 0;
                  return (
                    <View
                      key={category.id}
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                        padding: 14,
                        marginBottom: 10,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 10,
                        }}
                      >
                        <View>
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "600",
                              color: "#111827",
                            }}
                          >
                            {category.name}
                          </Text>
                          <Text
                            style={{
                              fontSize: 12,
                              color: "#6B7280",
                              marginTop: 2,
                            }}
                          >
                            {category.transaction_count} transaction
                            {parseInt(category.transaction_count) !== 1
                              ? "s"
                              : ""}
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "700",
                            color: "#16A34A",
                          }}
                        >
                          {sym}
                          {earned.toFixed(2)}
                        </Text>
                      </View>
                      <View
                        style={{
                          height: 6,
                          backgroundColor: "#F3F4F6",
                          borderRadius: 3,
                          overflow: "hidden",
                        }}
                      >
                        <View
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            backgroundColor: "#16A34A",
                            borderRadius: 3,
                          }}
                        />
                      </View>
                      <Text
                        style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}
                      >
                        {pct.toFixed(1)}% of total income
                      </Text>
                    </View>
                  );
                })}
              </>
            )}

            {categoryBreakdown.length === 0 && (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <Text style={{ fontSize: 14, color: "#6B7280" }}>
                  No data for this period
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
