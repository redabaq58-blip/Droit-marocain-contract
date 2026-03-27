import Anthropic from "@anthropic-ai/sdk";
import type { QanounStateType } from "../state";
import type { AnalysisReport, RedFlag, MissingClause } from "@/types";
import { DOCUMENT_LABELS } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * NODE 4b — Risk Extractor (analysis path)
 * THREE parallel Claude calls for comprehensive contract analysis.
 * Each call is grounded in the verified law context loaded by NODE 3.
 */
export async function nodeRiskExtractor(
  state: Partial<QanounStateType>
): Promise<Partial<QanounStateType>> {
  if (!state.rawContract || !state.lawContext || !state.documentType) {
    return {
      error: "Contrat, contexte juridique ou type de document manquant pour l'analyse",
      compliancePassed: false,
    };
  }

  const docLabel = DOCUMENT_LABELS[state.documentType];

  // Run 3 analysis agents in parallel
  const [complianceResult, balanceResult, plainLanguageResult] = await Promise.all([
    runComplianceAgent(state.rawContract, state.lawContext, docLabel.fr),
    runBalanceAgent(state.rawContract, state.lawContext, docLabel.fr),
    runPlainLanguageAgent(state.rawContract, docLabel.fr),
  ]);

  // Merge results
  const report: AnalysisReport = {
    contractType: docLabel.fr,
    detectedLaw: extractDetectedLaws(state.lawContext),
    overallFairnessScore: calculateFairnessScore(balanceResult.redFlags),
    redFlags: [...complianceResult.redFlags, ...balanceResult.redFlags],
    missingClauses: complianceResult.missingClauses,
    summaryFr: plainLanguageResult.summaryFr,
    summaryAr: plainLanguageResult.summaryAr,
    negotiationEmailFr: generateNegotiationEmail(balanceResult.redFlags, docLabel.fr, "fr"),
    negotiationEmailAr: generateNegotiationEmail(balanceResult.redFlags, docLabel.ar, "ar"),
    complianceNotes: complianceResult.notes,
  };

  return {
    analysisReport: report,
    compliancePassed: true, // Analysis path always passes compliance at this stage
  };
}

// ─── Sub-agents ───────────────────────────────────────────────────────────────

async function runComplianceAgent(
  contractText: string,
  lawContext: string,
  docType: string
): Promise<{ redFlags: RedFlag[]; missingClauses: MissingClause[]; notes: string[] }> {
  const prompt = `Tu es un expert en droit marocain. Analyse ce contrat de type "${docType}" en te basant UNIQUEMENT sur les articles de loi marocains fournis.

ARTICLES DE LOI VÉRIFIÉS :
${lawContext}

CONTRAT À ANALYSER :
${contractText}

Identifie:
1. Les clauses MANQUANTES qui sont obligatoires selon les articles fournis
2. Les clauses NON CONFORMES aux dispositions légales

Réponds en JSON:
{
  "redFlags": [{"clauseRef": "...", "severity": "High|Medium|Low", "explanation": "...", "negotiationTip": "..."}],
  "missingClauses": [{"description": "...", "requiredBy": "Art. X", "severity": "High|Medium|Low"}],
  "notes": ["note1", "note2"]
}`;

  return await callClaudeJson(prompt, { redFlags: [], missingClauses: [], notes: [] });
}

async function runBalanceAgent(
  contractText: string,
  lawContext: string,
  docType: string
): Promise<{ redFlags: RedFlag[] }> {
  const prompt = `Tu es un expert en équilibre contractuel marocain. Analyse ce contrat de type "${docType}".

ARTICLES DE LOI MAROCAINS APPLICABLES :
${lawContext}

CONTRAT :
${contractText}

Identifie les clauses DÉSÉQUILIBRÉES qui favorisent excessivement une partie, en violation des principes du DOC marocain.

Réponds en JSON:
{
  "redFlags": [{"clauseRef": "...", "severity": "High|Medium|Low", "explanation": "Explication en français. توضيح بالعربية", "negotiationTip": "Conseil de négociation"}]
}`;

  return await callClaudeJson(prompt, { redFlags: [] });
}

async function runPlainLanguageAgent(
  contractText: string,
  docType: string
): Promise<{ summaryFr: string; summaryAr: string }> {
  const prompt = `Tu es un traducteur juridique marocain. Résume ce contrat de type "${docType}" en langage simple, compréhensible par un non-juriste.

CONTRAT :
${contractText.substring(0, 3000)}

Réponds en JSON:
{
  "summaryFr": "Résumé en français simple (3-5 phrases)...",
  "summaryAr": "ملخص بالعربية البسيطة (3-5 جمل)..."
}`;

  return await callClaudeJson(prompt, {
    summaryFr: "Résumé non disponible.",
    summaryAr: "الملخص غير متاح.",
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function callClaudeJson<T>(prompt: string, fallback: T): Promise<T> {
  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim()) as T;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

function extractDetectedLaws(lawContext: string): string {
  const laws: string[] = [];
  if (lawContext.includes("Code du Travail")) laws.push("Code du Travail (Loi 65-99)");
  if (lawContext.includes("Loi n° 49-16")) laws.push("Loi 49-16 (Bail commercial)");
  if (lawContext.includes("Loi n° 67-12")) laws.push("Loi 67-12 (Bail habitation)");
  if (lawContext.includes("Loi n° 28-08")) laws.push("Loi 28-08 (Avocats)");
  if (lawContext.includes("Loi n° 09-08")) laws.push("Loi 09-08 (Données personnelles)");
  if (lawContext.includes("Loi n° 44-00")) laws.push("Loi 44-00 (VEFA)");
  if (lawContext.includes("DOC") || lawContext.includes("Dahir des Obligations")) {
    laws.push("DOC (Dahir des Obligations et Contrats, 1913)");
  }
  return laws.join(", ") || "Droit marocain";
}

function calculateFairnessScore(redFlags: RedFlag[]): number {
  if (redFlags.length === 0) return 85;
  const penalty = redFlags.reduce((acc, flag) => {
    if (flag.severity === "High") return acc + 20;
    if (flag.severity === "Medium") return acc + 10;
    return acc + 5;
  }, 0);
  return Math.max(0, Math.min(100, 85 - penalty));
}

function generateNegotiationEmail(
  redFlags: RedFlag[],
  docType: string,
  lang: "fr" | "ar"
): string {
  if (redFlags.length === 0) {
    return lang === "fr"
      ? `Objet: Retour sur le ${docType}\n\nBonjour,\n\nAprès examen du document, je n'ai pas de demandes de modification à formuler.\n\nCordialement`
      : `الموضوع: ملاحظات على ${docType}\n\nمرحباً،\n\nبعد مراجعة الوثيقة، لا توجد لدي طلبات تعديل.\n\nمع التحية`;
  }

  const issues = redFlags
    .slice(0, 3)
    .map((f, i) => `${i + 1}. ${f.clauseRef}: ${f.negotiationTip}`)
    .join("\n");

  return lang === "fr"
    ? `Objet: Demandes de modification — ${docType}\n\nBonjour,\n\nAprès analyse du contrat, je souhaite discuter des points suivants:\n\n${issues}\n\nJe reste disponible pour en discuter.\n\nCordialement`
    : `الموضوع: طلبات التعديل — ${docType}\n\nمرحباً،\n\nبعد تحليل العقد، أودّ مناقشة النقاط التالية:\n\n${issues}\n\nأنا متاح للنقاش.\n\nمع التحية`;
}
