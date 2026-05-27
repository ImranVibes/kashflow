import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID = "381627134197-rc7b290traclk3qdd0vjiv1b298m5bpj.apps.googleusercontent.com";
const SCOPES = [
  "https://www.googleapis.com/auth/drive.appdata",
  "https://www.googleapis.com/auth/userinfo.profile"
].join(" ");

const ACCESS_TOKEN_KEY = "kashflow_google_access_token";
const USER_INFO_KEY = "kashflow_google_user_info";

export const googleDriveBackup = {
  // --- Link Account / OAuth ---
  async linkAccount() {
    try {
      // Define a clean callback redirect URL using your Expo app scheme
      const redirectUrl = Linking.createURL("oauth-callback");
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUrl)}` +
        `&response_type=token` +
        `&scope=${encodeURIComponent(SCOPES)}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

      if (result.type === "success" && result.url) {
        // Parse the URL hash to extract the access token
        const hash = result.url.split("#")[1];
        if (!hash) throw new Error("No token returned in redirect URL");
        
        const params = {};
        hash.split("&").forEach((part) => {
          const [k, v] = part.split("=");
          params[k] = decodeURIComponent(v);
        });

        if (params.access_token) {
          await AsyncStorage.setItem(ACCESS_TOKEN_KEY, params.access_token);
          // Fetch user profile info to show their name/email in settings
          const profile = await this.fetchUserProfile(params.access_token);
          if (profile) {
            await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(profile));
          }
          return { success: true, profile };
        }
      }
      return { success: false, error: "Authentication cancelled or failed" };
    } catch (e) {
      console.error("[googleDrive] OAuth failed:", e);
      return { success: false, error: e.message };
    }
  },

  async unlinkAccount() {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_INFO_KEY);
    return { success: true };
  },

  async getLinkedProfile() {
    const raw = await AsyncStorage.getItem(USER_INFO_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  async getAccessToken() {
    return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  },

  async fetchUserProfile(token) {
    try {
      const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) return res.json();
    } catch (e) {
      console.warn("[googleDrive] Fetch profile failed:", e);
    }
    return null;
  },

  // --- Export (Upload Backup) ---
  async exportBackupToDrive(jsonData) {
    const token = await this.getAccessToken();
    if (!token) throw new Error("Google account is not linked");

    // 1. Search if a backup file already exists in the appDataFolder
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='kashflow_backup.json'+and+parents+in+'appDataFolder'&spaces=appDataFolder&fields=files(id)`;
    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!searchRes.ok) throw new Error("Search backup file failed");
    
    const searchData = await searchRes.json();
    const existingFile = searchData.files?.[0];

    // 2. Perform multipart upload
    const boundary = "kashflow_multipart_boundary";
    const metadata = {
      name: "kashflow_backup.json",
      parents: existingFile ? undefined : ["appDataFolder"],
    };

    const body = 
      `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      `${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: application/json\r\n\r\n` +
      `${typeof jsonData === "string" ? jsonData : JSON.stringify(jsonData)}\r\n` +
      `--${boundary}--`;

    const uploadUrl = existingFile 
      ? `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`
      : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;

    const res = await fetch(uploadUrl, {
      method: existingFile ? "PATCH" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[googleDrive] Upload failed:", errorText);
      throw new Error("Failed to upload backup file to Google Drive");
    }

    return res.json();
  },

  // --- Import (Download Backup) ---
  async importBackupFromDrive() {
    const token = await this.getAccessToken();
    if (!token) throw new Error("Google account is not linked");

    // 1. Search for the backup file in appDataFolder
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='kashflow_backup.json'+and+parents+in+'appDataFolder'&spaces=appDataFolder&fields=files(id)`;
    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!searchRes.ok) throw new Error("Search backup file failed");
    
    const searchData = await searchRes.json();
    const existingFile = searchData.files?.[0];

    if (!existingFile) {
      throw new Error("No backup file found in Google Drive");
    }

    // 2. Download the file content
    const downloadUrl = `https://www.googleapis.com/drive/v3/files/${existingFile.id}?alt=media`;
    const res = await fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error("Failed to download backup file from Google Drive");
    }

    return res.json();
  }
};
