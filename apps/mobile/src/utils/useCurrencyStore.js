import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { offlineDb } from "./offlineDb";

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", flag: "🇧🇩" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee", flag: "🇵🇰" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal", flag: "🇸🇦" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", flag: "🇲🇾" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "THB", symbol: "฿", name: "Thai Baht", flag: "🇹🇭" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", flag: "🇮🇩" },
  { code: "KRW", symbol: "₩", name: "South Korean Won", flag: "🇰🇷" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso", flag: "🇵🇭" },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong", flag: "🇻🇳" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", flag: "🇳🇬" },
  { code: "ZAR", symbol: "R", name: "South African Rand", flag: "🇿🇦" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", flag: "🇧🇷" },
  { code: "MXN", symbol: "Mex$", name: "Mexican Peso", flag: "🇲🇽" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", flag: "🇹🇷" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble", flag: "🇷🇺" },
  { code: "EGP", symbol: "E£", name: "Egyptian Pound", flag: "🇪🇬" },
  { code: "NPR", symbol: "रू", name: "Nepalese Rupee", flag: "🇳🇵" },
  { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee", flag: "🇱🇰" },
  { code: "MMK", symbol: "K", name: "Myanmar Kyat", flag: "🇲🇲" },
];

const STORAGE_KEY = "selected_currency_code";

export const useCurrencyStore = create((set, get) => ({
  currency: CURRENCIES.find((c) => c.code === "BDT") || CURRENCIES[0],
  isLoaded: false,
  isConverting: false,
  conversionError: null,

  loadCurrency: async () => {
    try {
      const code = await AsyncStorage.getItem(STORAGE_KEY);
      if (code) {
        const found = CURRENCIES.find((c) => c.code === code);
        if (found) {
          set({ currency: found });
        }
      } else {
        const bdt = CURRENCIES.find((c) => c.code === "BDT");
        if (bdt) {
          await AsyncStorage.setItem(STORAGE_KEY, "BDT");
          set({ currency: bdt });
        }
      }
    } catch (e) {
      console.error("Failed to load currency:", e);
    } finally {
      set({ isLoaded: true });
    }
  },

  setCurrency: async (code) => {
    const { currency: currentCurrency, isConverting } = get();
    if (isConverting) return; // prevent double-tap
    const found = CURRENCIES.find((c) => c.code === code);
    if (!found || found.code === currentCurrency.code) return;

    set({ isConverting: true, conversionError: null });

    try {
      // Local client-side conversion rate database mapping
      await offlineDb.convertCurrency(currentCurrency.code, code);

      // All local tables converted — now switch currency state
      set({ currency: found, isConverting: false });
      await AsyncStorage.setItem(STORAGE_KEY, code);
    } catch (e) {
      console.error("Currency conversion failed:", e);
      set({
        isConverting: false,
        conversionError: e.message || "Failed to convert currency offline.",
      });
    }
  },

  clearConversionError: () => set({ conversionError: null }),
}));
