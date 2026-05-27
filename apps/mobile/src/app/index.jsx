import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/utils/auth/useAuth.js";
import {
  LogIn,
  UserPlus,
  ArrowRight,
  Shield,
  Cloud,
  RefreshCw,
} from "lucide-react-native";

const GUEST_KEY = "guest_mode_enabled";

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { auth: authState, isReady, signIn } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isReady) return;

    const checkAndRedirect = async () => {
      // If already signed in, go to the app
      if (authState) {
        router.replace("/(tabs)");
        return;
      }

      // If chosen guest mode before, go to app
      const guestMode = await AsyncStorage.getItem(GUEST_KEY);
      if (guestMode === "true") {
        router.replace("/(tabs)");
        return;
      }

      setChecking(false);
    };

    checkAndRedirect();
  }, [isReady, authState]);

  const handleContinueAsGuest = async () => {
    await AsyncStorage.setItem(GUEST_KEY, "true");
    router.replace("/(tabs)");
  };

  const handleSignIn = () => {
    signIn();
  };

  if (checking || !isReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1C1C3A",
        }}
      >
        <ActivityIndicator color="#FFFFFF" size="large" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#1C1C3A", "#0A2463", "#1B4FD8"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <StatusBar style="light" />

      <View
        style={{
          flex: 1,
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 24,
          justifyContent: "space-between",
        }}
      >
        {/* Top: Logo + Title */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600 }}
          style={{ alignItems: "center", paddingTop: 40 }}
        >
          <Text style={{ fontSize: 64, marginBottom: 16 }}>💼</Text>
          <Text
            style={{
              fontSize: 34,
              fontWeight: "800",
              color: "#FFFFFF",
              textAlign: "center",
              letterSpacing: -0.5,
              marginBottom: 10,
            }}
          >
            Business Tracker
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.65)",
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            Smart finance tracking with{"\n"}AI-powered insights
          </Text>
        </MotiView>

        {/* Middle: Feature highlights */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 600, delay: 200 }}
        >
          {[
            {
              icon: Cloud,
              text: "Data saved in the cloud",
              sub: "Access from any device",
            },
            {
              icon: Shield,
              text: "Secure & private",
              sub: "Your data stays yours",
            },
            {
              icon: RefreshCw,
              text: "AI-powered entry",
              sub: "Just describe your expense",
            },
          ].map(({ icon: Icon, text, sub }) => (
            <View
              key={text}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: 14,
                padding: 14,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <Icon size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text
                  style={{ fontSize: 15, fontWeight: "700", color: "#FFFFFF" }}
                >
                  {text}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.55)",
                    marginTop: 2,
                  }}
                >
                  {sub}
                </Text>
              </View>
            </View>
          ))}
        </MotiView>

        {/* Bottom: Buttons */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600, delay: 350 }}
        >
          {/* Sign In */}
          <TouchableOpacity
            onPress={handleSignIn}
            activeOpacity={0.85}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <LogIn size={20} color="#1B4FD8" />
            <Text style={{ fontSize: 17, fontWeight: "700", color: "#1B4FD8" }}>
              Sign In
            </Text>
          </TouchableOpacity>

          {/* Create Account */}
          <TouchableOpacity
            onPress={handleSignIn}
            activeOpacity={0.85}
            style={{
              backgroundColor: "rgba(255,255,255,0.18)",
              borderRadius: 16,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginBottom: 16,
              borderWidth: 1.5,
              borderColor: "rgba(255,255,255,0.35)",
            }}
          >
            <UserPlus size={20} color="#FFFFFF" />
            <Text style={{ fontSize: 17, fontWeight: "700", color: "#FFFFFF" }}>
              Create Account
            </Text>
          </TouchableOpacity>

          {/* Continue as Guest */}
          <TouchableOpacity
            onPress={handleContinueAsGuest}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              paddingVertical: 12,
            }}
          >
            <Text style={{ fontSize: 15, color: "rgba(255,255,255,0.6)" }}>
              Continue without login
            </Text>
            <ArrowRight size={15} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>

          <Text
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "rgba(255,255,255,0.35)",
              marginTop: 8,
              lineHeight: 18,
            }}
          >
            Guest mode: data saved locally on this device only
          </Text>
        </MotiView>
      </View>
    </LinearGradient>
  );
}
