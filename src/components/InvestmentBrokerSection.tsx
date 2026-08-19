import React, { useState } from "react";
import {
  TrendingUp,
  Plus,
  Trash2,
  HelpCircle,
  Coins,
  Shield,
  Percent,
  CheckCircle2,
  Building,
  DollarSign,
  Info,
  ExternalLink,
  Flame,
  Scale,
  Sparkles,
} from "lucide-react";
import { InvestmentAsset, InvestmentCategory, UserFinanceData } from "../types";
import { formatBRL, formatPercent } from "../utils/financeCalculators";
import { investmentCatalog } from "../data/investmentCatalog";

interface InvestmentBrokerSectionProps {
  financeData: UserFinanceData;
  onUpdateData: (newData: UserFinanceData) => void;
  onOpenAIChatWithTopic?: (topic: string) => void;
}

export const InvestmentBrokerSection: React.FC<InvestmentBrokerSectionProps> = ({
  financeData,
  onUpdateData,
  onOpenAIChatWithTopic,
}) => {
  // Add Asset Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [assetName, setAssetName] = useState("");
  const [assetTicker, setAssetTicker] = useState("");
  const [assetCategory, setAssetCategory] = useState<InvestmentCategory>(
    "Renda Fixa (CDB / LCI / LCA)"
  );
  const [assetInvested, setAssetInvested] = useState<number | "">("");
  const [assetCurrentVal, setAssetCurrentVal] = useState<number | "">("");
  const [assetReturn, setAssetReturn] = useState<number | "">("");
  const [assetMonthlyYield, setAssetMonthlyYield] = useState<number | "">("");
  const [assetInstitution, setAssetInstitution] = useState("");

  // Fixed Income Comparator Tool state
  const [simPrincipal, setSimPrincipal] = useState(10000);
  const [simPeriodMonths, setSimPeriodMonths] = useState(12);

  // Totals
  const totalInvested = financeData.investments.reduce(
    (acc, inv) => acc + inv.investedAmount,
    0
  );
  const totalCurrent = financeData.investments.reduce(
    (acc, inv) => acc + inv.currentValue,
    0
  );
  const totalProfit = totalCurrent - totalInvested;
  const totalProfitPercent =
    totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;
  const totalMonthlyDividends = financeData.investments.reduce(
    (acc, inv) => acc + (inv.monthlyYieldEstimated || 0),
    0
  );

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName || !assetCurrentVal) return;

    const newAsset: InvestmentAsset = {
      id: `inv-${Date.now()}`,
      name: assetName,
      ticker: assetTicker || undefined,
      category: assetCategory,
      investedAmount: assetInvested ? Number(assetInvested) : Number(assetCurrentVal),
      currentValue: Number(assetCurrentVal),
      expectedAnnualReturn: assetReturn ? Number(assetReturn) : 12.0,
      monthlyYieldEstimated: assetMonthlyYield ? Number(assetMonthlyYield) : undefined,
      institution: assetInstitution || "Corretora / Banco",
    };

    onUpdateData({
      ...financeData,
      investments: [...financeData.investments, newAsset],
    });

    setAssetName("");
    setAssetTicker("");
    setAssetInvested("");
    setAssetCurrentVal("");
    setAssetReturn("");
    setAssetMonthlyYield("");
    setAssetInstitution("");
    setShowAddModal(false);
  };

  const handleDeleteAsset = (id: string) => {
    onUpdateData({
      ...financeData,
      investments: financeData.investments.filter((i) => i.id !== id),
    });
  };

  // Fixed Income Simulation calculations with IR Regressive Table
  const calculateNetReturn = (
    principal: number,
    annualRate: number,
    months: number,
    isTaxExempt: boolean = false
  ) => {
    const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
    const grossTotal = principal * Math.pow(1 + monthlyRate, months);
    const grossProfit = grossTotal - principal;

    let irRate = 0;
    if (!isTaxExempt) {
      const days = months * 30;
      if (days <= 180) irRate = 0.225;
      else if (days <= 360) irRate = 0.2;
      else if (days <= 720) irRate = 0.175;
      else irRate = 0.15;
    }

    const taxAmount = grossProfit * irRate;
    const netProfit = grossProfit - taxAmount;
    const netTotal = principal + netProfit;

    return {
      grossTotal,
      netTotal,
      netProfit,
      taxAmount,
      irRatePercent: irRate * 100,
    };
  };

  // Pre-configured comparison products
  const comparisonProducts = [
    {
      name: "Poupança Tradicional",
      rate: 7.0,
      exempt: true,
      tag: "Isento IR",
      desc: "Menor rendimento do mercado",
    },
    {
      name: "CDB 100% do CDI",
      rate: 13.15,
      exempt: false,
      tag: "Reserva Emergência",
      desc: "Bancos médios/grandes (FGC)",
    },
    {
      name: "CDB 120% do CDI",
      rate: 15.78,
      exempt: false,
      tag: "Médio/Longo Prazo",
      desc: "Bancos digitais e corretoras (FGC)",
    },
    {
      name: "LCI / LCA 92% CDI (Isenta)",
      rate: 12.1,
      exempt: true,
      tag: "0% IR Pessoa Física",
      desc: "Rendimento líquido direto no bolso",
    },
    {
      name: "Tesouro IPCA+ (6.4% + Inflação)",
      rate: 11.8,
      exempt: false,
      tag: "Proteção Soberana",
      desc: "Blindagem de longo prazo",
    },
    {
      name: "Fundos Imobiliários (FIIs)",
      rate: 13.5,
      exempt: true,
      tag: "Renda Passiva Mensal",
      desc: "Aluguéis isentos todo mês",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Broker Header (Elegant Dark) */}
      <div className="bg-[#121212] text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20 mb-3">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Mesa do Corretor de Investimentos & Bolsa</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Faça o seu Dinheiro Render Mais
            </h2>
            <p className="text-sm text-gray-400 max-w-2xl mt-1.5 leading-relaxed">
              Guia completo e comparador de <strong>CDB, CDI, LCI/LCA, Tesouro Direto, Ações da Bolsa, FIIs e Criptomoedas</strong> para montar uma carteira inteligente e balanceada.
            </p>
          </div>

          {/* Quick Portfolio Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/5">
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Patrimônio Investido</span>
              <span className="text-base sm:text-lg font-bold text-white">
                {formatBRL(totalCurrent)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Lucro Acumulado</span>
              <span
                className={`text-base sm:text-lg font-bold ${
                  totalProfit >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                +{formatBRL(totalProfit)} ({totalProfitPercent.toFixed(1)}%)
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Dividendos Mensais</span>
              <span className="text-base sm:text-lg font-bold text-blue-400">
                +{formatBRL(totalMonthlyDividends)} / mês
              </span>
            </div>
          </div>
        </div>

        {/* Recommended Asset Allocation Matrix */}
        <div className="mt-6 pt-5 border-t border-white/5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Alocação Estratégica Recomendada pelo Corretor
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-black/40 p-3.5 rounded-xl border border-white/5">
              <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center mb-2 text-orange-400 font-bold text-xs">
                ₿
              </div>
              <p className="text-xs font-medium text-white mb-0.5">Criptoativos</p>
              <p className="text-sm font-bold text-orange-400">
                5% <span className="text-[10px] font-normal text-gray-500">Arrojado</span>
              </p>
            </div>

            <div className="bg-black/40 p-3.5 rounded-xl border border-white/5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center mb-2 text-blue-400 font-bold text-xs">
                🏦
              </div>
              <p className="text-xs font-medium text-white mb-0.5">CDB / CDI / LCI</p>
              <p className="text-sm font-bold text-blue-400">
                45% <span className="text-[10px] font-normal text-gray-500">Liquidez</span>
              </p>
            </div>

            <div className="bg-black/40 p-3.5 rounded-xl border border-white/5">
              <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center mb-2 text-green-400 font-bold text-xs">
                📈
              </div>
              <p className="text-xs font-medium text-white mb-0.5">Bolsa & FIIs</p>
              <p className="text-sm font-bold text-green-400">
                35% <span className="text-[10px] font-normal text-gray-500">Dividendos</span>
              </p>
            </div>

            <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 text-center flex flex-col items-center justify-center">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center mb-1 text-purple-400">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <p className="text-[10px] text-gray-400">Otimizar Carteira</p>
              {onOpenAIChatWithTopic && (
                <button
                  onClick={() =>
                    onOpenAIChatWithTopic(
                      "Quero uma análise da minha carteira de investimentos e sugestões de rebalanceamento."
                    )
                  }
                  className="mt-1 text-[10px] px-2.5 py-0.5 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-bold transition-colors"
                >
                  ANALISAR
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Fixed Income & Market Comparator */}
      <div className="bg-[#121212] rounded-2xl p-6 border border-white/5 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div>
            <div className="flex items-center space-x-2">
              <Scale className="w-4 h-4 text-blue-400" />
              <h3 className="text-base font-bold text-white">
                Simulador Comparativo de Rendimento Real
              </h3>
            </div>
            <p className="text-xs text-gray-500">
              Veja quanto o seu dinheiro rende em cada modalidade com desconto real de Imposto de Renda (IR).
            </p>
          </div>

          {/* Capital and Period Inputs */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
              <span className="text-gray-400 font-medium">Valor:</span>
              <input
                type="number"
                step="1000"
                value={simPrincipal}
                onChange={(e) => setSimPrincipal(Number(e.target.value))}
                className="w-24 bg-transparent font-bold text-white focus:outline-none"
              />
            </div>

            {/* Period select */}
            <div className="flex items-center space-x-1">
              {[6, 12, 24, 36, 60].map((m) => (
                <button
                  key={m}
                  onClick={() => setSimPeriodMonths(m)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    simPeriodMonths === m
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {m >= 12 ? `${m / 12} ano(s)` : `${m} meses`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {comparisonProducts.map((prod) => {
            const res = calculateNetReturn(
              simPrincipal,
              prod.rate,
              simPeriodMonths,
              prod.exempt
            );
            const isWinner = prod.rate >= 13.5;

            return (
              <div
                key={prod.name}
                className={`rounded-2xl p-4.5 border transition-all hover:shadow-md relative bg-[#181818] ${
                  isWinner
                    ? "border-blue-500/30"
                    : "border-white/5"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {prod.name}
                    </h4>
                    <span className="text-[11px] text-gray-500">
                      {prod.desc}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      prod.exempt
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-white/5 text-gray-400 border border-white/5"
                    }`}
                  >
                    {prod.tag}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">
                      Rendimento Líquido:
                    </span>
                    <strong className="text-green-400 font-bold font-mono">
                      +{formatBRL(res.netProfit)}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">
                      Saldo Final em {simPeriodMonths} meses:
                    </span>
                    <strong className="text-sm font-black text-white font-mono">
                      {formatBRL(res.netTotal)}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
                    <span>Taxa Anual: {prod.rate}% a.a.</span>
                    <span>
                      {prod.exempt
                        ? "Isento de IR"
                        : `IR: ${res.irRatePercent.toFixed(1)}%`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User's Current Investment Portfolio */}
      <div className="bg-[#121212] rounded-2xl p-6 border border-white/5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Coins className="w-4 h-4 text-blue-400" />
              <span>Sua Carteira de Ativos & Investimentos</span>
            </h3>
            <p className="text-xs text-gray-500">
              {financeData.investments.length} posições ativas cadastradas
            </p>
          </div>

          <button
            id="btn-add-investment"
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Ativo</span>
          </button>
        </div>

        {/* Add Asset Form Modal */}
        {showAddModal && (
          <form
            onSubmit={handleAddAsset}
            className="my-3 p-4 bg-black/40 rounded-xl border border-white/10 space-y-3"
          >
            <div className="text-xs font-bold text-gray-200">
              Cadastrar Novo Ativo na Carteira
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                placeholder="Nome do Ativo (ex: CDB Sofisa 110% CDI)"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                className="px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Código / Ticker (ex: MXRF11, BTC, CDB)"
                value={assetTicker}
                onChange={(e) => setAssetTicker(e.target.value)}
                className="px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
              />
              <select
                value={assetCategory}
                onChange={(e) => setAssetCategory(e.target.value as InvestmentCategory)}
                className="px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
              >
                <option value="Renda Fixa (CDB / LCI / LCA)">Renda Fixa (CDB / LCI / LCA)</option>
                <option value="Tesouro Direto">Tesouro Direto</option>
                <option value="Fundos Imobiliários (FIIs)">Fundos Imobiliários (FIIs)</option>
                <option value="Ações Brasil (B3)">Ações Brasil (B3)</option>
                <option value="ETFs & Ativos Globais">ETFs & Ativos Globais</option>
                <option value="Criptomoedas (BTC / ETH)">Criptomoedas (BTC / ETH)</option>
                <option value="Reserva de Emergência">Reserva de Emergência</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <input
                type="number"
                step="0.01"
                placeholder="Valor Aplicado (R$)"
                value={assetInvested}
                onChange={(e) =>
                  setAssetInvested(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Valor Atual (R$)"
                value={assetCurrentVal}
                onChange={(e) =>
                  setAssetCurrentVal(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
                required
              />
              <input
                type="number"
                step="0.1"
                placeholder="Retorno Anual % (ex: 13.5)"
                value={assetReturn}
                onChange={(e) =>
                  setAssetReturn(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
              />
              <input
                type="text"
                placeholder="Instituição (XP, Nubank, BTG...)"
                value={assetInstitution}
                onChange={(e) => setAssetInstitution(e.target.value)}
                className="px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm"
              >
                Salvar Ativo
              </button>
            </div>
          </form>
        )}

        {/* Investment Asset Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {financeData.investments.map((inv) => {
            const profit = inv.currentValue - inv.investedAmount;
            const profitPct =
              inv.investedAmount > 0 ? (profit / inv.investedAmount) * 100 : 0;

            return (
              <div
                key={inv.id}
                className="p-4 rounded-xl border border-white/5 bg-[#181818] hover:bg-white/5 transition-colors flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-white">
                          {inv.name}
                        </h4>
                        {inv.ticker && (
                          <span className="text-[10px] uppercase font-bold text-gray-400 bg-white/10 px-1.5 py-0.2 rounded">
                            {inv.ticker}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-500">
                        {inv.institution} • {inv.category}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteAsset(inv.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 p-1 transition-opacity"
                      title="Excluir ativo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Valor Atual</span>
                    <strong className="text-sm font-bold text-white font-mono">
                      {formatBRL(inv.currentValue)}
                    </strong>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Rentabilidade</span>
                    <span
                      className={`font-bold font-mono ${
                        profit >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      +{formatBRL(profit)} ({profitPct.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Broker Educational Guide to Asset Classes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Building className="w-4 h-4 text-blue-400" />
              <span>Guia do Corretor: Entenda Cada Ativo</span>
            </h3>
            <p className="text-xs text-gray-500">
              Dicas e recomendações práticas para cada tipo de produto financeiro no Brasil.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {investmentCatalog.map((item) => (
            <div
              key={item.id}
              className="bg-[#121212] rounded-2xl p-5 border border-white/5 shadow-sm flex flex-col justify-between hover:border-blue-500/30 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                    {item.category}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-500">
                    Risco: {item.riskLevel}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mt-2">
                  {item.name}
                </h4>
                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-3 space-y-1.5 text-[11px] bg-black/40 p-3 rounded-xl border border-white/5">
                  <div className="text-gray-300">
                    <strong className="text-white">Benchmark:</strong> {item.benchmark}
                  </div>
                  <div className="text-gray-300">
                    <strong className="text-white">Tributação:</strong> {item.taxation}
                  </div>
                  <div className="text-gray-300">
                    <strong className="text-white">Liquidez:</strong> {item.liquidity}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-green-400 font-semibold">
                  {item.fgcProtection ? "✓ FGC Garantido" : "✓ Risco de Mercado"}
                </span>
                {onOpenAIChatWithTopic && (
                  <button
                    onClick={() =>
                      onOpenAIChatWithTopic(
                        `Gostaria de recomendações e estratégias sobre como investir em ${item.name}.`
                      )
                    }
                    className="text-xs text-blue-400 font-medium hover:underline flex items-center space-x-1"
                  >
                    <span>Dicas da IA</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
