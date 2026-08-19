import React, { useState } from "react";
import {
  Plus,
  Trash2,
  DollarSign,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Percent,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  ExpenseCategory,
  ExpenseItem,
  IncomeCategory,
  IncomeItem,
  UserFinanceData,
} from "../types";
import {
  formatBRL,
  formatPercent,
  computeFinanceMetrics,
} from "../utils/financeCalculators";

interface IncomeExpenseSectionProps {
  financeData: UserFinanceData;
  onUpdateData: (newData: UserFinanceData) => void;
}

export const IncomeExpenseSection: React.FC<IncomeExpenseSectionProps> = ({
  financeData,
  onUpdateData,
}) => {
  const metrics = computeFinanceMetrics(financeData);

  // Modal / Form state for new Income
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [newIncomeDesc, setNewIncomeDesc] = useState("");
  const [newIncomeAmount, setNewIncomeAmount] = useState<number | "">("");
  const [newIncomeCat, setNewIncomeCat] = useState<IncomeCategory>("Salário CLT");

  // Modal / Form state for new Expense
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [newExpDesc, setNewExpDesc] = useState("");
  const [newExpAmount, setNewExpAmount] = useState<number | "">("");
  const [newExpCat, setNewExpCat] = useState<ExpenseCategory>("Alimentação");
  const [newExpIsFixed, setNewExpIsFixed] = useState(false);
  const [newExpDueDate, setNewExpDueDate] = useState("");

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncomeDesc || !newIncomeAmount || Number(newIncomeAmount) <= 0) return;

    const newItem: IncomeItem = {
      id: `inc-${Date.now()}`,
      description: newIncomeDesc,
      amount: Number(newIncomeAmount),
      category: newIncomeCat,
      isRecurring: true,
    };

    onUpdateData({
      ...financeData,
      incomes: [...financeData.incomes, newItem],
    });

    setNewIncomeDesc("");
    setNewIncomeAmount("");
    setShowIncomeModal(false);
  };

  const handleDeleteIncome = (id: string) => {
    onUpdateData({
      ...financeData,
      incomes: financeData.incomes.filter((i) => i.id !== id),
    });
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpDesc || !newExpAmount || Number(newExpAmount) <= 0) return;

    const newItem: ExpenseItem = {
      id: `exp-${Date.now()}`,
      description: newExpDesc,
      amount: Number(newExpAmount),
      category: newExpCat,
      isFixed: newExpIsFixed,
      dueDate: newExpDueDate || undefined,
    };

    onUpdateData({
      ...financeData,
      expenses: [...financeData.expenses, newItem],
    });

    setNewExpDesc("");
    setNewExpAmount("");
    setNewExpDueDate("");
    setShowExpenseModal(false);
  };

  const handleDeleteExpense = (id: string) => {
    onUpdateData({
      ...financeData,
      expenses: financeData.expenses.filter((e) => e.id !== id),
    });
  };

  // 50-30-20 benchmark scores
  const rule = metrics.rule503020;
  const isEssentialOk = rule.essential <= 55;
  const isLifestyleOk = rule.lifestyle <= 35;
  const isSavingsOk = rule.investments >= 15;

  return (
    <div className="space-y-6">
      {/* Top Diagnostics Banner (Elegant Dark) */}
      <div className="bg-[#121212] text-white rounded-2xl p-6 shadow-xl border border-white/5 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20 mb-2.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Diagnóstico de Renda & Fluxo de Caixa Mensal</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Análise Detalhada da sua Capacidade Financeira
            </h2>
            <p className="text-sm text-gray-400 max-w-2xl mt-1">
              Avaliação em tempo real de entradas, saídas fixas e variáveis e sua
              taxa de poupança para abastecer seus investimentos futuros.
            </p>
          </div>

          {/* Quick Cash Flow Stats Card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-black/40 p-4 rounded-xl border border-white/5">
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Renda Total</span>
              <span className="text-base sm:text-lg font-bold text-green-400">
                {formatBRL(metrics.totalIncome)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Despesas Totais</span>
              <span className="text-base sm:text-lg font-bold text-red-400">
                {formatBRL(metrics.totalExpenses)}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Sobra para Aportes</span>
              <span
                className={`text-base sm:text-lg font-bold ${
                  metrics.netSavingsMargin >= 0
                    ? "text-blue-400"
                    : "text-red-400"
                }`}
              >
                {formatBRL(metrics.netSavingsMargin)}
              </span>
            </div>
          </div>
        </div>

        {/* 50 / 30 / 20 Rule Analysis Bar */}
        <div className="mt-6 pt-5 border-t border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 text-xs">
            <span className="font-semibold text-gray-300 flex items-center space-x-1.5">
              <span>Distribuição da Regra de Ouro (50% / 30% / 20%)</span>
              <HelpCircle className="w-3.5 h-3.5 text-gray-500" />
            </span>
            <span className="text-gray-400">
              Taxa de Poupança Atual:{" "}
              <strong
                className={
                  metrics.savingsRate >= 20 ? "text-green-400" : "text-amber-400"
                }
              >
                {metrics.savingsRate.toFixed(1)}%
              </strong>
            </span>
          </div>

          <div className="w-full bg-white/5 rounded-full h-3 flex overflow-hidden">
            <div
              className="bg-blue-500 h-3 transition-all duration-500"
              style={{ width: `${Math.min(100, rule.essential)}%` }}
              title={`Necessidades: ${rule.essential.toFixed(1)}%`}
            />
            <div
              className="bg-purple-500 h-3 transition-all duration-500"
              style={{ width: `${Math.min(100 - rule.essential, rule.lifestyle)}%` }}
              title={`Estilo de Vida: ${rule.lifestyle.toFixed(1)}%`}
            />
            <div
              className="bg-green-500 h-3 transition-all duration-500"
              style={{
                width: `${Math.min(
                  100 - (rule.essential + rule.lifestyle),
                  rule.investments
                )}%`,
              }}
              title={`Investimentos/Sobra: ${rule.investments.toFixed(1)}%`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3.5 text-xs">
            <div className="flex items-center space-x-2 bg-white/5 p-2.5 rounded-xl border border-white/5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
              <div>
                <span className="text-gray-400">50% Necessidades: </span>
                <strong className={isEssentialOk ? "text-blue-400" : "text-red-400"}>
                  {rule.essential.toFixed(1)}% ({formatBRL(metrics.totalFixedExpenses)})
                </strong>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-white/5 p-2.5 rounded-xl border border-white/5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
              <div>
                <span className="text-gray-400">30% Estilo de Vida: </span>
                <strong className={isLifestyleOk ? "text-purple-400" : "text-red-400"}>
                  {rule.lifestyle.toFixed(1)}% ({formatBRL(metrics.totalVariableExpenses)})
                </strong>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-white/5 p-2.5 rounded-xl border border-white/5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
              <div>
                <span className="text-gray-400">20% Investimentos: </span>
                <strong className={isSavingsOk ? "text-green-400" : "text-amber-400"}>
                  {rule.investments.toFixed(1)}% ({formatBRL(Math.max(0, metrics.netSavingsMargin))})
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Columns: Incomes vs Expenses (Elegant Dark Surfaces) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incomes Column */}
        <div className="bg-[#121212] rounded-2xl p-6 border border-white/5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Fontes de Renda & Entradas
                </h3>
                <p className="text-xs text-gray-500">
                  Total mensal: {formatBRL(metrics.totalIncome)}
                </p>
              </div>
            </div>

            <button
              id="btn-add-income"
              onClick={() => setShowIncomeModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-semibold border border-green-500/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Renda</span>
            </button>
          </div>

          {/* Income Form Inline */}
          {showIncomeModal && (
            <form
              onSubmit={handleAddIncome}
              className="my-3 p-4 bg-black/40 rounded-xl border border-white/10 space-y-3"
            >
              <div className="text-xs font-bold text-gray-200">
                Adicionar Nova Fonte de Renda
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Ex: Salário, Freelance..."
                  value={newIncomeDesc}
                  onChange={(e) => setNewIncomeDesc(e.target.value)}
                  className="px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Valor em R$"
                  value={newIncomeAmount}
                  onChange={(e) =>
                    setNewIncomeAmount(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
                  required
                />
                <select
                  value={newIncomeCat}
                  onChange={(e) => setNewIncomeCat(e.target.value as IncomeCategory)}
                  className="px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
                >
                  <option value="Salário CLT">Salário CLT</option>
                  <option value="Pró-labore / PJ">Pró-labore / PJ</option>
                  <option value="Freelance / Extra">Freelance / Extra</option>
                  <option value="Rendimentos & Dividendos">Rendimentos & Dividendos</option>
                  <option value="Aluguéis">Aluguéis</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowIncomeModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold bg-green-600 hover:bg-green-500 text-white rounded-lg shadow-sm"
                >
                  Salvar Renda
                </button>
              </div>
            </form>
          )}

          {/* Income List */}
          <div className="divide-y divide-white/5 mt-3">
            {financeData.incomes.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">
                Nenhuma renda cadastrada. Clique em "Nova Renda".
              </p>
            ) : (
              financeData.incomes.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between hover:bg-white/5 px-2 rounded-lg transition-colors group"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {item.description}
                    </p>
                    <span className="text-[10px] font-medium text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-green-400 font-mono">
                      +{formatBRL(item.amount)}
                    </span>
                    <button
                      onClick={() => handleDeleteIncome(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 p-1 transition-opacity"
                      title="Excluir renda"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expenses Column */}
        <div className="bg-[#121212] rounded-2xl p-6 border border-white/5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Despesas & Custos do Mês
                </h3>
                <p className="text-xs text-gray-500">
                  Fixas: {formatBRL(metrics.totalFixedExpenses)} | Variáveis:{" "}
                  {formatBRL(metrics.totalVariableExpenses)}
                </p>
              </div>
            </div>

            <button
              id="btn-add-expense"
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Despesa</span>
            </button>
          </div>

          {/* Expense Form Inline */}
          {showExpenseModal && (
            <form
              onSubmit={handleAddExpense}
              className="my-3 p-4 bg-black/40 rounded-xl border border-white/10 space-y-3"
            >
              <div className="text-xs font-bold text-gray-200">
                Adicionar Nova Despesa
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Ex: Aluguel, Mercado, Luz..."
                  value={newExpDesc}
                  onChange={(e) => setNewExpDesc(e.target.value)}
                  className="px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Valor em R$"
                  value={newExpAmount}
                  onChange={(e) =>
                    setNewExpAmount(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={newExpCat}
                  onChange={(e) => setNewExpCat(e.target.value as ExpenseCategory)}
                  className="px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
                >
                  <option value="Moradia">Moradia</option>
                  <option value="Alimentação">Alimentação</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Saúde">Saúde</option>
                  <option value="Educação">Educação</option>
                  <option value="Lazer & Estilo de Vida">Lazer & Estilo de Vida</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Dívidas & Empréstimos">Dívidas & Empréstimos</option>
                  <option value="Outros">Outros</option>
                </select>

                <div className="flex items-center space-x-2 px-3 py-2 bg-[#181818] rounded-lg border border-white/10">
                  <input
                    type="checkbox"
                    id="chk-is-fixed"
                    checked={newExpIsFixed}
                    onChange={(e) => setNewExpIsFixed(e.target.checked)}
                    className="rounded bg-black border-white/20 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="chk-is-fixed"
                    className="text-xs text-gray-300 select-none cursor-pointer"
                  >
                    Gasto Fixo / Essencial
                  </label>
                </div>

                <input
                  type="text"
                  placeholder="Dia Venc. (ex: 10)"
                  value={newExpDueDate}
                  onChange={(e) => setNewExpDueDate(e.target.value)}
                  className="px-3 py-2 rounded-lg text-xs bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-sm"
                >
                  Salvar Despesa
                </button>
              </div>
            </form>
          )}

          {/* Expense List */}
          <div className="divide-y divide-white/5 mt-3">
            {financeData.expenses.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">
                Nenhuma despesa cadastrada. Clique em "Nova Despesa".
              </p>
            ) : (
              financeData.expenses.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between hover:bg-white/5 px-2 rounded-lg transition-colors group"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-white">
                        {item.description}
                      </p>
                      {item.isFixed && (
                        <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.2 rounded">
                          Fixo
                        </span>
                      )}
                      {item.dueDate && (
                        <span className="text-[10px] text-gray-500">
                          Vence dia {item.dueDate}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-gray-400">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-red-400 font-mono">
                      -{formatBRL(item.amount)}
                    </span>
                    <button
                      onClick={() => handleDeleteExpense(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 p-1 transition-opacity"
                      title="Excluir despesa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
