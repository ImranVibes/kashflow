import { View, Text, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Target, Plus, Trash2 } from "lucide-react-native";

const shadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 10,
  elevation: 3,
};

export function BudgetsSection({ budgets, onAddBudget, onDeleteBudget }) {
  const handleDelete = (budget) => {
    Alert.alert(
      "Delete Budget",
      `Remove budget for "${budget.category_name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDeleteBudget(budget.id),
        },
      ],
    );
  };

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#1C1C1E" }}>
          Monthly Budgets
        </Text>
        <TouchableOpacity onPress={onAddBudget} activeOpacity={0.8}>
          <LinearGradient
            colors={["#007AFF", "#0055D5"]}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              paddingHorizontal: 14,
              paddingVertical: 9,
              borderRadius: 20,
              shadowColor: "#007AFF",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <Plus size={14} color="#FFFFFF" />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#FFFFFF" }}>
              Add Budget
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {budgets.length === 0 ? (
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 36,
            alignItems: "center",
            ...shadow,
          }}
        >
          <Text style={{ fontSize: 36, marginBottom: 10 }}>🎯</Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#1C1C1E",
              marginBottom: 6,
            }}
          >
            No Budgets Set
          </Text>
          <Text style={{ fontSize: 13, color: "#8E8E93", textAlign: "center" }}>
            Set spending limits to track where your money goes
          </Text>
        </View>
      ) : (
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            overflow: "hidden",
            ...shadow,
          }}
        >
          {budgets.map((budget, i) => (
            <View
              key={budget.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                borderBottomWidth: i < budgets.length - 1 ? 0.5 : 0,
                borderBottomColor: "#F2F2F7",
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: "#FEE2E2",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <Target size={18} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: "#1C1C1E",
                    marginBottom: 2,
                  }}
                >
                  {budget.category_name}
                </Text>
                <Text style={{ fontSize: 13, color: "#8E8E93" }}>
                  ${parseFloat(budget.amount).toFixed(2)} / {budget.period}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(budget)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Trash2 size={18} color="#D1D1D6" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
