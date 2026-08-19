import React, { useState } from "react";
import {
  Users,
  Plus,
  Trash2,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  DollarSign,
  Share2,
  RotateCcw,
  Receipt,
  HelpCircle,
} from "lucide-react";
import { BillSplitSession, SplitParticipant, UserFinanceData } from "../types";
import {
  formatBRL,
  calculateBillSettlements,
} from "../utils/financeCalculators";

interface BillSplitterSectionProps {
  financeData: UserFinanceData;
  onUpdateData: (newData: UserFinanceData) => void;
}

export const BillSplitterSection: React.FC<BillSplitterSectionProps> = ({
  financeData,
  onUpdateData,
}) => {
  // Active Split Session editing state
  const [sessionTitle, setSessionTitle] = useState(
    "Jantar & Passeio com Amigos"
  );
  const [splitMethod, setSplitMethod] = useState<
    "equal" | "custom_amount" | "percentage"
  >("equal");

  const [participants, setParticipants] = useState<SplitParticipant[]>([
    { id: "p-1", name: "Bruno", paidAmount: 1000 },
    { id: "p-2", name: "Ana", paidAmount: 50 },
    { id: "p-3", name: "Lucas", paidAmount: 150 },
  ]);

  const [customTotalInput, setCustomTotalInput] = useState<number | "">("");
  const [copiedSummary, setCopiedSummary] = useState(false);

  // New Participant inputs
  const [newName, setNewName] = useState("");
  const [newPaid, setNewPaid] = useState<number | "">("");

  // Total paid by all participants
  const sumPaid = participants.reduce((acc, p) => acc + (p.paidAmount || 0), 0);
  const totalBillAmount =
    customTotalInput !== "" && Number(customTotalInput) > 0
      ? Number(customTotalInput)
      : sumPaid > 0
      ? sumPaid
      : 1200;

  // Calculate settlement transactions
  const result = calculateBillSettlements(
    participants,
    totalBillAmount,
    splitMethod
  );

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newP: SplitParticipant = {
      id: `p-${Date.now()}`,
      name: newName.trim(),
      paidAmount: newPaid !== "" ? Number(newPaid) : 0,
    };

    setParticipants([...participants, newP]);
    setNewName("");
    setNewPaid("");
  };

  const handleRemoveParticipant = (id: string) => {
    if (participants.length <= 1) {
      alert("A conta precisa de pelo menos 1 participante.");
      return;
    }
    setParticipants(participants.filter((p) => p.id !== id));
  };

  const handleUpdatePaid = (id: string, amount: number) => {
    setParticipants(
      participants.map((p) => (p.id === id ? { ...p, paidAmount: amount } : p))
    );
  };

  const handleLoadClassicExample = () => {
    setSessionTitle("Exemplo: Jantar Bruno, Ana e Lucas");
    setSplitMethod("equal");
    setCustomTotalInput(1200);
    setParticipants([
      { id: "p-1", name: "Bruno", paidAmount: 1000 },
      { id: "p-2", name: "Ana", paidAmount: 50 },
      { id: "p-3", name: "Lucas", paidAmount: 150 },
    ]);
  };

  const handleSaveToHistory = () => {
    const newSession: BillSplitSession = {
      id: `split-${Date.now()}`,
      title: sessionTitle || "Divisão de Conta",
      totalAmount: totalBillAmount,
      splitMethod,
      participants,
      settlements: result.settlements,
    };

    onUpdateData({
      ...financeData,
      splitSessions: [newSession, ...(financeData.splitSessions || [])],
    });

    alert("Divisão de conta salva no histórico com sucesso!");
  };

  const handleCopyWhatsAppSummary = () => {
    let msg = `🧾 *RATEIO DE CONTA: ${sessionTitle}*\n`;
    msg += `💰 *Valor Total:* ${formatBRL(totalBillAmount)}\n`;
    msg += `👥 *Participantes:* ${participants.length} pessoas\n`;
    msg += `📊 *Cota por pessoa:* ${formatBRL(result.fairSharePerPerson)}\n\n`;

    msg += `*Quem pagou quanto:*\n`;
    participants.forEach((p) => {
      msg += `• ${p.name}: pagou ${formatBRL(p.paidAmount)}\n`;
    });

    msg += `\n*🤝 COMPENSAÇÃO DE PAGAMENTOS:*\n`;
    if (result.settlements.length === 0) {
      msg += `✅ As contas já estão perfeitamente equilibradas!\n`;
    } else {
      result.settlements.forEach((s) => {
        msg += `👉 *${s.from}* paga *${formatBRL(s.amount)}* para *${s.to}*\n`;
      });
    }

    msg += `\n_Calculado automaticamente pelo FinanSmart_ 🚀`;

    navigator.clipboard.writeText(msg);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Bill Splitter (Elegant Dark) */}
      <div className="bg-[#121212] text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20 mb-3">
              <Users className="w-3.5 h-3.5" />
              <span>Racha-Conta & Compensação Inteligente de Despesas</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Divisão Justa de Contas & Quem Paga Quanto
            </h2>
            <p className="text-sm text-gray-400 max-w-2xl mt-1.5 leading-relaxed">
              Algoritmo de compensação mínima: cada pessoa paga apenas a diferença para equilibrar os custos, sem confusão ou transferências desnecessárias.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              id="btn-load-example-split"
              onClick={handleLoadClassicExample}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-blue-400 text-xs font-bold border border-white/10 transition-all shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Carregar Exemplo (Bruno, Ana e Lucas)</span>
            </button>

            <button
              id="btn-copy-whatsapp-summary"
              onClick={handleCopyWhatsAppSummary}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-4 h-4 text-green-300" />
                  <span>Copiado para WhatsApp!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Copiar Resumo / PIX</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Splitter Interactive Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Participants & Payments */}
        <div className="lg:col-span-7 bg-[#121212] rounded-2xl p-6 border border-white/5 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-blue-400" />
                <span>Configuração da Conta & Participantes</span>
              </h3>
              <p className="text-xs text-gray-500">
                Informe o nome de cada pessoa e quanto cada uma já desembolsou.
              </p>
            </div>

            <div className="flex items-center space-x-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
              <span className="text-gray-400 font-medium">
                Total da Conta:
              </span>
              <input
                type="number"
                step="0.01"
                value={totalBillAmount}
                onChange={(e) =>
                  setCustomTotalInput(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="w-24 bg-transparent font-bold text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Session Title Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">
              Nome da Ocasião / Evento
            </label>
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="Ex: Jantar de Sexta, Aluguel da Casa de Praia..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
            />
          </div>

          {/* Add Participant Input Bar */}
          <form
            onSubmit={handleAddParticipant}
            className="p-3 bg-black/40 rounded-xl border border-white/10 flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              placeholder="Nome do Participante (ex: Juliana)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-lg bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Pagou quanto? (R$)"
              value={newPaid}
              onChange={(e) =>
                setNewPaid(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="w-full sm:w-36 px-3 py-2 text-xs rounded-lg bg-[#181818] border border-white/10 text-white focus:outline-blue-500"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-sm whitespace-nowrap"
            >
              + Adicionar
            </button>
          </form>

          {/* Participants Table / List */}
          <div className="divide-y divide-white/5">
            {participants.map((p) => {
              const b = result.balances.find((x) => x.participant.id === p.id);
              const net = b?.netBalance || 0;

              return (
                <div
                  key={p.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2 hover:bg-white/5 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {p.name}
                      </h4>
                      <span className="text-[11px] text-gray-500">
                        Cota justa: {formatBRL(b?.share || result.fairSharePerPerson)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-3">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[11px] text-gray-500">Pagou: R$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={p.paidAmount}
                        onChange={(e) =>
                          handleUpdatePaid(p.id, Number(e.target.value))
                        }
                        className="w-24 px-2 py-1 text-xs font-bold rounded-md bg-[#181818] border border-white/10 text-white font-mono"
                      />
                    </div>

                    <div className="w-28 text-right font-mono">
                      {net > 0 ? (
                        <span className="text-xs font-extrabold text-green-400">
                          Recebe {formatBRL(net)}
                        </span>
                      ) : net < 0 ? (
                        <span className="text-xs font-extrabold text-red-400">
                          Deve {formatBRL(Math.abs(net))}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-gray-500">
                          Zerado (R$ 0,00)
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleRemoveParticipant(p.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 p-1 transition-opacity"
                      title="Remover participante"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Exact Settlements (Quem paga para quem) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Settlement Solution Card */}
          <div className="bg-[#121212] rounded-2xl p-6 border border-white/5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Compensação de Pagamentos
                </h3>
              </div>
              <span className="text-xs font-semibold text-blue-400">
                {result.settlements.length} transferências
              </span>
            </div>

            {/* Quick Math Breakdown */}
            <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-xs space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-gray-400">
                <span>Valor Total da Conta:</span>
                <strong className="text-white">
                  {formatBRL(totalBillAmount)}
                </strong>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>Participantes ({participants.length}):</span>
                <strong className="text-blue-400">
                  {formatBRL(result.fairSharePerPerson)} / pessoa
                </strong>
              </div>
            </div>

            {/* Step by step payments */}
            <div className="space-y-2.5">
              {result.settlements.length === 0 ? (
                <div className="p-4 bg-black/40 rounded-xl text-center text-xs text-green-400 font-semibold border border-white/5">
                  🎉 As contas estão perfeitamente equilibradas! Ninguém precisa pagar nada.
                </div>
              ) : (
                result.settlements.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#181818] rounded-xl border border-white/5 flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-[10px] font-black">
                        {s.from.charAt(0)}
                      </span>
                      <strong className="text-xs text-white">
                        {s.from}
                      </strong>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                      <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-[10px] font-black">
                        {s.to.charAt(0)}
                      </span>
                      <strong className="text-xs text-white">
                        {s.to}
                      </strong>
                    </div>

                    <span className="text-xs sm:text-sm font-black text-green-400 bg-green-500/10 px-2.5 py-1 rounded-lg border border-green-500/20 font-mono">
                      {formatBRL(s.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Explanation for the user */}
            <p className="text-[11px] text-gray-500 leading-relaxed pt-1">
              ✨ <strong>Exemplo clássico:</strong> Se a conta foi R$ 1.200,00 e o rateio igual é R$ 400 por pessoa: Bruno que pagou R$ 1.000 recebe R$ 350 de Ana e R$ 250 de Lucas. Todos ficam com exatamente R$ 400 pagos.
            </p>

            <button
              onClick={handleSaveToHistory}
              className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/5 shadow-sm transition-colors"
            >
              Salvar no Histórico
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
