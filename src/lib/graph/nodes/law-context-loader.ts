import type { QanounStateType } from "../state";
import { loadLawContext } from "@/lib/law-context-map";

/**
 * NODE 3 — Law Context Loader (both paths)
 * Zero LLM calls. File I/O only.
 * Loads ONLY the verified law articles for the specific document type.
 * This is the anti-hallucination firewall.
 * Never generates or paraphrases law — verbatim verified text only.
 */
export async function nodeLawContextLoader(
  state: Partial<QanounStateType>
): Promise<Partial<QanounStateType>> {
  if (!state.documentType) {
    return {
      error: "Type de document requis pour charger le contexte juridique",
      compliancePassed: false,
    };
  }

  const { context, sourceFiles, unverifiedSources } = loadLawContext(state.documentType);

  if (!context || context.length < 50) {
    return {
      error: `Contexte juridique vide pour le type: ${state.documentType}. Vérifiez les fichiers de sources.`,
      compliancePassed: false,
    };
  }

  return {
    lawContext: context,
    lawSourceFiles: sourceFiles,
    unverifiedSources,
  };
}
