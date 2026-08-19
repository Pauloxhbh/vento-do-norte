import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  PieChart,
  Target,
  Flame,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { AIChatMessage, AIDiagnosisResult, UserFinanceData } from "../types";
import { formatBRL, computeFinanceMetrics } from "../utils/financeCalculators";

interface AIBrokerSectionProps {
  financeData: UserFinanceData;
  onUpdateData: (newData: UserFinanceData) => void;
  initialPrompt?: string;
}

export const AIBrokerSection: React.FC<AIBrokerSectionProps> = ({
  financeData,
  onUpdateData,
  initialPrompt,
}) => {
  const metrics = computeFinanceMetrics(financeData);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Chat State
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: "welcome-msg",
      role: "model",
      content: `Olá! Eu sou o seu **FinanSmart Broker**, seu consultor financeiro e corretor de investimentos pessoal certificado.\n\nAnalisei o seu patrimônio atual de **${formatBRL(
        metrics.totalInvestments
      )}**, sua margem mensal de **${formatBRL(
        metrics.netSavingsMargin
      )}** e sua meta de **${formatBRL(
        financeData.goal.targetAmount
      )}**.\n\nComo posso te ajudar a fazer seu dinheiro render mais hoje? Posso montar uma carteira de CDB/LCI/Tesouro/Ações/Cripto, otimizar sua quitação de dívidas ou simular seus prazos!`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isGeneratingDiagnosis, setIsGeneratingDiagnosis] = useState(false);

  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoadingChat]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoadingChat) return;

    const userMsg: AIChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoadingChat(true);

    try {
      const response = await fetch("/api/advisor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-8).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userFinanceSummary: {
            totalIncome: metrics.totalIncome,
            totalExpenses: metrics.totalExpenses,
            netSavingsMargin: metrics.netSavingsMargin,
            totalInvestments: metrics.totalInvestments,
            totalDebts: metrics.totalDebts,
            debtsList: financeData.debts.map((d) => ({
              name: d.name,
              balance: d.totalBalance,
              monthlyInterest: d.monthlyInterestRate,
            })),
            investmentsList: financeData.investments.map((i) => ({
              name: i.name,
              category: i.category,
              currentValue: i.currentValue,
            })),
            goal: financeData.goal,
          },
        }),
      });

      let replyText = "";
      if (response.ok) {
        const data = await response.json();
        replyText = data.reply || data.error;
      }

      if (!replyText) {
        // Intelligent client-side fallback for static hosts like GitHub Pages
        const lower = text.toLowerCase();
        if (lower.includes("dívida") || lower.includes("divida") || lower.includes("cartão") || lower.includes("juros")) {
          const highestDebt = [...financeData.debts].sort((a, b) => b.annualInterestRate - a.annualInterestRate)[0];
          replyText = `💡 **Recomendação Estratégica de Dívidas (Método Avalanche):**\n\n${
            highestDebt
              ? `Priorize quitar imediatamente a dívida **${highestDebt.name}** (${highestDebt.annualInterestRate}% a.a. / ${highestDebt.monthlyInterestRate}% a.m.). Juros de cheque especial e rotativo de cartão destroem o patrimônio mais rápido do que qualquer investimento rende.`
              : `Você não possui dívidas ativas pendentes cadastradas! Continue mantendo sua reserva de emergência e focando nos aportes mensais.`
          }\n\nSua margem líquida atual para aportes é de **${formatBRL(metrics.netSavingsMargin)}/mês**.`;
        } else if (lower.includes("cdb") || lower.includes("cdi") || lower.includes("renda fixa") || lower.includes("tesouro") || lower.includes("5.000") || lower.includes("primeiros")) {
          replyText = `📊 **Guia de Renda Fixa & Primeiros Investimentos:**\n\n1. **Reserva de Emergência (6 meses de gastos = ${formatBRL(metrics.totalExpenses * 6)}):** Aplique em Tesouro Selic ou CDB com liquidez diária a 100%+ do CDI.\n2. **Curto a Médio Prazo (1 a 3 anos):** CDBs de 110% a 125% do CDI e LCIs/LCAs com isenção de Imposto de Renda.\n3. **Proteção Inflacionária (Longo Prazo):** Tesouro IPCA+ para garantir ganho real acima da inflação.`;
        } else if (lower.includes("fii") || lower.includes("imobili") || lower.includes("ação") || lower.includes("ações") || lower.includes("dividendo")) {
          replyText = `🏢 **Renda Variável & FIIs (Geração de Renda Mensal):**\n\n- **Fundos Imobiliários (FIIs):** Excelente para receber aluguéis mensais isentos de IR na sua conta. Foque em fundos de tijolo (galpões logísticos e lajes corporativas premium) com histórico consistente.\n- **Ações de Valor e Dividendos:** Empresas sólidas em setores perenes (bancos, energia elétrica, saneamento e seguros) que repassam lucros robustos.`;
        } else if (lower.includes("cripto") || lower.includes("bitcoin") || lower.includes("btc") || lower.includes("eth")) {
          replyText = `⚡ **Alocação em Criptoativos (Risco Assimétrico):**\n\n- Recomendamos destinar entre **1% e 5%** do seu patrimônio total em **Bitcoin (BTC)** e **Ethereum (ETH)** como proteção e potencial de valorização global.\n- Nunca comprometa sua reserva de emergência com ativos voláteis.`;
        } else {
          replyText = `📈 **Diagnóstico do FinanSmart Broker:**\n\n- **Patrimônio Atual:** ${formatBRL(metrics.totalInvestments)}\n- **Capacidade de Aporte:** ${formatBRL(metrics.netSavingsMargin)}/mês (${metrics.savingsRate.toFixed(1)}% da renda)\n- **Meta Alvo:** ${formatBRL(financeData.goal.targetAmount)}\n\nPara acelerar sua meta, recomendamos manter uma distribuição balanceada: 60% em Renda Fixa/CDI seguro, 30% em FIIs e Ações geradoras de dividendos, e até 5% em Criptoativos.`;
        }
      }

      const modelMsg: AIChatMessage = {
        id: `model-${Date.now()}`,
        role: "model",
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      // Fallback on network fail
      const modelMsg: AIChatMessage = {
        id: `model-${Date.now()}`,
        role: "model",
        content: `📈 **Consultoria Financeira Rápida:**\nCom sua margem de **${formatBRL(metrics.netSavingsMargin)}/mês** e patrimônio de **${formatBRL(metrics.totalInvestments)}**, você está no caminho certo para atingir **${formatBRL(financeData.goal.targetAmount)}**. Foque em diversificar entre CDI com liquidez diária, LCIs isentas e Fundos Imobiliários!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, modelMsg]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleGenerateDiagnosis = async () => {
    setIsGeneratingDiagnosis(true);
    try {
      const response = await fetch("/api/advisor/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userFinanceSummary: {
            totalIncome: metrics.totalIncome,
            totalExpenses: metrics.totalExpenses,
            netSavingsMargin: metrics.netSavingsMargin,
            totalInvestments: metrics.totalInvestments,
            totalDebts: metrics.totalDebts,
            debts: financeData.debts,
            investments: financeData.investments,
            goal: financeData.goal,
          },
        }),
      });

      if (response.ok) {
        const data: AIDiagnosisResult = await response.json();
        if (data && data.financialHealthScore) {
          onUpdateData({
            ...financeData,
            aiDiagnosis: data,
          });
          return;
        }
      }
      throw new Error("Static fallback");
    } catch (err) {
      // Client-side calculated executive diagnosis fallback for static deployments
      const score = Math.min(
        100,
        Math.max(
          20,
          Math.round(
            (metrics.savingsRate > 20 ? 40 : metrics.savingsRate * 2) +
            (metrics.totalInvestments > metrics.totalExpenses * 6 ? 40 : (metrics.totalInvestments / (metrics.totalExpenses * 6 || 1)) * 40) -
            (metrics.totalDebts > 0 ? 20 : 0) +
            20
          )
        )
      );

      const status: "Excelente" | "Bom" | "Atenção" | "Crítico" =
        score >= 80 ? "Excelente" : score >= 60 ? "Bom" : score >= 40 ? "Atenção" : "Crítico";

      const fallbackDiagnosis: AIDiagnosisResult = {
        financialHealthScore: score,
        healthStatus: status,
        summary: `Você poupa ${metrics.savingsRate.toFixed(1)}% da sua renda com patrimônio acumulado de ${formatBRL(metrics.totalInvestments)}. Sua estrutura financeira possui excelente potencial de crescimento.`,
        strengths: [
          `Margem de poupança positiva de ${formatBRL(metrics.netSavingsMargin)} por mês`,
          `Patrimônio investido de ${formatBRL(metrics.totalInvestments)} gerando renda passiva`,
        ],
        risks: metrics.totalDebts > 0
          ? [`Presença de ${formatBRL(metrics.totalDebts)} em dívidas ativas que consom juros`]
          : [`Mantenha sua reserva de emergência atualizada contra imprevistos`],
        debtAdvice: metrics.totalDebts > 0
          ? "Abata prioritariamente as dívidas de maior taxa mensal/anual utilizando o método Avalanche."
          : "Parabéns! Sem dívidas ativas onerosas. Todo o seu excedente pode ser direcionado para investimentos com juros compostos a seu favor.",
        investmentAllocation: [
          { category: "Renda Fixa & Reserva (CDB/Tesouro Selic)", percentage: 50, reason: "Liquidez imediata e segurança" },
          { category: "Proteção Inflacionária (IPCA+/LCI)", percentage: 20, reason: "Garante poder de compra e isenção fiscal" },
          { category: "Renda Variável & FIIs", percentage: 25, reason: "Geração de dividendos mensais crescentes" },
          { category: "Criptoativos & Inovação (BTC/ETH)", percentage: 5, reason: "Exposição assimétrica e descorrelação" },
        ],
        milestonePlan: `Mantendo seus aportes mensais de ${formatBRL(metrics.netSavingsMargin > 0 ? metrics.netSavingsMargin : 1500)}, você avança consistentemente em direção à sua meta de ${formatBRL(financeData.goal.targetAmount)}.`,
        topTips: [
          "Reinvista 100% dos dividendos recebidos para acelerar o efeito bola de neve.",
          "Compare sempre a rentabilidade líquida entre CDB e LCI/LCA.",
          "Evite rotativo de cartão de crédito e cheque especial a todo custo.",
        ],
      };

      onUpdateData({
        ...financeData,
        aiDiagnosis: fallbackDiagnosis,
      });
    } finally {
      setIsGeneratingDiagnosis(false);
    }
  };

  const quickPrompts = [
    "Onde devo investir meus primeiros R$ 5.000?",
    "Vale mais a pena quitar minha dívida de maior juro ou investir em CDB 120%?",
    "Quais as melhores dicas para começar a investir em Fundos Imobiliários (FIIs)?",
    "Qual porcentagem de Bitcoin devo ter na minha carteira?",
    "Como acelerar minha meta de R$ 500.000?",
  ];

  const diagnosis = financeData.aiDiagnosis;

  return (
    <div className="space-y-6">
      {/* Top Banner: AI Financial Broker (Elegant Dark) */}
      <div className="bg-[#121212] text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Corretor de Investimentos & Consultoria Financeira com Gemini AI</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Seu Consultor Financeiro Particular 24/7
            </h2>
            <p className="text-sm text-gray-400 max-w-2xl mt-1.5 leading-relaxed">
              Receba análises matemáticas em tempo real, recomendações de carteira alinhadas ao mercado brasileiro (CDI, Selic, IPCA+, Ações B3, FIIs e Cripto) e planos estratégicos para estancar dívidas.
            </p>
          </div>

          <button
            id="btn-generate-diagnosis"
            onClick={handleGenerateDiagnosis}
            disabled={isGeneratingDiagnosis}
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 whitespace-nowrap"
          >
            {isGeneratingDiagnosis ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analisando Finanças...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-blue-200" />
                <span>{diagnosis ? "Atualizar Diagnóstico IA" : "Gerar Diagnóstico IA"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Financial Health Diagnosis Card (If available) */}
      {diagnosis && (
        <div className="bg-[#121212] rounded-2xl p-6 border border-white/5 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-base border border-blue-500/30">
                {diagnosis.financialHealthScore}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Diagnóstico Executivo de Saúde Financeira
                </h3>
                <span className="text-xs font-semibold text-green-400">
                  Status: {diagnosis.healthStatus} • Score: {diagnosis.financialHealthScore}/100
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium bg-black/40 p-4 rounded-xl border border-white/5">
            {diagnosis.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Strengths */}
            <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20 space-y-2">
              <span className="font-bold text-green-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Pontos Fortes da Carteira</span>
              </span>
              <ul className="space-y-1 text-gray-300">
                {diagnosis.strengths?.map((s, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-green-400 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks & Debt Advice */}
            <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20 space-y-2">
              <span className="font-bold text-red-400 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Riscos & Plano de Dívidas</span>
              </span>
              <p className="text-gray-300 leading-relaxed">
                {diagnosis.debtAdvice}
              </p>
            </div>
          </div>

          {/* Recommended Allocation from AI */}
          {diagnosis.investmentAllocation && (
            <div className="space-y-2.5 pt-2 border-t border-white/5">
              <span className="text-xs font-bold text-gray-300 flex items-center space-x-1.5">
                <PieChart className="w-4 h-4 text-blue-400" />
                <span>Alocação Ideal Recomendada pelo Corretor:</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {diagnosis.investmentAllocation.map((alloc, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-black/40 rounded-xl border border-white/5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-white">
                        {alloc.category}
                      </span>
                      <span className="text-xs font-black text-blue-400">
                        {alloc.percentage}%
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1 leading-normal">
                      {alloc.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Chat Console with the Broker */}
      <div className="bg-[#121212] rounded-2xl border border-white/5 shadow-sm flex flex-col h-[560px] overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#181818]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>FinanSmart AI Broker</span>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </h3>
              <p className="text-[11px] text-gray-500">
                Especialista em Mercado Financeiro, CDBs, FIIs, Ações e Cripto
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              setMessages([
                {
                  id: `welcome-${Date.now()}`,
                  role: "model",
                  content: "Chat reiniciado! Como posso ajudar em seus investimentos hoje?",
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ])
            }
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Limpar conversa"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isUser = m.role === "user";

            return (
              <div
                key={m.id}
                className={`flex items-start space-x-2.5 ${
                  isUser ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? "bg-white/10 text-white"
                      : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? "bg-blue-600 text-white rounded-tr-xs shadow-sm"
                      : "bg-[#181818] text-gray-200 rounded-tl-xs border border-white/5"
                  }`}
                >
                  {m.content}
                  <span
                    className={`block text-[9px] mt-1.5 text-right ${
                      isUser ? "text-blue-200" : "text-gray-500"
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoadingChat && (
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-[#181818] rounded-2xl px-4 py-2.5 text-xs text-gray-400 animate-pulse border border-white/5">
                O Corretor IA está calculando e formulando as melhores dicas...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 bg-black/40 border-t border-white/5 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1 rounded-full text-[11px] font-medium bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5 whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 border-t border-white/5 bg-[#181818] flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Pergunte ao seu Corretor IA sobre investimentos, CDBs, ações, dividendos ou dívidas..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoadingChat}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-black/40 border border-white/10 focus:border-blue-500 text-white focus:outline-none placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={isLoadingChat || !inputMessage.trim()}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
