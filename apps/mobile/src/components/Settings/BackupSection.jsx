import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
  Platform,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Download, Upload, Database, ShieldCheck } from "lucide-react-native";

export function BackupSection() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/data-export");
      if (!response.ok) throw new Error("Export failed");
      const json = await response.text();

      const filename = `business-backup-${new Date().toISOString().split("T")[0]}.json`;
      const fileUri = FileSystem.cacheDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, json, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (Platform.OS === "ios") {
        await Share.share({ url: fileUri, title: filename });
      } else {
        await Share.share({ message: json, title: filename });
      }
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert(
        "Export Failed",
        "Could not export your data. Please try again.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      Alert.alert(
        "Import Backup",
        "This will ADD all data from the backup file to your current data. Existing data will NOT be deleted.\n\nContinue?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Import",
            onPress: async () => {
              setIsImporting(true);
              try {
                const content = await FileSystem.readAsStringAsync(file.uri, {
                  encoding: FileSystem.EncodingType.UTF8,
                });
                const backup = JSON.parse(content);

                const response = await fetch("/api/data-import", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(backup),
                });
                if (!response.ok) throw new Error("Import failed");
                const data = await response.json();

                Alert.alert(
                  "✓ Import Successful",
                  `Imported:\n• ${data.imported.transactions} transactions\n• ${data.imported.categories} new categories\n• ${data.imported.budgets} budgets\n• ${data.imported.recurring} recurring rules`,
                );
              } catch (err) {
                console.error("Import error:", err);
                Alert.alert(
                  "Import Failed",
                  "Could not read the backup file. Make sure it's a valid backup.",
                );
              } finally {
                setIsImporting(false);
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error("Picker error:", error);
      Alert.alert("Error", "Could not open file picker.");
    }
  };

  const cardStyle = {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  };

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
        Data Backup
      </Text>

      {/* Info card */}
      <View
        style={{
          ...cardStyle,
          backgroundColor: "#EFF6FF",
          borderWidth: 1,
          borderColor: "#BFDBFE",
          marginBottom: 20,
          flexDirection: "row",
          gap: 12,
        }}
      >
        <ShieldCheck size={22} color="#2563EB" style={{ marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: "#1D4ED8",
              marginBottom: 4,
            }}
          >
            Your data is in the cloud
          </Text>
          <Text style={{ fontSize: 13, color: "#3B82F6", lineHeight: 18 }}>
            All transactions are saved online. Use backup to transfer data
            between devices or keep an offline copy.
          </Text>
        </View>
      </View>

      {/* Export */}
      <View style={cardStyle}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 10,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: "#DCFCE7",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Download size={20} color="#059669" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#1C1C1E" }}>
              Export Backup
            </Text>
            <Text style={{ fontSize: 13, color: "#8E8E93", marginTop: 2 }}>
              Save all transactions, categories & settings as a JSON file
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleExport}
          disabled={isExporting}
          activeOpacity={0.8}
          style={{
            backgroundColor: isExporting ? "#E5E7EB" : "#059669",
            borderRadius: 10,
            paddingVertical: 13,
            alignItems: "center",
          }}
        >
          {isExporting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 15 }}>
              Export Now
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Import */}
      <View style={cardStyle}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 10,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: "#FEF3C7",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Upload size={20} color="#D97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#1C1C1E" }}>
              Import Backup
            </Text>
            <Text style={{ fontSize: 13, color: "#8E8E93", marginTop: 2 }}>
              Restore from a backup file. Existing data will not be deleted.
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleImport}
          disabled={isImporting}
          activeOpacity={0.8}
          style={{
            backgroundColor: isImporting ? "#E5E7EB" : "#D97706",
            borderRadius: 10,
            paddingVertical: 13,
            alignItems: "center",
          }}
        >
          {isImporting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 15 }}>
              Choose File to Import
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Database info */}
      <View
        style={{
          ...cardStyle,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Database size={20} color="#6366F1" />
        <Text
          style={{ flex: 1, fontSize: 13, color: "#8E8E93", lineHeight: 18 }}
        >
          Backup includes: all transactions, categories, budgets, and recurring
          rules.
        </Text>
      </View>
    </View>
  );
}
