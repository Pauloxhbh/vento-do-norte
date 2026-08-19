import React from "react";
import {
  PieChart,
  Target,
  TrendingUp,
  CreditCard,
  Users,
  Sparkles,
} from "lucide-react";
import { AppTab } from "../types";

interface NavigationTabsProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  debtsCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onSelectTab,
  debtsCount,
}) => {
  const tabs = [
    {
      id: "diagnosis" as AppTab,
      label: "Diagnóstico & Renda",
      icon: PieChart,
      description: "Fluxo de caixa e regra 50/30/20",
    },
    {
      id: "roadmap" as AppTab,
      label: "Trilha Monetária",
      icon: Target,
      description: "Previsão de tempo para atingir R$ X",
    },
    {
      id: "investments" as AppTab,
      label: "Corretor & Investimentos",
      icon: TrendingUp,
      description: "CDB, CDI, Tesouro, Ações e Cripto",
    },
    {
      id: "debts" as AppTab,
      label: "Quitação de Dívidas",
      icon: CreditCard,
      description: "Ordem por juros e cartões",
      badge: debtsCount > 0 ? `${debtsCount}` : undefined,
    },
    {
      id: "billsplit" as AppTab,
      label: "Dividir Conta",
      icon: Users,
      description: "Racha-conta com compensação",
    },
    {
      id: "advisor" as AppTab,
      label: "Corretor IA",
      icon: Sparkles,
      description: "Consultoria inteligente Gemini",
      highlight: true,
    },
  ];

  return (
    <div className="bg-[#121212] border border-white/5 rounded-2xl p-1.5 shadow-sm">
      <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "bg-white/10 text-white border border-white/10 shadow-sm font-semibold"
                  : tab.highlight
                  ? "text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/20"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive
                    ? "text-blue-400"
                    : tab.highlight
                    ? "text-purple-400"
                    : "text-gray-500"
                }`}
              />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                  {tab.badge}
                </span>
              )}
              {tab.highlight && !isActive && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  IA
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
