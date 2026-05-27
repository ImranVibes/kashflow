import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import { Tag, Trash2, Plus } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

const shadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 10,
  elevation: 3,
};

const PALETTE = [
  "#EF4444", // Red
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Orange
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#14B8A6", // Teal
];

export function CategoriesSection({
  expenseCategories,
  incomeCategories,
  onAddCategory,
  onDeleteCategory,
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [selectedColor, setSelectedColor] = useState(PALETTE[0]);

  const handleAdd = () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter a category name");
      return;
    }
    onAddCategory({
      name: name.trim(),
      category_type: type,
      icon: "Tag",
      color: selectedColor,
    });
    setName("");
    Alert.alert("✓ Success", `Category "${name.trim()}" created successfully!`);
  };

  const handleDelete = (c) => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${c.name}"? This will not delete transactions under this category.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDeleteCategory(c.id),
        },
      ]
    );
  };

  return (
    <View>
      {/* ── Add Custom Category Card ── */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          padding: 18,
          marginBottom: 24,
          ...shadow,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#1C1C1E", marginBottom: 14 }}>
          Add Custom Category
        </Text>

        {/* Name Input */}
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Category Name (e.g. Subscriptions)"
          placeholderTextColor="#C7C7CC"
          style={{
            backgroundColor: "#F2F2F7",
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 14,
            color: "#1C1C1E",
            marginBottom: 14,
          }}
        />

        {/* Type Selector */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
          {["expense", "income"].map((t) => {
            const isSelected = type === t;
            return (
              <TouchableOpacity
                key={t}
                onPress={() => setType(t)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  alignItems: "center",
                  backgroundColor: isSelected
                    ? t === "expense"
                      ? "#FEE2E2"
                      : "#D1FAE5"
                    : "#F2F2F7",
                  borderWidth: 1,
                  borderColor: isSelected
                    ? t === "expense"
                      ? "#EF4444"
                      : "#10B981"
                    : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: isSelected
                      ? t === "expense"
                        ? "#EF4444"
                        : "#10B981"
                      : "#8E8E93",
                  }}
                >
                  {t === "expense" ? "Expense" : "Income"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Color Palette Selector */}
        <Text style={{ fontSize: 12, fontWeight: "600", color: "#8E8E93", marginBottom: 8 }}>
          SELECT COLOR
        </Text>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {PALETTE.map((color) => {
            const isSelected = selectedColor === color;
            return (
              <TouchableOpacity
                key={color}
                onPress={() => setSelectedColor(color)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: color,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: isSelected ? 3 : 0,
                  borderColor: "#FFFFFF",
                  shadowColor: isSelected ? "#000" : "transparent",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.3,
                  shadowRadius: 2,
                  elevation: isSelected ? 3 : 0,
                }}
              >
                {isSelected && (
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#FFFFFF" }} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Add Button */}
        <TouchableOpacity onPress={handleAdd} activeOpacity={0.8}>
          <LinearGradient
            colors={name.trim() ? ["#6366F1", "#4F46E5"] : ["#E5E5EA", "#E5E5EA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 12,
              paddingVertical: 13,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 6,
            }}
          >
            <Plus size={16} color={name.trim() ? "#FFFFFF" : "#C7C7CC"} strokeWidth={2.5} />
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: name.trim() ? "#FFFFFF" : "#C7C7CC",
              }}
            >
              Add Category
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ── Expense Categories ── */}
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
        {expenseCategories.map((c, i) => {
          const isCustom = c.id > 9;
          return (
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
                  backgroundColor: `${c.color || "#EF4444"}15`,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Tag size={14} color={c.color || "#EF4444"} />
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
              {isCustom ? (
                <TouchableOpacity onPress={() => handleDelete(c)} style={{ padding: 4 }}>
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              ) : (
                <Text style={{ fontSize: 11, color: "#C7C7CC", fontWeight: "500" }}>
                  Default
                </Text>
              )}
            </View>
          );
        })}
      </View>

      {/* ── Income Categories ── */}
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
        {incomeCategories.map((c, i) => {
          const isCustom = c.id > 9;
          return (
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
                  backgroundColor: `${c.color || "#059669"}15`,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Tag size={14} color={c.color || "#059669"} />
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
              {isCustom ? (
                <TouchableOpacity onPress={() => handleDelete(c)} style={{ padding: 4 }}>
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              ) : (
                <Text style={{ fontSize: 11, color: "#C7C7CC", fontWeight: "500" }}>
                  Default
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
export default CategoriesSection;
