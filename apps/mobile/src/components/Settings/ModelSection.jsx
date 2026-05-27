import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Key,
  Zap,
  Trash2,
  X,
  Eye,
  EyeOff,
} from "lucide-react-native";
import { AI_PROVIDERS } from "../../data/aiModels";
import { offlineDb } from "../../utils/offlineDb";

const shadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 10,
  elevation: 3,
};
const glowShadow = (color) => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 12,
  elevation: 6,
});

// ── Model picker modal ────────────────────────────────────────────────────────
function ModelPickerModal({
  visible,
  provider,
  selectedModel,
  onSelect,
  onClose,
}) {
  if (!provider) return null;
  const freeModels = provider.models.filter((m) => m.badge === "Free");
  const paidModels = provider.models.filter((m) => m.badge !== "Free");

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "#F2F2F7" }}>
        <View
          style={{ alignItems: "center", paddingTop: 12, paddingBottom: 6 }}
        >
          <View
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: "#C7C7CC",
            }}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingBottom: 16,
          }}
        >
          <View>
            <Text style={{ fontSize: 20, fontWeight: "700", color: "#1C1C1E" }}>
              Select Model
            </Text>
            <Text style={{ fontSize: 13, color: "#8E8E93" }}>
              {provider.name}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: "#E5E5EA",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={16} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {freeModels.length > 0 && (
            <>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <View
                  style={{ flex: 1, height: 0.5, backgroundColor: "#D1D1D6" }}
                />
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: "#059669",
                    letterSpacing: 0.5,
                  }}
                >
                  FREE MODELS
                </Text>
                <View
                  style={{ flex: 1, height: 0.5, backgroundColor: "#D1D1D6" }}
                />
              </View>
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 18,
                  overflow: "hidden",
                  marginBottom: 16,
                  ...shadow,
                }}
              >
                {freeModels.map((model, i) => {
                  const isSelected = selectedModel === model.id;
                  return (
                    <TouchableOpacity
                      key={model.id}
                      onPress={() => {
                        onSelect(model.id);
                        onClose();
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 14,
                        borderBottomWidth: i < freeModels.length - 1 ? 0.5 : 0,
                        borderBottomColor: "#F2F2F7",
                        backgroundColor: isSelected ? "#F0FDF4" : "#FFFFFF",
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: isSelected ? "700" : "500",
                            color: isSelected ? "#059669" : "#1C1C1E",
                          }}
                        >
                          {model.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#8E8E93",
                            marginTop: 2,
                          }}
                        >
                          {model.id}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <View
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 8,
                            backgroundColor: "#D1FAE5",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: "700",
                              color: "#059669",
                            }}
                          >
                            Free
                          </Text>
                        </View>
                        {isSelected && <Check size={18} color="#059669" />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {paidModels.length > 0 && (
            <>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <View
                  style={{ flex: 1, height: 0.5, backgroundColor: "#D1D1D6" }}
                />
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: "#8E8E93",
                    letterSpacing: 0.5,
                  }}
                >
                  {provider.id === "openrouter"
                    ? "PAID / CHEAP MODELS"
                    : "MODELS"}
                </Text>
                <View
                  style={{ flex: 1, height: 0.5, backgroundColor: "#D1D1D6" }}
                />
              </View>
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 18,
                  overflow: "hidden",
                  marginBottom: 16,
                  ...shadow,
                }}
              >
                {paidModels.map((model, i) => {
                  const isSelected = selectedModel === model.id;
                  return (
                    <TouchableOpacity
                      key={model.id}
                      onPress={() => {
                        onSelect(model.id);
                        onClose();
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 14,
                        borderBottomWidth: i < paidModels.length - 1 ? 0.5 : 0,
                        borderBottomColor: "#F2F2F7",
                        backgroundColor: isSelected ? "#EFF6FF" : "#FFFFFF",
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: isSelected ? "700" : "500",
                            color: isSelected
                              ? model.badgeColor || "#007AFF"
                              : "#1C1C1E",
                          }}
                        >
                          {model.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#8E8E93",
                            marginTop: 2,
                          }}
                        >
                          {model.id}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        {model.badge && (
                          <View
                            style={{
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                              borderRadius: 8,
                              backgroundColor: model.badgeColor
                                ? `${model.badgeColor}20`
                                : "#F2F2F7",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 11,
                                fontWeight: "700",
                                color: model.badgeColor || "#8E8E93",
                              }}
                            >
                              {model.badge}
                            </Text>
                          </View>
                        )}
                        {isSelected && <Check size={18} color="#007AFF" />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ── Provider card ─────────────────────────────────────────────────────────────
function ProviderCard({
  provider,
  savedConfig,
  activeProviderId,
  onSave,
  onActivate,
  onDelete,
  isSaving,
}) {
  const isSaved = !!savedConfig;
  const isActive = activeProviderId === provider.id;
  const [expanded, setExpanded] = useState(isActive || false);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState(
    savedConfig?.model_id || provider.models[0]?.id,
  );
  const [showModelPicker, setShowModelPicker] = useState(false);

  const selectedModelObj = provider.models.find((m) => m.id === selectedModel);

  const handleSave = () => {
    if (!apiKey.trim()) {
      Alert.alert(
        "API Key Required",
        `Please enter your ${provider.name} API key`,
      );
      return;
    }
    onSave({
      provider: provider.id,
      model_id: selectedModel,
      api_key: apiKey.trim(),
      set_active: true,
    });
    setApiKey("");
  };

  return (
    <>
      <ModelPickerModal
        visible={showModelPicker}
        provider={provider}
        selectedModel={selectedModel}
        onSelect={setSelectedModel}
        onClose={() => setShowModelPicker(false)}
      />

      <MotiView
        from={{ opacity: 0, translateY: 6 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 350 }}
      >
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.85}
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 18,
            marginBottom: 12,
            overflow: "hidden",
            ...shadow,
            ...(isActive ? glowShadow(provider.color) : {}),
          }}
        >
          {/* Active indicator bar */}
          {isActive && (
            <LinearGradient
              colors={provider.gradient}
              style={{ height: 3 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          )}

          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {/* Provider icon */}
              <LinearGradient
                colors={isActive ? provider.gradient : ["#F2F2F7", "#E5E5EA"]}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <Text
                  style={{
                    fontSize: 22,
                    color: isActive ? "#FFFFFF" : "#8E8E93",
                  }}
                >
                  {provider.icon}
                </Text>
              </LinearGradient>

              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 3,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#1C1C1E",
                    }}
                  >
                    {provider.name}
                  </Text>
                  {isActive && (
                    <LinearGradient
                      colors={provider.gradient}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "800",
                          color: "#FFFFFF",
                          letterSpacing: 0.3,
                        }}
                      >
                        ACTIVE
                      </Text>
                    </LinearGradient>
                  )}
                  {isSaved && !isActive && (
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 8,
                        backgroundColor: "#F2F2F7",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "700",
                          color: "#8E8E93",
                        }}
                      >
                        SAVED
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  style={{ fontSize: 12, color: "#8E8E93" }}
                  numberOfLines={1}
                >
                  {isSaved
                    ? `${savedConfig.model_id} · ${savedConfig.api_key_masked}`
                    : provider.keyHint}
                </Text>
              </View>

              {expanded ? (
                <ChevronUp size={18} color="#C7C7CC" />
              ) : (
                <ChevronDown size={18} color="#C7C7CC" />
              )}
            </View>

            {/* Expanded section */}
            {expanded && (
              <View style={{ marginTop: 16 }}>
                <View
                  style={{
                    height: 0.5,
                    backgroundColor: "#F2F2F7",
                    marginBottom: 16,
                  }}
                />

                {/* Model selector */}
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: "#8E8E93",
                    letterSpacing: 0.3,
                    marginBottom: 8,
                  }}
                >
                  MODEL
                </Text>
                <TouchableOpacity
                  onPress={() => setShowModelPicker(true)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#F2F2F7",
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 14,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: "#1C1C1E",
                      }}
                    >
                      {selectedModelObj?.name || selectedModel}
                    </Text>
                    <Text
                      style={{ fontSize: 11, color: "#8E8E93", marginTop: 2 }}
                    >
                      {selectedModel}
                    </Text>
                  </View>
                  {selectedModelObj?.badge && (
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 8,
                        backgroundColor:
                          selectedModelObj.badge === "Free"
                            ? "#D1FAE5"
                            : "#F2F2F7",
                        marginRight: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color:
                            selectedModelObj.badge === "Free"
                              ? "#059669"
                              : "#8E8E93",
                        }}
                      >
                        {selectedModelObj.badge}
                      </Text>
                    </View>
                  )}
                  <ChevronDown size={16} color="#C7C7CC" />
                </TouchableOpacity>

                {/* API Key */}
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: "#8E8E93",
                    letterSpacing: 0.3,
                    marginBottom: 8,
                  }}
                >
                  {provider.keyLabel.toUpperCase()}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#F2F2F7",
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    marginBottom: 14,
                  }}
                >
                  <Key size={15} color="#8E8E93" style={{ marginRight: 8 }} />
                  <TextInput
                    value={apiKey}
                    onChangeText={setApiKey}
                    placeholder={
                      isSaved
                        ? `Update key (${savedConfig.api_key_masked})`
                        : provider.keyPlaceholder
                    }
                    placeholderTextColor="#C7C7CC"
                    secureTextEntry={!showKey}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{
                      flex: 1,
                      paddingVertical: 13,
                      fontSize: 14,
                      color: "#1C1C1E",
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowKey(!showKey)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {showKey ? (
                      <EyeOff size={17} color="#C7C7CC" />
                    ) : (
                      <Eye size={17} color="#C7C7CC" />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Action buttons */}
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    onPress={handleSave}
                    disabled={isSaving || !apiKey.trim()}
                    activeOpacity={0.85}
                    style={{ flex: 1 }}
                  >
                    <LinearGradient
                      colors={
                        apiKey.trim() && !isSaving
                          ? provider.gradient
                          : ["#E5E5EA", "#E5E5EA"]
                      }
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
                      {isSaving ? (
                        <ActivityIndicator color="#FFFFFF" size={16} />
                      ) : (
                        <>
                          <Zap
                            size={15}
                            color={apiKey.trim() ? "#FFFFFF" : "#C7C7CC"}
                          />
                          <Text
                            style={{
                              fontSize: 15,
                              fontWeight: "700",
                              color: apiKey.trim() ? "#FFFFFF" : "#C7C7CC",
                            }}
                          >
                            {isSaved ? "Update & Activate" : "Save & Activate"}
                          </Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {isSaved && !isActive && (
                    <TouchableOpacity
                      onPress={() => onActivate(savedConfig.id)}
                      activeOpacity={0.85}
                    >
                      <LinearGradient
                        colors={provider.gradient}
                        style={{
                          borderRadius: 12,
                          paddingVertical: 13,
                          paddingHorizontal: 16,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "700",
                            color: "#FFFFFF",
                          }}
                        >
                          Set Active
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}

                  {isSaved && (
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert(
                          "Remove",
                          `Remove ${provider.name} config?`,
                          [
                            { text: "Cancel", style: "cancel" },
                            {
                              text: "Remove",
                              style: "destructive",
                              onPress: () => onDelete(savedConfig.id),
                            },
                          ],
                        )
                      }
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 12,
                        backgroundColor: "#FEE2E2",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Trash2 size={17} color="#DC2626" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </MotiView>
    </>
  );
}

// ── Main ModelSection ─────────────────────────────────────────────────────────
export function ModelSection() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["ai-config"],
    queryFn: async () => {
      return offlineDb.getAiConfigs();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (body) => {
      return offlineDb.saveAiConfig(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-config"] });
      Alert.alert(
        "✓ Saved",
        "AI model is now active. Smart Input will use it.",
      );
    },
    onError: () =>
      Alert.alert("Error", "Failed to save. Check your key and try again."),
  });

  const activateMutation = useMutation({
    mutationFn: async (id) => {
      return offlineDb.activateAiConfig(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ai-config"] }),
    onError: () => Alert.alert("Error", "Failed to activate"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return offlineDb.deleteAiConfig(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ai-config"] }),
    onError: () => Alert.alert("Error", "Failed to remove"),
  });

  const configs = data?.configs || [];
  const active = data?.active;

  // Map saved configs by provider
  const configByProvider = configs.reduce((acc, c) => {
    acc[c.provider] = c;
    return acc;
  }, {});
  const activeProviderId = active?.provider || null;

  return (
    <View>
      {/* Header info card */}
      <LinearGradient
        colors={["#1C1C3A", "#0A2463"]}
        style={{ borderRadius: 18, padding: 16, marginBottom: 20, ...shadow }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
          }}
        >
          <Zap size={18} color="#60A5FA" />
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#FFFFFF" }}>
            AI Model Settings
          </Text>
        </View>
        <Text
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.6)",
            lineHeight: 18,
          }}
        >
          Use your own API key for unlimited usage. The active model powers the
          Smart Input AI parser. Without a custom key, the platform's free
          Gemini 2.5 Flash is used.
        </Text>
        {active && (
          <View
            style={{
              marginTop: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#4ADE80",
              }}
            />
            <Text style={{ fontSize: 12, color: "#4ADE80", fontWeight: "600" }}>
              Active: {AI_PROVIDERS.find((p) => p.id === active.provider)?.name}{" "}
              · {active.model_id}
            </Text>
          </View>
        )}
        {!active && (
          <View
            style={{
              marginTop: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#60A5FA",
              }}
            />
            <Text style={{ fontSize: 12, color: "#60A5FA", fontWeight: "600" }}>
              Using platform Gemini 2.5 Flash (free)
            </Text>
          </View>
        )}
      </LinearGradient>

      {isLoading ? (
        <View style={{ paddingVertical: 40, alignItems: "center" }}>
          <ActivityIndicator color="#007AFF" />
        </View>
      ) : (
        AI_PROVIDERS.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            savedConfig={configByProvider[provider.id] || null}
            activeProviderId={activeProviderId}
            onSave={(body) => saveMutation.mutate(body)}
            onActivate={(id) => activateMutation.mutate(id)}
            onDelete={(id) => deleteMutation.mutate(id)}
            isSaving={saveMutation.isLoading}
          />
        ))
      )}
    </View>
  );
}
