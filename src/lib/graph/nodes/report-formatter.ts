import type { QanounStateType } from "../state";

/**
 * NODE 6b — Report Formatter (analysis path)
 * Finalizes the analysis report. No LLM calls.
 */
export async function nodeReportFormatter(
  state: Partial<QanounStateType>
): Promise<Partial<QanounStateType>> {
  if (!state.analysisReport) {
    return {
      error: "Rapport d'analyse manquant",
    };
  }

  // Sort red flags by severity
  const sortOrder = { High: 0, Medium: 1, Low: 2 };
  const sortedFlags = [...state.analysisReport.redFlags].sort(
    (a, b) => sortOrder[a.severity] - sortOrder[b.severity]
  );

  const finalReport = {
    ...state.analysisReport,
    redFlags: sortedFlags,
    generatedAt: new Date().toISOString(),
    sessionId: state.sessionId,
    disclaimer:
      "Cette analyse est fournie à titre indicatif. Elle ne constitue pas un avis juridique professionnel.",
  };

  return {
    analysisReport: finalReport,
  };
}
