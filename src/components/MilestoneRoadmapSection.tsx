import React, { useState } from "react";
import {
  Target,
  Sparkles,
  Calendar,
  Zap,
  TrendingUp,
  Award,
  Clock,
  Coins,
  ChevronRight,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import confetti from "canvas-confetti";
import { FinancialGoal, UserFinanceData } from "../types";
import {
  formatBRL,
  formatPercent,
  formatMonthsToTime,
  projectFinancialRoadmap,
  computeFinanceMetrics,
} from "../utils/financeCalculators";

interface MilestoneRoadmapSectionProps {
  financeData: UserFinanceData;
  onUpdateData: (newData: UserFinanceData) => void;
}

export const MilestoneRoadmapSection: React.FC<MilestoneRoadmapSectionProps> = ({
  financeData,
  onUpdateData,
}) => {
  const metrics = computeFinanceMetrics(financeData);
  const goal = financeData.goal;

  // Simulator dynamic controls
  const [targetAmount, setTargetAmount] = useState(goal.targetAmount || 500000);
  const [initialAmount, setInitialAmount] = useState(
    metrics.totalInvestments > 0 ? metrics.totalInvestments : goal.initialAmount || 50000
  );
  const [monthlyContribution, setMonthlyContribution] = useState(
    metrics.netSavingsMargin > 0
      ? Math.round(metrics.netSavingsMargin)
      : goal.monthlyContribution || 1500
  );
  const [annualReturn, setAnnualReturn] = useState(goal.annualInterestRate || 12.5);

  // Extra accelerator amount for "What if?" scenario
  const [extraContribution, setExtraContribution] = useState(300);

  // Calculate Base Roadmap
  const baseProjection = projectFinancialRoadmap(
    initialAmount,
    monthlyContribution,
    annualReturn,
    targetAmount
  );

  // Calculate Accelerated Roadmap with Extra Contribution
  const acceleratedProjection = projectFinancialRoadmap(
    initialAmount,
    monthlyContribution + extraContribution,
    annualReturn,
    targetAmount
  );

  const monthsSaved = Math.max(
    0,
    baseProjection.monthsToGoal - acceleratedProjection.monthsToGoal
  );

  const currentProgressPercent = Math.min(
    100,
    Math.max(0, (initialAmount / targetAmount) * 100)
  );

  const handleSaveGoal = () => {
    const updatedGoal: FinancialGoal = {
      ...goal,
      targetAmount,
      initialAmount,
      monthlyContribution,
      annualInterestRate: annualReturn,
    };
    onUpdateData({
      ...financeData,
      goal: updatedGoal,
    });
    alert("Meta financeira e parâmetros da trilha salvos com sucesso!");
  };

  const handleSyncWithInvestments = () => {
    setInitialAmount(metrics.totalInvestments);
  };

  const handleSyncWithSavingsMargin = () => {
    if (metrics.netSavingsMargin > 0) {
      setMonthlyContribution(Math.round(metrics.netSavingsMargin));
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner: Roadmap Summary (Elegant Dark) */}
      <div className="bg-[#121212] text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">
                <Target className="w-3.5 h-3.5" />
                <span>Trilha da Independência Financeira</span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Quando você vai alcançar{" "}
              <span className="text-blue-400">
                {formatBRL(targetAmount)}
              </span>
              ?
            </h2>
            <p className="text-sm text-gray-400 max-w-2xl mt-1.5 leading-relaxed">
              Patrimônio investido: <strong className="text-white">{formatBRL(initialAmount)}</strong> • Aporte mensal: <strong className="text-white">{formatBRL(monthlyContribution)}</strong> • Taxa: <strong className="text-white">{formatPercent(annualReturn)} a.a.</strong>
            </p>
          </div>

          {/* Target Countdown Pill */}
          <div className="bg-black/40 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-center min-w-[240px] shadow-lg">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold flex items-center justify-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Tempo Estimado Restante</span>
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {formatMonthsToTime(baseProjection.monthsToGoal)}
            </div>
            <div className="text-xs text-blue-400 font-medium mt-1">
              Previsão: <strong>{baseProjection.projectedTargetDate}</strong>
            </div>
          </div>
        </div>

        {/* Stepped Visual Trajectory Preview */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <div className="flex items-center justify-between text-xs font-medium mb-3">
            <span className="text-gray-400 flex items-center space-x-1.5">
              <span>Progresso Atual:</span>
              <span className="text-blue-400 font-bold">{currentProgressPercent.toFixed(1)}%</span>
            </span>
            <span className="text-gray-400">
              Faltam: <strong className="text-white">{formatBRL(Math.max(0, targetAmount - initialAmount))}</strong>
            </span>
          </div>

          {/* Stepped Bar Chart */}
          <div className="relative h-16 flex items-end gap-1.5 mb-4">
            <div className="flex-1 bg-white/5 h-[20%] rounded-t-sm" />
            <div className="flex-1 bg-white/5 h-[30%] rounded-t-sm" />
            <div className="flex-1 bg-white/5 h-[42%] rounded-t-sm" />
            <div className="flex-1 bg-blue-500/30 h-[55%] rounded-t-sm border-t border-blue-400/40" />
            <div className="flex-1 bg-blue-500/50 h-[70%] rounded-t-sm border-t border-blue-400/60" />
            <div className="flex-1 bg-blue-500/75 h-[85%] rounded-t-sm border-t border-blue-400/80" />
            <div className="flex-1 bg-blue-500 h-[100%] rounded-t-sm border-t-2 border-blue-300 shadow-md shadow-blue-500/20" />
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Aporte Mensal</p>
              <p className="text-sm font-bold text-white mt-0.5">{formatBRL(monthlyContribution)}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Rentabilidade</p>
              <p className="text-sm font-bold text-green-400 mt-0.5">{formatPercent(annualReturn / 12)} a.m.</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Juros no Prazo</p>
              <p className="text-sm font-bold text-purple-400 mt-0.5">
                +{formatBRL(Math.max(0, targetAmount - initialAmount - monthlyContribution * baseProjection.monthsToGoal))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Controls & Quick Preset Goals */}
      <div className="bg-[#121212] rounded-2xl p-6 border border-white/5 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span>Simulador de Cenários & Ajuste de Meta</span>
            </h3>
            <p className="text-xs text-gray-500">
              Personalize o montante desejado, patrimônio de largada e rentabilidade esperada.
            </p>
          </div>

          {/* Quick Target Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[100000, 300000, 500000, 1000000, 2000000].map((preset) => (
              <button
                key={preset}
                onClick={() => setTargetAmount(preset)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  targetAmount === preset
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {preset >= 1000000 ? `R$ ${preset / 1000000}M` : `R$ ${preset / 1000}k`}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders and Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Target Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">
              Valor da Meta (R$)
            </label>
            <input
              type="number"
              step="10000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm font-semibold rounded-xl bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
            />
            <span className="text-[10px] text-gray-500">Objetivo final a ser acumulado</span>
          </div>

          {/* Initial Invested Amount */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-300">
                Patrimônio Atual (R$)
              </label>
              <button
                onClick={handleSyncWithInvestments}
                className="text-[10px] text-blue-400 hover:underline"
              >
                Puxar Ativos
              </button>
            </div>
            <input
              type="number"
              step="1000"
              value={initialAmount}
              onChange={(e) => setInitialAmount(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm font-semibold rounded-xl bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
            />
            <span className="text-[10px] text-gray-500">Total já investido hoje</span>
          </div>

          {/* Monthly Contribution */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-300">
                Aporte Mensal (R$)
              </label>
              <button
                onClick={handleSyncWithSavingsMargin}
                className="text-[10px] text-green-400 hover:underline"
              >
                Puxar Sobra
              </button>
            </div>
            <input
              type="number"
              step="100"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm font-semibold rounded-xl bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
            />
            <span className="text-[10px] text-gray-500">Investido todo mês</span>
          </div>

          {/* Expected Return Rate */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-300">
                Rentabilidade: {annualReturn.toFixed(1)}% a.a.
              </label>
            </div>
            <input
              type="range"
              min="6"
              max="20"
              step="0.5"
              value={annualReturn}
              onChange={(e) => setAnnualReturn(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-2 bg-white/10 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>6% (IPCA+)</span>
              <span>13% (CDI)</span>
              <span>20% (Ações/Cripto)</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveGoal}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
          >
            Salvar Parâmetros da Meta
          </button>
        </div>
      </div>

      {/* The 4 Checkpoints / Milestones of the Roadmap */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Award className="w-4 h-4 text-blue-400" />
            <span>Os 4 Marcos da sua Liberdade Financeira</span>
          </h3>
          <span className="text-xs text-gray-500">
            Renda passiva estimada calculada com yield de 0,80% a.m.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {baseProjection.milestones.map((milestone) => {
            const isFinished = initialAmount >= milestone.targetValue;

            return (
              <div
                key={milestone.percentage}
                className={`bg-[#121212] rounded-2xl p-5 border transition-all duration-300 hover:shadow-md relative overflow-hidden ${
                  isFinished
                    ? "border-green-500/40 bg-green-950/10"
                    : "border-white/5"
                }`}
              >
                {isFinished && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-green-500 text-white text-[9px] font-bold uppercase tracking-wider">
                    Conquistado
                  </div>
                )}

                <div className="flex items-center space-x-2.5">
                  <span className="w-8 h-8 rounded-xl bg-white/10 text-white flex items-center justify-center text-xs font-bold">
                    {milestone.percentage}%
                  </span>
                  <span className="text-base font-bold text-white">
                    {formatBRL(milestone.targetValue)}
                  </span>
                </div>

                <div className="mt-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      <span>Data Prevista:</span>
                    </span>
                    <strong className="text-white">
                      {milestone.projectedDate}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      <span>Tempo:</span>
                    </span>
                    <strong className="text-white">
                      {formatMonthsToTime(milestone.monthReached)}
                    </strong>
                  </div>

                  <div className="pt-2.5 border-t border-white/5">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block">
                      Renda Passiva Estimada:
                    </span>
                    <span className="text-sm font-extrabold text-green-400">
                      +{formatBRL(milestone.monthlyPassiveIncome)} / mês
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* The Accelerator Booster */}
      <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl p-6 border border-blue-500/20 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>Acelerador de Metas (Poder dos Aportes Extras)</span>
            </div>
            <h4 className="text-base font-bold text-white">
              E se você aumentar seu aporte em{" "}
              <span className="text-blue-400">
                +{formatBRL(extraContribution)}/mês
              </span>
              ?
            </h4>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              Pequenos cortes em despesas supérfluas aceleram sua meta de forma exponencial devido
              aos juros compostos.
            </p>
          </div>

          {/* Quick extra preset chips */}
          <div className="flex items-center space-x-2">
            {[100, 200, 300, 500, 1000].map((val) => (
              <button
                key={val}
                onClick={() => setExtraContribution(val)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  extraContribution === val
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                +{formatBRL(val)}
              </button>
            ))}
          </div>
        </div>

        {/* Acceleration Result Box */}
        <div className="mt-4 p-4 bg-black/40 rounded-xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              🚀
            </div>
            <div>
              <span className="text-xs text-gray-400 block">
                Você antecipará sua meta em:
              </span>
              <span className="text-base sm:text-lg font-black text-blue-400">
                {formatMonthsToTime(monthsSaved)} mais rápido!
              </span>
            </div>
          </div>

          <div className="text-xs text-gray-400 sm:text-right">
            Novo prazo:{" "}
            <strong className="text-white">
              {formatMonthsToTime(acceleratedProjection.monthsToGoal)}
            </strong>{" "}
            (Previsão:{" "}
            <span className="text-green-400 font-bold">
              {acceleratedProjection.projectedTargetDate}
            </span>
            )
          </div>
        </div>
      </div>

      {/* Projection Evolution Table */}
      <div className="bg-[#121212] rounded-2xl p-6 border border-white/5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <h4 className="text-sm font-bold text-white flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span>Evolução Projetada Mês a Mês</span>
          </h4>
          <span className="text-xs text-gray-500">
            Aporte: {formatBRL(monthlyContribution)}/mês
          </span>
        </div>

        <div className="overflow-x-auto mt-3 max-h-80 overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#181818] text-gray-400 font-bold sticky top-0">
              <tr>
                <th className="py-2.5 px-3">Mês / Ano</th>
                <th className="py-2.5 px-3">Total Investido (Bolso)</th>
                <th className="py-2.5 px-3">Juros Ganhos</th>
                <th className="py-2.5 px-3">Patrimônio Acumulado</th>
                <th className="py-2.5 px-3">Renda Passiva Mensal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {baseProjection.trajectory.map((step) => (
                <tr
                  key={step.month}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="py-2.5 px-3 font-semibold text-white font-sans">
                    {step.dateStr} ({step.month === 0 ? "Início" : `Mês ${step.month}`})
                  </td>
                  <td className="py-2.5 px-3 text-gray-400">
                    {formatBRL(step.totalInvested)}
                  </td>
                  <td className="py-2.5 px-3 text-green-400">
                    +{formatBRL(step.totalInterest)}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-white">
                    {formatBRL(step.totalBalance)}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-blue-400">
                    {formatBRL(step.monthlyPassiveIncome)}/mês
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
