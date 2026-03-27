"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Star,
  TrendingUp,
  FileText,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import type { AnalysisReport, DocumentType } from "@/types";
import { DOCUMENT_LABELS } from "@/types";

const SEVERITY_COLORS = {
  High: "badge-high",
  Medium: "badge-medium",
  Low: "badge-low",
};

const DOC_TYPES: { value: DocumentType; label: string }[] = [
  { value: "cdi", label: "CDI / عقد غير محدد المدة" },
  { value: "cdd", label: "CDD / عقد محدد المدة" },
  { value: "bail_habitation", label: "Bail habitation / إيجار السكن" },
  { value: "bail_commercial", label: "Bail commercial / إيجار تجاري" },
  { value: "prestation_services", label: "Prestation de services / الخدمات" },
  { value: "promesse_vente", label: "Promesse de vente / وعد بالبيع" },
  { value: "mise_en_demeure", label: "Mise en demeure / إنذار" },
  { value: "nda", label: "NDA / اتفاقية سرية" },
  { value: "reconnaissance_dette", label: "Reconnaissance de dette / إقرار بالدين" },
  { value: "licenciement_faute", label: "Lettre de licenciement / رسالة فصل" },
  { value: "convention_honoraires", label: "Convention honoraires / أتعاب المحامي" },
  { value: "solde_tout_compte", label: "Solde de tout compte / الحساب الختامي" },
];

