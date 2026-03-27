import type { QanounStateType } from "../state";
import { SCHEMA_REGISTRY } from "@/lib/schemas";

/**
 * NODE 2a — Form Validator (generation path)
 * Pure Zod validation. Zero LLM calls.
 * Hard-stops if required legal fields are missing — never generate with missing variables.
 */
export async function nodeFormValidator(
  state: Partial<QanounStateType>
): Promise<Partial<QanounStateType>> {
  if (!state.formData || !state.documentType) {
    return {
      error: "Données du formulaire manquantes",
      compliancePassed: false,
    };
  }

  const schema = SCHEMA_REGISTRY[state.documentType];
  if (!schema) {
    return {
      error: `Schéma non trouvé pour le type: ${state.documentType}`,
      compliancePassed: false,
    };
  }

  const result = schema.safeParse(state.formData);

  if (!result.success) {
    const errors = result.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`
    );
    return {
      error: `Validation échouée:\n${errors.join("\n")}`,
      compliancePassed: false,
    };
  }

  return {
    formData: result.data,
  };
}
