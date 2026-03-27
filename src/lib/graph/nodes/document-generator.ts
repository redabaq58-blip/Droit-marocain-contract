import Anthropic from "@anthropic-ai/sdk";
import type { QanounStateType } from "../state";
import { DOCUMENT_LABELS } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT_TEMPLATE = `Tu es un assistant de rédaction juridique marocain spécialisé.

RÈGLES ABSOLUES — À NE JAMAIS ENFREINDRE :
1. Tu rédiges UNIQUEMENT à partir des articles de loi fournis ci-dessous dans la section ARTICLES DE LOI.
2. Tu ne cites JAMAIS un article que tu n'as pas reçu dans ce prompt.
3. Si une information est manquante dans les données du formulaire, tu l'indiques avec [À COMPLÉTER] — tu n'inventes jamais.
4. Si tu dois faire référence à une règle juridique non fournie, tu écris "selon le droit marocain applicable" sans inventer d'article.
5. Toute citation d'article doit correspondre EXACTEMENT au texte fourni.

ARTICLES DE LOI VÉRIFIÉS (seuls ces articles peuvent être cités) :
---
{LAW_CONTEXT}
---

DONNÉES DU FORMULAIRE :
{FORM_DATA}

FORMAT DE SORTIE OBLIGATOIRE — JSON uniquement, sans markdown :
{
  "title": "Titre du document en français",
  "titleAr": "عنوان الوثيقة بالعربية",
  "frText": "Texte complet du document en français...",
  "arText": "النص الكامل للوثيقة بالعربية...",
  "articlesCited": ["Art. 16 Code du Travail", "Art. 14 Code du Travail"]
}

INSTRUCTIONS DE RÉDACTION :
- Rédige un document professionnel, complet et conforme au droit marocain.
- Utilise les données du formulaire pour remplir toutes les variables.
- Cite les articles pertinents au bas de chaque section qui s'y réfère, entre parenthèses.
- Le document français doit être complet et juridiquement solide.
- Le document arabe (النص العربي) doit être une traduction fidèle du document français.
- Dans articlesCited, liste UNIQUEMENT les numéros d'articles que tu as effectivement cités dans le texte.
- Le document doit contenir TOUTES les clauses obligatoires pour ce type de contrat selon les articles fournis.`;

/**
 * NODE 4 — Document Generator (generation path)
 * ONE Claude API call. One job: generate bilingual document from verified law + form data.
 */
export async function nodeDocumentGenerator(
  state: Partial<QanounStateType>
): Promise<Partial<QanounStateType>> {
  if (!state.lawContext || !state.formData || !state.documentType) {
    return {
      error: "Contexte juridique ou données manquants pour la génération",
      compliancePassed: false,
    };
  }

  const docLabel = DOCUMENT_LABELS[state.documentType];

  const systemPrompt = SYSTEM_PROMPT_TEMPLATE
    .replace("{LAW_CONTEXT}", state.lawContext)
    .replace("{FORM_DATA}", JSON.stringify(state.formData, null, 2));

  const userMessage = `Génère un ${docLabel.fr} (${docLabel.ar}) complet et conforme au droit marocain, basé UNIQUEMENT sur les articles de loi fournis et les données du formulaire ci-dessus.

Rappel: Réponds UNIQUEMENT avec le JSON demandé. Aucun texte avant ou après le JSON.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8096,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
      system: systemPrompt,
    });

    const responseText =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Extract JSON — handle potential markdown code blocks
    const jsonMatch =
      responseText.match(/```(?:json)?\s*([\s\S]*?)```/) ||
      responseText.match(/(\{[\s\S]*\})/);

    if (!jsonMatch) {
      return {
        error: "La réponse du modèle n'est pas au format JSON attendu",
        compliancePassed: false,
      };
    }

    const parsed = JSON.parse(jsonMatch[1].trim());

    if (!parsed.frText || !parsed.arText || !Array.isArray(parsed.articlesCited)) {
      return {
        error: "Format de réponse incomplet (frText, arText ou articlesCited manquants)",
        compliancePassed: false,
      };
    }

    return {
      rawDocument: {
        title: parsed.title || docLabel.fr,
        frText: parsed.frText,
        arText: parsed.arText,
        articlesCited: parsed.articlesCited,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      error: `Erreur API Claude: ${message}`,
      compliancePassed: false,
    };
  }
}
