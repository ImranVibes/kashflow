import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import { View, Platform } from "react-native";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  House,
  ArrowLeftRight,
  ChartPie,
  SlidersHorizontal,
  Plus,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { offlineDb } from "@/utils/offlineDb";
import AddTransactionModal from "@/components/AddTransactionModal";

function TabIcon({ Icon, color, focused }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Icon size={24} color={color} strokeWidth={focused ? 2.2 : 1.8} />
    </View>
  );
}

function CenterPlusButton() {
  return (
    <View
      style={{
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        marginTop: -16,
        shadowColor: "#4F46E5",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 3,
        borderColor: "#FFFFFF",
      }}
    >
      <LinearGradient
        colors={["#6366F1", "#4F46E5"]}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 23,
          alignItems: "center",
          justifyContent: "center",
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Plus size={24} color="#FFFFFF" strokeWidth={3} />
      </LinearGradient>
    </View>
  );
}

export default function TabLayout() {
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      return offlineDb.getCategories();
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        categories={categories}
        onSuccess={() => setShowAddModal(false)}
      />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#007AFF",
          tabBarInactiveTintColor: "#8E8E93",
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "600",
            letterSpacing: 0.2,
            marginTop: 2,
          },
          tabBarStyle: {
            position: "absolute",
            borderTopWidth: 0,
            elevation: 0,
            backgroundColor:
              Platform.OS === "ios" ? "transparent" : "rgba(255,255,255,0.95)",
          },
          tabBarBackground: () =>
            Platform.OS === "ios" ? (
              <BlurView
                tint="systemChromeMaterial"
                intensity={95}
                style={{
                  flex: 1,
                  borderTopWidth: 0.5,
                  borderTopColor: "rgba(0,0,0,0.1)",
                }}
              />
            ) : (
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.97)",
                  borderTopWidth: 0.5,
                  borderTopColor: "rgba(0,0,0,0.08)",
                }}
              />
            ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={House} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            title: "Transactions",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={ArrowLeftRight} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="add-transaction-dummy"
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setShowAddModal(true);
            },
          }}
          options={{
            tabBarLabel: () => null,
            tabBarIcon: () => <CenterPlusButton />,
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: "Analytics",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={ChartPie} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon Icon={SlidersHorizontal} color={color} focused={focused} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
