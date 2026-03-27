import { NextRequest, NextResponse } from "next/server";
import { getFullQanounGraph } from "@/lib/graph/graph";
import type { AnalyseRequest } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AnalyseRequest;

    if (!body.contractText || body.contractText.trim().length < 50) {
      return NextResponse.json(
        { success: false, error: "Le texte du contrat est trop court (min 50 caractères)" },
        { status: 400 }
      );
    }

    // If no document type hint provided, default to CDI (most common)
    // The risk extractor will detect the actual type from the contract text
    const documentType = body.documentTypeHint ?? "cdi";

    const graph = getFullQanounGraph();

    const result = await graph.invoke({
      path: "analysis",
      documentType,
      language: "bilingual",
      rawContract: body.contractText,
      formData: undefined,
      lawContext: "",
      lawSourceFiles: [],
      unverifiedSources: [],
      compliancePassed: false,
      hallucinationFlags: [],
      missingClauses: [],
      complianceReport: {},
      sessionId: "",
      timestamp: "",
    });

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      report: result.analysisReport,
      sessionId: result.sessionId,
    });
  } catch (err) {
    console.error("Analyse API error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Erreur interne du serveur",
      },
      { status: 500 }
    );
  }
}
