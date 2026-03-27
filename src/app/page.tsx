"use client";

import Link from "next/link";
import {
  FileText,
  Search,
  Shield,
  Zap,
  CheckCircle2,
  BookOpen,
  Scale,
  Users,
  ArrowRight,
  Star,
} from "lucide-react";
import { DOCUMENT_LABELS } from "@/types";
import type { DocumentType } from "@/types";

const DOC_TYPES: DocumentType[] = [
  "cdi",
  "cdd",
  "licenciement_faute",
  "solde_tout_compte",
  "bail_commercial",
  "bail_habitation",
  "prestation_services",
  "promesse_vente",
  "mise_en_demeure",
  "convention_honoraires",
  "nda",
  "reconnaissance_dette",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1B4332] flex items-center justify-center">
              <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
            </div>
            <div>
              <span className="font-bold text-[#1B4332] text-lg">Qanoun Express</span>
              <span className="text-[#B8860B] font-bold text-lg mr-2"> | قانون إكسبريس</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/analyse"
              className="text-sm text-gray-600 hover:text-[#1B4332] font-medium transition-colors"
            >
              Analyser un contrat
            </Link>
            <Link
              href="/generate"
              className="bg-[#1B4332] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#2D6A4F] transition-colors"
            >
              Générer un document →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#B8860B]/20 border border-[#B8860B]/40 rounded-full px-4 py-2 mb-6">
            <Shield className="w-4 h-4 text-[#B8860B]" />
            <span className="text-sm font-medium text-[#F0D060]">
              Ancré dans le droit marocain vérifié — Zéro hallucination
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Documents juridiques marocains
            <br />
            <span className="text-[#B8860B]">bilingues Français | العربية</span>
          </h1>

          <p className="text-lg text-green-100 mb-3 max-w-2xl mx-auto">
            Générez et analysez des contrats conformes au droit marocain en 60 secondes.
            Chaque document cite les articles exacts du Code du Travail, DOC, et lois applicables.
          </p>

          <p className="text-sm text-green-200 mb-8" dir="rtl">
            أنشئ وحلل العقود وفق القانون المغربي في 60 ثانية. كل وثيقة تستند إلى مواد قانونية معتمدة.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/generate"
              className="bg-[#B8860B] text-white font-semibold px-8 py-4 rounded-xl hover:bg-[#9A7209] transition-colors flex items-center justify-center gap-2 text-lg"
            >
              <FileText className="w-5 h-5" />
              Générer un document
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/analyse"
              className="bg-white/10 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2 text-lg"
            >
              <Search className="w-5 h-5" />
              Analyser un contrat reçu
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why it's different ───────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-[#F0F7F3]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#1B4332] mb-12">
            La différence Qanoun Express
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Zéro hallucination juridique",
                titleAr: "صفر هلوسة قانونية",
                desc: "Chaque article cité est vérifié contre les sources officielles (sgg.gov.ma, CNDP, AMDIE). Un vérificateur automatique bloque tout document avec une citation non sourcée.",
              },
              {
                icon: BookOpen,
                title: "Bilingue Français | عربي",
                titleAr: "ثنائي اللغة فرنسي | عربي",
                desc: "Sortie Word côte-à-côte (FR gauche | AR droite). Le seul outil marocain qui génère les deux langues simultanément dans un fichier téléchargeable.",
              },
              {
                icon: Scale,
                title: "Droit marocain uniquement",
                titleAr: "القانون المغربي حصراً",
                desc: "Code du Travail (Loi 65-99), DOC (1913), Loi 49-16, Loi 67-12, Loi 09-08, Loi 44-00, Loi 28-08 — les vrais textes, pas des résumés.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
                <div className="w-12 h-12 bg-[#1B4332]/10 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-[#1B4332]" />
                </div>
                <h3 className="font-bold text-[#1B4332] mb-1">{item.title}</h3>
                <p className="text-xs text-[#B8860B] font-medium mb-3 arabic">{item.titleAr}</p>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12 Document types ────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#1B4332] mb-3">
            12 types de documents — droit marocain vérifié
          </h2>
          <p className="text-center text-gray-500 mb-10">
            Chaque document cite les articles applicables du Code du Travail, DOC et lois spéciales
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DOC_TYPES.map((type) => (
              <Link
                key={type}
                href={`/generate?type=${type}`}
                className="group flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-[#1B4332] hover:bg-[#F0F7F3] transition-all"
              >
                <div className="w-8 h-8 bg-[#1B4332]/10 rounded-lg flex items-center justify-center group-hover:bg-[#1B4332]/20 transition-colors">
                  <FileText className="w-4 h-4 text-[#1B4332]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-800 truncate">
                    {DOCUMENT_LABELS[type].fr}
                  </p>
                  <p className="text-xs text-[#B8860B] arabic truncate">
                    {DOCUMENT_LABELS[type].ar}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#1B4332] transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-[#F0F7F3]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#1B4332] mb-12">
            Comment ça fonctionne
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-lg text-[#1B4332] mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Générer un document
              </h3>
              {[
                { step: "1", text: "Sélectionnez le type de document parmi 12 modèles" },
                { step: "2", text: "Remplissez le formulaire structuré (CIN, dates, montants)" },
                { step: "3", text: "Le graph LangGraph valide, charge les lois, génère le document" },
                { step: "4", text: "Téléchargez le fichier Word bilingue FR | عربي en 60 secondes" },
              ].map((s) => (
                <div key={s.step} className="flex gap-3 mb-4">
                  <div className="w-7 h-7 bg-[#1B4332] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {s.step}
                  </div>
                  <p className="text-sm text-gray-700 pt-1">{s.text}</p>
                </div>
              ))}
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#1B4332] mb-6 flex items-center gap-2">
                <Search className="w-5 h-5" />
                Analyser un contrat reçu
              </h3>
              {[
                { step: "1", text: "Collez le texte du contrat que vous avez reçu" },
                { step: "2", text: "3 agents Claude analysent en parallèle : conformité, équilibre, langage simple" },
                { step: "3", text: "Obtenez le rapport : red flags par sévérité, clauses manquantes, score équité" },
                { step: "4", text: "Téléchargez l'email de négociation en FR et عربي" },
              ].map((s) => (
                <div key={s.step} className="flex gap-3 mb-4">
                  <div className="w-7 h-7 bg-[#B8860B] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {s.step}
                  </div>
                  <p className="text-sm text-gray-700 pt-1">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Disclaimer ───────────────────────────────────────────────────── */}
      <section className="py-8 px-4 bg-amber-50 border-t border-amber-200">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-amber-800">
            <strong>⚠️ Avertissement :</strong> Les documents générés sont fournis à titre informatif uniquement.
            Ils ne constituent pas un conseil juridique et ne remplacent pas la consultation d&apos;un avocat
            inscrit au barreau marocain. Consultez un professionnel avant de signer tout document juridique.
          </p>
          <p className="text-xs text-amber-700 mt-2 arabic">
            ⚠️ هذه الوثائق مُنشأة لأغراض إعلامية فحسب ولا تُغني عن استشارة محامٍ مقيّد في هيئة المحامين المغاربة.
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-[#1B4332] text-white py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
            <span className="font-bold">Qanoun Express | قانون إكسبريس</span>
          </div>
          <p className="text-green-300 text-sm">
            Droit marocain vérifié — Code du Travail, DOC, Lois 49-16, 67-12, 09-08, 28-08, 44-00
          </p>
          <p className="text-green-400 text-xs">
            Sources: sgg.gov.ma · cndp.ma · amdie.gov.ma · pmp.ma
          </p>
        </div>
      </footer>
    </div>
  );
}
