import { View, Text } from "react-native";
import { Tag } from "lucide-react-native";

const shadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 10,
  elevation: 3,
};

export function CategoriesSection({ expenseCategories, incomeCategories }) {
  return (
    <View>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: "#8E8E93",
          letterSpacing: 0.3,
          marginBottom: 8,
        }}
      >
        EXPENSE CATEGORIES
      </Text>
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          overflow: "hidden",
          marginBottom: 24,
          ...shadow,
        }}
      >
        {expenseCategories.map((c, i) => (
          <View
            key={c.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 14,
              borderBottomWidth: i < expenseCategories.length - 1 ? 0.5 : 0,
              borderBottomColor: "#F2F2F7",
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: "#FEE2E2",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Tag size={14} color="#DC2626" />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                color: "#1C1C1E",
                fontWeight: "500",
              }}
            >
              {c.name}
            </Text>
            {c.is_default && (
              <Text
                style={{ fontSize: 11, color: "#C7C7CC", fontWeight: "500" }}
              >
                Default
              </Text>
            )}
          </View>
        ))}
      </View>

      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: "#8E8E93",
          letterSpacing: 0.3,
          marginBottom: 8,
        }}
      >
        INCOME CATEGORIES
      </Text>
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          overflow: "hidden",
          marginBottom: 24,
          ...shadow,
        }}
      >
        {incomeCategories.map((c, i) => (
          <View
            key={c.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 14,
              borderBottomWidth: i < incomeCategories.length - 1 ? 0.5 : 0,
              borderBottomColor: "#F2F2F7",
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: "#D1FAE5",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Tag size={14} color="#059669" />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                color: "#1C1C1E",
                fontWeight: "500",
              }}
            >
              {c.name}
            </Text>
            {c.is_default && (
              <Text
                style={{ fontSize: 11, color: "#C7C7CC", fontWeight: "500" }}
              >
                Default
              </Text>
            )}
          </View>
        ))}
      </View>

      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          padding: 18,
          ...shadow,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: "700",
            color: "#1C1C1E",
            marginBottom: 6,
          }}
        >
          About
        </Text>
        <Text style={{ fontSize: 13, color: "#8E8E93", lineHeight: 20 }}>
          Business Tracker — AI-powered expense & income tracking with budgets,
          recurring transactions, and PDF reports.
        </Text>
        <Text style={{ fontSize: 12, color: "#C7C7CC", marginTop: 10 }}>
          Powered by Google Gemini 2.5 Flash
        </Text>
      </View>
    </View>
  );
}
