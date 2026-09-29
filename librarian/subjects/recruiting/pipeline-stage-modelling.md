---
domain: recruiting
subject: pipeline-stage-modelling
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L3
---

# pipeline-stage-modelling

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-29 - `/deepen`, third pass, landed by dp-psm-0929

The Curator lane dispatched this from the registry's attention scan, on "never swept by the
librarian". True: the subject was at revision 1 from the bundle's founding on 2026-08-21, with
no note and no `applied.md` row.

**Provenance, stated because the shape of this run is unusual.** The working tree already held
a finished pass over this subject when the run started: eight modified files, two new
applications, last written 19:09, no run-board claim, no result and no registry commit. The
same pass had already committed its code fix and a map rebuild in kp (`5f990d590`, `c35a63321`).
The run took the claim, confirmed the tree was quiescent, and **verified and landed** that pass;
it did not re-run its research lanes, and the lanes named below are the earlier pass's, as the
two spec applications and the kp application record them. What this run itself did: read the
whole diff against the prior text; re-read the federal Q&A no. 15 on the agency's own page (the
first read was extracted text, and the page ends the withdrawal sentence "for purposes of
computing adverse impact", which the first quote had cut off; corrected in the application);
confirmed kp's commits exist and the fix is at kp's tip; ran the knowledge gate; built the
generated files in a clean worktree; rebuilt kp's map.

Lanes the earlier pass recorded:
- a **blind training-data reading** (rounds as children of a gate, with their own timestamps);
- a **vendor lane** over five shipped applicant-tracking systems' documentation, fetched
  2026-09-29 (Workable, Ashby, Greenhouse, SmartRecruiters read; Lever mostly search-derived);
- a **regulation lane**: 29 CFR 1607 (§§1607.4, 1607.16), its Q&A no. 15, the New York City
  proposed rule of September 2022, and the EU AI Act Annex III 4(a);
- a **tree lane**: kp read at `ca3d48934` and again at `7340988e2`, with the pure functions
  executed against constructed axes.

**Corrected or conditioned:**
- **"Each stage runs exactly one activity."** Wider than the evidence. Vendors put several
  interviews in one stage and the practitioner boundary is the decision point. Now: a stage
  ends in one decision about whether the candidate goes on; interviews inside a parallel loop
  are children of it, a round that can end the process before the next begins is a stage. The
  harm of a stacked column is argued, not measured, and says so.
- **"At least one terminal stage."** Contradicted the technique's own well-formedness set and
  the shipped validator. Now exactly one; hired, rejected and withdrawn are outcomes on it.
- **The screening set.** "Everything before the gate, minus homework" was a list that grows a
  role per case met. Executed against other axes it kept custom, scoring and early offer
  columns in, and a permission table read the default axis. Now the entry and screening roles
  before the gate, which is one rule. This is the run's one code-verified correction.
- **A retired stage in a rate.** The tombstone kept the role but every measure treated the row
  as unresolvable. Now resolved through the tombstone's role for interview and offer (at or
  past the gate) and entry, screening, homework and custom (not); a retired scoring stage is
  reported unresolved. Derived from the promise and one execution, not a second source.
- **Closure is not one bucket.** A rejection stays in every denominator it followed; a
  voluntary withdrawal leaves the denominators after it, under the federal guidelines.
- **The migration as the only door.** A second endpoint that accepts an axis with a column
  missing makes the guarantee a convention.
- **The past-the-end gate** is unreachable on a validated board; the real case is entry,
  screening and terminal with nothing between.
- **A shared spine is the norm, position-matching is what is refused.** Every vendor that
  reports across pipelines keeps three to six buckets above each team's stages.
- **One sentence of meaning per stage is an argument, not a finding.** No vendor stage object
  has a description field and no study was found. The one shipped implementation has the
  sentence per role and none per stage.

**Verified and left untouched:** that every shipped system has a closed role above its stages
(all five); that both closure shapes ship by name; that removal is a human-chosen destination
(Workable rewrites the history, which is the counter-example to "history keeps resolving").

**Not reached, so not claimed:** the final New York City rule text (the agency page returned a
403; only the proposed rule was read verbatim); Ashby's full type enumeration; Lever's
pipeline pages; any vendor's documentation of removing a stage in Ashby or SmartRecruiters;
Teamtailor, Workday and Recruitee were not run.

## Applied

Six `applied.md` rows: one code (better), five unapplied with return conditions. The code row
is the screening-set fix in kp (`5f990d590`, local, unpublished; two new tests fail on the old
module, 22/22 on the pair). Not run there: type-check, full unit suite, the Python policy pass.

## Impact

kp joins the subject and no other project's map does. No verdict was judged against it, so
0 stale verdicts and nothing enters a `/conform --stale` queue. kp's map was rebuilt and
committed locally (`f0395dbec`).

## Clocks and return conditions

- The vendor application carries a three-month clock (`refresh_by` 2026-12-29); re-read it then.
- The regulation application carries `refresh_by` 2027-03-28. Return sooner if the New York
  City final rule text becomes reachable, because the denominator sentence rests on the
  proposed text and a search summary.
- Return when a kp fairness window first spans a board edit: the retired-stage rate rule is
  the least corroborated claim on the page and the analytics loop was read, not run.

Yield high, `dry_streak` 0, depth L3. Not saturated: two open conditions above.
