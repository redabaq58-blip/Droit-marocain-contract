"use client";

import { FileText, ArrowRight } from "lucide-react";
import { DOCUMENT_LABELS } from "@/types";
import type { DocumentType } from "@/types";

const DOC_GROUPS = [
  {
    label: "Droit du travail",
    labelAr: "قانون الشغل",
    law: "Code du Travail (Loi 65-99)",
    types: ["cdi", "cdd", "licenciement_faute", "solde_tout_compte"] as DocumentType[],
  },
  {
    label: "Immobilier & Bail",
    labelAr: "العقار والإيجار",
    law: "Loi 67-12, Loi 49-16, DOC",
    types: ["bail_habitation", "bail_commercial", "promesse_vente"] as DocumentType[],
  },
  {
    label: "Contrats commerciaux",
    labelAr: "العقود التجارية",
    law: "DOC (Dahir 1913), Loi 09-08",
    types: ["prestation_services", "nda", "convention_honoraires"] as DocumentType[],
  },
  {
    label: "Recouvrement & Preuves",
    labelAr: "الاستخلاص والإثبات",
    law: "DOC Art. 255, 323",
    types: ["mise_en_demeure", "reconnaissance_dette"] as DocumentType[],
  },
];

interface Props {
  onSelect: (type: DocumentType) => void;
}

export function DocumentTypeSelector({ onSelect }: Props) {
  return (
    <div className="space-y-8">
      {DOC_GROUPS.map((group) => (
        <div key={group.label}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-[#1B4332]">{group.label}</h2>
              <p className="text-xs text-[#B8860B] arabic">{group.labelAr}</p>
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
              {group.law}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {group.types.map((type) => (
              <button
                key={type}
                onClick={() => onSelect(type)}
                className="group flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:border-[#1B4332] hover:bg-[#F0F7F3] transition-all text-left"
              >
                <div className="w-10 h-10 bg-[#1B4332]/10 rounded-xl flex items-center justify-center group-hover:bg-[#1B4332]/20 transition-colors flex-shrink-0">
                  <FileText className="w-5 h-5 text-[#1B4332]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-800">
                    {DOCUMENT_LABELS[type].fr}
                  </p>
                  <p className="text-xs text-[#B8860B] arabic">
                    {DOCUMENT_LABELS[type].ar}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#1B4332] transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
