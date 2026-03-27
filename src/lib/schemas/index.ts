import { z } from "zod";

// ─── CDI ─────────────────────────────────────────────────────────────────────
// Code du Travail Art. 13, 14, 16, 18

export const CDISchema = z.object({
  employer_name: z.string().min(2, "Nom employeur requis"),
  employer_rc: z.string().optional(),
  employer_ice: z.string().length(15, "ICE doit être 15 chiffres").optional().or(z.literal("")),
  employer_cnss: z.string().optional(),
  employer_address: z.string().min(5, "Adresse employeur requise"),
  employer_city: z.string().min(2),
  employee_name: z.string().min(2, "Nom salarié requis"),
  employee_cin: z
    .string()
    .regex(/^[A-Z]{1,2}\d{5,6}$/, "Format CIN invalide (ex: AB123456)")
    .or(z.string().regex(/^[A-Z]\d{6}$/, "Format CIN invalide")),
  employee_address: z.string().min(5),
  poste: z.string().min(2, "Poste requis"),
  categorie: z.enum(["ouvrier", "employe", "cadre", "cadre_superieur"], {
    errorMap: () => ({ message: "Catégorie requise" }),
  }),
  salaire_base: z.number().min(2828.71, "Salaire minimum légal: 2828.71 MAD (SMIG 2024)"),
  date_debut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format: AAAA-MM-JJ"),
  // Art. 14: max 90j pour ouvriers/employés (45j renouvelables), max 180j pour cadres (3mois + 3mois)
  periode_essai_jours: z
    .number()
    .int()
    .min(0)
    .max(180, "Période d'essai max: 180 jours (cadres), 90 jours (autres)"),
  horaire_hebdo: z.number().min(1).max(44, "Durée légale max: 44h/semaine"),
  lieu_travail: z.string().min(2),
  juridiction: z.string().default("Tribunal du travail compétent"),
  convention_collective: z.string().optional(),
});

export type CDIInput = z.infer<typeof CDISchema>;

// ─── CDD ─────────────────────────────────────────────────────────────────────
// Art. 16 + 17 — durée max 1 an

export const CDDSchema = z.object({
  employer_name: z.string().min(2),
  employer_rc: z.string().optional(),
  employer_address: z.string().min(5),
  employer_city: z.string().min(2),
  employee_name: z.string().min(2),
  employee_cin: z.string().regex(/^[A-Z]{1,2}\d{5,6}$/, "Format CIN invalide"),
  employee_address: z.string().min(5),
  poste: z.string().min(2),
  categorie: z.enum(["ouvrier", "employe", "cadre", "cadre_superieur"]),
  salaire_base: z.number().min(2828.71, "SMIG minimum: 2828.71 MAD"),
  date_debut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  date_fin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  motif_cdd: z.enum(
    ["remplacement", "saisonnier", "accroissement_activite", "travail_determine"],
    { errorMap: () => ({ message: "Motif CDD requis (Art. 16 Code du Travail)" }) }
  ),
  salarie_remplace: z.string().optional(), // Required if motif = remplacement
  horaire_hebdo: z.number().min(1).max(44),
  lieu_travail: z.string().min(2),
  juridiction: z.string().default("Tribunal du travail compétent"),
});

export type CDDInput = z.infer<typeof CDDSchema>;

// ─── Licenciement pour faute grave ──────────────────────────────────────────
// Art. 39 (fautes), 62-63 (procédure)

export const LicenciementFauteSchema = z.object({
  employer_name: z.string().min(2),
  employer_address: z.string().min(5),
  employee_name: z.string().min(2),
  employee_cin: z.string().regex(/^[A-Z]{1,2}\d{5,6}$/),
  employee_poste: z.string().min(2),
  date_entree: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  date_convocation_entretien: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Entretien préalable obligatoire (Art. 62)"),
  date_licenciement: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  faute_grave: z.enum([
    "insulte_grave",
    "violence",
    "refus_execution_travail",
    "absence_injustifiee",
    "deterioration_equipements",
    "detournement_fonds",
    "divulgation_secret",
    "condamnation_penale",
    "vol",
    "ivresse",
    "consommation_stupefiants",
    "harcelement_sexuel",
    "abus_de_confiance",
    "autre",
  ], { errorMap: () => ({ message: "Sélectionnez la faute grave (Art. 39 CT)" }) }),
  description_faits: z.string().min(30, "Décrivez précisément les faits (min 30 caractères)"),
  lieu: z.string().min(2),
  ville: z.string().min(2),
});

