import {
  DebtItem,
  FinancialGoal,
  InvestmentAsset,
  SplitParticipant,
  SplitSettlement,
  UserFinanceData,
} from "../types";

// Currency Formatter BRL
export function formatBRL(value: number): string {
  if (isNaN(value) || value === null || value === undefined) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Percentage Formatter
export function formatPercent(value: number, decimals = 2): string {
  if (isNaN(value) || value === null || value === undefined) return "0,00%";
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}

// Months to Text (e.g. 2 anos e 4 meses)
export function formatMonthsToTime(months: number): string {
  if (!isFinite(months) || months <= 0) return "0 meses";
  if (months > 1200) return "+100 anos";
  
  const years = Math.floor(months / 12);
  const remainingMonths = Math.round(months % 12);

  if (years === 0) {
    return `${remainingMonths} ${remainingMonths === 1 ? "mês" : "meses"}`;
  }
  if (remainingMonths === 0) {
    return `${years} ${years === 1 ? "ano" : "anos"}`;
  }
  return `${years} ${years === 1 ? "ano" : "anos"} e ${remainingMonths} ${
    remainingMonths === 1 ? "mês" : "meses"
  }`;
}

// Format Date string DD/MM/YYYY
export function formatDateBR(dateStr?: string): string {
  if (!dateStr) return "Sem data";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

// Split Bill Calculator (Algoritmo de compensação de dívidas mínimas)
export function calculateBillSettlements(
  participants: SplitParticipant[],
  totalAmount: number,
  splitMethod: "equal" | "custom_amount" | "percentage" = "equal"
): {
  settlements: SplitSettlement[];
  fairSharePerPerson: number;
  balances: { participant: SplitParticipant; netBalance: number; share: number }[];
} {
  if (!participants || participants.length === 0) {
    return { settlements: [], fairSharePerPerson: 0, balances: [] };
  }

  const count = participants.length;
  let shares: number[] = [];

  if (splitMethod === "equal") {
    const fairShare = totalAmount / count;
    shares = participants.map(() => fairShare);
  } else if (splitMethod === "percentage") {
    shares = participants.map((p) => (totalAmount * (p.assignedShare || 0)) / 100);
  } else {
    shares = participants.map((p) => p.assignedShare || 0);
  }

  const balances = participants.map((p, index) => {
    const share = shares[index] || 0;
    const netBalance = Math.round((p.paidAmount - share) * 100) / 100;
    return {
      participant: p,
      netBalance,
      share,
    };
  });

  interface Party {
    name: string;
    amount: number;
  }

  const debtors: Party[] = [];
  const creditors: Party[] = [];

  for (const b of balances) {
    if (b.netBalance < -0.01) {
      debtors.push({ name: b.participant.name, amount: Math.abs(b.netBalance) });
    } else if (b.netBalance > 0.01) {
      creditors.push({ name: b.participant.name, amount: b.netBalance });
    }
  }

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements: SplitSettlement[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settled = Math.min(debtor.amount, creditor.amount);
    if (settled > 0.01) {
      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: Math.round(settled * 100) / 100,
      });
    }

    debtor.amount -= settled;
    creditor.amount -= settled;

    if (debtor.amount <= 0.01) dIdx++;
    if (creditor.amount <= 0.01) cIdx++;
  }

  return {
    settlements,
    fairSharePerPerson: totalAmount / count,
    balances,
  };
}

// Compound Interest Roadmap Projector
export interface MilestoneCheckpoint {
  percentage: number;
  label: string;
  targetValue: number;
  monthReached: number;
  projectedDate: string;
  accumulatedContributions: number;
  accumulatedInterest: number;
  monthlyPassiveIncome: number;
  isReached: boolean;
}

export interface TrajectoryPoint {
  month: number;
  dateStr: string;
  totalBalance: number;
  totalInvested: number;
  totalInterest: number;
  monthlyPassiveIncome: number;
}

