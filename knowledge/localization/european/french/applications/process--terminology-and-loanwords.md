---
layer: application
type: application
subject: french
technique: terminology-and-loanwords
stack: process
status: forged
verified_on: 2026-08-24
---

# Process — French term governance in the fleet (Personas termbase, kp open-decision register)

Two real French catalogs, verified 2026-08-24, showing the two halves of the
technique: Personas demonstrates a **decisive termbase** (every fork ruled),
kp demonstrates an honest **open-decision register** (forks recorded as open,
half-sweeps refused until ruled).

## Personas — every loanword ruled, gender pinned

`C:\Users\kazda\kiro\personas\docs\i18n\style-fr.md` carries a four-bucket
loanword policy (stays-borrowed-capitalized for surface names; borrowed
lowercase for naturalized tech vocabulary — *persona*, *twin*, *workflow*;
always-translated — *agent*, *coffre-fort*, *déclencheur*…; never-translate —
API/CLI/JSON, tier names) plus a termbase where the hard calls are visible:

- **FR-LOANGENDER live**: `persona` is pinned "emprunté, invariable,
  **masculin**: *un persona*… Masculin par analogie avec d'autres emprunts en
  *-a* déjà masculins (*un agenda*, *un visa*)" — and Pitfalls #6 documents the
  drift the pin exists to stop: shipped strings writing *toutes les personas*
  against the recorded masculine. The ruling preceded the agreement sweep,
  exactly the order FR-LOANGENDER prescribes.
- **FR-ONE-WORD live**: Pitfalls #1 is the collapse of *persona* into *agent*
  ("Sélectionner un agent" for "Select a persona") — two source concepts, and
  the mechanical repair rule is stated as this bundle teaches it: "le mot
  source dicte le mot cible", no per-string judgment.
- **Sense-splits recorded, not flattened**: *capability* = *capacité* vs
  *skill* = *compétence*; *recipe* vs *template*; *review* = *révision* with
  the legacy *revue* key (`sidebar.manual_review`) explicitly quarantined —
  "ne pas reproduire ce choix ailleurs".
- The **healing→guérison** medical calque (Pitfalls #2) is ruled
  fix-on-contact, not bulk: "une correction à faire à chaque contact, pas en
  masse" — the clean-strings-compatible sweep mode for a low-count drift.

## kp — the open-decision register and the half-sweep refusal

kp's `docs/i18n/glossary.md` keeps a "House decisions — still open" list, and
`docs/i18n/review-fr.md` (94 queued items on 2026-08-24) shows reviewers
*refusing* to fix real defects because the fork is unruled:

- **Impossible de… vs Nous n'avons pas pu…** — a 189-site split; at least five
  separate review entries (feedback.failed, pipeline.tab.moveFailed,
  billing.loadFailed, pipeline.tab.eventsError, analytics.compute.*) each
  independently decline the fix, citing "a half-sweep is worse than none".
- **AI vs IA** — 93 AI / 25 IA across `messages/fr.json`; one landing-page
  pass unified its own namespace and logged that the app-wide call is "one
  house decision, then one sweep".
- **endpoint** — three renderings found (loanword / *point d'accès HTTP* /
  *point de terminaison*), no glossary row; nothing changed until a row exists.
- **JD → offre vs fiche de poste** — recorded open in the glossary itself,
  with the review explicitly not touching `report.jdEditedBadge` because the
  house call is pending.
- **Derived-form split lived**: glossary licenses the loanword *matching*,
  while the catalog says *mis en correspondance* for the verb and *Rematché*
  in log kinds — the review queues the whole matching cluster for "one house
  decision across the cluster, not a local edit" (the derived-forms rule of
  this technique, observed in the wild).
- **FR-LOANGENDER's minting incident**: `pipeline.drawer.humanScorecard` —
  "the grammatical gender of the loanword *scorecard* in fr is unpinned across
  the catalog … Needs a CS-LOANGENDER-style ruling for fr before any agreement
  is corrected." That entry is why this subject minted the rule.

## The transferable procedure

1. Keep two artifacts: a termbase of **settled** rows (Personas' table shape:
   term, rendering, gender, note with the anti-pattern) and a register of
   **open** forks with their site counts (kp's still-open list).
2. A reviewer meeting an unruled fork flags and counts; the fix waits for the
   ruling. Five reviewers independently declining the same tempting fix is the
   register working, not the process failing.
3. When ruling, count first (93/25 makes the AI/IA stakes concrete), rule
   once, sweep every site in one merge, move the row from register to
   termbase.
4. Pin gender at adoption; agreement sweeps are blocked until the pin exists.
