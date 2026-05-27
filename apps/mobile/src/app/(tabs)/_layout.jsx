import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import { View, Platform } from "react-native";
import {
  House,
  ArrowLeftRight,
  ChartPie,
  SlidersHorizontal,
} from "lucide-react-native";

function TabIcon({ Icon, color, focused }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Icon size={24} color={color} strokeWidth={focused ? 2.2 : 1.8} />
    </View>
  );
}

export default function TabLayout() {
  return (
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
  );
}
