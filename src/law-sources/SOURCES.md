# Qanoun Express — Law Source Audit Trail

Every article in this directory traces back to one of the official sources below.
The `verifiedBy` field in each `.ts` file must be filled by a qualified Moroccan lawyer
(barreau inscrit) before public launch. The compliance checker warns if it is empty.

## Official Source PDFs (all confirmed accessible)

| Law | Official URL |
|-----|-------------|
| Code du Travail (Loi 65-99) | https://www.sgg.gov.ma/Portals/0/lois/code_travail_fr.pdf |
| Code du Travail (alt) | https://casainvest.ma/sites/default/files/Code%20du%20travail.pdf |
| DOC (Dahir 1913, mis à jour) | https://rnesm.justice.gov.ma/Documentation/MA/4_ONC_Law_fr-FR.pdf |
| DOC (alt) | https://rabat.eregulations.org/media/Doc%20maroc.pdf |
| Loi 49-16 (bail commercial) | https://amdie.gov.ma/wp-content/uploads/2024/02/Loi-n%C2%B0-49-16-relative-aux-baux-a-usage-commercial-industriel-ou-artisanal.pdf |
| Loi 67-12 (bail habitation) | https://aute.gov.ma/s/a/library/2023-11-01/b941f00c-28f5-4a1c-8a0c-dcba0d7d0987.pdf |
| Loi 28-08 (avocats) | https://www.pmp.ma/wp-content/uploads/2023/03/1-La-profession-davocat.pdf |
| Loi 09-08 (données personnelles, CNDP) | https://www.cndp.ma/wp-content/uploads/2023/11/Loi-09-08-Fr.pdf |
| Loi 44-00 (VEFA immobilier) | https://www.aubm.ma/sites/default/files/2021-04/La%20loi%20n%C2%B0%2044-00.pdf |

## Critical Correction
⚠️ Loi 53-05 = échange électronique de données juridiques (e-signature). Ce N'EST PAS la loi
sur les données personnelles. La loi applicable pour les NDA est Loi 09-08 (CNDP).

## Lawyer Verification Checklist
Before launch, each law source file must have its `verifiedBy` field populated:

- [ ] code-travail/art-13.ts
- [ ] code-travail/art-14.ts
- [ ] code-travail/art-16.ts
- [ ] code-travail/art-17.ts
- [ ] code-travail/art-18.ts
- [ ] code-travail/art-39.ts
- [ ] code-travail/art-62.ts
- [ ] code-travail/art-63.ts
- [ ] code-travail/art-64.ts
- [ ] code-travail/art-73.ts
- [ ] code-travail/art-74.ts
- [ ] code-travail/art-247.ts
- [ ] doc/art-230.ts
- [ ] doc/art-254.ts
- [ ] doc/art-255.ts
- [ ] doc/art-256.ts
- [ ] doc/art-323.ts
- [ ] doc/art-324.ts
- [ ] doc/art-325.ts
- [ ] doc/art-488.ts
- [ ] doc/art-627.ts
- [ ] doc/art-628.ts
- [ ] doc/art-629.ts
- [ ] doc/art-723.ts
- [ ] doc/art-724.ts
- [ ] loi-49-16.ts
- [ ] loi-67-12.ts
- [ ] loi-28-08.ts
- [ ] loi-09-08.ts
- [ ] loi-44-00.ts
