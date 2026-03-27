import type { QanounStateType } from "../state";
import type { DocumentType } from "@/types";
import { randomUUID } from "crypto";

const VALID_DOCUMENT_TYPES: DocumentType[] = [
  "cdi",
  "cdd",
  "licenciement_faute",
  "solde_tout_compte",
  "bail_commercial",
  "bail_habitation",
  "prestation_services",
  "promesse_vente",
  "mise_en_demeure",
  "convention_honoraires",
  "nda",
  "reconnaissance_dette",
];

/**
 * NODE 1 — Input Classifier
 * Pure TypeScript routing. Zero LLM calls.
 * Validates the document type and sets the graph path.
 */
export async function nodeInputClassifier(
  state: Partial<QanounStateType>
): Promise<Partial<QanounStateType>> {
  const docType = state.documentType;

  if (!docType || !VALID_DOCUMENT_TYPES.includes(docType)) {
    return {
      error: `Type de document invalide: "${docType}". Types valides: ${VALID_DOCUMENT_TYPES.join(", ")}`,
      compliancePassed: false,
    };
  }

  return {
    documentType: docType,
    path: state.rawContract ? "analysis" : "generation",
    sessionId: randomUUID(),
    timestamp: new Date().toISOString(),
    language: state.language ?? "bilingual",
  };
}
