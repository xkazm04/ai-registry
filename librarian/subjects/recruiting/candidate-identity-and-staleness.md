---
domain: recruiting
subject: candidate-identity-and-staleness
last_touched: 2026-09-28
touched_by: deepen
dry_streak: 0
depth: L2
---

# candidate-identity-and-staleness

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-28 - `/deepen`, first pass (dp-cis-0928)

Dispatched by the Curator lane. An earlier dispatch (dp-cis-0926) died in
research on 2026-09-26 and left nothing. The event was a lead banked in
[[cv-authenticity-screening]]: a 2025 law-enforcement advisory names
cross-application duplication as a fraud indicator, return "when that subject is
next deepened". No clock had expired; all three applications sat at 2026-08-30,
inside the 183-day node/react window.

Four lanes: web counter-evidence (seven claims), the fraud-advisory lead (web),
a blind training-data lane, and a re-read of the one joined tree at HEAD
c39dc91a6.

**Counter-evidence: nothing refuted, six claims conditioned, two confirmed.**
- "Staleness informs, never blocks" holds for the organisation's own choices.
  Three binding rules make age or accuracy a condition of use: restriction
  while accuracy is contested (EU), a bias audit over a year old (one US city),
  and consumer-report age limits. This flips an absolute.
- "Collision-free" holds only at SHA-256 strength. The first public SHA-1
  collision was two PDFs.
- "Never auto-merge" needed its scope. Auto-attach on an identifier proven to
  be the candidate's own is standard. An unproven address is a label. Vendors
  exclude agency submissions from auto-merge for exactly this reason, and some
  auto-merge on a shared email even when the names differ.
- "Overlay is worse than a duplicate" is industry consensus, not a
  measurement. Held as written.
- A digest is personal data for the controller (pseudonymisation guidance).
  Confirmed, and extended to every copy keyed on it.
- Keep every submission: confirmed and strengthened by US record-keeping rules.
- Human-authored beats machine: confirmed, with the side-path condition (guard
  the write).

**Convergence.** The new technique, shared-artifact-across-claimed-identities,
rests on the advisory (verbatim), an independent industry investigation, and
the blind lane, which reached the same rule unprompted. The blind lane also
converged on: the normalised-text fingerprint (with document-review practice),
erasure reaching caches (with the tree), "email is evidence, not proof" (with
the vendor docs), and machine and human layers kept apart (with the enrichment
vendors).

**Landed** (c2fa7935, then the ledger commit):
- the new technique;
- eight conditions across the golden path and four techniques;
- all three applications re-verified to c39dc91a6;
- a fourth application for the new technique (simulation).

The tree had moved a long way. The rebuild is now a three-way field merge with
merge as the default, which closes two old deviations. The staleness predicate
compares parsed instants, and the roster's inline copy did not follow. The old
dedupe key became a hashed, erasable applicant key. New deviations were
recorded:
- every JD save counts as an edit, even an identical one;
- unknown divergence reads as "unedited" on the single-profile path and "edited"
  on the batch path;
- the footprint cannot tell a blind run;
- the response cache is an unstated erasure window.

**Applied** (7 rows in [[applied]]):
- code, better: erasure drops the CV hash (kp 0c9a742d3, local, not pushed);
- three simulations, better: the new technique, proof-graded identity, and
  guarding the write;
- three unapplied: the legal exceptions (no seam), runtime configuration
  (circular in this tree), and the hash floor and fingerprint (already met, or
  no seam).

## Impact

Map regenerated for kp at registry c2fa7935 (kp 96e6c210d, local). kp: 9
contexts join this subject, all `unknown`, **0 stale verdicts**. No other
project joins it. The same regeneration surfaced 20 stale verdicts from other
subjects (agent-cli-transport 11, app-shell 2, table 2, and one each for
eval-harness, module-design, docs-sync, combining-signals-into-a-hire-decision
and candidate-consent-and-retention). That is kp's `/conform --stale` queue, and
this pass did not cause it.

## Open leads

- **The evidence-grew cause of staleness.** The tree's shared predicate takes a
  third timestamp (a CV score predating a later scorecard is stale), tested but
  passed by no production caller. The blind lane separately proposed that a
  human edit to an extracted fact should mark the score stale. Both say the
  evidence behind a verdict can change without the person, the requirement or
  the instrument changing. They are different mechanisms, so there is no
  convergence yet. Return: a production caller for the scorecard axis, or a
  source on corrected-evidence staleness.
- **Time-relative derived facts.** Tenure or "current role" computed against an
  implicit now goes stale with no version change (blind lane only). Return: a
  second lane or a tree that stamps an as-of date.
- **Erasure's false negative.** When a candidate exercises a right, their
  unlinked duplicates escape it. A search for probable duplicates routed to a
  human would close that. This is the counter-evidence lane's reasoning, with
  no source. Return: a regulator's or a court's statement.
- **Unmerge can be built.** One vendor documents an un-merge, which would
  soften "a wrong merge is close to unrecoverable". Single source, against two
  vendors that say it is irreversible. Return: a second product.
- **kp's remaining identity seams** (code candidates, one project):
  - the 24 h shared response cache holding an erased person's analysis;
  - the label-keyed choice of analyses to scrub;
  - the duplicate answer on an unproven match;
  - skip the JD revision on a no-op save;
  - persist blind mode on saved analyses.

  Return: when the kp tree is quiet. A sibling was editing it during this pass.

## Declines

- A per-tenant keyed hash instead of plain SHA-256 (blind lane): the risk the
  guidance names is linkage, not brute-force reversal of a whole CV, and the
  subject already destroys the digest on erasure.
- A 2025 EU court judgment that pseudonymised data is not personal data for
  every recipient: true, and it does not move the recruiting controller, who
  can always re-identify.
- The AI Act's data-quality article as a blocking rule for stale scores: it
  binds a provider's training data, not a deployer's stored scores.

## Source classes (this pass)

Regulation and statute text, and government advisories, checked verbatim:
accepted, and they carried the flip. Standards bodies (NIST): accepted.
Vendors' own help pages: accepted as evidence of shipped behaviour, never as
evidence of what is right. An identity-security vendor's investigation:
accepted as the independent second source, with its commercial interest noted.
A law-firm alert syndicated on a content site: accepted only for a point the
statute supports.
