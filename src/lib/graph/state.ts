import { Annotation } from "@langchain/langgraph";
import type { DocumentType, GraphPath, AnalysisReport } from "@/types";

export const QanounStateAnnotation = Annotation.Root({
  // Routing
  path: Annotation<GraphPath>({ reducer: (_, b) => b }),
  documentType: Annotation<DocumentType>({ reducer: (_, b) => b }),
  language: Annotation<"fr" | "ar" | "bilingual">({
    reducer: (_, b) => b,
    default: () => "bilingual",
  }),

  // Input
  formData: Annotation<Record<string, unknown> | undefined>({
    reducer: (_, b) => b,
  }),
  rawContract: Annotation<string | undefined>({ reducer: (_, b) => b }),

  // Law context
  lawContext: Annotation<string>({
    reducer: (_, b) => b,
    default: () => "",
  }),
  lawSourceFiles: Annotation<string[]>({
    reducer: (_, b) => b,
    default: () => [],
  }),

  // Generation output
  rawDocument: Annotation<
    | {
        frText: string;
        arText: string;
        articlesCited: string[];
        title: string;
      }
    | undefined
  >({ reducer: (_, b) => b }),

  // Compliance
  compliancePassed: Annotation<boolean>({
    reducer: (_, b) => b,
    default: () => false,
  }),
  hallucinationFlags: Annotation<string[]>({
    reducer: (_, b) => b,
    default: () => [],
  }),
  missingClauses: Annotation<string[]>({
    reducer: (_, b) => b,
    default: () => [],
  }),
  unverifiedSources: Annotation<string[]>({
    reducer: (_, b) => b,
    default: () => [],
  }),
  complianceReport: Annotation<Record<string, unknown>>({
    reducer: (_, b) => b,
    default: () => ({}),
  }),

  // Analysis
  analysisReport: Annotation<AnalysisReport | undefined>({ reducer: (_, b) => b }),

  // Final output
  outputDocxBase64: Annotation<string | undefined>({ reducer: (_, b) => b }),

  // Audit
  sessionId: Annotation<string>({ reducer: (_, b) => b }),
  timestamp: Annotation<string>({ reducer: (_, b) => b }),
  error: Annotation<string | undefined>({ reducer: (_, b) => b }),
});

export type QanounStateType = typeof QanounStateAnnotation.State;
