import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Target,
  RefreshCw,
  Tag,
  Bot,
  Globe,
  Archive,
} from "lucide-react-native";
import { AddBudgetModal } from "@/components/Settings/AddBudgetModal";
import { AddRecurringModal } from "@/components/Settings/AddRecurringModal";
import { SectionTabs } from "@/components/Settings/SectionTabs";
import { BudgetsSection } from "@/components/Settings/BudgetsSection";
import { RecurringSection } from "@/components/Settings/RecurringSection";
import { CategoriesSection } from "@/components/Settings/CategoriesSection";
import { ModelSection } from "@/components/Settings/ModelSection";
import { CurrencySection } from "@/components/Settings/CurrencySection";
import { BackupSection } from "@/components/Settings/BackupSection";
import {
  useCategories,
  useBudgets,
  useRecurring,
} from "@/utils/settings/useSettingsData";
import { useSettingsMutations } from "@/utils/settings/useSettingsMutations";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [activeSection, setActiveSection] = useState("budgets");

  const { data: categories = [] } = useCategories();
  const { data: budgets = [] } = useBudgets();
  const { data: recurring = [] } = useRecurring();
  const {
    deleteBudgetMutation,
    deleteRecurringMutation,
    toggleRecurringMutation,
    processRecurringMutation,
    addCategoryMutation,
    deleteCategoryMutation,
  } = useSettingsMutations();

  const sections = [
    { id: "budgets", label: "Budgets", icon: Target },
    { id: "recurring", label: "Recurring", icon: RefreshCw },
    { id: "categories", label: "Categories", icon: Tag },
    { id: "ai", label: "AI", icon: Bot },
    { id: "currency", label: "Currency", icon: Globe },
    { id: "backup", label: "Backup", icon: Archive },
  ];

  const expenseCategories = categories.filter(
    (c) => c.category_type === "expense",
  );
  const incomeCategories = categories.filter(
    (c) => c.category_type === "income",
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F2F7" }}>
      <StatusBar style="dark" />
      <AddBudgetModal
        visible={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        categories={categories}
      />
      <AddRecurringModal
        visible={showRecurringModal}
        onClose={() => setShowRecurringModal(false)}
        categories={categories}
      />

      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          backgroundColor: "#F2F2F7",
        }}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: "800",
            color: "#1C1C1E",
            letterSpacing: -0.5,
            marginBottom: 16,
          }}
        >
          Settings
        </Text>
        <SectionTabs
          sections={sections}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {activeSection === "budgets" && (
          <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 350 }}
          >
            <BudgetsSection
              budgets={budgets}
              onAddBudget={() => setShowBudgetModal(true)}
              onDeleteBudget={(id) => deleteBudgetMutation.mutate(id)}
            />
          </MotiView>
        )}
        {activeSection === "recurring" && (
          <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 350 }}
          >
            <RecurringSection
              recurring={recurring}
              onAddRecurring={() => setShowRecurringModal(true)}
              onDeleteRecurring={(id) => deleteRecurringMutation.mutate(id)}
              onToggleRecurring={(data) => toggleRecurringMutation.mutate(data)}
              onProcessRecurring={() => processRecurringMutation.mutate()}
              isProcessing={processRecurringMutation.isLoading}
            />
          </MotiView>
        )}
        {activeSection === "categories" && (
          <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 350 }}
          >
            <CategoriesSection
              expenseCategories={expenseCategories}
              incomeCategories={incomeCategories}
              onAddCategory={(cat) => addCategoryMutation.mutate(cat)}
              onDeleteCategory={(id) => deleteCategoryMutation.mutate(id)}
            />
          </MotiView>
        )}
        {activeSection === "ai" && (
          <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 350 }}
          >
            <ModelSection />
          </MotiView>
        )}
        {activeSection === "currency" && (
          <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 350 }}
          >
            <CurrencySection />
          </MotiView>
        )}
        {activeSection === "backup" && (
          <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 350 }}
          >
            <BackupSection />
          </MotiView>
        )}
      </ScrollView>
    </View>
  );
}