export type LicenciementFauteInput = z.infer<typeof LicenciementFauteSchema>;

// ─── Solde de tout compte ────────────────────────────────────────────────────
// Art. 73-74 — délai contestation 60 jours automatiquement injecté

export const SoldeToutCompteSchema = z.object({
  employer_name: z.string().min(2),
  employer_address: z.string().min(5),
  employee_name: z.string().min(2),
  employee_cin: z.string().regex(/^[A-Z]{1,2}\d{5,6}$/),
  employee_poste: z.string().min(2),
  date_fin_contrat: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  motif_rupture: z.enum(["licenciement", "demission", "fin_cdd", "accord_mutuel", "retraite"]),
  salaire_derniere_periode: z.number().min(0),
  conges_payes_restants_jours: z.number().min(0),
  valeur_conges_payes: z.number().min(0),
  indemnite_licenciement: z.number().min(0),
  autres_sommes_description: z.string().optional(),
  autres_sommes_montant: z.number().min(0).optional(),
  montant_total: z.number().min(0),
  mode_paiement: z.enum(["cheque", "virement", "especes"]),
  date_paiement: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ville: z.string().min(2),
});

export type SoldeToutCompteInput = z.infer<typeof SoldeToutCompteSchema>;

// ─── Bail commercial ─────────────────────────────────────────────────────────
// Loi 49-16 (entrée en vigueur 11 fév 2017) + DOC Art. 627

export const BailCommercialSchema = z.object({
  bailleur_nom: z.string().min(2),
  bailleur_cin_or_rc: z.string().min(2),
  bailleur_adresse: z.string().min(5),
  preneur_nom: z.string().min(2),
  preneur_cin_or_rc: z.string().min(2),
  preneur_adresse: z.string().min(5),
  preneur_ice: z.string().optional(),
  adresse_local: z.string().min(10),
  ville: z.string().min(2),
  superficie_m2: z.number().positive("Superficie requise"),
  destination: z.string().min(5, "Activité commerciale précise requise"),
  loyer_mensuel: z.number().positive("Loyer mensuel requis"),
  charges_mensuelles: z.number().min(0).default(0),
  depot_garantie_mois: z
    .number()
    .min(0)
    .max(6, "Dépôt de garantie max: 6 mois (Loi 49-16 Art. 12)"),
  date_debut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  duree_annees: z
    .number()
    .min(3, "Durée min: 3 ans (Loi 49-16 Art. 4)"),
  revision_loyer_annuelle_pct: z.number().min(0).max(10).default(5),
  juridiction: z.string().default("Tribunal de Commerce compétent"),
});

export type BailCommercialInput = z.infer<typeof BailCommercialSchema>;

// ─── Bail habitation ─────────────────────────────────────────────────────────
// Loi 67-12

export const BailHabitationSchema = z.object({
  bailleur_nom: z.string().min(2),
  bailleur_cin: z.string().regex(/^[A-Z]{1,2}\d{5,6}$/, "CIN bailleur requis"),
  bailleur_adresse: z.string().min(5),
  locataire_nom: z.string().min(2),
  locataire_cin: z.string().regex(/^[A-Z]{1,2}\d{5,6}$/, "CIN locataire requis"),
  locataire_adresse_actuelle: z.string().min(5),
  adresse_bien: z.string().min(10),
  ville: z.string().min(2),
  type_bien: z.enum(["appartement", "villa", "studio", "etage_villa", "maison"]),
  superficie_m2: z.number().positive(),
  loyer_mensuel: z.number().positive(),
  depot_garantie_mois: z
    .number()
    .min(0)
    .max(2, "Dépôt de garantie max: 2 mois (Art. 9 Loi 67-12)"),
  date_debut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  duree_mois: z.number().min(1),
  charges_locatives: z.number().min(0).default(0),
  juridiction: z.string().default("Tribunal compétent du lieu du bien"),
});

