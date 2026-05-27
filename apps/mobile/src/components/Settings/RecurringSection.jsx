import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { RefreshCw, Plus, Trash2 } from "lucide-react-native";

export function RecurringSection({
  recurring,
  onAddRecurring,
  onDeleteRecurring,
  onToggleRecurring,
  onProcessRecurring,
  isProcessing,
}) {
  const handleDelete = (item) => {
    Alert.alert("Delete", `Delete "${item.description}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDeleteRecurring(item.id),
      },
    ]);
  };

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>
          Recurring
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={onProcessRecurring}
            disabled={isProcessing}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: "#F0FDF4",
              paddingHorizontal: 10,
              paddingVertical: 7,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#BBF7D0",
            }}
          >
            {isProcessing ? (
              <ActivityIndicator size={14} color="#16A34A" />
            ) : (
              <RefreshCw size={14} color="#16A34A" />
            )}
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: "#16A34A",
              }}
            >
              Process
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onAddRecurring}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: "#EFF6FF",
              paddingHorizontal: 10,
              paddingVertical: 7,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#BFDBFE",
            }}
          >
            <Plus size={14} color="#2563EB" />
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: "#2563EB",
              }}
            >
              Add
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {recurring.length === 0 ? (
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#E5E7EB",
            padding: 24,
            alignItems: "center",
          }}
        >
          <RefreshCw size={32} color="#D1D5DB" />
          <Text
            style={{
              fontSize: 14,
              color: "#6B7280",
              marginTop: 8,
              textAlign: "center",
            }}
          >
            No recurring transactions.{"\n"}Add subscriptions, salaries, rent,
            etc.
          </Text>
        </View>
      ) : (
        recurring.map((item) => (
          <View
            key={item.id}
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
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 999,
                      backgroundColor:
                        item.transaction_type === "expense"
                          ? "#FEE2E2"
                          : "#DCFCE7",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "600",
                        color:
                          item.transaction_type === "expense"
                            ? "#DC2626"
                            : "#16A34A",
                        textTransform: "uppercase",
                      }}
                    >
                      {item.transaction_type}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#6B7280",
                      textTransform: "capitalize",
                    }}
                  >
                    {item.frequency}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#111827",
                    marginBottom: 2,
                  }}
                >
                  {item.description}
                </Text>
                <Text style={{ fontSize: 12, color: "#6B7280" }}>
                  ${parseFloat(item.amount).toFixed(2)} · Next: {item.next_date}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 8 }}>
                <Switch
                  value={item.is_active}
                  onValueChange={(val) =>
                    onToggleRecurring({ id: item.id, is_active: val })
                  }
                  trackColor={{ false: "#E5E7EB", true: "#BFDBFE" }}
                  thumbColor={item.is_active ? "#2563EB" : "#9CA3AF"}
                />
                <TouchableOpacity
                  onPress={() => handleDelete(item)}
                  style={{ padding: 4 }}
                >
                  <Trash2 size={16} color="#D1D5DB" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );
}
