---
layer: application
type: application
subject: parliamentary-data-modeling
technique: office-vs-plain-membership
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# Node ingest: resolving offices and memberships to one organ key

The politicas repo ingests the Czech Chamber of Deputies bulk open data
(`lib/ingest/sources/psp.ts`), whose `zarazeni.unl` relationship table is the
textbook publisher shape this technique exists for: one table, a
`cl_funkce` discriminator, and a target id that points at an *organ* when
`cl_funkce = 0` but at a *function* (`funkce.unl` row, which itself names an
organ) when `cl_funkce = 1`.

## The resolution pass

`normalizePoslanci` (psp.ts:197-238) does the flatten exactly as the
technique prescribes. It first builds the position registry lookup:

- `funkceOrgan: Map<funkceId, { organId, nameCz, typeId }>` from
  `funkce.unl` (psp.ts:202-206), and `funkceTypeCz` from `typ_funkce.unl`
  for the denormalized role-type label.

Then each `zarazeni` row becomes one `MembershipRow` where:

- `kind` is `"function" | "member"` from the discriminator (psp.ts:226);
- `targetPspId` keeps the publisher's raw reference for provenance;
- `organPspId` is the resolved body key — `fn?.organId` for offices,
  `targetPspId` itself for plain members (psp.ts:228);
- `functionNameCz` / `functionTypeCz` are the denormalized office columns,
  null for plain members.

The inline comment at psp.ts:198-201 states the payoff in the technique's
own terms: resolving both shapes to `organ_psp_id` "is what makes 'which
club was this MP in on date X' a single indexed lookup instead of a two-hop
join at query time."

## Details worth copying

- **The natural key includes the window start** (psp.ts:222-224):
  `psp:zarazeni:<person>:<target>:<clFunkce>:<od_o>` — the comment records
  why: "od_o is part of the key: the same person can rejoin the same
  organ." Without the timestamp, idempotent re-upsert of the daily full
  snapshot would merge distinct stints.
- **Unresolvable functions degrade honestly**: a missing `funkce` entry
  yields `organPspId: null` with the raw target retained, never a guessed
  organ.
- **Downstream consumption** (docs/data-analysis/graph-schema.md): the
  `influential_in` person→organ edges weight by the denormalized role
  (chair 1 / vice 0.6 / member 0.3), computed deterministically off the
  flattened rows — the office weights defined once in the KG compute pass.
  The effort case loop (scripts/case-loops/effort/triage.ts:31-47) then
  uses office windows the other way: a hand-verified
  `ROLE_WINDOW_MISMATCH_PSP_IDS` set excludes mid-term
  ministers/deputy-PMs/speakers from the low-effort lens, because their
  depressed floor numbers are a score-window artifact. That set is the
  repo's own admission that the deterministic version (deriving the
  exclusion from office windows instead of a hand-kept id list) is the next
  step the technique calls for.