export type BailHabitationInput = z.infer<typeof BailHabitationSchema>;

// ─── Prestation de services ───────────────────────────────────────────────────
// DOC Art. 723-724 + 230

export const PrestationServicesSchema = z.object({
  prestataire_nom: z.string().min(2),
  prestataire_adresse: z.string().min(5),
  prestataire_rc: z.string().optional(),
  prestataire_ice: z.string().optional(),
  client_nom: z.string().min(2),
  client_adresse: z.string().min(5),
  client_rc: z.string().optional(),
  description_mission: z.string().min(30, "Décrivez la mission (min 30 caractères)"),
  livrable: z.string().min(10, "Précisez les livrables attendus"),
  date_debut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  date_fin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  montant_ht: z.number().positive("Montant requis"),
  tva_applicable: z.boolean().default(true),
  taux_tva: z.number().min(0).max(20).default(20),
  conditions_paiement: z.enum([
    "acompte_30_solde_livraison",
    "50_50",
    "mensualites",
    "a_reception",
    "personnalise",
  ]),
  propriete_intellectuelle: z.enum(["prestataire", "client", "partage"]),
  clause_confidentialite: z.boolean().default(true),
  juridiction: z.string().default("Tribunal de Commerce compétent"),
});

export type PrestationServicesInput = z.infer<typeof PrestationServicesSchema>;

// ─── Promesse de vente immobilière ───────────────────────────────────────────
// DOC Art. 488 + Loi 44-00

export const PromesseVenteSchema = z.object({
  vendeur_nom: z.string().min(2),
  vendeur_cin: z.string().regex(/^[A-Z]{1,2}\d{5,6}$/),
  vendeur_adresse: z.string().min(5),
  acquereur_nom: z.string().min(2),
  acquereur_cin: z.string().regex(/^[A-Z]{1,2}\d{5,6}$/),
  acquereur_adresse: z.string().min(5),
  description_bien: z.string().min(10),
  titre_foncier: z.string().optional(),
  adresse_bien: z.string().min(10),
  superficie_m2: z.number().positive(),
  prix_vente: z.number().positive("Prix de vente requis"),
  acompte_pct: z.number().min(5).max(30, "Acompte standard: 5-30%"),
  date_signature_acte_definitif: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  conditions_suspensives: z.string().optional(),
  notaire: z.string().optional(),
  juridiction: z.string().default("Tribunal compétent du lieu du bien"),
  ville: z.string().min(2),
});

export type PromesseVenteInput = z.infer<typeof PromesseVenteSchema>;

// ─── Mise en demeure ─────────────────────────────────────────────────────────
// DOC Art. 254, 255, 256