export function projectFinancialRoadmap(
  initialAmount: number,
  monthlyContribution: number,
  annualReturn: number,
  targetAmount: number
): {
  monthsToGoal: number;
  projectedTargetDate: string;
  milestones: MilestoneCheckpoint[];
  trajectory: TrajectoryPoint[];
  monthlyInterestRate: number;
} {
  const initial = initialAmount || 0;
  const target = targetAmount || 500000;
  const monthlyContrib = monthlyContribution || 0;
  const annualRate = (annualReturn || 10.5) / 100;
  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;

  const milestonesPercentages = [0.1, 0.25, 0.5, 0.75, 1.0];
  const milestoneLabels = [
    "Primeiro Marco (10%)",
    "Primeiro Quarto (25%)",
    "Meio Caminho (50%)",
    "Reta Final (75%)",
    "Independência / Meta Total (100%)",
  ];

  let currentBalance = initial;
  let totalInvested = initial;
  let totalInterest = 0;
  let months = 0;
  const maxMonths = 600; // 50 years max safety limit

  const trajectory: TrajectoryPoint[] = [
    {
      month: 0,
      dateStr: "Hoje",
      totalBalance: Math.round(initial),
      totalInvested: Math.round(initial),
      totalInterest: 0,
      monthlyPassiveIncome: Math.round(initial * 0.008),
    },
  ];

  const today = new Date();

  const milestones: MilestoneCheckpoint[] = milestonesPercentages.map((pct, i) => {
    const val = target * pct;
    const isReached = initial >= val;
    return {
      percentage: pct * 100,
      label: milestoneLabels[i],
      targetValue: val,
      monthReached: isReached ? 0 : 0,
      projectedDate: isReached ? "Já alcançado" : "",
      accumulatedContributions: isReached ? initial : 0,
      accumulatedInterest: 0,
      monthlyPassiveIncome: val * 0.008,
      isReached,
    };
  });

  while (currentBalance < target && months < maxMonths) {
    months++;
    const interestEarned = currentBalance * monthlyRate;
    currentBalance += interestEarned + monthlyContrib;
    totalInvested += monthlyContrib;
    totalInterest += interestEarned;

    for (const m of milestones) {
      if (!m.isReached && currentBalance >= m.targetValue) {
        m.isReached = true;
        m.monthReached = months;
        m.projectedDate = formatMonthYear(today, months);
        m.accumulatedContributions = totalInvested;
        m.accumulatedInterest = totalInterest;
      }
    }

    if (months <= 36 || months % 3 === 0 || currentBalance >= target) {
      trajectory.push({
        month: months,
        dateStr: formatMonthYear(today, months),
        totalBalance: Math.round(currentBalance),
        totalInvested: Math.round(totalInvested),
        totalInterest: Math.round(totalInterest),
        monthlyPassiveIncome: Math.round(currentBalance * 0.008),
      });
    }
  }

  for (const m of milestones) {
    if (!m.projectedDate) {
      m.projectedDate = months >= maxMonths ? "+50 anos" : formatMonthYear(today, months);
      m.monthReached = months;
      m.accumulatedContributions = totalInvested;
      m.accumulatedInterest = totalInterest;
    }
  }

  const projectedTargetDate =
    initial >= target
      ? "Meta já alcançada!"
      : months >= maxMonths
      ? "+50 anos (aumente o aporte)"
      : formatMonthYear(today, months);

  return {
    monthsToGoal: months,
    projectedTargetDate,
    milestones,
    trajectory,
    monthlyInterestRate: monthlyRate * 100,
  };
}

export function projectMonetaryRoadmap(
  goal: FinancialGoal,
  currentInvestments: number,
  monthlyMargin: number
) {
  return projectFinancialRoadmap(
    currentInvestments || goal.initialAmount || 0,
    monthlyMargin > 0 ? monthlyMargin : goal.monthlyContribution || 1000,
    goal.annualInterestRate || 10.5,
    goal.targetAmount || 500000
  );
}

function formatMonthYear(baseDate: Date, addMonths: number): string {
  const d = new Date(baseDate.getFullYear(), baseDate.getMonth() + addMonths, 1);
  const monthNames = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ];
  return `${monthNames[d.getMonth()]}/${d.getFullYear().toString().slice(2)}`;
}

// ----------------------------------------------------
// Robust Debt Payoff & Interest Accumulation Engine
// ----------------------------------------------------
export interface DebtPrioritizedItem extends DebtItem {
  principal: number;
  annualInterestRate: number;
  monthlyInterestRate: number;
  monthlyInterestAmount: number;
  accumulatedInterest: number; // Juros acumulados calculados
  totalPayableAmount: number; // Principal + Juros acumulados
  priorityRank: number;
  priorityReason: string;
  daysUntilDue?: number;
  dueStatus: "overdue" | "due_today" | "upcoming" | "future" | "paid" | "no_date";
  dueStatusText: string;
}

/**
 * Calculates accumulated interest and total payable for a given debt.
 */
