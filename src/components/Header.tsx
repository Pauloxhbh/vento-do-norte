import React, { useRef } from "react";
import {
  TrendingUp,
  Wallet,
  AlertTriangle,
  Target,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  Moon,
  Sun,
  DollarSign,
  Shield,
} from "lucide-react";
import { UserFinanceData } from "../types";
import { formatBRL, computeFinanceMetrics } from "../utils/financeCalculators";
import { initialFinanceData } from "../data/initialData";

interface HeaderProps {
  financeData: UserFinanceData;
  onUpdateData: (newData: UserFinanceData) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAIConsult: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  financeData,
  onUpdateData,
  isDarkMode,
  onToggleDarkMode,
  onOpenAIConsult,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const metrics = computeFinanceMetrics(financeData);
  const goalProgress =
    financeData.goal.targetAmount > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (metrics.totalInvestments / financeData.goal.targetAmount) * 100
          )
        )
      : 0;

  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(financeData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `finansmart-backup-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.incomes) && parsed.goal) {
          onUpdateData(parsed);
        } else {
          alert("Arquivo JSON inválido para o formato do FinanSmart.");
        }
      } catch (err) {
        alert("Erro ao ler o arquivo JSON.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleResetDemo = () => {
    if (
      window.confirm(
        "Deseja restaurar todos os dados de demonstração padrão?"
      )
    ) {
      onUpdateData(initialFinanceData);
    }
  };

  return (
    <header
      id="main-app-header"
      className="bg-[#121212] border-b border-white/5 sticky top-0 z-40 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Top bar with Logo, Profile & Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-600/20 text-base">
                $
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-bold tracking-tight text-white">
                    Nexus<span className="text-blue-500">Finance</span>
                  </h1>
                  <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Pro Broker
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Gestão Financeira, Corretor de Investimentos & Rateio
                </p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center space-x-1.5 md:hidden">
              <button
                id="btn-open-ai-mobile"
                onClick={onOpenAIConsult}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold shadow hover:bg-blue-500 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Corretor IA</span>
              </button>
              <button
                onClick={onToggleDarkMode}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>

          {/* Desktop Actions & User Profile */}
          <div className="hidden md:flex items-center space-x-2.5">
            <button
              id="btn-ai-consultant"
              onClick={onOpenAIConsult}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>Consultar Corretor IA</span>
            </button>

            <button
              id="btn-reset-demo-data"
              onClick={handleResetDemo}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
              title="Restaurar dados de demonstração"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
              <span>Restaurar</span>
            </button>

            <button
              id="btn-export-backup"
              onClick={handleExportJSON}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
              title="Exportar backup em JSON"
            >
              <Download className="w-3.5 h-3.5 text-gray-400" />
              <span>Backup</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportJSON}
              accept=".json"
              className="hidden"
            />
            <button
              id="btn-import-backup"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
              title="Importar dados de JSON"
            >
              <Upload className="w-3.5 h-3.5 text-gray-400" />
              <span>Importar</span>
            </button>

            <button
              id="btn-toggle-dark-desktop"
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
              title={isDarkMode ? "Tema Claro" : "Tema Escuro"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-400" />}
            </button>

            {/* Profile Avatar Pill */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
              <div className="text-right">
                <p className="text-xs font-medium text-white leading-tight">Investidor</p>
                <p className="text-[10px] text-green-400 leading-tight">Perfil Estrategista</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                NF
              </div>
            </div>
          </div>
        </div>

        {/* Global Key Financial Metrics Bar (Elegant Dark Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3.5 pt-3.5 border-t border-white/5">
          {/* Total Invested */}
          <div className="bg-[#181818] rounded-xl p-3 border border-white/5">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1">
                <Wallet className="w-3 h-3 text-blue-400" />
                Patrimônio Total
              </span>
              <span className="text-[10px] text-blue-400 font-medium">
                {financeData.investments.length} ativos
              </span>
            </div>
            <p className="text-base sm:text-lg font-bold text-white mt-1">
              {formatBRL(metrics.totalInvestments)}
            </p>
          </div>

          {/* Monthly Savings Margin */}
          <div className="bg-[#181818] rounded-xl p-3 border border-white/5">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-green-400" />
                Sobra Líquida / Mês
              </span>
              <span
                className={`text-[10px] font-semibold ${
                  metrics.netSavingsMargin >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {metrics.savingsRate.toFixed(1)}%
              </span>
            </div>
            <p
              className={`text-base sm:text-lg font-bold mt-1 ${
                metrics.netSavingsMargin >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {formatBRL(metrics.netSavingsMargin)}
            </p>
          </div>

          {/* Total Debts */}
          <div className="bg-[#181818] rounded-xl p-3 border border-white/5">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1">
                <AlertTriangle
                  className={`w-3 h-3 ${
                    metrics.totalDebts > 0 ? "text-red-400" : "text-gray-500"
                  }`}
                />
                Dívidas Ativas
              </span>
              <span className="text-[10px] text-red-400 font-medium">
                {financeData.debts.length} contas
              </span>
            </div>
            <p
              className={`text-base sm:text-lg font-bold mt-1 ${
                metrics.totalDebts > 0 ? "text-red-400" : "text-gray-300"
              }`}
            >
              {formatBRL(metrics.totalDebts)}
            </p>
          </div>

          {/* Goal Progress */}
          <div className="bg-[#181818] rounded-xl p-3 border border-white/5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1">
                <Target className="w-3 h-3 text-blue-400" />
                Meta ({financeData.goal.targetAmount >= 1000000 ? `R$ ${(financeData.goal.targetAmount / 1000000).toFixed(0)}M` : `R$ ${(financeData.goal.targetAmount / 1000).toFixed(0)}k`})
              </span>
              <span className="text-xs font-bold text-blue-400">
                {goalProgress.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
