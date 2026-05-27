import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { X, Calendar, Tag, ArrowUpRight, ArrowDownRight, FileText, Info } from "lucide-react-native";
import { format } from "date-fns";
import { useCurrencyStore } from "@/utils/useCurrencyStore";

export default function TransactionDetailModal({ visible, onClose, transaction }) {
  if (!transaction) return null;
  const { currency } = useCurrencyStore();
  const sym = currency.symbol;

  const isIncome = transaction.transaction_type === "income";
  const date = new Date(transaction.transaction_date);
  const formattedDate = format(date, "EEEE, MMMM dd, yyyy");

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 24,
            width: "100%",
            maxHeight: "80%",
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 14,
              borderBottomWidth: 0.5,
              borderColor: "#F2F2F7",
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: "700", color: "#1C1C1E" }}>
              Transaction Details
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: "#F2F2F7",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={16} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
            {/* Amount Banner */}
            <View
              style={{
                alignItems: "center",
                paddingVertical: 24,
                backgroundColor: isIncome ? "#F0FDF4" : "#FDF2F2",
                borderRadius: 18,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: isIncome ? "#DCFCE7" : "#FEE2E2",
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: isIncome ? "#DCFCE7" : "#FEE2E2",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                {isIncome ? (
                  <ArrowUpRight size={22} color="#16A34A" strokeWidth={2.5} />
                ) : (
                  <ArrowDownRight size={22} color="#DC2626" strokeWidth={2.5} />
                )}
              </View>

              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "800",
                  color: isIncome ? "#16A34A" : "#DC2626",
                  letterSpacing: -1,
                }}
              >
                {isIncome ? "+" : "-"}
                {sym}
                {parseFloat(transaction.amount).toFixed(2)}
              </Text>

              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: isIncome ? "#059669" : "#DC2626",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  marginTop: 4,
                }}
              >
                {transaction.transaction_type}
              </Text>
            </View>

            {/* Core Info Rows */}
            <View style={{ gap: 14, marginBottom: 20 }}>
              {/* Description */}
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ width: 20, marginTop: 2 }}>
                  <Info size={18} color="#8E8E93" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: "#8E8E93", textTransform: "uppercase" }}>
                    Description
                  </Text>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: "#1C1C1E", marginTop: 2 }}>
                    {transaction.description}
                  </Text>
                </View>
              </View>

              {/* Category */}
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ width: 20, marginTop: 2 }}>
                  <Tag size={18} color={transaction.category_color || "#6366F1"} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: "#8E8E93", textTransform: "uppercase" }}>
                    Category
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 20,
                        backgroundColor: `${transaction.category_color || "#6366F1"}15`,
                        borderWidth: 0.5,
                        borderColor: `${transaction.category_color || "#6366F1"}30`,
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: "600", color: transaction.category_color || "#6366F1" }}>
                        {transaction.category_name || "Uncategorized"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Date */}
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ width: 20, marginTop: 2 }}>
                  <Calendar size={18} color="#8E8E93" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: "#8E8E93", textTransform: "uppercase" }}>
                    Transaction Date
                  </Text>
                  <Text style={{ fontSize: 15, fontWeight: "500", color: "#1C1C1E", marginTop: 2 }}>
                    {formattedDate}
                  </Text>
                </View>
              </View>
            </View>

            {/* Optional Notes Section */}
            <View style={{ borderTopWidth: 0.5, borderColor: "#F2F2F7", paddingTop: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <FileText size={16} color="#8E8E93" />
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#8E8E93", textTransform: "uppercase", letterSpacing: 0.3 }}>
                  Optional Notes
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: "#F2F2F7",
                  borderRadius: 14,
                  padding: 14,
                  minHeight: 80,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: transaction.notes ? "#1C1C1E" : "#8E8E93",
                    lineHeight: 20,
                    fontStyle: transaction.notes ? "normal" : "italic",
                  }}
                >
                  {transaction.notes || "No extra notes provided for this transaction."}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Close Action Button */}
          <View style={{ padding: 20, borderTopWidth: 0.5, borderColor: "#F2F2F7" }}>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.8}
              style={{
                backgroundColor: "#F2F2F7",
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#1C1C1E" }}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
