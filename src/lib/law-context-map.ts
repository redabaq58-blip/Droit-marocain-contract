import type { DocumentType } from "@/types";
import { readFileSync } from "fs";
import path from "path";

/**
 * Maps each document type to the verified law source files it needs.
 * ONLY these files are injected into Claude's context for each document type.
 * This is the anti-hallucination firewall.
 */
export const LAW_CONTEXT_MAP: Record<DocumentType, string[]> = {
  cdi: [
    "code-travail/art-13",
    "code-travail/art-14",
    "code-travail/art-16",
    "code-travail/art-18",
    "code-travail/art-247",
    "doc/art-230",
  ],
  cdd: [
    "code-travail/art-13",
    "code-travail/art-16",
    "code-travail/art-18",
    "doc/art-230",
  ],
  licenciement_faute: [
    "code-travail/art-39",
    "code-travail/art-62",
    "code-travail/art-63",
    "doc/art-230",
  ],
  solde_tout_compte: [
    "code-travail/art-73",
    "code-travail/art-74",
    "code-travail/art-247",
    "doc/art-230",
  ],
  bail_commercial: [
    "loi-49-16",
    "doc/art-627",
    "doc/art-230",
  ],
  bail_habitation: [
    "loi-67-12",
    "doc/art-627",
    "doc/art-230",
  ],
  prestation_services: [
    "doc/art-723",
    "doc/art-230",
  ],
  promesse_vente: [
    "doc/art-488",
    "loi-44-00",
    "doc/art-230",
  ],
  mise_en_demeure: [
    "doc/art-254",
    "doc/art-255",
    "doc/art-256",
    "doc/art-230",
  ],
  convention_honoraires: [
    "loi-28-08",
    "doc/art-230",
  ],
  nda: [
    "doc/art-230",
    "loi-09-08",
  ],
  reconnaissance_dette: [
    "doc/art-323",
    "doc/art-230",
  ],
};

interface LawSourceModule {
  meta: {
    law: string;
    article?: string;
    sourceUrl: string;
    verifiedBy: string;
  };
  text: {
    fr: string;
    ar: string;
  };
}

/**
 * Load and concatenate verified law articles for a given document type.
 * Returns the law context string to inject into Claude's system prompt.
 * Also returns the list of source files and any unverified sources.
 */
export function loadLawContext(documentType: DocumentType): {
  context: string;
  sourceFiles: string[];
  unverifiedSources: string[];
} {
  const sourceKeys = LAW_CONTEXT_MAP[documentType];
  const lawSourcesDir = path.join(process.cwd(), "src", "law-sources");

  const contextParts: string[] = [];
  const sourceFiles: string[] = [];
  const unverifiedSources: string[] = [];

  for (const key of sourceKeys) {
    const filePath = path.join(lawSourcesDir, `${key}.ts`);
    sourceFiles.push(filePath);

    try {
      // Read the file and extract the exported text using regex
      // (We parse the raw TS file since we can't dynamic-import easily in Next.js server routes)
      const content = readFileSync(filePath, "utf-8");

      const frMatch = content.match(/fr:\s*`([\s\S]*?)`/);
      const arMatch = content.match(/ar:\s*`([\s\S]*?)`/);
      const verifiedByMatch = content.match(/verifiedBy:\s*"([^"]*)"/);
      const lawMatch = content.match(/law:\s*"([^"]*)"/);
      const articleMatch = content.match(/article:\s*"([^"]*)"/);

      const frText = frMatch ? frMatch[1].trim() : "";
      const arText = arMatch ? arMatch[1].trim() : "";
      const verifiedBy = verifiedByMatch ? verifiedByMatch[1] : "";
      const lawName = lawMatch ? lawMatch[1] : key;
      const articleNum = articleMatch ? articleMatch[1] : "";

      if (!verifiedBy) {
        unverifiedSources.push(filePath);
      }

      if (frText || arText) {
        contextParts.push(
          `=== ${lawName}${articleNum ? ` — Article ${articleNum}` : ""} ===\n` +
          `[FRANÇAIS]\n${frText}\n\n` +
          `[ARABE / العربية]\n${arText}\n`
        );
      }
    } catch (err) {
      console.error(`Failed to load law source: ${filePath}`, err);
      // Do not inject missing sources — fail safe
    }
  }

  return {
    context: contextParts.join("\n---\n\n"),
    sourceFiles,
    unverifiedSources,
  };
}