export function calculateDebtAccumulatedInterest(
  principal: number,
  annualRate: number,
  monthlyRate: number,
  dueDateStr?: string,
  termMonths?: number
): {
  accumulatedInterest: number;
  totalPayable: number;
  effectiveMonths: number;
  daysUntilDue?: number;
  dueStatus: "overdue" | "due_today" | "upcoming" | "future" | "paid" | "no_date";
  dueStatusText: string;
} {
  const now = new Date();
  let daysUntilDue: number | undefined = undefined;
  let dueStatus: "overdue" | "due_today" | "upcoming" | "future" | "paid" | "no_date" = "no_date";
  let dueStatusText = "Sem data definida";

  let effectiveMonths = termMonths && termMonths > 0 ? termMonths : 12;

  if (dueDateStr) {
    const due = new Date(dueDateStr);
    if (!isNaN(due.getTime())) {
      const diffTime = due.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      daysUntilDue = diffDays;

      if (diffDays < 0) {
        dueStatus = "overdue";
        dueStatusText = `Vencida há ${Math.abs(diffDays)} dia(s)`;
      } else if (diffDays === 0) {
        dueStatus = "due_today";
        dueStatusText = "Vence Hoje!";
      } else if (diffDays <= 7) {
        dueStatus = "upcoming";
        dueStatusText = `Vence em ${diffDays} dias`;
      } else {
        dueStatus = "future";
        dueStatusText = `Vencimento em ${diffDays} dias`;
      }

      if (!termMonths) {
        effectiveMonths = Math.max(1, Math.ceil(diffDays / 30));
      }
    }
  }

  const mRate = monthlyRate / 100;
  const totalPayable = principal * Math.pow(1 + mRate, effectiveMonths);
  const accumulatedInterest = Math.max(0, totalPayable - principal);

  return {
    accumulatedInterest: Math.round(accumulatedInterest * 100) / 100,
    totalPayable: Math.round(totalPayable * 100) / 100,
    effectiveMonths,
    daysUntilDue,
    dueStatus,
    dueStatusText,
  };
}

export function analyzeDebtPriorities(debts: DebtItem[]): {
  avalancheRanked: DebtPrioritizedItem[];
  snowballRanked: DebtPrioritizedItem[];
  dueDateRanked: DebtPrioritizedItem[];
  pendingDebts: DebtPrioritizedItem[];
  paidDebts: DebtPrioritizedItem[];
  totalPrincipalPending: number;
  totalAccumulatedInterestPending: number;
  totalPayablePending: number;
  totalMonthlyInterestCost: number;
  totalPaidPrincipal: number;
  totalInterestSavedByPaid: number;
  highestInterestDebt?: DebtPrioritizedItem;
} {
  if (!debts || debts.length === 0) {
    return {
      avalancheRanked: [],
      snowballRanked: [],
      dueDateRanked: [],
      pendingDebts: [],
      paidDebts: [],
      totalPrincipalPending: 0,
      totalAccumulatedInterestPending: 0,
      totalPayablePending: 0,
      totalMonthlyInterestCost: 0,
      totalPaidPrincipal: 0,
      totalInterestSavedByPaid: 0,
    };
  }

  let totalPrincipalPending = 0;
  let totalAccumulatedInterestPending = 0;
  let totalPayablePending = 0;
  let totalMonthlyInterestCost = 0;
  let totalPaidPrincipal = 0;
  let totalInterestSavedByPaid = 0;

  const processedItems: DebtPrioritizedItem[] = debts.map((d) => {
    const principal = d.principalAmount || d.totalBalance || 0;

    let annualRate = d.annualInterestRate;
    let monthlyRate = d.monthlyInterestRate;

    if ((annualRate === undefined || annualRate === 0) && monthlyRate > 0) {
      annualRate = (Math.pow(1 + monthlyRate / 100, 12) - 1) * 100;
    } else if ((monthlyRate === undefined || monthlyRate === 0) && annualRate > 0) {
      monthlyRate = (Math.pow(1 + annualRate / 100, 1 / 12) - 1) * 100;
    } else if (!annualRate && !monthlyRate) {
      annualRate = 0;
      monthlyRate = 0;
    }

    const calc = calculateDebtAccumulatedInterest(
      principal,
      annualRate,
      monthlyRate,
      d.dueDate,
      d.termMonths
    );

    const monthlyInterestAmount = principal * (monthlyRate / 100);

    if (d.isPaid) {
      totalPaidPrincipal += principal;
      totalInterestSavedByPaid += calc.accumulatedInterest;
    } else {
      totalPrincipalPending += principal;
      totalAccumulatedInterestPending += calc.accumulatedInterest;
      totalPayablePending += calc.totalPayable;
      totalMonthlyInterestCost += monthlyInterestAmount;
    }

    return {
      ...d,
      principal,
      annualInterestRate: Math.round(annualRate * 100) / 100,
      monthlyInterestRate: Math.round(monthlyRate * 100) / 100,
      monthlyInterestAmount,
      accumulatedInterest: calc.accumulatedInterest,
      totalPayableAmount: calc.totalPayable,
      priorityRank: 0,
      priorityReason: "",
      daysUntilDue: calc.daysUntilDue,
      dueStatus: d.isPaid ? "paid" : calc.dueStatus,
      dueStatusText: d.isPaid ? "Quitada / Paga" : calc.dueStatusText,
    };
  });

  const pendingDebts = processedItems.filter((d) => !d.isPaid);
  const paidDebts = processedItems.filter((d) => d.isPaid);

  // 1. Avalanche: Highest Annual/Monthly Interest Rate first
  const avalancheRanked = [...pendingDebts].sort(
    (a, b) => b.annualInterestRate - a.annualInterestRate
  );
  avalancheRanked.forEach((item, index) => {
    item.priorityRank = index + 1;
    if (index === 0) {
      item.priorityReason = `🚨 PRIORIDADE MÁXIMA (#1): Maior taxa de juros (${formatPercent(
        item.annualInterestRate
      )} a.a. / ${formatPercent(
        item.monthlyInterestRate
      )} a.m.). Quitar primeiro estanca o maior dreno financeiro!`;
    } else {
      item.priorityReason = `Prioridade #${index + 1} (${formatPercent(
        item.annualInterestRate
      )} a.a.). Mantenha a quitação regular enquanto foca o aporte extra na prioridade superior.`;
    }
  });

  // 2. Snowball: Lowest Principal first
  const snowballRanked = [...pendingDebts].sort(
    (a, b) => a.principal - b.principal
  );

  // 3. Due Date: Closest Due Date first
  const dueDateRanked = [...pendingDebts].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return {
    avalancheRanked,
    snowballRanked,
    dueDateRanked,
    pendingDebts,
    paidDebts,
    totalPrincipalPending,
    totalAccumulatedInterestPending,
    totalPayablePending,
    totalMonthlyInterestCost,
    totalPaidPrincipal,
    totalInterestSavedByPaid,
    highestInterestDebt: avalancheRanked[0],
  };
}

