export type AppTab =
  | "diagnosis"
  | "roadmap"
  | "investments"
  | "debts"
  | "billsplit"
  | "advisor";

export type ExpenseCategory =
  | "Moradia"
  | "Alimentação"
  | "Transporte"
  | "Saúde"
  | "Educação"
  | "Lazer & Estilo de Vida"
  | "Cartão de Crédito"
  | "Dívidas & Empréstimos"
  | "Investimentos"
  | "Outros";

export type IncomeCategory =
  | "Salário CLT"
  | "Pró-labore / PJ"
  | "Freelance / Extra"
  | "Rendimentos & Dividendos"
  | "Aluguéis"
  | "Outros";

export interface IncomeItem {
  id: string;
  description: string;
  amount: number;
  category: IncomeCategory;
  isRecurring: boolean;
}

export interface ExpenseItem {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  isFixed: boolean;
  dueDate?: string;
}

export interface CreditCard {
  id: string;
  name: string;
  bank: string;
  limit: number;
  currentInvoice: number;
  closingDay: number;
  dueDay: number;
  colorHex: string;
}

export interface DebtItem {
  id: string;
  name: string;
  creditor: string;
  totalBalance: number; // Saldo devedor atual / principal
  principalAmount?: number; // Valor original principal
  annualInterestRate: number; // Taxa de juros anual % a.a.
  monthlyInterestRate: number; // Taxa de juros mensal % a.m.
  minimumPayment?: number;
  dueDate?: string; // Data de vencimento (ex: "2026-09-30")
  termMonths?: number; // Prazo estimado para quitação
  category: "Cartão de Crédito" | "Cheque Especial" | "Empréstimo Pessoal" | "Financiamento Imob/Auto" | "Outro";
  notes?: string;
  isPaid?: boolean; // Marcar como paga
  paidDate?: string; // Data em que foi quitada
}

export type InvestmentCategory =
  | "Renda Fixa (CDB / LCI / LCA)"
  | "Tesouro Direto"
  | "Fundos Imobiliários (FIIs)"
  | "Ações Brasil (B3)"
  | "ETFs & Ativos Globais"
  | "Criptomoedas (BTC / ETH)"
  | "Reserva de Emergência";

export interface InvestmentAsset {
  id: string;
  name: string;
  ticker?: string;
  category: InvestmentCategory;
  investedAmount: number;
  currentValue: number;
  expectedAnnualReturn: number; // in % (e.g. 12.5)
  monthlyYieldEstimated?: number; // e.g. dividendos mensais
  institution: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number; // e.g. R$ 100.000 ou R$ 1.000.000
  initialAmount: number;
  monthlyContribution: number;
  annualInterestRate: number; // e.g. 11.5% a.a. real
  startDate: string;
  targetDate?: string;
  category: "Independência Financeira" | "Reserva de Emergência" | "Comprar Imóvel" | "Viagem dos Sonhos" | "Meta Personalizada";
}

export interface SplitParticipant {
  id: string;
  name: string;
  paidAmount: number;
  assignedShare?: number; // if custom split
}

export interface SplitSettlement {
  from: string;
  to: string;
  amount: number;
}

export interface BillSplitSession {
  id: string;
  title: string;
  totalAmount: number;
  splitMethod: "equal" | "custom_amount" | "percentage";
  participants: SplitParticipant[];
  settlements: SplitSettlement[];
}

export interface AIChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface AIDiagnosisResult {
  financialHealthScore: number;
  healthStatus: "Excelente" | "Bom" | "Atenção" | "Crítico";
  summary: string;
  strengths: string[];
  risks: string[];
  debtAdvice: string;
  investmentAllocation: {
    category: string;
    percentage: number;
    reason: string;
  }[];
  milestonePlan: string;
  topTips: string[];
}

export interface UserFinanceData {
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  creditCards: CreditCard[];
  debts: DebtItem[];
  investments: InvestmentAsset[];
  goal: FinancialGoal;
  splitSessions: BillSplitSession[];
  aiDiagnosis?: AIDiagnosisResult | null;
}
