import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export function SectionTabs({ sections, activeSection, onSectionChange }) {
  // Chunk into rows of 3 — all 6 are always visible, no scrolling needed
  const rows = [];
  for (let i = 0; i < sections.length; i += 3) {
    rows.push(sections.slice(i, i + 3));
  }

  return (
    <View style={{ gap: 10, marginBottom: 20 }}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={{ flexDirection: "row", gap: 10 }}>
          {row.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id;
            return (
              <TouchableOpacity
                key={id}
                onPress={() => onSectionChange(id)}
                activeOpacity={0.75}
                style={{ flex: 1 }}
              >
                {isActive ? (
                  <LinearGradient
                    colors={["#007AFF", "#0055D5"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      paddingVertical: 16,
                      borderRadius: 16,
                      gap: 6,
                      shadowColor: "#007AFF",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.35,
                      shadowRadius: 8,
                      elevation: 5,
                    }}
                  >
                    <Icon size={22} color="#FFFFFF" />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: "#FFFFFF",
                      }}
                    >
                      {label}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      paddingVertical: 16,
                      borderRadius: 16,
                      gap: 6,
                      backgroundColor: "#FFFFFF",
                      borderWidth: 1.5,
                      borderColor: "#E5E5EA",
                    }}
                  >
                    <Icon size={22} color="#8E8E93" />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: "#8E8E93",
                      }}
                    >
                      {label}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}
