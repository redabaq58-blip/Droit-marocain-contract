// ─── Document Types ───────────────────────────────────────────────────────────

export type DocumentType =
  | "cdi"
  | "cdd"
  | "licenciement_faute"
  | "solde_tout_compte"
  | "bail_commercial"
  | "bail_habitation"
  | "prestation_services"
  | "promesse_vente"
  | "mise_en_demeure"
  | "convention_honoraires"
  | "nda"
  | "reconnaissance_dette";

export const DOCUMENT_LABELS: Record<DocumentType, { fr: string; ar: string }> = {
  cdi: { fr: "Contrat de travail CDI", ar: "عقد شغل غير محدد المدة" },
  cdd: { fr: "Contrat de travail CDD", ar: "عقد شغل محدد المدة" },
  licenciement_faute: { fr: "Lettre de licenciement pour faute grave", ar: "رسالة الفصل لخطأ جسيم" },
  solde_tout_compte: { fr: "Reçu de solde de tout compte", ar: "وصل الحساب الختامي" },
  bail_commercial: { fr: "Contrat de bail commercial", ar: "عقد إيجار تجاري" },
  bail_habitation: { fr: "Contrat de bail d'habitation", ar: "عقد إيجار السكن" },
  prestation_services: { fr: "Contrat de prestation de services", ar: "عقد تقديم الخدمات" },
  promesse_vente: { fr: "Promesse de vente immobilière", ar: "وعد بالبيع العقاري" },
  mise_en_demeure: { fr: "Mise en demeure", ar: "إنذار رسمي" },
  convention_honoraires: { fr: "Convention d'honoraires avocat", ar: "اتفاقية أتعاب المحامي" },
  nda: { fr: "Accord de confidentialité (NDA)", ar: "اتفاقية السرية" },
  reconnaissance_dette: { fr: "Reconnaissance de dette", ar: "إقرار بالدين" },
};

// ─── Graph paths ──────────────────────────────────────────────────────────────

export type GraphPath = "generation" | "analysis";

// ─── LangGraph State ─────────────────────────────────────────────────────────

export interface QanounState {
  // Routing
  path: GraphPath;
  documentType: DocumentType;
  language: "fr" | "ar" | "bilingual";

  // Input
  formData?: Record<string, unknown>;
  rawContract?: string;

  // Law context (loaded ONLY from verified source files)
  lawContext: string;
  lawSourceFiles: string[]; // file paths — audit trail

  // Generation output
  rawDocument?: {
    frText: string;
    arText: string;
    articlesCited: string[]; // e.g. ["Art. 16", "Art. 14"] — must all appear in lawContext
    title: string;
  };

  // Compliance
  compliancePassed: boolean;
  hallucinationFlags: string[]; // articles cited but NOT in lawContext
  missingClauses: string[];
  unverifiedSources: string[]; // law source files where verifiedBy is empty
  complianceReport: Record<string, unknown>;

  // Analysis output
  analysisReport?: AnalysisReport;

  // Final output
  outputDocxBase64?: string;

  // Audit trail
  sessionId: string;
  timestamp: string;
  error?: string;
}

// ─── Analysis types ───────────────────────────────────────────────────────────

export type Severity = "High" | "Medium" | "Low";

export interface RedFlag {
  clauseRef: string;
  severity: Severity;
  explanation: string; // In both languages: fr + ar
  negotiationTip: string;
  missingArticle?: string; // e.g. "Art. 9 Loi 67-12"
}

export interface MissingClause {
  description: string;
  requiredBy: string; // e.g. "Art. 4 Loi 67-12"
  severity: Severity;
}

export interface AnalysisReport {
  contractType: string;
  detectedLaw: string;
  overallFairnessScore: number; // 0-100
  redFlags: RedFlag[];
  missingClauses: MissingClause[];
  summaryFr: string;
  summaryAr: string;
  negotiationEmailFr: string;
  negotiationEmailAr: string;
  complianceNotes: string[];
}

// ─── API types ────────────────────────────────────────────────────────────────

export interface GenerateRequest {
  documentType: DocumentType;
  formData: Record<string, unknown>;
  language?: "bilingual" | "fr" | "ar";
}

export interface AnalyseRequest {
  contractText: string;
  documentTypeHint?: DocumentType;
}

export interface GenerateResponse {
  success: boolean;
  docxBase64?: string;
  complianceReport?: Record<string, unknown>;
  error?: string;
  hallucinationFlags?: string[];
}

export interface AnalyseResponse {
  success: boolean;
  report?: AnalysisReport;
  error?: string;
}

// ─── Form field definitions ───────────────────────────────────────────────────

export interface FormField {
  key: string;
  label: { fr: string; ar: string };
  type: "text" | "number" | "date" | "select" | "textarea" | "boolean";
  required: boolean;
  options?: { value: string; label: { fr: string; ar: string } }[];
  placeholder?: { fr: string; ar: string };
  hint?: { fr: string; ar: string };
  min?: number;
  max?: number;
}

export type FormSchema = FormField[];
