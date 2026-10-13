---
layer: application
type: application
subject: beneficial-ownership-resolution
technique: officer-record-reading
stack: node
status: forged
verified_on: 2026-10-13
verified_against: node@24
applied: code
ab_verdict: better
---

# Node: an inconclusive negative is not a contradiction

The politicas money loop reconciles every MP-to-company tie against the
Czech official register in `scripts/case-loops/money/reconcile-ares-vr.ts`,
with the match rule in `aresVrMatch.ts`. The register payload was already
read across three collections (statutory organs, other organs, partners),
which is the technique's first rule done right. Two gaps remained, both found
by reading the tree against the technique rather than from the source.

## What A did

- `findMatches` never read `akcionari[]`, the joint-stock holders collection
  (same member shape as an organ, verified on a live record 2026-10-13). A
  fourth collection the shared reading routine did not list.
- A negative with nothing matching on the birth date was written
  `conflicting` with the note "not confirmed by the register", whether or not
  any entry in the payload lacked a birth date. The technique's vocabulary
  says a negative with keyless entries is inconclusive.

## What B did

`akcionari[]` joins the reading routine. `keylessNameCandidates` counts
entries with no birth date and the same accent-folded full name, gated to
the no-match case; a non-zero count writes `registry-unconfirmed` with a
distinct flag and a reader note, never `conflicting`. The fallback confirms
nothing.

## Paired proof (`ab-paired`, n=23 ties)

Target: ties labelled `conflicting` although the payload could not rule the
person out. The 23 ties of the population that carried the no-match flag were
re-read against the live register. Arm A labels all 23 contradicted. Arm B
reclassifies 4 (three persons, three companies' worth of same-name entries,
all ended, all from the era before the register collected the key), leaving
19. Eight of the 23 payloads held keyless entries at all; surname-only hits
were not counted. The unread collection changed no label in this population
(one of 23 companies had it, with no same-name entry), so that half is a
structural fix with no measured effect here.

Floor: the confirmed population (167) was not re-run, because the roster
birth dates live in a local database this run did not open. Adding a
collection can only add entries for a person who already matched, so a
confirmed tie keeps its label; its role span could widen. Unmeasured.

## What it cannot do

Live payloads are today's, not those the reconcile run saw. The name match is
exact on the folded full name, so a transliterated or reordered name is
missed. It resolves nothing: the four ties still need a human.
