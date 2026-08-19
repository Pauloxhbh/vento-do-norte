import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { NavigationTabs } from "./components/NavigationTabs";
import { IncomeExpenseSection } from "./components/IncomeExpenseSection";
import { MilestoneRoadmapSection } from "./components/MilestoneRoadmapSection";
import { InvestmentBrokerSection } from "./components/InvestmentBrokerSection";
import { DebtPayoffSection } from "./components/DebtPayoffSection";
import { BillSplitterSection } from "./components/BillSplitterSection";
import { AIBrokerSection } from "./components/AIBrokerSection";
import { initialUserData } from "./data/initialData";
import { AppTab, UserFinanceData } from "./types";
import { computeFinanceMetrics, formatBRL } from "./utils/financeCalculators";

const STORAGE_KEY = "finansmart_user_data_v2";

export default function App() {
  // Load persisted user data with defensive merging against corrupt or legacy local storage shapes
  const [financeData, setFinanceData] = useState<UserFinanceData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("finansmart_user_data_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          return {
            ...initialUserData,
            ...parsed,
            incomes: Array.isArray(parsed.incomes) ? parsed.incomes : initialUserData.incomes,
            expenses: Array.isArray(parsed.expenses) ? parsed.expenses : initialUserData.expenses,
            investments: Array.isArray(parsed.investments) ? parsed.investments : initialUserData.investments,
            debts: Array.isArray(parsed.debts)
              ? parsed.debts.map((d: any) => ({
                  ...d,
                  principalAmount: d.principalAmount || d.totalBalance || 0,
                  annualInterestRate: d.annualInterestRate || (d.monthlyInterestRate ? ((Math.pow(1 + d.monthlyInterestRate / 100, 12) - 1) * 100) : 15),
                  monthlyInterestRate: d.monthlyInterestRate || 1.2,
                  isPaid: !!d.isPaid,
                }))
              : initialUserData.debts,
            creditCards: Array.isArray(parsed.creditCards) ? parsed.creditCards : initialUserData.creditCards,
            splitSessions: Array.isArray(parsed.splitSessions) ? parsed.splitSessions : initialUserData.splitSessions,
            goal: parsed.goal ? { ...initialUserData.goal, ...parsed.goal } : initialUserData.goal,
          };
        }
      }
    } catch (e) {
      console.error("Failed to parse localStorage data, restoring default data", e);
    }
    return initialUserData;
  });

  const [activeTab, setActiveTab] = useState<AppTab>("diagnosis");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem("finansmart_theme");
      if (savedTheme) return savedTheme === "dark";
    } catch {
      // fallback
    }
    return true; // Default to true for Elegant Dark theme
  });

  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>(
    undefined
  );

  // Sync with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(financeData));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  }, [financeData]);

  // Dark Mode class toggle
  useEffect(() => {
    try {
      localStorage.setItem("finansmart_theme", isDarkMode ? "dark" : "light");
    } catch {}
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleUpdateFinanceData = (newData: UserFinanceData) => {
    setFinanceData(newData);
  };

  const handleOpenAIChatWithTopic = (topicPrompt: string) => {
    setAiInitialPrompt(topicPrompt);
    setActiveTab("advisor");
  };

  const metrics = computeFinanceMetrics(financeData);
  const pendingDebtsCount = (financeData.debts || []).filter((d) => !d.isPaid).length;

  return (
    <div
      id="app-root"
      className="min-h-screen bg-[#0a0a0a] text-gray-200 transition-colors duration-200 selection:bg-blue-600 selection:text-white flex flex-col justify-between"
    >
      <div>
        {/* Global Header & Top KPI Metrics */}
        <Header
          financeData={financeData}
          onUpdateData={handleUpdateFinanceData}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onOpenAIConsult={() => {
            setAiInitialPrompt(
              "Olá Corretor! Gostaria de uma consultoria geral sobre minhas finanças e dicas para acelerar meu patrimônio."
            );
            setActiveTab("advisor");
          }}
        />

        {/* Main Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Navigation Tabs */}
          <NavigationTabs
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setAiInitialPrompt(undefined);
              setActiveTab(tab);
            }}
            debtsCount={pendingDebtsCount}
          />

          {/* Tab Views */}
          <div className="transition-all duration-300">
            {activeTab === "diagnosis" && (
              <IncomeExpenseSection
                financeData={financeData}
                onUpdateData={handleUpdateFinanceData}
              />
            )}

            {activeTab === "roadmap" && (
              <MilestoneRoadmapSection
                financeData={financeData}
                onUpdateData={handleUpdateFinanceData}
              />
            )}

            {activeTab === "investments" && (
              <InvestmentBrokerSection
                financeData={financeData}
                onUpdateData={handleUpdateFinanceData}
                onOpenAIChatWithTopic={handleOpenAIChatWithTopic}
              />
            )}

            {activeTab === "debts" && (
              <DebtPayoffSection
                financeData={financeData}
                onUpdateData={handleUpdateFinanceData}
              />
            )}

            {activeTab === "billsplit" && (
              <BillSplitterSection
                financeData={financeData}
                onUpdateData={handleUpdateFinanceData}
              />
            )}

            {activeTab === "advisor" && (
              <AIBrokerSection
                financeData={financeData}
                onUpdateData={handleUpdateFinanceData}
                initialPrompt={aiInitialPrompt}
              />
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center text-xs text-gray-500 bg-[#0a0a0a] mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong className="text-gray-300">FinanSmart</strong> • Gestão Financeira Pessoal, Corretor de Investimentos & Rateio de Contas
          </span>
          <span>
            Patrimônio Líquido Monitorado:{" "}
            <strong className="text-blue-400 font-mono">
              {formatBRL(metrics.netWorth)}
            </strong>
          </span>
        </div>
      </footer>
    </div>
  );
}
