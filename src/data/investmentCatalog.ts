export interface InvestmentCatalogItem {
  id: string;
  name: string;
  category: string;
  riskLevel: "Muito Baixo" | "Baixo" | "Moderado" | "Alto" | "Muito Alto";
  badgeColor: string;
  benchmark: string;
  annualEstimatedYield: number; // in %
  taxation: string;
  liquidity: string;
  fgcProtection: boolean;
  minInvestment: number;
  description: string;
  pros: string[];
  cons: string[];
  recommendationProfile: string;
}

export const investmentCatalog: InvestmentCatalogItem[] = [
  {
    id: "cdb-liquidez",
    name: "CDB 100% a 110% do CDI (Liquidez Diária)",
    category: "Renda Fixa / Reserva",
    riskLevel: "Muito Baixo",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    benchmark: "100% a 110% do CDI (~13,15% a.a.)",
    annualEstimatedYield: 13.15,
    taxation: "Tabela Regressiva de IR (22,5% a 15%)",
    liquidity: "Diária (resgate a qualquer momento)",
    fgcProtection: true,
    minInvestment: 1,
    description:
      "Emitido por bancos (Sofisa, Nubank, Inter, Itaú) para captar recursos. É o padrão de ouro para guardar Reserva de Emergência.",
    pros: [
      "Proteção do FGC até R$ 250 mil por CPF e instituição",
      "Resgate imediato com rendimento diário",
      "Rendimento superior à poupança em quase 100%",
    ],
    cons: ["Incidência de Imposto de Renda sobre o lucro", "IOF nos primeiros 30 dias se resgatar"],
    recommendationProfile: "Essencial para 100% dos investidores montarem a Reserva de Emergência (6 meses de custo de vida).",
  },
  {
    id: "lci-lca",
    name: "LCI / LCA (Letras Imobiliárias e do Agronegócio)",
    category: "Renda Fixa Isenta",
    riskLevel: "Baixo",
    badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300",
    benchmark: "90% a 98% do CDI (Equivale a CDB de ~115% CDI)",
    annualEstimatedYield: 12.35,
    taxation: "ISENTO de Imposto de Renda para Pessoa Física (0% IR)",
    liquidity: "Carência mínima de 9 meses ou vencimento",
    fgcProtection: true,
    minInvestment: 100,
    description:
      "Títulos emitidos por instituições financeiras para financiar os setores imobiliário e agropecuário do Brasil. Todo o rendimento vai direto para o seu bolso sem desconto de IR.",
    pros: [
      "Isenção total de IR para PF",
      "Garantia do FGC até R$ 250 mil",
      "Retorno líquido frequentemente bate CDBs tradicionais",
    ],
    cons: ["Existe período de carência mínimo exigido por lei", "Não serve para reserva de emergência imediata"],
    recommendationProfile: "Excelente para metas de médio prazo (1 a 3 anos) como troca de carro ou entrada de imóvel.",
  },
  {
    id: "tesouro-ipca",
    name: "Tesouro IPCA+ (Proteção Inflacionária com Juro Real)",
    category: "Tesouro Direto",
    riskLevel: "Baixo",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
    benchmark: "IPCA (Inflação) + 6,20% a 6,60% ao ano",
    annualEstimatedYield: 11.8,
    taxation: "Tabela Regressiva de IR (15% no vencimento)",
    liquidity: "Diária (com marcação a mercado se resgatar antes)",
    fgcProtection: false, // Risco soberano (mais seguro que FGC)
    minInvestment: 35,
    description:
      "Garante que o seu poder de compra nunca seja corroído pela inflação, pagando a variação integral do IPCA acrescido de uma taxa de juros reais fixa acordada na contratação.",
    pros: [
      "Garantia soberana do Tesouro Nacional (risco zero de crédito bancário)",
      "Blindagem matemática contra a inflação brasileira",
      "Ideal para aposentadoria e metas de longo prazo (5 a 20 anos)",
    ],
    cons: ["Se vender antes do vencimento, sofre oscilação de marcação a mercado"],
    recommendationProfile: "Fundamental para patrimônio previdenciário e enriquecimento no longo prazo.",
  },
  {
    id: "fiis-dividendos",
    name: "Fundos Imobiliários (FIIs) - Renda Passiva Mensal",
    category: "Renda Variável / Imóveis",
    riskLevel: "Moderado",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    benchmark: "Dividend Yield médio de 10,5% a 13,0% a.a. + valorização",
    annualEstimatedYield: 13.5,
    taxation: "Dividendos mensais 100% ISENTOS de IR para PF",
    liquidity: "Diária na Bolsa de Valores (B3)",
    fgcProtection: false,
    minInvestment: 10,
    description:
      "Compre frações dos maiores shoppings, galpões logísticos, prédios corporativos e Certificados de Recebíveis Imobiliários (CRIs) do país e receba 'aluguéis' todo mês na sua conta.",
    pros: [
      "Renda passiva 'pingando' todo mês na conta",
      "Diversificação imobiliária sem burocracia de escritura ou inquilinos",
      "Isenção de IR nos proventos distribuídos",
    ],
    cons: ["Cotação oscila no mercado da B3", "Tributação de 20% no ganho de capital da venda da cota"],
    recommendationProfile: "Perfeito para construir fluxo contínuo de caixa e viver de renda passiva.",
  },
  {
    id: "acoes-dividendos",
    name: "Ações de Dividendos & Valor (B3)",
    category: "Ações Brasil",
    riskLevel: "Alto",
    badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300",
    benchmark: "Ibovespa + Proventos (Yield médio 8% a 14% a.a.)",
    annualEstimatedYield: 15.0,
    taxation: "Dividendos isentos / 15% sobre Juros s/ Capital Próprio",
    liquidity: "Diária na B3",
    fgcProtection: false,
    minInvestment: 20,
    description:
      "Torne-se sócio das maiores empresas do Brasil (Bancos como Itaú e Banco do Brasil, Elétricas como Taesa e Copel, Saneamento como Sanepar). Empresas sólidas que distribuem bilhões em lucros.",
    pros: [
      "Potencial de valorização exponencial no longo prazo",
      "Participação direta no lucro das maiores companhias nacionais",
      "Isenção de IR nas vendas até R$ 20 mil/mês em ações",
    ],
    cons: ["Volatilidade diária de curto prazo", "Exige visão de longo prazo e disciplina"],
    recommendationProfile: "Para investidores focados em multiplicação de patrimônio e independência financeira.",
  },
  {
    id: "cripto-btc-eth",
    name: "Criptoativos (Bitcoin & Ethereum)",
    category: "Ativos Digitais Globais",
    riskLevel: "Alto",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
    benchmark: "Adoção Global & Ciclos de Halving do Bitcoin",
    annualEstimatedYield: 22.0,
    taxation: "Isenção em vendas até R$ 35 mil/mês em exchanges nacionais",
    liquidity: "24 horas por dia, 7 dias por semana globalmente",
    fgcProtection: false,
    minInvestment: 50,
    description:
      "Bitcoin é o ouro digital com oferta limitada a 21 milhões de moedas, e Ethereum é a rede global de computação descentralizada. Proporcionam assimetria positiva de risco.",
    pros: [
      "Descentralização total e independência de bancos centrais",
      "Retorno histórico superior a todas as classes tradicionais",
      "Proteção contra emissão desenfreada de moeda fiduciária",
    ],
    cons: ["Alta volatilidade no curto e médio prazo", "Responsabilidade total pela autocustódia/chaves"],
    recommendationProfile: "Recomendado ter entre 2% a 5% da carteira para buscar retornos assimétricos com risco controlado.",
  },
];
