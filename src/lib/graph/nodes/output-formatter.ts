import { Packer } from "docx";
import type { QanounStateType } from "../state";
import { buildBilingualDocx } from "@/lib/docx-builder";
import { DOCUMENT_LABELS } from "@/types";

/**
 * NODE 6a — Output Formatter (generation path)
 * Converts the compliance-checked JSON document into a bilingual Word file.
 * Returns base64-encoded .docx for download.
 */
export async function nodeOutputFormatter(
  state: Partial<QanounStateType>
): Promise<Partial<QanounStateType>> {
  if (!state.rawDocument || !state.documentType) {
    return {
      error: "Document brut manquant pour la génération du fichier Word",
    };
  }

  const docLabel = DOCUMENT_LABELS[state.documentType];

  try {
    const doc = buildBilingualDocx({
      titleFr: state.rawDocument.title || docLabel.fr,
      titleAr: docLabel.ar,
      frText: state.rawDocument.frText,
      arText: state.rawDocument.arText,
      documentType: state.documentType,
      sessionId: state.sessionId || "unknown",
      generatedAt: state.timestamp || new Date().toISOString(),
    });

    const buffer = await Packer.toBuffer(doc);
    const base64 = Buffer.from(buffer).toString("base64");

    return {
      outputDocxBase64: base64,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      error: `Erreur génération Word: ${message}`,
    };
  }
}