// General Metric Summary
export function computeFinanceMetrics(data: UserFinanceData) {
  const totalIncome = data.incomes.reduce((acc, i) => acc + i.amount, 0);
  const totalExpenses = data.expenses.reduce((acc, e) => acc + e.amount, 0);
  
  const totalFixedExpenses = data.expenses
    .filter((e) => e.isFixed)
    .reduce((acc, e) => acc + e.amount, 0);
  const totalVariableExpenses = totalExpenses - totalFixedExpenses;

  const netSavingsMargin = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavingsMargin / totalIncome) * 100 : 0;

  // 50-30-20 rule calculation
  const safeIncome = totalIncome > 0 ? totalIncome : 1;
  const rule503020 = {
    essential: (totalFixedExpenses / safeIncome) * 100,
    lifestyle: (totalVariableExpenses / safeIncome) * 100,
    investments: (Math.max(0, netSavingsMargin) / safeIncome) * 100,
  };

  const totalInvestments = data.investments.reduce((acc, a) => acc + a.currentValue, 0);
  const totalInitialInvested = data.investments.reduce((acc, a) => acc + a.investedAmount, 0);
  const totalProfitInvestments = totalInvestments - totalInitialInvested;
  const portfolioReturnPercent =
    totalInitialInvested > 0 ? (totalProfitInvestments / totalInitialInvested) * 100 : 0;

  const debtAnalysis = analyzeDebtPriorities(data.debts);
  const netWorth = totalInvestments - debtAnalysis.totalPrincipalPending;

  return {
    totalIncome,
    totalExpenses,
    totalFixedExpenses,
    totalVariableExpenses,
    netSavingsMargin,
    savingsRate,
    rule503020,
    totalInvestments,
    totalInitialInvested,
    totalProfitInvestments,
    portfolioReturnPercent,
    totalDebts: debtAnalysis.totalPrincipalPending,
    totalAccumulatedInterest: debtAnalysis.totalAccumulatedInterestPending,
    totalPayableDebts: debtAnalysis.totalPayablePending,
    debtAnalysis,
    netWorth,
  };
}
