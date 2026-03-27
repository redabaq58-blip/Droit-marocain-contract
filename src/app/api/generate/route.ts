import { NextRequest, NextResponse } from "next/server";
import { getFullQanounGraph } from "@/lib/graph/graph";
import type { GenerateRequest } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateRequest;

    if (!body.documentType || !body.formData) {
      return NextResponse.json(
        { success: false, error: "documentType et formData sont requis" },
        { status: 400 }
      );
    }

    const graph = getFullQanounGraph();

    const result = await graph.invoke({
      path: "generation",
      documentType: body.documentType,
      language: body.language ?? "bilingual",
      formData: body.formData,
      rawContract: undefined,
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
        {
          success: false,
          error: result.error,
          hallucinationFlags: result.hallucinationFlags ?? [],
          complianceReport: result.complianceReport ?? {},
        },
        { status: result.hallucinationFlags?.length ? 422 : 400 }
      );
    }

    if (!result.outputDocxBase64) {
      return NextResponse.json(
        { success: false, error: "Génération du document échouée" },
        { status: 500 }
      );
    }

    // Warn about unverified sources (non-blocking for development)
    const warnings =
      result.unverifiedSources?.length
        ? [`${result.unverifiedSources.length} source(s) non vérifiée(s) par un avocat`]
        : [];

    return NextResponse.json({
      success: true,
      docxBase64: result.outputDocxBase64,
      complianceReport: result.complianceReport,
      missingClauses: result.missingClauses ?? [],
      warnings,
      sessionId: result.sessionId,
    });
  } catch (err) {
    console.error("Generate API error:", err);
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error ? err.message : "Erreur interne du serveur",
      },
      { status: 500 }
    );
  }
}
