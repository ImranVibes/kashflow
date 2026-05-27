import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Check, Search, RefreshCw } from "lucide-react-native";
import { useCurrencyStore, CURRENCIES } from "@/utils/useCurrencyStore";
import { useQueryClient } from "@tanstack/react-query";

export function CurrencySection() {
  const {
    currency,
    setCurrency,
    isConverting,
    conversionError,
    clearConversionError,
  } = useCurrencyStore();
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  // When conversion finishes successfully, refresh all cached data
  useEffect(() => {
    if (!isConverting) {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    }
  }, [isConverting]);

  // Show error alert when conversion fails
  useEffect(() => {
    if (conversionError) {
      Alert.alert(
        "Conversion Failed",
        conversionError +
          "\n\nYour currency was not changed. Please check your internet connection and try again.",
        [{ text: "OK", onPress: clearConversionError }],
      );
    }
  }, [conversionError]);

  const filtered = CURRENCIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.includes(search),
  );

  return (
    <View style={{ paddingTop: 16 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: "#8E8E93",
          marginBottom: 12,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        Selected Currency
      </Text>

      {/* Current selection preview */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <Text style={{ fontSize: 32, marginRight: 14 }}>{currency.flag}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 17, fontWeight: "700", color: "#1C1C1E" }}>
            {currency.name}
          </Text>
          <Text style={{ fontSize: 14, color: "#8E8E93", marginTop: 2 }}>
            {currency.code} · {currency.symbol}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: "#4ADE80",
            width: 24,
            height: 24,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Check size={14} color="#FFFFFF" />
        </View>
      </View>

      {/* Converting banner */}
      {isConverting && (
        <View
          style={{
            backgroundColor: "#EFF6FF",
            borderRadius: 12,
            padding: 14,
            marginBottom: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            borderWidth: 1,
            borderColor: "#BFDBFE",
          }}
        >
          <ActivityIndicator size="small" color="#2563EB" />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#1D4ED8" }}>
              Converting values…
            </Text>
            <Text style={{ fontSize: 12, color: "#3B82F6", marginTop: 2 }}>
              Fetching live exchange rate and updating all your transactions,
              budgets & recurring entries.
            </Text>
          </View>
        </View>
      )}

      {/* Search */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#E5E7EB",
          paddingHorizontal: 12,
          marginBottom: 12,
          opacity: isConverting ? 0.5 : 1,
        }}
      >
        <Search size={16} color="#8E8E93" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search currencies…"
          placeholderTextColor="#C7C7CC"
          editable={!isConverting}
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 8,
            fontSize: 14,
            color: "#1C1C1E",
          }}
        />
      </View>

      {/* Currency list */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
          opacity: isConverting ? 0.5 : 1,
        }}
      >
        {filtered.map((c, i) => {
          const isSelected = c.code === currency.code;
          return (
            <TouchableOpacity
              key={c.code}
              onPress={() => !isConverting && setCurrency(c.code)}
              activeOpacity={isConverting ? 1 : 0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 14,
                borderBottomWidth: i < filtered.length - 1 ? 0.5 : 0,
                borderBottomColor: "#F2F2F7",
                backgroundColor: isSelected ? "#F0FDF4" : "#FFFFFF",
              }}
            >
              <Text style={{ fontSize: 24, marginRight: 12 }}>{c.flag}</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: isSelected ? "700" : "500",
                    color: isSelected ? "#059669" : "#1C1C1E",
                  }}
                >
                  {c.name}
                </Text>
                <Text style={{ fontSize: 12, color: "#8E8E93", marginTop: 1 }}>
                  {c.code} · {c.symbol}
                </Text>
              </View>
              {isSelected && <Check size={18} color="#059669" />}
            </TouchableOpacity>
          );
        })}
        {filtered.length === 0 && (
          <View style={{ padding: 32, alignItems: "center" }}>
            <Text style={{ color: "#8E8E93", fontSize: 14 }}>
              No currencies found
            </Text>
          </View>
        )}
      </View>

      <Text
        style={{
          fontSize: 12,
          color: "#8E8E93",
          marginTop: 12,
          textAlign: "center",
        }}
      >
        Powered by ExchangeRate-API · Rates updated daily
      </Text>
    </View>
  );
}
