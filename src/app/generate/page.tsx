"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Download,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Star,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { DOCUMENT_LABELS } from "@/types";
import type { DocumentType } from "@/types";
import { DocumentTypeSelector } from "@/components/DocumentTypeSelector";
import { DynamicForm } from "@/components/DynamicForm";

type Step = "select" | "fill" | "done";

export default function GeneratePage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("select");
  const [selectedType, setSelectedType] = useState<DocumentType | null>(
    (searchParams.get("type") as DocumentType) ?? null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    docxBase64: string;
    warnings: string[];
    missingClauses: string[];
    sessionId: string;
    complianceReport: Record<string, unknown>;
  } | null>(null);

  useEffect(() => {
    const typeParam = searchParams.get("type") as DocumentType;
    if (typeParam && DOCUMENT_LABELS[typeParam]) {
      setSelectedType(typeParam);
      setStep("fill");
    }
  }, [searchParams]);

  const handleTypeSelect = (type: DocumentType) => {
    setSelectedType(type);
    setStep("fill");
  };

  const handleFormSubmit = async (formData: Record<string, unknown>) => {
    if (!selectedType) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: selectedType,
          formData,
          language: "bilingual",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.hallucinationFlags?.length) {
          toast.error(
            "🚫 Hallucination détectée — document bloqué",
            {
              description: data.hallucinationFlags[0],
              duration: 8000,
            }
          );
        } else {
          toast.error(data.error || "Erreur de génération");
        }
        return;
      }

      setResult(data);
      setStep("done");

      if (data.warnings?.length) {
        toast.warning(data.warnings[0], { duration: 6000 });
      }
    } catch {
      toast.error("Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadDocx = () => {
    if (!result?.docxBase64 || !selectedType) return;

    const bytes = Uint8Array.from(atob(result.docxBase64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qanoun-express_${selectedType}_${new Date().toISOString().split("T")[0]}.docx`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Document téléchargé ✓");
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Header */}
      <header className="bg-[#1B4332] text-white py-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-4 h-4" />
            <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
            <span className="font-bold">Qanoun Express</span>
          </Link>
          <span className="text-green-200 text-sm">
            Génération de documents
          </span>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm">
            {[
              { key: "select", label: "Choisir le type" },
              { key: "fill", label: "Remplir le formulaire" },
              { key: "done", label: "Télécharger" },
            ].map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="w-4 h-4 text-gray-300" />}
                <span
                  className={`font-medium ${
                    step === s.key
                      ? "text-[#1B4332]"
                      : step === "done" || (step === "fill" && i < 1) || (step === "done" && i < 2)
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Step 1: Select document type */}
        {step === "select" && (
          <div>
            <h1 className="text-2xl font-bold text-[#1B4332] mb-2">
              Quel document souhaitez-vous générer ?
            </h1>
            <p className="text-gray-500 mb-8">
              Chaque document est ancré dans les articles de loi marocains vérifiés
            </p>
            <DocumentTypeSelector onSelect={handleTypeSelect} />
          </div>
        )}

        {/* Step 2: Fill form */}
        {step === "fill" && selectedType && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setStep("select")}
                className="text-gray-400 hover:text-[#1B4332] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#1B4332]">
                  {DOCUMENT_LABELS[selectedType].fr}
                </h1>
                <p className="text-[#B8860B] arabic text-sm">
                  {DOCUMENT_LABELS[selectedType].ar}
                </p>
              </div>
            </div>

            <DynamicForm
              documentType={selectedType}
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Step 3: Done */}
        {step === "done" && result && selectedType && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-[#1B4332] mb-2">
              Document généré avec succès
            </h1>
            <p className="text-[#B8860B] arabic mb-6">تم إنشاء الوثيقة بنجاح</p>

            {result.warnings?.length > 0 && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-left max-w-lg mx-auto">
                {result.warnings.map((w, i) => (
                  <div key={i} className="flex gap-2 items-start text-sm text-amber-800">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}

            {result.missingClauses?.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-left max-w-lg mx-auto">
                <p className="text-xs font-semibold text-blue-800 mb-2">Clauses à vérifier :</p>
                {result.missingClauses.slice(0, 3).map((c, i) => (
                  <p key={i} className="text-xs text-blue-700">• {c}</p>
                ))}
              </div>
            )}

            <button
              onClick={downloadDocx}
              className="inline-flex items-center gap-3 bg-[#1B4332] text-white font-semibold px-8 py-4 rounded-xl hover:bg-[#2D6A4F] transition-colors text-lg mx-auto"
            >
              <Download className="w-5 h-5" />
              Télécharger le document Word (bilingue FR | عربي)
            </button>

            <div className="mt-4 text-sm text-gray-500">
              Format: .docx · Bilingue côte-à-côte · Articles de loi cités · Mention PROJET
            </div>

            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl max-w-2xl mx-auto">
              <p className="text-xs text-amber-800">
                <strong>⚠️ Rappel :</strong> Ce document est généré à titre informatif uniquement.
                Faites-le vérifier par un avocat inscrit au barreau marocain avant toute signature.
              </p>
            </div>

            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={() => { setStep("select"); setResult(null); setSelectedType(null); }}
                className="text-sm text-gray-500 hover:text-[#1B4332] underline"
              >
                Générer un autre document
              </button>
              <Link href="/analyse" className="text-sm text-[#1B4332] hover:underline">
                Analyser ce document →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