export default function AnalysePage() {
  const [contractText, setContractText] = useState("");
  const [documentTypeHint, setDocumentTypeHint] = useState<DocumentType>("cdi");
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [activeTab, setActiveTab] = useState<"report" | "emailFr" | "emailAr">("report");

  const handleAnalyse = async () => {
    if (contractText.trim().length < 50) {
      toast.error("Veuillez coller un contrat (minimum 50 caractères)");
      return;
    }

    setIsLoading(true);
    setReport(null);

    try {
      const response = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractText, documentTypeHint }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.error || "Erreur d'analyse");
        return;
      }

      setReport(data.report);
    } catch {
      toast.error("Erreur réseau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Header */}
      <header className="bg-[#1B4332] text-white py-4 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-4 h-4" />
            <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
            <span className="font-bold">Qanoun Express</span>
          </Link>
          <span className="text-green-200 text-sm">Analyser un contrat</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {!report ? (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-[#1B4332] mb-2">
              Analysez un contrat reçu
            </h1>
            <p className="text-gray-500 mb-1">
              Collez le texte du contrat pour obtenir : red flags, clauses manquantes, score d&apos;équité,
              et un email de négociation bilingue.
            </p>
            <p className="text-sm text-[#B8860B] arabic mb-8">
              الصق نص العقد للحصول على: المخاطر، البنود المفقودة، درجة الإنصاف، وبريد التفاوض.
            </p>

            {/* Document type hint */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de contrat (pour affiner l&apos;analyse)
              </label>
              <select
                value={documentTypeHint}
                onChange={(e) => setDocumentTypeHint(e.target.value as DocumentType)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] bg-white"
              >
                {DOC_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Contract text input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Texte du contrat
              </label>
              <textarea
                value={contractText}
                onChange={(e) => setContractText(e.target.value)}
                placeholder="Collez ici le texte intégral du contrat que vous souhaitez analyser..."
                rows={12}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] resize-y font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">{contractText.length} caractères</p>
            </div>

            <button
              onClick={handleAnalyse}
              disabled={isLoading || contractText.trim().length < 50}
              className="w-full flex items-center justify-center gap-3 bg-[#1B4332] text-white font-semibold py-3 rounded-xl hover:bg-[#2D6A4F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyse en cours (3 agents en parallèle)...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Analyser le contrat
                </>
              )}
            </button>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs text-blue-800">
                <strong>3 agents d&apos;analyse :</strong> Conformité légale (clauses obligatoires) +
                Équilibre contractuel (clauses défavorables) + Langage simplifié bilingue.
                Chaque analyse est ancrée dans les lois marocaines vérifiées.
              </p>
            </div>
          </div>
        ) : (
          <div>
            {/* Report header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[#1B4332]">
                  Rapport d&apos;analyse
                </h1>
                <p className="text-gray-500 text-sm">{report.contractType} — {report.detectedLaw}</p>
              </div>
              <button
                onClick={() => setReport(null)}
                className="text-sm text-gray-500 hover:text-[#1B4332] underline"
              >
                Nouvelle analyse
              </button>
            </div>

            {/* Fairness score */}
            <div className="card mb-6 flex items-center gap-6">
              <div className="text-center">
                <div
                  className={`text-4xl font-bold ${
                    report.overallFairnessScore >= 70
                      ? "text-green-600"
                      : report.overallFairnessScore >= 50
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {report.overallFairnessScore}/100
                </div>
                <div className="text-xs text-gray-500 mt-1">Score d&apos;équité</div>
              </div>
              <div>
                <div className="flex gap-3 text-sm mb-2">
                  <span className="badge-high">
                    {report.redFlags.filter((f) => f.severity === "High").length} High
                  </span>
                  <span className="badge-medium">
                    {report.redFlags.filter((f) => f.severity === "Medium").length} Medium
                  </span>
                  <span className="badge-low">
                    {report.redFlags.filter((f) => f.severity === "Low").length} Low
                  </span>
                </div>
                <p className="text-sm text-gray-600">{report.missingClauses.length} clauses manquantes</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200 mb-6">
              {[
                { key: "report" as const, label: "Rapport", icon: FileText },
                { key: "emailFr" as const, label: "Email FR", icon: Mail },
                { key: "emailAr" as const, label: "بريد عربي", icon: Mail },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === tab.key
                      ? "text-[#1B4332] border-b-2 border-[#1B4332]"
                      : "text-gray-500 hover:text-[#1B4332]"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "report" && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="card">
                  <h3 className="font-semibold text-[#1B4332] mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Résumé
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">{report.summaryFr}</p>
                  <p className="text-sm text-gray-700 arabic" dir="rtl">{report.summaryAr}</p>
                </div>

                {/* Red flags */}
                {report.redFlags.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      Points d&apos;attention ({report.redFlags.length})
                    </h3>
                    <div className="space-y-3">
                      {report.redFlags.map((flag, i) => (
                        <div key={i} className="card border-l-4 border-l-red-400">
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-medium text-sm text-gray-800">
                              {flag.clauseRef}
                            </span>
                            <span className={SEVERITY_COLORS[flag.severity]}>
                              {flag.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{flag.explanation}</p>
                          {flag.negotiationTip && (
                            <p className="text-xs text-[#1B4332] font-medium">
                              💡 {flag.negotiationTip}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing clauses */}
                {report.missingClauses.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-500" />
                      Clauses manquantes ({report.missingClauses.length})
                    </h3>
                    <div className="space-y-2">
                      {report.missingClauses.map((clause, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                          <span className={SEVERITY_COLORS[clause.severity] + " mt-0.5"}>
                            {clause.severity}
                          </span>
                          <div>
                            <p className="text-sm text-gray-700">{clause.description}</p>
                            <p className="text-xs text-blue-600 mt-1">Requis par: {clause.requiredBy}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compliance notes */}
                {report.complianceNotes?.length > 0 && (
                  <div className="card bg-gray-50">
                    <h3 className="font-semibold text-gray-700 mb-2 text-sm">Notes de conformité</h3>
                    {report.complianceNotes.map((note, i) => (
                      <p key={i} className="text-xs text-gray-600">• {note}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "emailFr" && (
              <div className="card">
                <h3 className="font-semibold text-[#1B4332] mb-4">Email de négociation (Français)</h3>
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans bg-gray-50 p-4 rounded-lg">
                  {report.negotiationEmailFr}
                </pre>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(report.negotiationEmailFr);
                    toast.success("Email copié !");
                  }}
                  className="mt-3 text-sm text-[#1B4332] hover:underline"
                >
                  Copier →
                </button>
              </div>
            )}

            {activeTab === "emailAr" && (
              <div className="card">
                <h3 className="font-semibold text-[#1B4332] mb-4 arabic">البريد الإلكتروني للتفاوض</h3>
                <pre
                  className="whitespace-pre-wrap text-sm text-gray-700 font-sans bg-gray-50 p-4 rounded-lg arabic"
                  dir="rtl"
                >
                  {report.negotiationEmailAr}
                </pre>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(report.negotiationEmailAr);
                    toast.success("تم النسخ !");
                  }}
                  className="mt-3 text-sm text-[#1B4332] hover:underline"
                >
                  نسخ →
                </button>
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs text-amber-800">
                <strong>⚠️ Avertissement :</strong> Cette analyse est fournie à titre indicatif uniquement.
                Elle ne constitue pas un avis juridique professionnel. Consultez un avocat inscrit au
                barreau marocain avant toute décision juridique.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
