import React, { useState } from "react";
import {
  CreditCard as CreditCardIcon,
  AlertTriangle,
  Flame,
  Plus,
  Trash2,
  TrendingDown,
  ShieldCheck,
  Zap,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  CheckCircle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  PieChart,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { CreditCard, DebtItem, UserFinanceData } from "../types";
import {
  formatBRL,
  formatPercent,
  formatDateBR,
  analyzeDebtPriorities,
} from "../utils/financeCalculators";

interface DebtPayoffSectionProps {
  financeData: UserFinanceData;
  onUpdateData: (newData: UserFinanceData) => void;
}

export const DebtPayoffSection: React.FC<DebtPayoffSectionProps> = ({
  financeData,
  onUpdateData,
}) => {
  // Strategy toggle: Avalanche (Highest annual interest first) vs Due Date vs Snowball (Lowest balance first)
  const [strategy, setStrategy] = useState<"avalanche" | "duedate" | "snowball">(
    "avalanche"
  );

  // Tab filter: "pending" | "paid" | "all"
  const [statusFilter, setStatusFilter] = useState<"pending" | "paid" | "all">(
    "pending"
  );

  // Debt Form modal state
  const [showAddDebtModal, setShowAddDebtModal] = useState(false);
  const [debtName, setDebtName] = useState("");
  const [debtCreditor, setDebtCreditor] = useState("");
  const [debtPrincipal, setDebtPrincipal] = useState<number | "">("");
  const [debtAnnualRate, setDebtAnnualRate] = useState<number | "">("");
  const [debtMonthlyRate, setDebtMonthlyRate] = useState<number | "">("");
  const [debtDueDate, setDebtDueDate] = useState<string>("");
  const [debtTermMonths, setDebtTermMonths] = useState<number | "">("");
  const [debtMinPayment, setDebtMinPayment] = useState<number | "">("");
  const [debtCategory, setDebtCategory] =
    useState<DebtItem["category"]>("Cartão de Crédito");
  const [debtNotes, setDebtNotes] = useState("");

  // Card Form modal state
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardBank, setCardBank] = useState("");
  const [cardLimit, setCardLimit] = useState<number | "">("");
  const [cardInvoice, setCardInvoice] = useState<number | "">("");
  const [cardClosingDay, setCardClosingDay] = useState(25);
  const [cardDueDay, setCardDueDay] = useState(5);
  const [cardColor, setCardColor] = useState("#820ad1");

  // Success alert state
  const [recentlyPaidName, setRecentlyPaidName] = useState<string | null>(null);

  const debtAnalysis = analyzeDebtPriorities(financeData.debts);

  // Handlers for Annual vs Monthly rate synchronization
  const handleAnnualRateChange = (val: string) => {
    if (val === "") {
      setDebtAnnualRate("");
      setDebtMonthlyRate("");
      return;
    }
    const annual = Number(val);
    setDebtAnnualRate(annual);
    if (!isNaN(annual) && annual > 0) {
      const monthly = (Math.pow(1 + annual / 100, 1 / 12) - 1) * 100;
      setDebtMonthlyRate(Math.round(monthly * 100) / 100);
    }
  };

  const handleMonthlyRateChange = (val: string) => {
    if (val === "") {
      setDebtMonthlyRate("");
      setDebtAnnualRate("");
      return;
    }
    const monthly = Number(val);
    setDebtMonthlyRate(monthly);
    if (!isNaN(monthly) && monthly > 0) {
      const annual = (Math.pow(1 + monthly / 100, 12) - 1) * 100;
      setDebtAnnualRate(Math.round(annual * 100) / 100);
    }
  };

  // Compute active list based on strategy and filter
  let displayedList =
    strategy === "avalanche"
      ? debtAnalysis.avalancheRanked
      : strategy === "duedate"
      ? debtAnalysis.dueDateRanked
      : debtAnalysis.snowballRanked;

  if (statusFilter === "paid") {
    displayedList = debtAnalysis.paidDebts;
  } else if (statusFilter === "all") {
    displayedList = [
      ...displayedList,
      ...debtAnalysis.paidDebts,
    ];
  }

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtName || !debtPrincipal) return;

    let finalAnnual = Number(debtAnnualRate) || 0;
    let finalMonthly = Number(debtMonthlyRate) || 0;

    if (finalAnnual === 0 && finalMonthly > 0) {
      finalAnnual = (Math.pow(1 + finalMonthly / 100, 12) - 1) * 100;
    } else if (finalMonthly === 0 && finalAnnual > 0) {
      finalMonthly = (Math.pow(1 + finalAnnual / 100, 1 / 12) - 1) * 100;
    }

    const newDebt: DebtItem = {
      id: `debt-${Date.now()}`,
      name: debtName.trim(),
      creditor: debtCreditor.trim() || "Instituição Financeira",
      totalBalance: Number(debtPrincipal),
      principalAmount: Number(debtPrincipal),
      annualInterestRate: Math.round(finalAnnual * 100) / 100,
      monthlyInterestRate: Math.round(finalMonthly * 100) / 100,
      minimumPayment: debtMinPayment ? Number(debtMinPayment) : 0,
      dueDate: debtDueDate || undefined,
      termMonths: debtTermMonths ? Number(debtTermMonths) : undefined,
      category: debtCategory,
      notes: debtNotes.trim() || undefined,
      isPaid: false,
    };

    onUpdateData({
      ...financeData,
      debts: [...financeData.debts, newDebt],
    });

    setDebtName("");
    setDebtCreditor("");
    setDebtPrincipal("");
    setDebtAnnualRate("");
    setDebtMonthlyRate("");
    setDebtDueDate("");
    setDebtTermMonths("");
    setDebtMinPayment("");
    setDebtNotes("");
    setShowAddDebtModal(false);
  };

  const handleTogglePaidStatus = (id: string) => {
    const targetDebt = financeData.debts.find((d) => d.id === id);
    const willBePaid = !targetDebt?.isPaid;

    const updatedDebts = financeData.debts.map((d) => {
      if (d.id === id) {
        return {
          ...d,
          isPaid: willBePaid,
          paidDate: willBePaid
            ? new Date().toISOString().split("T")[0]
            : undefined,
        };
      }
      return d;
    });

    onUpdateData({
      ...financeData,
      debts: updatedDebts,
    });

    if (willBePaid && targetDebt) {
      setRecentlyPaidName(targetDebt.name);
      setTimeout(() => setRecentlyPaidName(null), 4000);
    }
  };

  const handleDeleteDebt = (id: string) => {
    onUpdateData({
      ...financeData,
      debts: financeData.debts.filter((d) => d.id !== id),
    });
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName || !cardLimit) return;

    const newCard: CreditCard = {
      id: `card-${Date.now()}`,
      name: cardName,
      bank: cardBank || "Banco",
      limit: Number(cardLimit),
      currentInvoice: cardInvoice ? Number(cardInvoice) : 0,
      closingDay: Number(cardClosingDay),
      dueDay: Number(cardDueDay),
      colorHex: cardColor,
    };

    onUpdateData({
      ...financeData,
      creditCards: [...financeData.creditCards, newCard],
    });

    setCardName("");
    setCardBank("");
    setCardLimit("");
    setCardInvoice("");
    setShowAddCardModal(false);
  };

  const handleDeleteCard = (id: string) => {
    onUpdateData({
      ...financeData,
      creditCards: financeData.creditCards.filter((c) => c.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Debt Elimination Strategy (Elegant Dark) */}
      <div className="bg-[#121212] text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold border border-red-500/20 mb-3">
              <Flame className="w-3.5 h-3.5" />
              <span>Rastreador Inteligente de Dívidas & Otimizador por Juros</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Sistema de Rastreamento & Quitação de Dívidas
            </h2>
            <p className="text-sm text-gray-400 max-w-2xl mt-1.5 leading-relaxed">
              Monitore o valor principal, taxas anuais e vencimentos. O sistema calcula os <strong>juros acumulados</strong> e ordena as pendências por maior taxa para maximizar a sua economia financeira.
            </p>
          </div>

          {/* Quick Debt Drain Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/5">
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block">
                Principal Pendente
              </span>
              <span className="text-base sm:text-lg font-bold text-white font-mono">
                {formatBRL(debtAnalysis.totalPrincipalPending)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block">
                Juros Acumulados
              </span>
              <span className="text-base sm:text-lg font-bold text-red-400 font-mono">
                +{formatBRL(debtAnalysis.totalAccumulatedInterestPending)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block">
                Total a Pagar
              </span>
              <span className="text-base sm:text-lg font-bold text-amber-400 font-mono">
                {formatBRL(debtAnalysis.totalPayablePending)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block">
                Dívidas Quitadas
              </span>
              <span className="text-base sm:text-lg font-bold text-green-400 font-mono">
                {debtAnalysis.paidDebts.length} pagas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Celebration Alert when a Debt is marked as paid */}
      {recentlyPaidName && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-green-400">
                🎉 Parabéns! Dívida "{recentlyPaidName}" Marcada como Paga!
              </h4>
              <p className="text-xs text-gray-300">
                Você acaba de estancar mais uma sangria de juros e acelerou sua trilha para a independência financeira.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter("paid")}
            className="text-xs px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors"
          >
            Ver Quitadas
          </button>
        </div>
      )}

      {/* Main Debt Tracker Card */}
      <div className="bg-[#121212] rounded-2xl p-6 border border-white/5 shadow-sm space-y-5">
        {/* Controls Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Rastreamento & Ordem de Ataque</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-mono">
                  {debtAnalysis.pendingDebts.length} pendentes
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                Priorize a liquidação de acordo com as taxas de juros e datas de vencimento.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter Tabs (Pendentes, Quitadas, Todas) */}
            <div className="flex bg-black/40 p-1 rounded-xl text-xs font-semibold border border-white/5">
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === "pending"
                    ? "bg-red-600 text-white shadow-sm font-bold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Pendentes ({debtAnalysis.pendingDebts.length})
              </button>
              <button
                onClick={() => setStatusFilter("paid")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === "paid"
                    ? "bg-green-600 text-white shadow-sm font-bold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Quitadas ({debtAnalysis.paidDebts.length})
              </button>
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === "all"
                    ? "bg-white/10 text-white shadow-sm font-bold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Todas ({financeData.debts.length})
              </button>
            </div>

            {/* Strategy selector pills */}
            {statusFilter !== "paid" && (
              <div className="flex bg-black/40 p-1 rounded-xl text-xs font-semibold border border-white/5">
                <button
                  onClick={() => setStrategy("avalanche")}
                  title="Focar primeiro na dívida com maior taxa de juros anual para economizar mais dinheiro"
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    strategy === "avalanche"
                      ? "bg-red-600/80 text-white shadow-sm font-bold border border-red-500/40"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  ⚡ Maior Juro (Avalanche)
                </button>
                <button
                  onClick={() => setStrategy("duedate")}
                  title="Ordenar pelas datas de vencimento mais próximas"
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    strategy === "duedate"
                      ? "bg-amber-600/80 text-white shadow-sm font-bold border border-amber-500/40"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  📅 Por Vencimento
                </button>
                <button
                  onClick={() => setStrategy("snowball")}
                  title="Eliminar as dívidas de menor valor primeiro para ganhos rápidos"
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    strategy === "snowball"
                      ? "bg-blue-600/80 text-white shadow-sm font-bold border border-blue-500/40"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  ❄️ Menor Saldo
                </button>
              </div>
            )}

            <button
              id="btn-add-debt"
              onClick={() => setShowAddDebtModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Inserir Nova Dívida</span>
            </button>
          </div>
        </div>

        {/* Strategy Explanation Banner */}
        <div className="p-4 rounded-xl bg-blue-900/10 border border-blue-500/20 text-xs text-gray-300 flex items-start space-x-3">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">
              {strategy === "avalanche"
                ? "Estratégia Recomendada: Método Avalanche (Foco na Maior Taxa de Juros Anual)"
                : strategy === "duedate"
                ? "Estratégia por Data de Vencimento: Foco em evitar multas por atraso"
                : "Estratégia Bola de Neve: Foco em liquidação rápida de menores saldos"}
            </strong>
            <p className="mt-0.5 text-gray-400 leading-relaxed">
              {strategy === "avalanche"
                ? "Ao quitar primeiro as dívidas com maiores taxas anuais (% a.a.), você estanca o crescimento exponencial dos juros compostos cobrados pelos bancos, gerando a maior economia financeira possível."
                : strategy === "duedate"
                ? "Evite a incidência de juros de mora e multas adicionais pagando pontualmente as contas que vencem nos próximos dias."
                : "A Bola de Neve foca em zerar as contas com menor saldo principal primeiro para gerar alívio emocional e reduzir a quantidade de boletos mensais."}
            </p>
          </div>
        </div>

        {/* Modal / Form: Inserir Detalhes da Dívida */}
        {showAddDebtModal && (
          <form
            onSubmit={handleAddDebt}
            className="my-3 p-5 bg-black/50 rounded-2xl border border-white/10 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center space-x-2">
                <Plus className="w-4 h-4 text-red-400" />
                <h4 className="text-sm font-bold text-white">
                  Cadastrar Nova Dívida para Rastreamento
                </h4>
              </div>
              <span className="text-[11px] text-gray-400">
                Preencha os campos para cálculo automático dos juros e total a pagar
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-gray-300 font-semibold">
                  Nome da Dívida *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Rotativo Cartão Platinum, Empréstimo..."
                  value={debtName}
                  onChange={(e) => setDebtName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-gray-300 font-semibold">
                  Credor / Instituição
                </label>
                <input
                  type="text"
                  placeholder="Ex: Banco Itaú, Nubank, BV..."
                  value={debtCreditor}
                  onChange={(e) => setDebtCreditor(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-gray-300 font-semibold">
                  Categoria
                </label>
                <select
                  value={debtCategory}
                  onChange={(e) =>
                    setDebtCategory(e.target.value as DebtItem["category"])
                  }
                  className="w-full px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
                >
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cheque Especial">Cheque Especial</option>
                  <option value="Empréstimo Pessoal">Empréstimo Pessoal</option>
                  <option value="Financiamento Imob/Auto">
                    Financiamento Imob/Auto
                  </option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Valor Principal */}
              <div className="space-y-1">
                <label className="text-[11px] text-gray-300 font-semibold flex items-center justify-between">
                  <span>Valor Principal (R$) *</span>
                  <span className="text-[10px] text-gray-500">Saldo inicial</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 5000.00"
                  value={debtPrincipal}
                  onChange={(e) =>
                    setDebtPrincipal(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white font-mono focus:outline-blue-500 font-bold"
                  required
                />
              </div>

              {/* Taxa de Juros Anual */}
              <div className="space-y-1">
                <label className="text-[11px] text-gray-300 font-semibold flex items-center justify-between">
                  <span>Taxa Anual (% a.a.) *</span>
                  <span className="text-[10px] text-red-400">Juros ao ano</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 45.9"
                  value={debtAnnualRate}
                  onChange={(e) => handleAnnualRateChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white font-mono focus:outline-blue-500"
                  required
                />
              </div>

              {/* Taxa de Juros Mensal (Sincronizada) */}
              <div className="space-y-1">
                <label className="text-[11px] text-gray-300 font-semibold flex items-center justify-between">
                  <span>Taxa Mensal (% a.m.)</span>
                  <span className="text-[10px] text-gray-400">Sincronizada</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 3.2"
                  value={debtMonthlyRate}
                  onChange={(e) => handleMonthlyRateChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white font-mono focus:outline-blue-500"
                />
              </div>

              {/* Data de Vencimento */}
              <div className="space-y-1">
                <label className="text-[11px] text-gray-300 font-semibold flex items-center justify-between">
                  <span>Data de Vencimento *</span>
                  <span className="text-[10px] text-gray-400">Prazo</span>
                </label>
                <input
                  type="date"
                  value={debtDueDate}
                  onChange={(e) => setDebtDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white font-mono focus:outline-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-gray-300 font-semibold">
                  Parcela Mínima Mensal (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 350.00 (opcional)"
                  value={debtMinPayment}
                  onChange={(e) =>
                    setDebtMinPayment(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white font-mono focus:outline-blue-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] text-gray-300 font-semibold">
                  Observações / Estratégia de Negociação
                </label>
                <input
                  type="text"
                  placeholder="Ex: Tentar portabilidade ou desconto para quitação à vista..."
                  value={debtNotes}
                  onChange={(e) => setDebtNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
                />
              </div>
            </div>

            {/* Real-time projection preview before saving */}
            {Number(debtPrincipal) > 0 && Number(debtAnnualRate) > 0 && (
              <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-gray-300">
                  ⚡ <strong>Simulação em Tempo Real:</strong> Principal de{" "}
                  <strong className="text-white">
                    {formatBRL(Number(debtPrincipal))}
                  </strong>{" "}
                  a{" "}
                  <strong className="text-red-400 font-mono">
                    {Number(debtAnnualRate)}% a.a.
                  </strong>
                </span>
                <div className="flex items-center space-x-3 font-mono">
                  <span className="text-gray-400">
                    Juros acumulados:{" "}
                    <strong className="text-red-400">
                      +{formatBRL((Number(debtPrincipal) * Number(debtAnnualRate)) / 100)}
                    </strong>
                  </span>
                  <span className="text-amber-300 font-bold">
                    Total a Pagar:{" "}
                    {formatBRL(
                      Number(debtPrincipal) +
                        (Number(debtPrincipal) * Number(debtAnnualRate)) / 100
                    )}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddDebtModal(false)}
                className="px-4 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-md transition-all"
              >
                Salvar Dívida no Rastreador
              </button>
            </div>
          </form>
        )}

        {/* Prioritized Debt Cards List */}
        <div className="space-y-3.5">
          {displayedList.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-xs bg-black/20 rounded-2xl border border-white/5 space-y-2">
              <ShieldCheck className="w-10 h-10 text-green-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">
                {statusFilter === "paid"
                  ? "Nenhuma dívida marcada como paga ainda."
                  : "Nenhuma dívida pendente encontrada!"}
              </h4>
              <p className="text-gray-400 max-w-sm mx-auto">
                {statusFilter === "paid"
                  ? "Quando você quitar uma pendência, clique em 'Marcar como Paga' para comemorar e registrar seu progresso."
                  : "Sua carteira está livre de dívidas ativas. Parabéns pela saúde financeira!"}
              </p>
            </div>
          ) : (
            displayedList.map((debt, index) => {
              const isTopPriority = !debt.isPaid && index === 0;
              const isPaid = debt.isPaid;

              // Calculate principal vs interest proportion for progress meter
              const totalVal = debt.totalPayableAmount || debt.principal;
              const principalPct = totalVal > 0 ? (debt.principal / totalVal) * 100 : 100;
              const interestPct = Math.max(0, 100 - principalPct);

              return (
                <div
                  key={debt.id}
                  className={`p-5 rounded-2xl border transition-all hover:shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-5 group relative overflow-hidden ${
                    isPaid
                      ? "bg-[#141d17] border-green-500/20 opacity-85"
                      : isTopPriority
                      ? "bg-red-500/10 border-red-500/30 shadow-red-900/10"
                      : "bg-[#181818] border-white/5"
                  }`}
                >
                  {/* Left Column: Priority rank, titles, tags, and due date */}
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-md ${
                        isPaid
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : isTopPriority
                          ? "bg-red-600 text-white shadow-red-600/30 animate-pulse"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      {isPaid ? <CheckCircle className="w-5 h-5" /> : `#${index + 1}`}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4
                          className={`text-sm sm:text-base font-bold ${
                            isPaid
                              ? "text-gray-300 line-through decoration-green-500"
                              : "text-white"
                          }`}
                        >
                          {debt.name}
                        </h4>

                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/5">
                          {debt.category}
                        </span>

                        {isPaid ? (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>PAGA & QUITADA {debt.paidDate ? `(${formatDateBR(debt.paidDate)})` : ""}</span>
                          </span>
                        ) : isTopPriority ? (
                          <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-red-600 text-white shadow-xs">
                            🚨 PRIORIDADE #1: ABATER PRIMEIRO
                          </span>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                        <span>Credor: <strong className="text-gray-300">{debt.creditor}</strong></span>

                        {debt.dueDate && (
                          <span className="flex items-center space-x-1 text-gray-300">
                            <Calendar className="w-3.5 h-3.5 text-blue-400" />
                            <span>Vencimento: <strong>{formatDateBR(debt.dueDate)}</strong></span>
                            {debt.dueStatus === "overdue" && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-red-600 text-white font-bold">
                                Vencida!
                              </span>
                            )}
                            {debt.dueStatus === "due_today" && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500 text-black font-bold">
                                Vence Hoje
                              </span>
                            )}
                            {debt.dueStatus === "upcoming" && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 font-semibold">
                                {debt.dueStatusText}
                              </span>
                            )}
                          </span>
                        )}
                      </div>

                      {debt.priorityReason && !isPaid && (
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                          {debt.priorityReason}
                        </p>
                      )}

                      {/* Visual Breakdown Bar: Principal vs Juros Acumulados */}
                      {!isPaid && debt.accumulatedInterest > 0 && (
                        <div className="pt-1 max-w-md space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                            <span>Principal: {formatBRL(debt.principal)} ({Math.round(principalPct)}%)</span>
                            <span className="text-red-400 font-bold">
                              Juros Acumulados: +{formatBRL(debt.accumulatedInterest)} ({Math.round(interestPct)}%)
                            </span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden flex">
                            <div
                              className="bg-blue-500 h-1.5 transition-all"
                              style={{ width: `${principalPct}%` }}
                              title={`Principal: ${formatBRL(debt.principal)}`}
                            />
                            <div
                              className="bg-red-500 h-1.5 transition-all"
                              style={{ width: `${interestPct}%` }}
                              title={`Juros: ${formatBRL(debt.accumulatedInterest)}`}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Financial Figures, Total a Pagar, and Action Buttons */}
                  <div className="flex flex-wrap lg:flex-nowrap items-center justify-between lg:justify-end gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/5">
                    {/* Principal */}
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest block">
                        Valor Principal
                      </span>
                      <strong className="text-sm font-bold text-white font-mono">
                        {formatBRL(debt.principal)}
                      </strong>
                    </div>

                    {/* Taxa Anual e Mensal */}
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest block">
                        Taxa de Juros
                      </span>
                      <span className="text-xs font-black text-red-400 block font-mono">
                        {formatPercent(debt.annualInterestRate)} a.a.
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        ({formatPercent(debt.monthlyInterestRate)} a.m.)
                      </span>
                    </div>

                    {/* Valor Total a Ser Pago (Principal + Juros Acumulados) */}
                    <div className="text-left lg:text-right bg-black/40 px-3 py-2 rounded-xl border border-white/5">
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest block">
                        Valor Total a Pagar
                      </span>
                      <strong className="text-sm sm:text-base font-extrabold text-amber-400 font-mono block">
                        {formatBRL(debt.totalPayableAmount)}
                      </strong>
                      <span className="text-[9px] text-gray-500 block font-mono">
                        (Juros: +{formatBRL(debt.accumulatedInterest)})
                      </span>
                    </div>

                    {/* Action buttons: Mark as Paid / Reopen & Delete */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTogglePaidStatus(debt.id)}
                        className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          isPaid
                            ? "bg-white/10 hover:bg-white/15 text-gray-300"
                            : "bg-green-600 hover:bg-green-500 text-white shadow-green-600/20"
                        }`}
                        title={
                          isPaid
                            ? "Reabrir dívida para pendente"
                            : "Marcar dívida como 100% quitada"
                        }
                      >
                        {isPaid ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reabrir</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Marcar como Paga</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteDebt(debt.id)}
                        className="text-gray-500 hover:text-red-400 p-2 rounded-xl hover:bg-white/5 transition-colors"
                        title="Excluir dívida"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Credit Cards Management */}
      <div className="bg-[#121212] rounded-2xl p-6 border border-white/5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <CreditCardIcon className="w-4 h-4 text-blue-400" />
              <span>Gestão de Cartões de Crédito & Melhores Dias de Compra</span>
            </h3>
            <p className="text-xs text-gray-500">
              Controle limites, faturas e aproveite até 40 dias sem juros sabendo o dia de fechamento.
            </p>
          </div>

          <button
            id="btn-add-card"
            onClick={() => setShowAddCardModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Cartão</span>
          </button>
        </div>

        {/* Add Card Form Modal */}
        {showAddCardModal && (
          <form
            onSubmit={handleAddCard}
            className="my-3 p-4 bg-black/40 rounded-xl border border-white/10 space-y-3"
          >
            <div className="text-xs font-bold text-gray-200">
              Adicionar Cartão de Crédito
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                placeholder="Nome do Cartão (ex: Nubank UV)"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Banco Emissor (ex: Nubank, Itaú)"
                value={cardBank}
                onChange={(e) => setCardBank(e.target.value)}
                className="px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
              />
              <input
                type="color"
                value={cardColor}
                onChange={(e) => setCardColor(e.target.value)}
                className="h-9 w-full rounded-lg bg-[#181818] border border-white/10 cursor-pointer"
                title="Cor do Cartão"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <input
                type="number"
                step="100"
                placeholder="Limite Total (R$)"
                value={cardLimit}
                onChange={(e) =>
                  setCardLimit(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Fatura Atual (R$)"
                value={cardInvoice}
                onChange={(e) =>
                  setCardInvoice(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
              />
              <input
                type="number"
                min="1"
                max="31"
                placeholder="Dia Fechamento (ex: 25)"
                value={cardClosingDay}
                onChange={(e) => setCardClosingDay(Number(e.target.value))}
                className="px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
                required
              />
              <input
                type="number"
                min="1"
                max="31"
                placeholder="Dia Vencimento (ex: 5)"
                value={cardDueDay}
                onChange={(e) => setCardDueDay(Number(e.target.value))}
                className="px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
                required
              />
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddCardModal(false)}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm"
              >
                Salvar Cartão
              </button>
            </div>
          </form>
        )}

        {/* Credit Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {financeData.creditCards.map((card) => {
            const usagePercent =
              card.limit > 0
                ? Math.min(100, (card.currentInvoice / card.limit) * 100)
                : 0;
            const bestPurchaseDay =
              card.closingDay === 31 ? 1 : card.closingDay + 1;

            return (
              <div
                key={card.id}
                className="p-5 rounded-2xl border border-white/5 bg-[#181818] flex flex-col justify-between hover:shadow-md transition-shadow relative group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm"
                      style={{ backgroundColor: card.colorHex }}
                    >
                      💳
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {card.name}
                      </h4>
                      <span className="text-[11px] text-gray-500">
                        {card.bank}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 p-1 transition-opacity"
                    title="Excluir cartão"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">
                      Fatura Atual:{" "}
                      <strong className="text-white font-mono">
                        {formatBRL(card.currentInvoice)}
                      </strong>
                    </span>
                    <span className="text-gray-500 font-mono">
                      Limite: {formatBRL(card.limit)}
                    </span>
                  </div>

                  {/* Limit usage bar */}
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        usagePercent > 80
                          ? "bg-red-500"
                          : usagePercent > 50
                          ? "bg-amber-500"
                          : "bg-blue-500"
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[11px] text-center">
                    <div className="bg-black/40 p-2 rounded-xl border border-white/5">
                      <span className="text-gray-500 block text-[10px]">Fecha Dia</span>
                      <strong className="text-white">
                        {card.closingDay}
                      </strong>
                    </div>
                    <div className="bg-black/40 p-2 rounded-xl border border-white/5">
                      <span className="text-gray-500 block text-[10px]">Vence Dia</span>
                      <strong className="text-white">
                        {card.dueDay}
                      </strong>
                    </div>
                    <div className="bg-green-500/10 p-2 rounded-xl border border-green-500/20">
                      <span className="text-green-400 block text-[10px] font-bold">
                        Melhor Dia
                      </span>
                      <strong className="text-green-400 font-extrabold">
                        Dia {bestPurchaseDay}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
