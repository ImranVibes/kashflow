import { useState, useEffect } from "react";
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
import * as Sharing from "expo-sharing";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Download, 
  Upload, 
  Database, 
  ShieldCheck, 
  Cloud, 
  RefreshCw, 
  Link, 
  LogOut 
} from "lucide-react-native";
import { googleDriveBackup } from "@/utils/googleDriveBackup";
import { offlineDb } from "@/utils/offlineDb";

export function BackupSection() {
  const queryClient = useQueryClient();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // Google Drive state
  const [isLinking, setIsLinking] = useState(false);
  const [isGoogleBackingUp, setIsGoogleBackingUp] = useState(false);
  const [isGoogleRestoring, setIsGoogleRestoring] = useState(false);
  const [googleProfile, setGoogleProfile] = useState(null);

  useEffect(() => {
    // Check if user is already linked with Google Drive on mount
    googleDriveBackup.getLinkedProfile().then((profile) => {
      if (profile) setGoogleProfile(profile);
    });
  }, []);

  // --- Local JSON Backups ---
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const backupData = await offlineDb.exportBackup();
      const json = JSON.stringify(backupData);

      const filename = `kashflow-backup-${new Date().toISOString().split("T")[0]}.json`;
      const fileUri = FileSystem.cacheDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, json, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: "Export KashFlow Backup",
          UTI: "public.json",
        });
      } else {
        await Share.share({ message: json, title: filename });
      }
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert(
        "Export Failed",
        "Could not export your data. Please try again."
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
        "This will OVERWRITE your current transactions and category budgets with the backup file.\n\nContinue?",
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
                const data = await offlineDb.importBackup(backup);

                // Invalidate all queries to refresh the screen data
                queryClient.invalidateQueries();

                Alert.alert(
                  "✓ Import Successful",
                  `Imported:\n• ${data.imported.transactions} transactions\n• ${data.imported.categories} categories\n• ${data.imported.budgets} budgets\n• ${data.imported.recurring} recurring rules`
                );
              } catch (err) {
                console.error("Import error:", err);
                Alert.alert(
                  "Import Failed",
                  "Could not read the backup file. Make sure it's a valid backup."
                );
              } finally {
                setIsImporting(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Picker error:", error);
      Alert.alert("Error", "Could not open file picker.");
    }
  };

  // --- Google Drive Backups ---
  const handleLinkGoogle = async () => {
    setIsLinking(true);
    try {
      const res = await googleDriveBackup.linkAccount();
      if (res.success && res.profile) {
        setGoogleProfile(res.profile);
        Alert.alert("✓ Account Linked", `Successfully linked to Google Drive as ${res.profile.name || res.profile.email}`);
      } else if (res.error) {
        Alert.alert("Link Failed", res.error);
      }
    } catch (err) {
      Alert.alert("Error", "An unexpected error occurred during link.");
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkGoogle = async () => {
    Alert.alert(
      "Unlink Google Account",
      "Are you sure you want to unlink your Google Drive account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unlink",
          style: "destructive",
          onPress: async () => {
            await googleDriveBackup.unlinkAccount();
            setGoogleProfile(null);
          },
        },
      ]
    );
  };

  const handleGoogleBackup = async () => {
    setIsGoogleBackingUp(true);
    try {
      const backupData = await offlineDb.exportBackup();
      await googleDriveBackup.exportBackupToDrive(backupData);
      
      Alert.alert(
        "✓ Backup Successful",
        "Your data is securely uploaded to your personal Google Drive app folder!"
      );
    } catch (err) {
      console.error("Google backup error:", err);
      Alert.alert("Backup Failed", err.message || "Failed to backup data to Google Drive.");
    } finally {
      setIsGoogleBackingUp(false);
    }
  };

  const handleGoogleRestore = async () => {
    Alert.alert(
      "Restore from Google Drive",
      "This will replace all your current data on this device with your Google Drive backup. Are you sure you want to continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          onPress: async () => {
            setIsGoogleRestoring(true);
            try {
              const backup = await googleDriveBackup.importBackupFromDrive();
              const result = await offlineDb.importBackup(backup);
              
              // Invalidate queries to refresh tabs UI
              queryClient.invalidateQueries();

              Alert.alert(
                "✓ Restore Successful",
                `Restored from Google Drive:\n• ${result.imported.transactions} transactions\n• ${result.imported.categories} categories\n• ${result.imported.budgets} budgets\n• ${result.imported.recurring} recurring rules`
              );
            } catch (err) {
              console.error("Google restore error:", err);
              Alert.alert("Restore Failed", err.message || "Failed to download or restore backup from Google Drive.");
            } finally {
              setIsGoogleRestoring(false);
            }
          },
        },
      ]
    );
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
        Data Backup & Sync
      </Text>

      {/* Info card */}
      <View
        style={{
          ...cardStyle,
          backgroundColor: "#EFF6FF",
          borderWidth: 1,
          borderColor: "#BFDBFE",
          marginBottom: 16,
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
            100% Offline & Private
          </Text>
          <Text style={{ fontSize: 13, color: "#3B82F6", lineHeight: 18 }}>
            All your transaction history, budgets, and categories are saved locally on this phone. Use Google Drive or JSON files to securely back them up.
          </Text>
        </View>
      </View>

      {/* Google Drive Card */}
      <View style={cardStyle}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: "#E0F2FE",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Cloud size={20} color="#0284C7" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#1C1C1E" }}>
              Google Drive Cloud Sync
            </Text>
            {googleProfile ? (
              <Text style={{ fontSize: 13, color: "#10B981", fontWeight: "600", marginTop: 2 }}>
                ✓ Linked as {googleProfile.name || googleProfile.email}
              </Text>
            ) : (
              <Text style={{ fontSize: 13, color: "#8E8E93", marginTop: 2 }}>
                Keep your backup automatically inside your Google Drive
              </Text>
            )}
          </View>
        </View>

        {!googleProfile ? (
          <TouchableOpacity
            onPress={handleLinkGoogle}
            disabled={isLinking}
            activeOpacity={0.8}
            style={{
              backgroundColor: "#0284C7",
              borderRadius: 10,
              paddingVertical: 13,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {isLinking ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Link size={16} color="#FFFFFF" />
                <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 15 }}>
                  Link Google Account
                </Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {/* Export to Google Drive */}
              <TouchableOpacity
                onPress={handleGoogleBackup}
                disabled={isGoogleBackingUp || isGoogleRestoring}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  backgroundColor: "#0284C7",
                  borderRadius: 10,
                  paddingVertical: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {isGoogleBackingUp ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <RefreshCw size={15} color="#FFFFFF" />
                    <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 14 }}>
                      Backup Now
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Restore from Google Drive */}
              <TouchableOpacity
                onPress={handleGoogleRestore}
                disabled={isGoogleBackingUp || isGoogleRestoring}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  backgroundColor: "#F0F9FF",
                  borderRadius: 10,
                  paddingVertical: 12,
                  borderWidth: 1.5,
                  borderColor: "#B9E6FE",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {isGoogleRestoring ? (
                  <ActivityIndicator color="#0284C7" />
                ) : (
                  <>
                    <Download size={15} color="#0284C7" />
                    <Text style={{ color: "#0284C7", fontWeight: "600", fontSize: 14 }}>
                      Restore
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Unlink */}
            <TouchableOpacity
              onPress={handleUnlinkGoogle}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                paddingVertical: 8,
              }}
            >
              <LogOut size={14} color="#EF4444" />
              <Text style={{ fontSize: 13, color: "#EF4444", fontWeight: "500" }}>
                Unlink Account
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Local Export File */}
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
              Export JSON File
            </Text>
            <Text style={{ fontSize: 13, color: "#8E8E93", marginTop: 2 }}>
              Save transactions, categories & settings as a local file
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
              Export to File
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Local Import File */}
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
              Import JSON File
            </Text>
            <Text style={{ fontSize: 13, color: "#8E8E93", marginTop: 2 }}>
              Import & restore transactions from an existing JSON backup file
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
              Select File to Import
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
          Backup includes: all transactions, categories, budgets, and recurring rules.
        </Text>
      </View>
    </View>
  );
}
export default BackupSection;
