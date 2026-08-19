import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy Gemini Client Initialization (fails fast with clear error on first use if missing, never crashes server on boot)
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY environment variable is not configured. Configure it in Google AI Studio secrets."
      );
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// API Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// API: AI Financial Broker Chat
app.post("/api/advisor/chat", async (req, res) => {
  try {
    const { message, history, userFinanceSummary } = req.body;

    const systemInstruction = `Você é o 'FinanSmart Broker', um corretor de investimentos e consultor financeiro sênior certificado (CFP/CEA) de alta precisão no mercado brasileiro.
Seu objetivo é ser o melhor parceiro financeiro do usuário:
1. Analisar receitas, despesas, margem de economia e capacidade de aporte.
2. Auxiliar a alcançar a meta monetária do usuário com prazos realistas e trilhas matemáticas de juros compostos.
3. Explicar e recomendar de forma didática e prática:
   - Renda Fixa: CDI, Selic, CDB (ex: 100% a 130% do CDI), LCI/LCA (isenção de IR), Tesouro Selic, Prefixado e IPCA+ (proteção inflacionária).
   - Renda Variável: Fundos Imobiliários (FIIs) para renda passiva mensal, Ações de dividendos e valor (ex: setor elétrico, bancário, commodities).
   - Criptoativos: Bitcoin, Ethereum (recomendações cautelosas de 1% a 5% do patrimônio para diversificação de risco assimétrico).
4. Fornecer orientação incisiva para dívidas: alertar sobre o risco mortal dos juros de cartão de crédito e cheque especial, recomendando quitá-las primeiro pelo método Avalanche (maior taxa de juros primeiro).
5. Responder com formatação clara (Markdown, tópicos, destaques em negrito, cálculos ilustrativos em R$) e em tom encorajador, profissional e ético.

Contexto financeiro atual do usuário:
${JSON.stringify(userFinanceSummary || {}, null, 2)}`;

    // Build chat contents from history
    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history) {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content }],
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const ai = getGemini();
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "Desculpe, não consegui processar a resposta neste momento.";
    res.json({ reply });
  } catch (error: any) {
    console.error("Error in /api/advisor/chat:", error);
    res.status(500).json({
      error: "Falha ao consultar o Corretor IA. Verifique se a chave de API GEMINI_API_KEY está configurada.",
      details: error?.message,
    });
  }
});

// API: AI Portfolio & Financial Health Diagnosis
app.post("/api/advisor/analyze", async (req, res) => {
  try {
    const { userFinanceSummary } = req.body;

    const prompt = `Analise detalhadamente o perfil e a situação financeira do usuário com base nos dados fornecidos e gere um diagnóstico executivo de alto nível com recomendações práticas de investimentos (CDB, CDI, Tesouro, Ações, FIIs, Cripto) e gestão de dívidas/metas.

Dados do usuário:
${JSON.stringify(userFinanceSummary, null, 2)}

Retorne um JSON estrito com o seguinte formato:
{
  "financialHealthScore": 85,
  "healthStatus": "Excelente",
  "summary": "Resumo executivo da saúde financeira em 2 a 3 frases.",
  "strengths": ["Ponto forte 1", "Ponto forte 2"],
  "risks": ["Ponto de atenção ou risco 1", "Ponto 2"],
  "debtAdvice": "Estratégia personalizada para quitar ou controlar dívidas com prioridade nos maiores juros.",
  "investmentAllocation": [
    { "category": "Renda Fixa (CDB/Tesouro Selic/CDI)", "percentage": 50, "reason": "Liquidez e segurança para reserva e curto prazo" },
    { "category": "Proteção Inflacionária (IPCA+/LCI/LCA)", "percentage": 20, "reason": "Rendimento real isento ou acima da inflação" },
    { "category": "Renda Variável (FIIs & Ações Dividendos)", "percentage": 25, "reason": "Geração de renda passiva e valorização a longo prazo" },
    { "category": "Ativos Globais & Cripto (BTC/ETH)", "percentage": 5, "reason": "Assimetria de retorno com exposição controlada" }
  ],
  "milestonePlan": "Como o usuário pode atingir sua meta financeira mais rápido.",
  "topTips": [
    "Dica prática acionável 1",
    "Dica prática acionável 2",
    "Dica prática acionável 3"
  ]
}`;

    const ai = getGemini();
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const jsonText = response.text?.trim() || "{}";
    let data;
    try {
      data = JSON.parse(jsonText);
    } catch {
      data = { error: "Failed to parse diagnosis json", raw: jsonText };
    }

    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/advisor/analyze:", error);
    res.status(500).json({
      error: "Erro ao gerar diagnóstico financeiro IA.",
      details: error?.message,
    });
  }
});

// Vite middleware configuration for dev / static for prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FinanSmart Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
