import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  TRANSACTIONS: "kashflow_local_transactions",
  CATEGORIES: "kashflow_local_categories",
  BUDGETS: "kashflow_local_budgets",
  RECURRING: "kashflow_local_recurring",
};

const DEFAULT_CATEGORIES = [
  { id: 1, name: "Food & Dining", category_type: "expense", icon: "Utensils", color: "#EF4444" },
  { id: 2, name: "Shopping", category_type: "expense", icon: "ShoppingBag", color: "#3B82F6" },
  { id: 3, name: "Transportation", category_type: "expense", icon: "Car", color: "#10B981" },
  { id: 4, name: "Bills & Utilities", category_type: "expense", icon: "FileText", color: "#F59E0B" },
  { id: 5, name: "Entertainment", category_type: "expense", icon: "Film", color: "#8B5CF6" },
  { id: 6, name: "Housing & Rent", category_type: "expense", icon: "Home", color: "#EC4899" },
  { id: 7, name: "Salary", category_type: "income", icon: "Briefcase", color: "#10B981" },
  { id: 8, name: "Freelance", category_type: "income", icon: "Laptop", color: "#3B82F6" },
  { id: 9, name: "Investments", category_type: "income", icon: "TrendingUp", color: "#8B5CF6" },
];

export const offlineDb = {
  // --- Core Initialization & Seeding ---
  async initialize() {
    try {
      const cats = await AsyncStorage.getItem(KEYS.CATEGORIES);
      if (!cats) {
        await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      }
      
      const txs = await AsyncStorage.getItem(KEYS.TRANSACTIONS);
      if (!txs) {
        await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify([]));
      }

      const budgets = await AsyncStorage.getItem(KEYS.BUDGETS);
      if (!budgets) {
        await AsyncStorage.setItem(KEYS.BUDGETS, JSON.stringify([]));
      }

      const recurring = await AsyncStorage.getItem(KEYS.RECURRING);
      if (!recurring) {
        await AsyncStorage.setItem(KEYS.RECURRING, JSON.stringify([]));
      }
    } catch (e) {
      console.error("[offlineDb] Initialization failed:", e);
    }
  },

  // --- Transactions ---
  async getTransactions() {
    const raw = await AsyncStorage.getItem(KEYS.TRANSACTIONS);
    const list = raw ? JSON.parse(raw) : [];
    const categories = await this.getCategories();
    const catMap = {};
    categories.forEach((c) => {
      catMap[c.id.toString()] = c;
    });
    return list.map((t) => {
      const cat = t.category_id ? catMap[t.category_id.toString()] : null;
      return {
        ...t,
        category_name: cat ? cat.name : (t.category_name || "Uncategorized"),
        category_color: cat ? cat.color : (t.category_color || "#9CA3AF"),
        category_icon: cat ? cat.icon : (t.category_icon || "HelpCircle"),
      };
    });
  },

  async addTransaction(tx) {
    const list = await this.getTransactions();
    const newTx = {
      id: Math.floor(Math.random() * 10000000) + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...tx,
    };
    list.unshift(newTx);
    await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(list));
    return newTx;
  },

  async deleteTransaction(id) {
    const list = await this.getTransactions();
    const filtered = list.filter((t) => t.id !== id && t.id.toString() !== id.toString());
    await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(filtered));
    return { success: true };
  },

  // --- Categories ---
  async getCategories() {
    const raw = await AsyncStorage.getItem(KEYS.CATEGORIES);
    return raw ? JSON.parse(raw) : DEFAULT_CATEGORIES;
  },

  async addCategory(cat) {
    const list = await this.getCategories();
    const newCat = {
      id: Math.floor(Math.random() * 10000000) + 1,
      ...cat,
    };
    list.push(newCat);
    await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(list));
    return newCat;
  },

  async deleteCategory(id) {
    const list = await this.getCategories();
    const filtered = list.filter((c) => c.id !== id && c.id.toString() !== id.toString());
    await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(filtered));
    return { success: true };
  },

  // --- Budgets ---
  async getBudgets() {
    const raw = await AsyncStorage.getItem(KEYS.BUDGETS);
    return raw ? JSON.parse(raw) : [];
  },

  async addOrUpdateBudget(budget) {
    const list = await this.getBudgets();
    const existingIndex = list.findIndex(
      (b) => b.category_id.toString() === budget.category_id.toString() && b.period === (budget.period || "month")
    );

    const now = new Date().toISOString();
    if (existingIndex > -1) {
      list[existingIndex] = {
        ...list[existingIndex],
        amount: parseFloat(budget.amount),
        updated_at: now,
      };
      await AsyncStorage.setItem(KEYS.BUDGETS, JSON.stringify(list));
      return list[existingIndex];
    } else {
      const newBudget = {
        id: Math.floor(Math.random() * 10000000) + 1,
        created_at: now,
        updated_at: now,
        period: "month",
        ...budget,
        amount: parseFloat(budget.amount),
      };
      list.push(newBudget);
      await AsyncStorage.setItem(KEYS.BUDGETS, JSON.stringify(list));
      return newBudget;
    }
  },

  async deleteBudget(id) {
    const list = await this.getBudgets();
    const filtered = list.filter((b) => b.id !== id && b.id.toString() !== id.toString());
    await AsyncStorage.setItem(KEYS.BUDGETS, JSON.stringify(filtered));
    return { success: true };
  },

  // --- Recurring Rules ---
  async getRecurring() {
    const raw = await AsyncStorage.getItem(KEYS.RECURRING);
    return raw ? JSON.parse(raw) : [];
  },

  async addRecurring(rule) {
    const list = await this.getRecurring();
    const newRule = {
      id: Math.floor(Math.random() * 10000000) + 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...rule,
    };
    list.push(newRule);
    await AsyncStorage.setItem(KEYS.RECURRING, JSON.stringify(list));
    return newRule;
  },

  async deleteRecurring(id) {
    const list = await this.getRecurring();
    const filtered = list.filter((r) => r.id !== id && r.id.toString() !== id.toString());
    await AsyncStorage.setItem(KEYS.RECURRING, JSON.stringify(filtered));
    return { success: true };
  },

  async toggleRecurring(id, isActive) {
    const list = await this.getRecurring();
    const updated = list.map((r) => {
      if (r.id === id || r.id.toString() === id.toString()) {
        return { ...r, is_active: isActive, updated_at: new Date().toISOString() };
      }
      return r;
    });
    await AsyncStorage.setItem(KEYS.RECURRING, JSON.stringify(updated));
    return { success: true };
  },

  // --- Analytics ---
  async getAnalytics(period = "month") {
    const transactions = await this.getTransactions();
    const categories = await this.getCategories();
    
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const currentYearMonth = todayStr.substring(0, 7); // YYYY-MM
    const currentYear = todayStr.substring(0, 4);      // YYYY
    
    const filtered = transactions.filter((t) => {
      if (!t.transaction_date) return false;
      
      if (period === "week") {
        const diffTime = Math.abs(now - new Date(t.transaction_date));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      } else if (period === "month") {
        return t.transaction_date.substring(0, 7) === currentYearMonth;
      } else if (period === "year") {
        return t.transaction_date.substring(0, 4) === currentYear;
      }
      return true;
    });
    
    let totalIncome = 0;
    let totalExpenses = 0;
    
    filtered.forEach((t) => {
      const amt = parseFloat(t.amount) || 0;
      if (t.transaction_type === "income") {
        totalIncome += amt;
      } else {
        totalExpenses += amt;
      }
    });
    
    const netProfit = totalIncome - totalExpenses;
    
    const catMap = {};
    categories.forEach((c) => {
      catMap[c.id.toString()] = {
        id: c.id,
        name: c.name,
        category_type: c.category_type,
        color: c.color,
        icon: c.icon,
        total_amount: 0,
        transaction_count: 0,
      };
    });
    
    filtered.forEach((t) => {
      const amt = parseFloat(t.amount) || 0;
      const catId = t.category_id ? t.category_id.toString() : null;
      if (catId && catMap[catId]) {
        catMap[catId].total_amount += amt;
        catMap[catId].transaction_count += 1;
      } else {
        const uncatKey = t.transaction_type === "income" ? "uncat_income" : "uncat_expense";
        if (!catMap[uncatKey]) {
          catMap[uncatKey] = {
            id: uncatKey,
            name: "Uncategorized",
            category_type: t.transaction_type,
            color: "#9CA3AF",
            icon: "HelpCircle",
            total_amount: 0,
            transaction_count: 0,
          };
        }
        catMap[uncatKey].total_amount += amt;
        catMap[uncatKey].transaction_count += 1;
      }
    });
    
    const categoryBreakdown = Object.values(catMap)
      .filter((c) => c.transaction_count > 0)
      .map((c) => ({
        ...c,
        total_amount: c.total_amount.toString(),
        transaction_count: c.transaction_count.toString(),
      }));
      
    const recentTransactions = [...filtered]
      .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
      .slice(0, 10);
      
    return {
      summary: {
        totalIncome,
        totalExpenses,
        netProfit,
        totalTransactions: filtered.length,
      },
      recentTransactions,
      categoryBreakdown,
    };
  },

  // --- AI Model Config ---
  async getAiConfigs() {
    const rawConfigs = await AsyncStorage.getItem("kashflow_local_ai_configs");
    const configs = rawConfigs ? JSON.parse(rawConfigs) : [];
    
    const activeId = await AsyncStorage.getItem("kashflow_local_active_ai_config");
    const active = configs.find((c) => c.provider === activeId) || null;
    
    return { configs, active };
  },

  async saveAiConfig({ provider, model_id, api_key, set_active }) {
    const { configs } = await this.getAiConfigs();
    
    const masked = api_key.length > 8 
      ? api_key.substring(0, 6) + "..." + api_key.substring(api_key.length - 4)
      : "masked";
      
    const newConfig = {
      id: provider,
      provider,
      model_id,
      api_key,
      api_key_masked: masked,
      updated_at: new Date().toISOString(),
    };
    
    const existingIndex = configs.findIndex((c) => c.provider === provider);
    if (existingIndex > -1) {
      configs[existingIndex] = newConfig;
    } else {
      configs.push(newConfig);
    }
    
    await AsyncStorage.setItem("kashflow_local_ai_configs", JSON.stringify(configs));
    
    if (set_active) {
      await AsyncStorage.setItem("kashflow_local_active_ai_config", provider);
    }
    
    return newConfig;
  },

  async activateAiConfig(providerId) {
    await AsyncStorage.setItem("kashflow_local_active_ai_config", providerId);
    return { success: true };
  },

  async deleteAiConfig(providerId) {
    const { configs } = await this.getAiConfigs();
    const filtered = configs.filter((c) => c.provider !== providerId);
    await AsyncStorage.setItem("kashflow_local_ai_configs", JSON.stringify(filtered));
    
    const activeId = await AsyncStorage.getItem("kashflow_local_active_ai_config");
    if (activeId === providerId) {
      await AsyncStorage.removeItem("kashflow_local_active_ai_config");
    }
    return { success: true };
  },

  // --- Currency Conversion ---
  async convertCurrency(fromCode, toCode) {
    const RATES = {
      USD: 1.0,
      EUR: 0.92,
      GBP: 0.79,
      BDT: 117.0,
      INR: 83.5,
      PKR: 278.0,
      JPY: 156.0,
      CNY: 7.25,
      AUD: 1.50,
      CAD: 1.36,
      CHF: 0.91,
      SAR: 3.75,
      AED: 3.67,
      MYR: 4.70,
      SGD: 1.35,
      THB: 36.5,
      IDR: 16200.0,
      KRW: 1360.0,
      PHP: 58.0,
      VND: 25400.0,
      NGN: 1500.0,
      ZAR: 18.5,
      BRL: 5.15,
      MXN: 16.7,
      TRY: 32.2,
      RUB: 90.0,
      EGP: 47.0,
      NPR: 133.0,
      LKR: 300.0,
      MMK: 2100.0,
    };

    const fromRate = RATES[fromCode] || 1.0;
    const toRate = RATES[toCode] || 1.0;
    const rate = toRate / fromRate;

    // Convert transactions
    const rawTx = await AsyncStorage.getItem(KEYS.TRANSACTIONS);
    const transactions = rawTx ? JSON.parse(rawTx) : [];
    const convertedTx = transactions.map((t) => ({
      ...t,
      amount: parseFloat((parseFloat(t.amount) * rate).toFixed(2)),
    }));
    await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(convertedTx));

    // Convert budgets
    const rawBudgets = await AsyncStorage.getItem(KEYS.BUDGETS);
    const budgets = rawBudgets ? JSON.parse(rawBudgets) : [];
    const convertedBudgets = budgets.map((b) => ({
      ...b,
      amount: parseFloat((parseFloat(b.amount) * rate).toFixed(2)),
    }));
    await AsyncStorage.setItem(KEYS.BUDGETS, JSON.stringify(convertedBudgets));

    return { success: true };
  },

  // --- Complete Import & Export ---
  async exportBackup() {
    const transactions = await this.getTransactions();
    const categories = await this.getCategories();
    const budgets = await this.getBudgets();
    const recurring = await this.getRecurring();
    
    return {
      transactions,
      categories,
      budgets,
      recurring,
      exportedAt: new Date().toISOString(),
    };
  },

  async importBackup(backup) {
    if (!backup) throw new Error("Invalid backup payload");
    
    const transactions = backup.transactions || [];
    const categories = backup.categories || [];
    const budgets = backup.budgets || [];
    const recurring = backup.recurring || [];

    await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
    await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
    await AsyncStorage.setItem(KEYS.BUDGETS, JSON.stringify(budgets));
    await AsyncStorage.setItem(KEYS.RECURRING, JSON.stringify(recurring));

    return {
      imported: {
        transactions: transactions.length,
        categories: categories.length,
        budgets: budgets.length,
        recurring: recurring.length,
      }
    };
  }
};