export const MiseEnDemeureSchema = z.object({
  expediteur_nom: z.string().min(2),
  expediteur_adresse: z.string().min(5),
  expediteur_qualite: z.string().optional(), // e.g. "gérant", "directeur"
  destinataire_nom: z.string().min(2),
  destinataire_adresse: z.string().min(5),
  objet_obligation: z.string().min(20, "Décrivez l'obligation non exécutée (min 20 caractères)"),
  montant_du: z.number().min(0).optional(),
  devise: z.enum(["MAD", "EUR", "USD"]).default("MAD"),
  date_echeance_initiale: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  delai_execution_jours: z
    .number()
    .int()
    .min(1)
    .max(30, "Délai raisonnable: 1-30 jours"),
  consequences_non_execution: z
    .string()
    .min(10, "Précisez les conséquences (action en justice, intérêts, etc.)"),
  mode_envoi: z.enum(["lettre_recommandee_ar", "huissier", "main_propre"]),
  ville: z.string().min(2),
  date_lettre: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type MiseEnDemeureInput = z.infer<typeof MiseEnDemeureSchema>;

// ─── Convention d'honoraires avocat ─────────────────────────────────────────
// Loi 28-08 Art. 47, 57, 58

export const ConventionHonorairesSchema = z.object({
  avocat_nom: z.string().min(2),
  avocat_barreau: z.string().min(2, "Barreau requis (ex: Casablanca)"),
  avocat_numero_ordre: z.string().min(1, "Numéro d'inscription au barreau requis"),
  avocat_adresse: z.string().min(5),
  client_nom: z.string().min(2),
  client_cin: z.string().regex(/^[A-Z]{1,2}\d{5,6}$/),
  client_adresse: z.string().min(5),
  objet_mission: z.string().min(20, "Décrivez la mission juridique (min 20 caractères)"),
  type_honoraires: z.enum(["forfait", "taux_horaire", "honoraires_succes", "mixte"]),
  montant_forfait: z.number().positive().optional(),
  taux_horaire: z.number().positive().optional(),
  honoraires_succes_pct: z.number().min(0).max(30).optional(),
  provision_a_verser: z.number().min(0),
  conditions_paiement: z.string().min(5),
  juridiction: z.string().default("Barreau compétent"),
  date_convention: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ville: z.string().min(2),
});

export type ConventionHonorairesInput = z.infer<typeof ConventionHonorairesSchema>;

// ─── NDA / Accord de confidentialité ────────────────────────────────────────
// DOC Art. 230 + Loi 09-08 (données personnelles — CNDP)
// NOTE: Loi 53-05 = e-signature. Loi 09-08 = données perso. Ne pas confondre.

export const NDASchema = z.object({
  partie_divulgatrice_nom: z.string().min(2),
  partie_divulgatrice_adresse: z.string().min(5),
  partie_divulgatrice_rc: z.string().optional(),
  partie_receptrice_nom: z.string().min(2),
  partie_receptrice_adresse: z.string().min(5),
  partie_receptrice_rc: z.string().optional(),
  objet_informations: z.string().min(20, "Décrivez les informations confidentielles (min 20 car.)"),
  finalite_divulgation: z.string().min(10, "Précisez le contexte/finalité de la divulgation"),
  duree_confidentialite_annees: z
    .number()
    .int()
    .min(1)
    .max(10, "Durée de confidentialité: 1-10 ans"),
  exclusions: z.string().optional(), // Info. déjà publique, connue préalablement, etc.
  penalite_violation: z.string().optional(),
  droit_applicable: z.string().default("Droit marocain"),
  juridiction: z.string().default("Tribunal de Commerce de Casablanca"),
  date_signature: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ville: z.string().min(2),
});

export type NDAInput = z.infer<typeof NDASchema>;

// ─── Reconnaissance de dette ─────────────────────────────────────────────────
// DOC Art. 323-325
// IMPORTANT: Art. 323 exige que la somme soit écrite en chiffres ET en toutes lettres

export const ReconnaissanceDettSchema = z.object({
  debiteur_nom: z.string().min(2),
  debiteur_cin: z.string().regex(/^[A-Z]{1,2}\d{5,6}$/),
  debiteur_adresse: z.string().min(5),
  creancier_nom: z.string().min(2),
  creancier_cin: z.string().regex(/^[A-Z]{1,2}\d{5,6}$/),
  creancier_adresse: z.string().min(5),
  montant_principal: z.number().positive("Montant requis"),
  devise: z.enum(["MAD", "EUR", "USD"]).default("MAD"),
  date_remise_fonds: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  taux_interet_annuel: z.number().min(0).max(15).optional(),
  date_remboursement: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  modalites_remboursement: z.enum(["une_seule_fois", "echelonne", "a_premiere_demande"]),
  lieu: z.string().min(2),
  date_acte: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type ReconnaissanceDettInput = z.infer<typeof ReconnaissanceDettSchema>;

// ─── Schema registry ──────────────────────────────────────────────────────────

import type { DocumentType } from "@/types";

export const SCHEMA_REGISTRY: Record<DocumentType, z.ZodObject<z.ZodRawShape>> = {
  cdi: CDISchema,
  cdd: CDDSchema,
  licenciement_faute: LicenciementFauteSchema,
  solde_tout_compte: SoldeToutCompteSchema,
  bail_commercial: BailCommercialSchema,
  bail_habitation: BailHabitationSchema,
  prestation_services: PrestationServicesSchema,
  promesse_vente: PromesseVenteSchema,
  mise_en_demeure: MiseEnDemeureSchema,
  convention_honoraires: ConventionHonorairesSchema,
  nda: NDASchema,
  reconnaissance_dette: ReconnaissanceDettSchema,
};
