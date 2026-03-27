import type { QanounStateType } from "../state";
import type { DocumentType } from "@/types";

/**
 * Mandatory clause keywords that MUST appear in the generated text for each document type.
 * If missing → compliance warning (not a hard block, but logged).
 */
const MANDATORY_CLAUSE_CHECKS: Record<DocumentType, string[]> = {
  cdi: [
    "période d'essai",
    "salaire",
    "durée indéterminée",
    "lieu de travail",
    "préavis",
  ],
  cdd: [
    "durée déterminée",
    "motif",
    "salaire",
    "date de fin",
  ],
  licenciement_faute: [
    "faute grave",
    "entretien préalable",
    "lettre recommandée",
    "Art. 39",
    "Art. 62",
  ],
  solde_tout_compte: [
    "solde de tout compte",
    "60 jours",
    "Art. 74",
    "contestation",
  ],
  bail_commercial: [
    "loyer",
    "durée",
    "dépôt de garantie",
    "destination",
    "Loi 49-16",
  ],
  bail_habitation: [
    "loyer",
    "dépôt de garantie",
    "durée",
    "Loi 67-12",
    "état des lieux",
  ],
  prestation_services: [
    "mission",
    "prix",
    "livrable",
    "Art. 723",
    "Art. 230",
  ],
  promesse_vente: [
    "prix de vente",
    "acompte",
    "date de signature",
    "Art. 488",
  ],
  mise_en_demeure: [
    "Art. 255",
    "délai",
    "obligation",
    "lettre recommandée",
  ],
  convention_honoraires: [
    "honoraires",
    "mission",
    "Art. 57",
    "barreau",
  ],
  nda: [
    "confidentialité",
    "informations confidentielles",
    "Art. 230",
    "durée",
  ],
  reconnaissance_dette: [
    "Art. 323",
    "montant",
    "remboursement",
    "toutes lettres",
  ],
};

/**
 * NODE 5 — Compliance Checker (both paths)
 * ZERO LLM calls — pure TypeScript string matching.
 *
 * Checks:
 * 1. CITATION AUDIT: Every article in articlesCited must appear in lawContext.
 *    If not → hallucinationFlags (BLOCKS output)
 * 2. MANDATORY CLAUSE CHECK: Required clause keywords present in generated text
 * 3. UNVERIFIED SOURCES: Warns if any law source file has verifiedBy = ""
 * 4. DISCLAIMER INJECTION: Appends mandatory bilingual disclaimer
 */
export async function nodeComplianceChecker(
  state: Partial<QanounStateType>
): Promise<Partial<QanounStateType>> {
  const hallucinationFlags: string[] = [];
  const missingClauses: string[] = [];

  // ── 1. Citation audit (generation path) ──────────────────────────────────
  if (state.rawDocument && state.lawContext) {
    for (const citation of state.rawDocument.articlesCited) {
      // Normalize the citation: extract just the article number
      const artNum = citation.match(/\d+(?:-\d+)?/)?.[0];
      if (!artNum) continue;

      // Check if this article number appears anywhere in the verified law context
      if (!state.lawContext.includes(artNum)) {
        hallucinationFlags.push(
          `⚠️ HALLUCINATION: "${citation}" cité dans le document mais absent du contexte juridique vérifié.`
        );
      }
    }
  }

  // ── 2. Mandatory clause check ─────────────────────────────────────────────
  const documentText = state.rawDocument
    ? `${state.rawDocument.frText} ${state.rawDocument.arText}`.toLowerCase()
    : (state.analysisReport ? JSON.stringify(state.analysisReport).toLowerCase() : "");

  if (state.documentType && documentText) {
    const requiredKeywords = MANDATORY_CLAUSE_CHECKS[state.documentType] ?? [];
    for (const keyword of requiredKeywords) {
      if (!documentText.includes(keyword.toLowerCase())) {
        missingClauses.push(
          `Clause requise potentiellement manquante: "${keyword}"`
        );
      }
    }
  }

  // ── 3. Compliance pass/fail ───────────────────────────────────────────────
  const compliancePassed = hallucinationFlags.length === 0;

  // ── 4. Disclaimer injection ───────────────────────────────────────────────
  const DISCLAIMER_FR =
    "\n\n---\n⚠️ AVERTISSEMENT JURIDIQUE : Ce document est généré à titre informatif uniquement. " +
    "Il ne constitue pas un conseil juridique et ne remplace pas la consultation d'un avocat " +
    "inscrit au barreau marocain. Qanoun Express décline toute responsabilité pour l'usage de " +
    "ce document sans vérification préalable par un professionnel du droit.";

  const DISCLAIMER_AR =
    "\n\n---\n⚠️ تنبيه قانوني: هذه الوثيقة مُنشأة لأغراض إعلامية فحسب. لا تُعدّ استشارةً " +
    "قانونيةً ولا تُغني عن استشارة محامٍ مقيّد في هيئة المحامين المغاربة. تخلي قانون إكسبريس " +
    "مسؤوليتها عن أي استخدام لهذه الوثيقة دون مراجعة مسبقة من قِبَل محترف في القانون.";

  if (state.rawDocument && compliancePassed) {
    state.rawDocument = {
      ...state.rawDocument,
      frText: state.rawDocument.frText + DISCLAIMER_FR,
      arText: state.rawDocument.arText + DISCLAIMER_AR,
    };
  }

  const complianceReport = {
    passed: compliancePassed,
    hallucinationFlags,
    missingClauses,
    unverifiedSources: state.unverifiedSources ?? [],
    checkedAt: new Date().toISOString(),
    note: compliancePassed
      ? "Toutes les citations vérifiées contre les sources officielles."
      : `BLOQUÉ: ${hallucinationFlags.length} citation(s) hallucination(s) détectée(s).`,
  };

  return {
    compliancePassed,
    hallucinationFlags,
    missingClauses,
    complianceReport,
    rawDocument: state.rawDocument,
    error: compliancePassed
      ? state.error
      : `Erreur de conformité: ${hallucinationFlags.join("; ")}`,
  };
}
